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
          self.sendSocketNotification("DATA", body);
        }
      }
    );

    setTimeout(function () {
      self.getData();
    }, this.config.refreshInterval);
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
