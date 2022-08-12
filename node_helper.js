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

const DataSource = require("./DataSource");
const TeslaFi = require("./datasources/teslafi");

module.exports = NodeHelper.create({
  start: function () {
    this.started = false;
    this.config = null;
    this.source = null;
  },

  getData: function () {
    var self = this;
    
    if(!this.started) { return; }
    
    Log.info("TeslaFi fetching data from source: " + this.source.config.name);
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
      if(this.config !== null) { return; }
      
      Log.info("TeslaFi received configuration");
      this.config = payload;
      
      switch(this.config.source.name.toLowerCase()) {
      case "teslafi":
        this.source = new TeslaFi(this.config.source);
        break;
        
      default:
        Log.error("Unknown source provided for Tesla data: " + this.config.source.name);
        break;
      }

      break; // End CONFIG notification
    }
    
    if(this.config !== null && this.source !== null && !this.started) {
      Log.info("TeslaFi helper starting");
      this.sendSocketNotification("STARTED", true);
      this.started = true;
      this.getData();
    }
  }
});
