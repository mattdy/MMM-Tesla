/*
 * Fetch data from TeslaFi
 *
 * Created by Matt Dyson
 */

const NodeHelper = require("node_helper");
var request = require("request");
const Log = require("../../js/logger");
const buildUrl = require("build-url");

DataSource.register("teslafi", {
  
  start() {
    if(this.config.source.apiCommand === null || this.config.source.apiCommand === "") {
      this.config.source.apiCommand = "lastGood";
    }
    
    if(!this.config.teslafi.apiKey) {
      throw new Exception("You must specify a TeslaFi API key");
    }
  },
  
  fetchData(helper) {
    var self = this;

    var url = buildUrl("https://www.teslafi.com", {
      path: "feed.php",
      queryParams: {
        token: self.config.source.apiKey,
        command: self.config.source.apiCommand
      }
    });

    Log.info("Sending request to TeslaFi");
    request(
      {
        url: url,
        method: "GET",
        headers: { TeslaFi_API_TOKEN: this.config.source.apiKey }
      },
      function (error, response, body) {
        Log.info("TeslaFi response was " + response.statusCode);
        if (!error && response.statusCode === 200) {
          helper.sendData(body);
        }
      }
    );
  }
});