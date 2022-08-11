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
const buildUrl = require("build-url");

module.exports = NodeHelper.create({
  start: function () {
    this.started = false;
    this.config = null;
    this.source = null;
  },

  getData: function () {
    
    if(!this.started) { return; }
    
    Log.info("TeslaFi fetching data from source");
    this.source.fetchData();
    
    setTimeout(function () {
      self.getData();
    }, this.config.updateInterval);
  },
  
  sendData: function (data) {
    Log.info("TeslaFi sending data");
    this.sendSocketNotification("DATA", data);
  },

  socketNotificationReceived: function (notification, payload) {
    if(payload === null) {
      return;
    }
    
    switch(notification) {
    case "CONFIG":
      Log.info("TeslaFi received configuration");
      this.config = payload;
      break;
      
    case "SOURCE":
      Log.info("TeslaFi received data source: " + payload.config.name);
      this.source = payload;
      this.source.setHelper(this);
      break;
    }
    
    if(this.config !== null && this.source !== null && !this.started) {
      Log.info("TeslaFi helper starting");
      this.sendSocketNotification("STARTED", true);
      this.started = true;
      this.getData();
    }
  }
});
