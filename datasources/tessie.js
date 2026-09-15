/*
 * Fetch data from Tessie
 *
 * Created by Matt Dyson
 */

const Log = require('../../../js/logger')
const buildUrl = require('build-url')
const DataSource = require('../DataSource')

class Tessie extends DataSource {
  constructor (config) {
    super(config)

    if (!this.config.apiKey) {
      throw new Error('You must specify a Tessie API key')
    }

    if (!this.config.vin) {
      throw new Error('You must specify the VIN of your vehicle')
    }
  }

  fetchData (callback) {
    const self = this
    self.callback = callback

    const url = buildUrl('https://api.tessie.com', {
      path: '/' + this.config.vin + '/state',
      queryParams: {
        use_cache: true
      }
    })

    Log.info('Sending request to Tessie')
    fetch(url, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + this.config.apiKey,
        Accept: ''
      }
    })
      .then(function (response) {
        Log.info('Tessie response was code ' + response.status)
        if (response.status !== 200) {
          return
        }

        return response.json().then(function (body) {
          const parsed = {}

          // Flatten Tessie response into one-dimensional object
          for (const header in body) {
            if (typeof body[header] === 'object') {
              for (const entry in body[header]) {
                parsed[entry] = body[header][entry]
              }
            } else {
              parsed[header] = body[header]
            }
          }

          // Attempt to recreate the useful TeslaFi 'carState' variable
          let carState = 'Idling'

          if (parsed.charging_state === 'Complete') {
            carState = 'Idling'
          } else if (parsed.charging_state === 'Charging') {
            carState = 'Charging'
          } else if (parsed.shift_state === 'D') {
            carState = 'Driving'
          } else if (parsed.sentry_mode === true) {
            carState = 'Sentry'
          }

          parsed.carState = carState

          const json = JSON.stringify(parsed)

          self.callback(json)
        })
      })
      .catch(function (error) {
        Log.error('Error fetching data from Tessie: ' + error)
      })
  }
}

module.exports = Tessie
