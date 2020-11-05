/* Magic Mirror
 * Module: MMM-TeslaFi
 *
 * Originally By Adrian Chrysanthou
 * Updated by Matt Dyson
 * MIT Licensed.
 */
Module.register("MMM-TeslaFi", {
  defaults: {
    units: config.units,
    animationSpeed: 1000,
    refreshInterval: 1000 * 60, //refresh every minute
    updateInterval: 1000 * 3600, //update every hour
    lang: config.language,
    initialLoadDelay: 0, // 0 seconds delay
    retryDelay: 2500,
    unitDistance: "miles",
    unitTemperature: "c",
    batteryDanger: 30,
    batteryWarning: 50,
    dataTimeout: 0,
    precision: 1, // How many decimal places to round values to
    apiBase: "https://www.teslafi.com/feed.php?token=",
    apiQuery: "&command=lastGood",
    items: [
      "battery",
      "range",
      "range-estimated",
      "power-connected",
      "charge-time",
      "charge-added",
      "locked",
      "odometer",
      "temperature",
      "data-time"
    ]
  },
  // Define required scripts.
  getScripts: function () {
    return [
      "https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.11/lodash.min.js",
      "https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.24.0/moment.min.js",
      "moment.js"
    ];
  },
  getStyles: function () {
    return [
      "https://cdnjs.cloudflare.com/ajax/libs/material-design-iconic-font/2.2.0/css/material-design-iconic-font.min.css",
      "MMM-TeslaFi.css"
    ];
  },
  start: function () {
    Log.info("Starting module: " + this.name);
    this.loaded = false;
    this.sendSocketNotification("CONFIG", this.config);
  },
  getDom: function () {
    var wrapper = document.createElement("div");
    if (!this.loaded) {
      wrapper.innerHTML = this.translate("LOADING");
      wrapper.className = "dimmed light small";
      return wrapper;
    }
    if (this.config.apiKey === "") {
      wrapper.innerHTML = "No Tesla Fi <i>apiKey</i> set in config file.";
      wrapper.className = "dimmed light small";
      return wrapper;
    }
    if (!this.data) {
      wrapper.innerHTML = "No data";
      wrapper.className = "dimmed light small";
      return wrapper;
    }
    var t = this.data;
    var content = document.createElement("div");
    const getBatteryLevelClass = function (bl, warn, danger) {
      if (bl < danger) {
        return "danger";
      }
      if (bl < warn) {
        return "warning";
      }
      if (bl >= warn) {
        return "ok";
      }
    };

    content.innerHTML = "";
    var table = `
		<h2 class="mqtt-title"><span class="zmdi zmdi-car zmdi-hc-1x icon"></span> ${t.display_name}</h2>
		<table class="small">
		`;

    for (var field in this.config.items) {
      switch (this.config.items[field]) {
        case "battery":
          table += `
				   <tr>
				      <td class="icon"><span class="zmdi zmdi-battery zmdi-hc-fw"></span></td>
				      <td class="field">Battery</td>
				      <td class="value">
				         <span class="battery-level-${getBatteryLevelClass(
                   t.usable_battery_level,
                   this.config.batteryWarning,
                   this.config.batteryDanger
                 )}">${t.usable_battery_level}%</span>
                                         /
                                         <span class="battery-level-${getBatteryLevelClass(
                                           t.charge_limit_soc,
                                           this.config.batteryWarning,
                                           this.config.batteryDanger
                                         )}">${t.charge_limit_soc}%</span>
				      </td>
				   </tr>
				`;
          break;

        case "range":
          table += `
				   <tr>
				      <td class="icon"><span class="zmdi zmdi-gas-station zmdi-hc-fw"></span></td>
				      <td class="field">Range</td>
				      <td class="value">${this.convertDistance(t.ideal_battery_range)}</td>
				   </tr>
				`;
          break;

        case "range-estimated":
          table += `
				   <tr>
				      <td class="icon"><span class="zmdi zmdi-gas-station zmdi-hc-fw"></span></td>
				      <td class="field">Range</td>
				      <td class="value">${this.convertDistance(
                t.est_battery_range
              )} (estimated)</td>
				   </tr>
				`;
          break;

        case "charge-time":
          if (!t.charging_state || t.time_to_full_charge === "0.0") {
            break;
          }

          table += `
				   <tr>
				      <td class="icon"><span class="zmdi zmdi-battery-flash zmdi-hc-fw"></span></td>
				      <td class="field">Charging</td>
				      <td class="value">Done ${moment()
                .add(t.time_to_full_charge, "hours")
                .fromNow()}</td>
				   </tr>
				`;
          break;

        case "charge-added":
          if (!t.charging_state || t.charging_state === "Disconnected") {
            break;
          }

          table += `
				   <tr>
				      <td class="icon"><span class="zmdi zmdi-flash zmdi-hc-fw"></span></td>
				      <td class="field">Charge Added</td>
				      <td class="value">${this.numberFormat(t.charge_energy_added)} kWh</td>
				   </tr>
				`;

          break;

        case "locked":
          if (t.locked) {
            table += `
				   <tr>
				      <td class="icon"><span class="zmdi zmdi-lock-outline zmdi-hc-fw"></span></td>
				      <td class="field" colspan="2">Locked</td>
				   </tr>
				`;
          } else {
            table += `
				   <tr>
				      <td class="icon"><span class="zmdi zmdi-lock-open zmdi-hc-fw"></span></td>
				      <td class="field" colspan="2">Unlocked</td>
				   </tr>
				`;
          }
          break;

        case "odometer":
          table += `
				   <tr>
				      <td class="icon"><span class="zmdi zmdi-globe zmdi-hc-fw"></span></td>
				      <td class="field">Odometer</td>
				      <td class="value">${this.convertDistance(t.odometer)}</td>
				   </tr>
				`;
          break;

        case "temperature":
          if (!t.outside_temp || !t.inside_temp) {
            break;
          }

          var outside = this.convertTemperature(t.outside_temp);
          var inside = this.convertTemperature(t.inside_temp);

          table += `
				   <tr>
				      <td class="icon"><span class="zmdi zmdi-sun zmdi-hc-fw"></span></td>
				      <td class="field">Temperature</td>
				      <td class="value">${outside} / ${inside}</td>
				   </tr>
				`;
          break;

        case "power-connected":
          if (!t.charging_state) {
            break;
          }

          if (t.charging_state !== "Disconnected") {
            var displayVal = t.charging_state;
            if (t.scheduled_charging_pending === "1") {
              displayVal =
                "Scheduled " +
                moment(t.scheduled_charging_start_time).fromNow();
            }

            table += `
				   <tr>
				      <td class="icon"><span class="zmdi zmdi-input-power zmdi-hc-fw"></span></td>
				      <td class="field">Connected</td>
				      <td class="value">${displayVal}</td>
				   </tr>
				`;
          } else {
            table += `
				   <tr>
				      <td class="icon"><span class="zmdi zmdi-input-power zmdi-hc-fw"></span></td>
				      <td class="field" colspan="2">Disconnected</td>
				   </tr>
				`;
          }
          break;

        case "data-time":
          var secondsPassed = moment().diff(moment(t.Date), "seconds");
          if (secondsPassed > this.config.dataTimeout) {
            table += `
            <tr>
              <td class="icon"><span class="zmdi zmdi-time zmdi-hc-fw"></span></td>
              <td class="field" colspan="2">${moment(t.Date).fromNow()}</td>
            </tr>
            `;
          }
          break;
      } // switch
    } // end foreach loop of items

    table += "</table>";

    wrapper.innerHTML = table;
    wrapper.className = "light small";
    wrapper.appendChild(content);
    return wrapper;
  },
  socketNotificationReceived: function (notification, payload) {
    if (notification === "STARTED") {
      this.updateDom();
    } else if (notification === "DATA") {
      this.loaded = true;
      this.tFi(JSON.parse(payload));
      this.updateDom();
    }
  },
  // tFi(data)
  // Uses the received data to set the various values.
  //argument data object - info from teslfi.com
  tFi: function (data) {
    if (!data) {
      // Did not receive usable new data.
      return;
    }
    this.data = data;
    this.loaded = true;
    this.updateDom(this.config.animationSpeed);
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
  }
});
