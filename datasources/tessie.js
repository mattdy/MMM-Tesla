/*
 * Fetch data from Tessie
 *
 * Created by Matt Dyson
 */

var request = require("request");
const Log = require("../../../js/logger");
const buildUrl = require("build-url");
const DataSource = require("../DataSource");

class Tessie extends DataSource {
  constructor(config) {
    super(config);
    
    if(!this.config.apiKey) {
      throw new Exception("You must specify a Tessie API key");
    }
    
    if(!this.config.vin) {
      throw new Exception("You must specify the VIN of your vehicle");
    }
    
  }
  
  fetchData(callback) {
     var self =  this;
     self.callback = callback;
     
     var url = buildUrl("https://api.tessie.com", {
       path: "/" + this.config.vin + "/state",
       queryParams: {
         use_cache: true
       }
     });

     Log.info("Sending request to Tessie");
     request(
       {
         url: url,
         method: "GET",
         headers: {
           "Authorization": "Bearer " + this.config.apiKey,
           "Accept": ""
         }
       },
       function (error, response, body) {
         Log.info("TeslaFi response was " + response.statusCode);
         if (!error && response.statusCode === 200) {
           
           var parsed = {};
           
           for(header in ['charge_state', 'climate_state', 'drive_state', 'gui_settings', 'vehicle_config', 'vehicle_state']) {
             Log.info("Entering " + header);
             for(entry in response.results[0].last_state[header]) {
               Log.info( " - " + entry + " => " + response.results[0].last_state[header][entry]);
               parsed[entry] = response.results[0].last_state[header][entry];
             }
           }
           
           Log.info("Final response from Tessie:" + parsed);
           
           self.callback(parsed);
         }
       }
     );
  }
}

module.exports = Tessie;