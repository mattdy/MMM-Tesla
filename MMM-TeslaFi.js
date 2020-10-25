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
    googleMapApiKey: "",
    mapZoom: 13,
    mapWidth: 300,
    mapHeight: 150,
    excludeLocations: [],
    googleApiBase:
      "https://maps.googleapis.com/maps/api/distancematrix/json?key=",
    precision: 1, // How many decimal places to round values to
    apiBase: "https://www.teslafi.com/feed.php?token=",
    apiQuery: "&command=lastGood",
    items: [
      "state",
      "battery",
      "range",
      "range-estimated",
      "power-connected",
      "charge-time",
      "charge-added",
      "locked",
      "odometer",
      "temperature",
      "data-time",
      "version",
      "location",
      "map"
    ]
  },
  // Define required scripts.
  getScripts: function () {
    return [
      "https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.11/lodash.min.js",
      "https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.24.0/moment.min.js",
      "https://cdnjs.cloudflare.com/ajax/libs/moment-duration-format/1.3.0/moment-duration-format.min.js",
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

    for (field in this.config.items) {
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
          if (!t.charging_state || t.time_to_full_charge == 0) {
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
          if (!t.charging_state || t.charging_state == "Disconnected") {
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

        case "charge-power":
          if (!t.charging_state || t.charging_state == "Disconnected") {
            break;
          }

          table += `
				   <tr>
				      <td class="icon"><span class="zmdi zmdi-flash zmdi-hc-fw"></span></td>
				      <td class="field">Charger Power</td>
				      <td class="value">${this.numberFormat(t.charger_power)} kW</td>
				   </tr>
				`;
          break;

        case "locked":
          if (t.carState !== "Driving") {
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

          outside = this.convertTemperature(t.outside_temp);
          inside = this.convertTemperature(t.inside_temp);

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

          if (t.charging_state != "Disconnected") {
            displayVal = t.charging_state;
            if (t.scheduled_charging_pending == 1) {
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
          const secondsPassed = moment().diff(moment(t.Date), "seconds");
          if (secondsPassed > this.config.dataTimeout) {
            table += `
					<tr>
						<td class="icon"><span class="zmdi zmdi-time zmdi-hc-fw"></span></td>
						<td class="field" colspan="2">${moment(t.Date).fromNow()}</td>
					</tr>
					`;
          }
          break;

        case "state":
          table += `
					<tr>
						<td class="icon"><span class="zmdi zmdi-hc-fw ${
              t.carState === "Sentry"
                ? "sentry zmdi-dot-circle"
                : "zmdi-parking"
            }"></span></td>
						<td class="field">State</td>
						<td class="value">${t.carState}</td>
					</tr>
				`;
          if (t.carState === "Driving") {
            table += `
						<tr>
							<td class="icon"><span class="zmdi zmdi-time-countdown zmdi-hc-fw"></span></td>
							<td class="field">Speed</td>
							<td class="value">${this.convertSpeed(t.speed)}</td>
						</tr>
					`;
            table += `
						<tr>
							<td class="icon"><span class="zmdi zmdi-compass zmdi-hc-fw"></span></td>
						   	<td class="field">Heading</td>
						   	<td class="value">${this.convertHeading(t.heading)}</td>
						</tr>
					`;
          }
          break;

        case "newVersion":
          if (t.newVersionStatus !== "") {
            table += `
					<tr>
						<td class="icon"><span class="zmdi zmdi-download zmdi-hc-fw newVersion"></span></td>
						<td class="field newVersion">NEW Version Available!</td>
						<td class="value newVersion">${t.newVersion}</td>
					</tr>
					`;
          }
          break;

        case "version":
          if (t.carState !== "Driving") {
            if (t.newVersionStatus === "") {
              table += `
						<tr>
							<td class="icon"><span class="zmdi zmdi-download zmdi-hc-fw"></span></td>
							<td class="field">Version</td>
							<td class="value">${t.car_version.split(" ")[0]}</td>
						</tr>
						`;
            } else {
              table += `
						<tr>
							<td class="icon"><span class="zmdi zmdi-download zmdi-hc-fw newVersion"></span></td>
							<td class="field newVersion">NEW Version Available!</td>
							<td class="value newVersion">${t.newVersion}</td>
						</tr>
						`;
            }
          }
          break;

        case "location":
          if (
            t.carState !== "Driving" &&
            t.location !== "No Tagged Location Found"
          ) {
            table += `
					<tr>
					<td class="icon"><span class="zmdi zmdi-pin zmdi-hc-fw"></span></td>
						<td class="field">Location</td>
						<td class="value">${t.location}</td>
					</tr>
					`;
          }
          break;

        case "map":
          if (this.config.googleMapApiKey !== "") {
            if (!this.isExcluded(t.location) || t.carState === "Driving") {
              table += `
						<tr>
							<td class="icon ${t.carState !== "Driving" ? "dim" : ""}" colspan="3">
								<img alt="map" class="map" src="${this.getMap(t.latitude, t.longitude)}" />
							</td>
						</tr>
						`;
            }
          } else {
            table += `
					<tr>
					<td class="icon"><span class="zmdi zmdi-alert-octagon sentry zmdi-hc-fw"></span></td>
						<td class="field">MAP ERROR!</td>
						<td class="value">Missing GoogleMaps API Key</td>
					</tr>
					`;
          }
          break;

        case "distance":
          if (
            this.config.googleMapApiKey !== "" &&
            this.config.homeAddress !== ""
          ) {
            if (!this.isExcluded(t.location) || t.state === "Driving") {
              table += `
				<tr>
				<td class="icon"><span class="zmdi zmdi-ruler zmdi-hc-fw"></span></td>
					<td class="field">Distance</td>
					<td class="value">${this.convertDistance(t.distance)}</td>
				</tr>
				`;
            }
          }
          break;

        case "duration":
          if (
            this.config.googleMapApiKey !== "" &&
            this.config.homeAddress !== ""
          ) {
            if (!this.isExcluded(t.location) || t.state === "Driving") {
              const duration = moment.duration(t.duration, "seconds");
              const formattedTime = duration.format("HH:mm");
              table += `
				  <tr>
				  <td class="icon"><span class="zmdi zmdi-timer zmdi-hc-fw"></span></td>
					  <td class="field">Duration to Here</td>
					  <td class="value">${formattedTime}</td>
				  </tr>
				  `;
            }
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
      //this.updateDom(); - this was double updating the Dom.
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
    if (this.config.unitTemperature == "f") {
      valueF = valueC * (9 / 5) + 32;
      return this.numberFormat(valueF) + "&deg;F";
    } else {
      return this.numberFormat(valueC) + "&deg;C";
    }
  },

  // Converts the given distance (assumes miles input) into the configured output, with appropriate units appended
  convertDistance: function (valueMiles) {
    if (this.config.unitDistance == "km") {
      if (valueMiles === 0) {
        valueKm = 0;
      } else {
        valueKm = valueMiles * 1.60934;
      }
      return this.numberFormat(valueKm) + " km";
    } else {
      return this.numberFormat(valueMiles) + " miles";
    }
  },

  // Converts given speed (assumes miles input) to configured output with approprate units appened
  convertSpeed: function (valueMiles) {
    if (this.config.unitDistance === "km") {
      return this.numberFormat(valueMiles * 1.60934) + " Km/h";
    } else {
      return this.numberFormat(valueMiles) + " Mph";
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
  },

  // Gets Static map as picture
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
  },

  isExcluded: function (locale) {
    const excludeLocationsUpper = this.config.excludeLocations.map((location) =>
      location.toUpperCase()
    );
    return excludeLocationsUpper.includes(locale.toUpperCase());
  }
});
