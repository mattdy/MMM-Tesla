"use strict";

/* Magic Mirror
 * Module: MMM-TeslaFi
 *
 * Originally By Adrian Chrysanthou
 * Updated by Matt Dyson
 *
 * MIT Licensed.
 */

const NodeHelper = require("node_helper");
var request = require("request");
var moment = require("moment");

module.exports = NodeHelper.create({
  start: function () {
    this.started = false;
    this.config = null;
  },

  getData: function () {
	var listOfItems = Object.values(this.config.items);
    var self = this;
    var myUrl = this.config.apiBase + this.config.apiKey + this.config.apiQuery;
    request(
      {
        url: myUrl,
        method: "GET",
        headers: { TeslaFi_API_TOKEN: this.config.apiKey }
      },
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
			if(listOfItems.includes('distance') || listOfItems.includes('duration')) {
				self.getMatrixInfo(body);
			} else {
				var jBody = JSON.parse(body);
				var newBody = {...jBody, distance: null, duration: null}
		  		self.sendSocketNotification("DATA", newBody);
			}
        }
      }
    );

    setTimeout(function () {
      self.getData();
    }, this.config.refreshInterval);
  },

  getMatrixInfo: async function (body) {
	var self = this;
	var listOfExclusions = Object.values(this.config.excludeLocations).map(local => local.toUpperCase());
	const tBody = JSON.parse(body);
    const lng = tBody.longitude;
    const lat = tBody.latitude;
    const dest = encodeURI(this.config.homeAddress);
    var gUrl = `
	  ${this.config.googleApiBase}${this.config.googleMapApiKey}&origins=${lat},${lng}&destinations=${dest}&departure_time=now`;
	  if(!listOfExclusions.includes(tBody.location.toUpperCase()) && dest !== "" && this.config.googleMapApiKey !== "") {
		request(
		{
			url: gUrl,
			method: "GET"
		},
		function (error, response, mbody) {
			if (!error && response.statusCode == 200) {
			var jBody = JSON.parse(mbody);
			const distance = (jBody.rows[0].elements[0].distance.value) * 0.00062137;
			const duration = jBody.rows[0].elements[0].duration_in_traffic.value;
			const newBody = {...tBody, distance, duration}
			self.sendSocketNotification("DATA", JSON.stringify(newBody));
			} else {
				const newBody = {...tBody, distance:error, duration:error}
				self.sendSocketNotification("DATA", JSON.stringify(newBody));
			}
		}
		);
		} else {
			const newBody = {...tBody, distance:'excluded', duration:'excluded'}
			self.sendSocketNotification("DATA", JSON.stringify(newBody));
		}
	},

	socketNotificationReceived: function (notification, payload) {
		var self = this;
		if (notification === "CONFIG" && self.started == false) {
		self.config = payload;
		self.sendSocketNotification("STARTED", true);
		self.getData();
		self.started = true;
		}
  }
});
