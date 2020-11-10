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
const Log = require("../../js/logger");

module.exports = NodeHelper.create({
  start: function () {
    this.started = false;
    this.config = null;
  },

  getData: function () {
    var self = this;
    var myUrl = this.config.apiBase + this.config.apiKey + this.config.apiQuery;
    Log.info("TeslaFi sending request");
    request(
      {
        url: myUrl,
        method: "GET",
        headers: { TeslaFi_API_TOKEN: this.config.apiKey }
      },
      function (error, response, body) {
        Log.info("TeslaFi response was " + response.statusCode);
        if (!error && response.statusCode === 200) {
          Log.info("TeslaFi sending data");
          self.sendSocketNotification("DATA", body);
        }
      }
    );

    setTimeout(function () {
      self.getData();
    }, this.config.updateInterval);
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "CONFIG" && this.started === false) {
      Log.info("TeslaFi received configuration");
      this.config = payload;
      this.sendSocketNotification("STARTED", true);
      this.getData();
      this.started = true;
    }
  }
});
