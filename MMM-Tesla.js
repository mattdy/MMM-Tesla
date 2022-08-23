/* Magic Mirror
 * Module: MMM-Tesla
 *
 * Originally By Adrian Chrysanthou
 * Updated by Matt Dyson
 * MIT Licensed.
 */
Module.register("MMM-Tesla", {
  defaults: {
    animationSpeed: 1000,
    refreshInterval: 1000 * 60, // Refresh DOM every 60 seconds
    updateInterval: 1000 * 60 * 5, // Load data every 5 minutes
    unitDistance: "miles",
    unitTemperature: "c",
    batteryDanger: 30,
    batteryWarning: 50,
    dataTimeout: 0,
    source: {},
    maps: {
      apiKey: "",
      width: 300,
      height: 150,
      zoom: 13,
      exclude: []
    },
    precision: 1, // How many decimal places to round values to
    items: [
      "state",
      "speed",
      "heading",
      "battery",
      "range",
      "range-estimated",
      "power-connected",
      "charge-time",
      "charge-added",
      "charge-power",
      "locked",
      "odometer",
      "temperature",
      "map",
      "version",
      "version-new",
      "location",
      "data-time"
    ]
  },
  // Define required scripts.
  getScripts: function () {
    return [
      "moment.js",
      this.file("node_modules/build-url/src/build-url.js"),

      this.file("DataItemProvider.js"),
      this.file("dataitems/battery.js"),
      this.file("dataitems/charge.js"),
      this.file("dataitems/driving.js"),
      this.file("dataitems/location.js"),
      this.file("dataitems/range.js"),
      this.file("dataitems/software.js"),
      this.file("dataitems/state.js"),
      this.file("dataitems/temperature.js")
    ];
  },
  getStyles: function () {
    return [
      "https://cdnjs.cloudflare.com/ajax/libs/material-design-iconic-font/2.2.0/css/material-design-iconic-font.min.css",
      "MMM-Tesla.css"
    ];
  },
  start: function () {
    Log.info("Starting module: " + this.name);
    this.loaded = false;
    this.sendSocketNotification("CONFIG", this.config);
    this.providers = [];

    for (var identifier in DataItemProvider.providers) {
      this.providers[identifier] = new DataItemProvider.providers[identifier](
        this
      );
    }

    this.resetDomUpdate();
  },

  resetDomUpdate: function () {
    var self = this;
    // Reset any previously allocated timer to avoid double-refreshes
    clearInterval(this.domTimer);
    // Refresh the DOM at the given interval
    this.domTimer = setInterval(function () {
      self.updateDom(self.config.animationSpeed);
    }, this.config.refreshInterval);
  },

  getDom: function () {
    var wrapper = document.createElement("div");
    if (!this.loaded) {
      wrapper.innerHTML = this.translate("LOADING");
      wrapper.className = "dimmed light small";
      return wrapper;
    }
    if (!this.parsedData) {
      wrapper.innerHTML = "No data";
      wrapper.className = "dimmed light small";
      return wrapper;
    }
    var t = this.parsedData;
    var content = document.createElement("div");

    content.innerHTML = "";
    var table = `
      <h2 class="car-name"><span class="zmdi zmdi-car zmdi-hc-1x icon"></span> ${t.display_name}</h2>
      <table class="small">
		`;

    for (var index in this.config.items) {
      dataItem = this.config.items[index];

      if (!this.providers.hasOwnProperty(dataItem)) {
        Log.error("Could not find " + dataItem + " in list of valid providers");
        continue;
      }

      if (!this.providers[dataItem].display) {
        // This provider doesn't want us to display it right now, so skip
        Log.info(
          "Provider " + dataItem + " doesn't want to be shown right now"
        );
        continue;
      }

      var icon = this.providers[dataItem].icon;
      var field = this.providers[dataItem].field;
      var value = this.providers[dataItem].value;

      if (field === null && value === null) {
        table += `
          <tr>
            <td class="icon" colspan="3">${icon}</td>
          </tr>
        `;
      } else {
        var colspan = 1;
        if (value === null) {
          colspan = 2;
        }

        table += `
          <tr>
            <td class="icon">${icon}</td>
            <td class="field" colspan="${colspan}">${field}</td>
        `;
        if (value !== null) {
          table += `<td class="value">${value}</td>`;
        }
        table += `</tr>`;
      }
    } // end foreach loop of items

    table += "</table>";

    wrapper.innerHTML = table;
    wrapper.className = "light small";
    wrapper.appendChild(content);
    return wrapper;
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "STARTED") {
      // If the node_helper socket has only just opened, refresh the DOM to make sure we're displaying a loading message
      this.updateDom();
    } else if (notification === "DATA") {
      Log.info("Tesla received new data");
      // We've received data, so parse and display it
      var data = JSON.parse(payload);
      if (!data) {
        return;
      }
      this.parsedData = data;
      this.loaded = true;

      // Tell all of our data item providers about the new data
      for (var identifier in this.providers) {
        this.providers[identifier].onDataUpdate(data);
      }

      this.updateDom(this.config.animationSpeed);
      this.resetDomUpdate();
    }
  },

  // Return a number with the precision specified in our config
  numberFormat: function (number) {
    return parseFloat(number).toFixed(this.config.precision);
  },

  // Converts the given temperature (assumes C input) into the configured output, with appropriate units appended
  convertTemperature: function (valueC) {
    if (this.config.unitTemperature === "f") {
      var valueF = valueC * (9 / 5) + 32;
      return this.numberFormat(valueF) + "&deg;F";
    } else {
      return this.numberFormat(valueC) + "&deg;C";
    }
  },

  // Converts the given distance (assumes miles input) into the configured output, with appropriate units appended
  convertDistance: function (valueMiles) {
    if (this.config.unitDistance === "km") {
      var valueKm = valueMiles * 1.60934;
      return this.numberFormat(valueKm) + " km";
    } else {
      return this.numberFormat(valueMiles) + " miles";
    }
  },

  // Converts given speed (assumes miles input) to configured output with approprate units appened
  convertSpeed: function (valueMiles) {
    if (this.config.unitDistance === "km") {
      return this.numberFormat(valueMiles * 1.60934) + " km/h";
    } else {
      return this.numberFormat(valueMiles) + " mph";
    }
  },

  // Converts heading int to nearest bearing by 45deg
  convertHeading: function (heading) {
    const bearing = {
      0: "North",
      45: "North East",
      90: "East",
      135: "South East",
      180: "South",
      225: "South West",
      270: "West",
      315: "North West",
      360: "North"
    };
    const direction = (heading) => {
      return Object.keys(bearing)
        .map(Number)
        .reduce(function (prev, curr) {
          return Math.abs(curr - heading) < Math.abs(prev - heading)
            ? curr
            : prev;
        });
    };
    return bearing[direction(heading)];
  }
});
