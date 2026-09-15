/*
 * Fetch data from TeslaMate, via its MQTT integration
 * See https://docs.teslamate.org/docs/integrations/mqtt for the list of published topics
 *
 * Created by Matt Dyson
 */

const mqtt = require('mqtt')
const Log = require('../../../js/logger')
const DataSource = require('../DataSource')

const KM_PER_MILE = 1.60934

class TeslaMate extends DataSource {
  constructor (config) {
    super(config)

    if (!this.config.url) {
      throw new Error('You must specify the URL of your MQTT server')
    }

    if (!this.config.carId) {
      this.config.carId = 1
    }

    if (!this.config.topicPrefix) {
      this.config.topicPrefix = 'teslamate'
    }

    this.state = {}
    this.lastUpdate = null
    this.waitingForData = false
    this.topic = this.config.topicPrefix + '/cars/' + this.config.carId + '/'

    const options = {}
    if (this.config.username) {
      options.username = this.config.username
    }
    if (this.config.password) {
      options.password = this.config.password
    }

    // MQTT is push-based, so we hold a persistent connection and cache the latest value of each
    // topic. TeslaMate retains its messages, so we receive the full vehicle state on subscribe.
    this.client = mqtt.connect(this.config.url, options)

    this.client.on('connect', () => {
      Log.info('Connected to TeslaMate MQTT server, subscribing to ' + this.topic + '#')
      this.client.subscribe(this.topic + '#', (error) => {
        if (error) {
          Log.error('Failed to subscribe to TeslaMate topics: ' + error.message)
        }
      })
    })

    this.client.on('message', (topic, message) => this.onMessage(topic, message))

    this.client.on('error', (error) => {
      Log.error('TeslaMate MQTT error: ' + error.message)
    })
  }

  onMessage (topic, message) {
    const key = topic.substring(this.topic.length)
    const value = message.toString()

    // An empty payload means TeslaMate has cleared this value
    if (value === '') {
      delete this.state[key]
    } else {
      this.state[key] = value
    }

    this.lastUpdate = new Date()

    if (this.waitingForData) {
      this.waitingForData = false
      // Retained messages arrive in a burst on subscribe, so let them all land before sending
      setTimeout(() => this.sendData(), 2000)
    }
  }

  fetchData (callback) {
    this.callback = callback

    if (this.lastUpdate === null) {
      // Nothing received yet - send as soon as it arrives rather than waiting for the next poll
      Log.info('No data received from TeslaMate yet')
      this.waitingForData = true
      return
    }

    this.sendData()
  }

  sendData () {
    this.callback(JSON.stringify(this.buildResponse()))
  }

  // Convert the raw TeslaMate topic values into the fields expected by the data items
  buildResponse () {
    const state = this.state
    const parsed = { ...state }

    parsed.locked = this.toBool(state.locked)
    parsed.sentry_mode = this.toBool(state.sentry_mode)
    parsed.plugged_in = this.toBool(state.plugged_in)

    // TeslaMate reports metric distances and speeds, but the module expects miles
    parsed.odometer = this.kmToMiles(state.odometer)
    parsed.speed = this.kmToMiles(state.speed)
    parsed.ideal_battery_range = this.kmToMiles(state.ideal_battery_range_km)
    parsed.est_battery_range = this.kmToMiles(state.est_battery_range_km)

    // Co-ordinates come as a JSON blob, with the deprecated latitude/longitude topics as a fallback
    if (state.location) {
      try {
        const location = JSON.parse(state.location)
        parsed.latitude = location.latitude
        parsed.longitude = location.longitude
      } catch (e) {
        Log.warn('Could not parse TeslaMate location: ' + state.location)
      }
    }

    // The module's 'location' is the tagged location name, which TeslaMate calls a geofence
    parsed.location = state.geofence || 'No Tagged Location Found'

    // Charging values may be cleared when not charging
    parsed.charger_power = state.charger_power || '0'
    parsed.charge_energy_added = state.charge_energy_added || '0'
    parsed.time_to_full_charge = state.time_to_full_charge || '0'

    // TeslaMate gives an ISO date, the module expects a unix timestamp plus a pending flag
    const scheduled = Date.parse(state.scheduled_charging_start_time)
    if (!isNaN(scheduled) && scheduled > Date.now() && state.charging_state !== 'Charging') {
      parsed.scheduled_charging_pending = '1'
      parsed.scheduled_charging_start_time = Math.floor(scheduled / 1000)
    } else {
      parsed.scheduled_charging_pending = '0'
    }

    parsed.car_version = state.version || ''
    parsed.newVersionStatus = this.toBool(state.update_available) ? 'available' : ''
    parsed.newVersion = state.update_version || ''

    // Attempt to recreate the useful TeslaFi 'carState' variable
    let carState = 'Idling'

    if (state.state === 'driving') {
      carState = 'Driving'
    } else if (state.state === 'charging' || state.charging_state === 'Charging') {
      carState = 'Charging'
    } else if (state.state === 'asleep' || state.state === 'offline') {
      carState = 'Sleeping'
    } else if (parsed.sentry_mode) {
      carState = 'Sentry'
    }

    parsed.carState = carState

    // Used by the 'data-time' item to show how old the data is
    parsed.Date = this.lastUpdate.toISOString()

    return parsed
  }

  toBool (value) {
    return value === 'true'
  }

  kmToMiles (value) {
    if (value === undefined) {
      return undefined
    }

    return parseFloat(value) / KM_PER_MILE
  }
}

module.exports = TeslaMate
