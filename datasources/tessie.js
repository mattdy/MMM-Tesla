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
         Log.info("Tessie response was code " + response.statusCode + ": " + body);
         if (!error && response.statusCode === 200) {
           var parsed = {};
           
           for(var header in body) {
             Log.info("Entering " + header + ", which is a " + typeof header);
             
             if(typeof body[header] === "object") {
               for(var entry in body[header]) {
                 Log.info( " - " + entry + " => " + body[header][entry]);
                 parsed[entry] = body[header][entry];
               }  
             } else {
               Log.info(" - " + header + " => " + body[header]);
               parsed[header] = body[header];
             }
           }
           
           var json = JSON.stringify(parsed);
           
           Log.info("Final response from Tessie:" + json);
           
           self.callback(json);
         }
       }
     );
  }
}

module.exports = Tessie;