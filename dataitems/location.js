/*
 * Display the current location of the vehicle within a static Google Maps window
 * Size of the map can be modified using the `mapZoom`, `mapWidth` and `mapHeight` configuration options
 * Requires a valid Google Maps API key - see the README for more information
 *
 * Created by Matt Dyson
 * Adapted from original code by Justyn R
 */
DataItemProvider.register("map", {
  itemName: "map",

  updateData(data) {
    if (this.config.googleMapApiKey === "") {
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
    const excludeLocationsUpper = this.config.excludeLocations.map((location) =>
      location.toUpperCase()
    );
    return excludeLocationsUpper.includes(locale.toUpperCase());
  },

  getMap: function (lat, lng) {
    if (this.config.googleMapApiKey !== "") {
      const options = {
        center: [lat, lng],
        zoom: this.config.mapZoom,
        key: this.config.googleMapApiKey,
        marker: [lat, lng]
      };
      return `https://maps.googleapis.com/maps/api/staticmap?size=${this.config.mapWidth}x${this.config.mapHeight}&center=${options.center}&markers=${options.marker}&key=${options.key}&zoom=${options.zoom}&size=tiny`;
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
  itemName: "location",

  icon: `<span class="zmdi zmdi-pin zmdi-hc-fw"></span>`,
  field: "Location",

  updateData(data) {
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
