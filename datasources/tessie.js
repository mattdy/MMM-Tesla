/*
 * Fetch data from Tessie
 *
 * Created by Matt Dyson
 */

var request = require("request");
const Log = require("../../../js/logger");
const buildUrl = require("build-url");
const DataSource = require("../DataSource");
const sdk = require('api')('@tessie/v2.0#3vnlia9l48orn1r');

class Tessie extends DataSource {
  constructor(config) {
    super(config);
    
    if(!this.config.apiKey) {
      throw new Exception("You must specify a Tessie API key");
    }
    
    if(!this.config.vin) {
      throw new Exception("You must specify the VIN of your vehicle");
    }
    
    sdk.auth(this.config.apiKey);
    
  }
  
  fetchData(callback) {
     var self =  this;
     self.callback = callback
     
     Log.info("Sending request to Tessie");
     sdk.getState({use_cache: 'true', vin: this.config.vin})
     .then(function(result) {
       Log.info("Tessie response received");
       
       var json = JSON.parse(result);
       var response = {};
       
       for(header in ['charge_state', 'climate_state', 'drive_state', 'gui_settings', 'vehicle_config', 'vehicle_state']) {
         Log.info("Entering " + header);
         for(entry in json.results[0].last_state[header]) {
           Log.info( " - " + entry + " => " + json.results[0].last_state[header][entry]);
           response[entry] = json.results[0].last_state[header][entry];
         }
       }
       
       Log.info("Final response from Tessie:" + response);
       
       self.callback(response);
     })
     .catch(err => Log.error(err));
  }
}

module.exports = Tessie;