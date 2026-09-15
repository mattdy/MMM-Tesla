/*
 * Fetch data from TeslaFi
 *
 * Created by Matt Dyson
 */

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
    fetch(url, {
      method: 'GET',
      headers: { TeslaFi_API_TOKEN: this.config.apiKey }
    })
      .then(function (response) {
        Log.info('TeslaFi response was ' + response.status)
        if (response.status !== 200) {
          return
        }

        return response.text().then(function (body) {
          self.callback(body)
        })
      })
      .catch(function (error) {
        Log.error('Error fetching data from TeslaFi: ' + error)
      })
  }
}

module.exports = TeslaFi
