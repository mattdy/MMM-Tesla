/*
 * Display the current location of the vehicle within a static Google Maps window
 * Size of the map can be modified using the `maps.zoom`, `maps.width` and `maps.height` configuration options
 * Requires a valid Google Maps API key - see the README for more information
 *
 * Created by Matt Dyson
 * Adapted from original code by Justyn R
 */
/* eslint valid-typeof: ["error", { "requireStringLiterals": false }] */
DataItemProvider.register('map', {
  onDataUpdate (data) {
    this.height = this.setParam(this.config.maps.height, 'number', 150)
    this.width = this.setParam(this.config.maps.width, 'number', 300)
    this.zoom = this.setParam(this.config.maps.zoom, 'number', 13)
    this.drivingOnly = this.setParam(
      this.config.maps.drivingOnly,
      'boolean',
      false
    )

    if (!this.hasApiKey()) {
      this.display = true
      this.icon = '<span class="zmdi zmdi-alert-octagon sentry zmdi-hc-fw"></span>'
      this.field = 'MAP ERROR!'
      this.value = 'Missing Google Maps API Key'
      return
    }

    if (this.drivingOnly && data.carState !== 'Driving') {
      this.display = false
      return
    }

    if (this.isExcluded(data.location)) {
      this.display = false
      return
    }

    this.display = true
    const url = this.getMap(data.latitude, data.longitude)
    this.icon = `<img alt="map" class="map" src="${url}" />`
  },

  // Check that our config value is of the correct type, otherwise set the default
  setParam: function (variable, expectedType, def) {
    if (typeof variable === expectedType) {
      return variable
    } else {
      return def
    }
  },

  isExcluded: function (locale) {
    if (typeof this.config.maps.exclude !== 'object') {
      return false
    }

    const excludeLocationsUpper = this.config.maps.exclude.map((location) =>
      location.toUpperCase()
    )
    return excludeLocationsUpper.includes(locale.toUpperCase())
  },

  hasApiKey: function () {
    return (
      typeof this.config.maps.apiKey === 'string' &&
      this.config.maps.apiKey !== ''
    )
  },

  getMap: function (lat, lng) {
    if (!this.hasApiKey()) {
      return ''
    }

    const self = this

    return buildUrl('https://maps.googleapis.com', {
      path: 'maps/api/staticmap',
      queryParams: {
        size: self.width + 'x' + self.height,
        center: [lat, lng],
        markers: [lat, lng],
        key: self.config.maps.apiKey,
        zoom: self.zoom
      }
    })
  }
})

/*
 * Display the tagged location of the vehicle, if such a tag exists within TeslaFi
 *
 * Created by Matt Dyson
 * Adapted from original code by Justyn R
 */
DataItemProvider.register('location', {
  icon: '<span class="zmdi zmdi-pin zmdi-hc-fw"></span>',
  field: 'Location',

  onDataUpdate (data) {
    if (
      data.carState === 'Driving' ||
      data.location === 'No Tagged Location Found'
    ) {
      this.display = false
    } else {
      this.display = true
      this.value = data.location
    }
  }
})
