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

    if (!this.config.apiKey) {
      throw new Error("You must specify a Tessie API key");
    }

    if (!this.config.vin) {
      throw new Error("You must specify the VIN of your vehicle");
    }
  }

  fetchData(callback) {
    var self = this;
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
          Authorization: "Bearer " + this.config.apiKey,
          Accept: ""
        }
      },
      function (error, response, body) {
        Log.info("Tessie response was code " + response.statusCode);
        if (!error && response.statusCode === 200) {
          body = JSON.parse(body);

          var parsed = {};

          // Flatten Tessie response into one-dimensional object
          for (var header in body) {
            if (typeof body[header] === "object") {
              for (var entry in body[header]) {
                parsed[entry] = body[header][entry];
              }
            } else {
              parsed[header] = body[header];
            }
          }

          // Attempt to recreate the useful TeslaFi 'carState' variable
          var carState = "Idling";

          if (parsed["charging_state"] === "Complete") {
            carState = "Idling";
          } else if (parsed["charging_state"] === "Charging") {
            carState = "Charging";
          } else if (parsed["shift_state"] === "D") {
            carState = "Driving";
          } else if (parsed["sentry_mode"] === true) {
            carState = "Sentry";
          }

          parsed["carState"] = carState;

          var json = JSON.stringify(parsed);

          self.callback(json);
        }
      }
    );
  }
}

module.exports = Tessie;
