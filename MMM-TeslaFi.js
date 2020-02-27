/* Magic Mirror
 * Module: MMM-TeslaFi
 *
 * By Adrian Chrysanthou
 * MIT Licensed.
 */
Module.register('MMM-TeslaFi', {
	defaults: {
		units: config.units,
		animationSpeed: 1000,
		refreshInterval: 1000 * 60, //refresh every minute
		updateInterval: 1000 * 3600, //update every hour
		lang: config.language,
		initialLoadDelay: 0, // 0 seconds delay
		retryDelay: 2500,
		imperial: true,
		batteryDanger: 30,
		batteryWarning: 50,
		apiBase: 'https://www.teslafi.com/feed.php?token=',
		apiQuery: '&command=lastGood',
	},
	// Define required scripts.
	getScripts: function() {
		return ['https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.11/lodash.min.js', 'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.24.0/moment.min.js', ];
	},
	getStyles: function() {
		return ['https://cdnjs.cloudflare.com/ajax/libs/material-design-iconic-font/2.2.0/css/material-design-iconic-font.min.css', 'MMM-TeslaFi.css'];
	},
	start: function() {
		Log.info('Starting module: ' + this.name);
		this.loaded = false;
		this.sendSocketNotification('CONFIG', this.config);
	},
	getDom: function() {
		var wrapper = document.createElement("div");
		if (!this.loaded) {
			wrapper.innerHTML = this.translate('LOADING');
			wrapper.className = "dimmed light small";
			return wrapper;
		}
		if (this.config.apiKey === "") {
			wrapper.innerHTML = "No Tesla Fi <i>apiKey</i> set in config file.";
			wrapper.className = "dimmed light small";
			return wrapper;
		}
		if (this.config.googleApiKey === "") {
			wrapper.innerHTML = "No Google <i>api Key</i> set in config file.";
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
		const getBatteryLevelClass = function(bl, warn, danger) {
			if (bl < danger) {
				return 'danger';
			}
			if (bl < warn) {
				return 'warning';
			}
			if (bl >= warn) {
				return 'ok';
			}
		}
		const carName = t.display_name;
		const state = t.carState;
		const latitude = t.latitude;
		const longitude = t.longitude;
		const battery = t.usable_battery_level;
		const idealRange = t.ideal_battery_range ? (!this.config.imperial ? (t.ideal_battery_range * 1.0).toFixed(0) : (t.ideal_battery_range / 1.609).toFixed(0)) : 0;
		const estRange = t.est_battery_range ? (!this.config.imperial ? (t.est_battery_range * 1.0).toFixed(0) : (t.est_battery_range / 1.609).toFixed(0)) : 0;
		const pluggedIn = t.charging_state;
		const chargeLimitSOC = t.charge_limit_soc;
		const chargeStartTime = t.charge_current_request;
		const timeToFull = t.time_to_full_charge;
		const energyAdded = t.charge_energy_added;
		const speed = t.speed ? (!this.config.imperial ? (t.speed * 1.0).toFixed(1) : (t.speed / 1.609).toFixed(1)) : 0;
		const outside_temp = t.outside_temp ? (!this.config.imperial ? (t.outside_temp * 1.0).toFixed(1) : (t.outside_temp * 9 / 5 + 32).toFixed(1)) : 0;
		const inside_temp = t.inside_temp ? (!this.config.imperial ? (t.inside_temp * 1.0).toFixed(1) : (t.inside_temp * 9 / 5 + 32).toFixed(1)) : 0;
		const odometer = t.odometer ? (!this.config.imperial ? (t.odometer * 1.0).toFixed(1) : (t.odometer / 1.609).toFixed(0)) : 0;
		const locked = t.locked;
		content.innerHTML = "";
		wrapper.innerHTML = `
		    <h2 class="mqtt-title">
		    <span class="zmdi zmdi-car zmdi-hc-1x icon"></span> ${carName}</h2>
				<ul class="mattributes">
			    <li class="mattribute battery-level battery-level-${getBatteryLevelClass(
			        battery, this.config.batteryWarning, this.config.batteryDanger
			      )}">
			      <span class="icon zmdi zmdi-battery zmdi-hc-fw"></span>
			      <span class="name">Current Battery Level</span>
			      <span class="value">${battery}%</span>
			    </li>
			    <li class="mattribute battery-level battery-level-${getBatteryLevelClass(
			      chargeLimitSOC, this.config.batteryWarning, this.config.batteryDanger
			    )}">
			    <span class="icon zmdi zmdi-battery zmdi-hc-fw"></span>
			    <span class="name">Max Battery Level</span>
			    <span class="value">${chargeLimitSOC}%</span>
			  	</li>
			    <li class="mattribute">
			      <span class="icon zmdi zmdi-car zmdi-hc-fw"></span>
			      <span class="name">Ideal v. Est. Range</span>
			      <span class="value">${idealRange} v. ${estRange} ${!this.config.imperial ? `Km` : `Mi`}</span>
			    </li>
			    ${pluggedIn ? `
			    <li class="mattribute">
			      <span class="icon zmdi zmdi-input-power zmdi-hc-fw"></span>
			      <span class="name">Charge Added</span>
			      <span class="value">${energyAdded} kWh</span>
			    </li>
			    <li class="mattribute">
			      <span class="icon zmdi zmdi-time zmdi-hc-fw"></span>
			      <span class="name">Time to Full Charge</span>
			      <span class="value">${timeToFull} Hours</span>
			    </li>
			    `: ``}
			    <li class="mattribute">
			      <span class="icon zmdi zmdi-lock zmdi-hc-fw"></span>
			      <span class="name">Lock</span>
			      <span class="value">${ locked ?
			        '<span class="zmdi zmdi-lock"></span> Locked' :
			        '<span class="zmdi zmdi-lock-open"></span> Unlocked'}
			      </span>
			    </li>
			    <li class="mattribute">
			      <span class="icon zmdi zmdi-dot-circle-alt zmdi-hc-fw"></span>
			      <span class="name">Odometer</span>
			      <span class="value">${odometer} ${!this.config.imperial ? `Km` : `Mi`}</s$
			    </li>
				  </ul>
						`;
		wrapper.className = "dimmed light small";
		wrapper.appendChild(content);
		return wrapper;
	},
	socketNotificationReceived: function(notification, payload) {
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
	tFi: function(data) {
		if (!data) {
			// Did not receive usable new data.
			return;
		}
		this.data = data;
		this.loaded = true;
		this.updateDom(this.config.animationSpeed);
	}
});
