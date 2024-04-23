/*
 * Fetch data from TeslaFi
 *
 * Created by Matt Dyson
 */

const request = require('request')
const Log = require('../../../js/logger')
const buildUrl = require('build-url')
const DataSource = require('../DataSource')
const empty = require('is-empty')

class TeslaFi extends DataSource {
  constructor (config) {
    super(config)

    if (empty(this.config.apiCommand)) {
      this.config.apiCommand = 'lastGood'
    }

    if (empty(this.config.apiKey)) {
      throw new Error('You must specify a TeslaFi API key')
    }
  }

  fetchData (callback) {
    const self = this
    self.callback = callback

    const url = buildUrl('https://www.teslafi.com', {
      path: 'feed.php',
      queryParams: {
        token: this.config.apiKey,
        command: this.config.apiCommand
      }
    })

    Log.info('Sending request to TeslaFi')
    request(
      {
        url,
        method: 'GET',
        headers: { TeslaFi_API_TOKEN: this.config.apiKey }
      },
      function (error, response, body) {
        Log.info('TeslaFi response was ' + response.statusCode)
        if (!error && response.statusCode === 200) {
          self.callback(body)
        }
      }
    )
  }
}

module.exports = TeslaFi
