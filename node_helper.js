'use strict'

/* Magic Mirror
 * Module: MMM-Tesla
 *
 * Originally By Adrian Chrysanthou
 * Updated by Matt Dyson
 *
 * MIT Licensed.
 */

const NodeHelper = require('node_helper')
const Log = require('../../js/logger')

const TeslaFi = require('./datasources/teslafi')
const Tessie = require('./datasources/tessie')
const TeslaMate = require('./datasources/teslamate')

module.exports = NodeHelper.create({
  start: function () {
    this.started = false
    this.config = null
    this.source = null
    this.lastResponse = null
  },

  getData: function () {
    const self = this

    if (!this.started) {
      return
    }

    Log.info('Tesla fetching data from source: ' + this.source.config.name)
    this.source.fetchData(function (response) {
      Log.info('Received data: ' + response)
      // Held on to so that a frontend reconnecting mid-interval can be given it straight away
      self.lastResponse = response
      self.sendSocketNotification('DATA', response)
    })

    setTimeout(function () {
      self.getData()
    }, this.config.updateInterval)
  },

  socketNotificationReceived: function (notification, payload) {
    if (payload === null) {
      return
    }

    switch (notification) {
      case 'CONFIG':
        if (this.config !== null) {
          // We are already running, so this is a frontend that has reconnected (after a browser
          // reload, for instance) and lost its data. Hand it what we already have, rather than
          // leaving it showing 'Loading' until the next poll comes round
          if (this.started) {
            this.sendSocketNotification('STARTED', true)

            if (this.lastResponse !== null) {
              Log.info('Tesla sending cached data to reconnected frontend')
              this.sendSocketNotification('DATA', this.lastResponse)
            }
          }

          return
        }

        Log.info('Tesla received configuration')
        this.config = payload

        switch (this.config.source.name.toLowerCase()) {
          case 'teslafi':
            this.source = new TeslaFi(this.config.source)
            break

          case 'tessie':
            this.source = new Tessie(this.config.source)
            break

          case 'teslamate':
            this.source = new TeslaMate(this.config.source)
            break

          default:
            Log.error(
              'Unknown source provided for Tesla data: ' +
                this.config.source.name
            )
            break
        }

        break // End CONFIG notification
    }

    if (this.config !== null && this.source !== null && !this.started) {
      Log.info('Tesla helper starting')
      this.sendSocketNotification('STARTED', true)
      this.started = true
      this.getData()
    }
  }
})
