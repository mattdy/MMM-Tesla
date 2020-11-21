/*
 * Display the current location of the vehicle within a static Google Maps window
 * Size of the map can be modified using the `maps.zoom`, `maps.width` and `maps.height` configuration options
 * Requires a valid Google Maps API key - see the README for more information
 *
 * Created by Matt Dyson
 * Adapted from original code by Justyn R
 */
DataItemProvider.register("map", {
  onDataUpdate(data) {
    if (!this.hasApiKey()) {
      this.display = true;
      this.icon = `<span class="zmdi zmdi-alert-octagon sentry zmdi-hc-fw"></span>`;
      this.field = "MAP ERROR!";
      this.value = "Missing Google Maps API Key";
      return;
    }

    if (this.isExcluded(data.location) || data.carState !== "Driving") {
      this.display = false;
      return;
    }

    this.display = true;
    var url = this.getMap(data.latitude, data.longitude);
    this.icon = `<img alt="map" class="map" src="${url}" />`;
  },

  isExcluded: function (locale) {
    if (typeof this.config.maps.exclude !== "object") {
      return false;
    }

    const excludeLocationsUpper = this.config.maps.exclude.map((location) =>
      location.toUpperCase()
    );
    return excludeLocationsUpper.includes(locale.toUpperCase());
  },

  hasApiKey: function () {
    return (
      typeof this.config.maps.apiKey === "string" &&
      this.config.maps.apiKey !== ""
    );
  },

  getMap: function (lat, lng) {
    if (this.hasApiKey()) {
      const options = {
        center: [lat, lng],
        zoom: this.config.maps.zoom,
        key: this.config.maps.apiKey,
        marker: [lat, lng]
      };
      return `https://maps.googleapis.com/maps/api/staticmap?size=${this.config.maps.width}x${this.config.maps.height}&center=${options.center}&markers=${options.marker}&key=${options.key}&zoom=${options.zoom}&size=tiny`;
    }
  }
});

/*
 * Display the tagged location of the vehicle, if such a tag exists within TeslaFi
 *
 * Created by Matt Dyson
 * Adapted from original code by Justyn R
 */
DataItemProvider.register("location", {
  icon: `<span class="zmdi zmdi-pin zmdi-hc-fw"></span>`,
  field: "Location",

  onDataUpdate(data) {
    if (
      data.carState === "Driving" ||
      data.location === "No Tagged Location Found"
    ) {
      this.display = false;
    } else {
      this.display = true;
      this.value = data.location;
    }
  }
});
