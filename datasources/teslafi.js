/*
 * Fetch data from TeslaFi
 *
 * Created by Matt Dyson
 */
class TeslaFi extends DataSource {
  constructor(config) {
    super(config);
    
    if(this.config.apiCommand === null || this.config.apiCommand === "") {
      this.config.apiCommand = "lastGood";
    }
    
    if(!this.config.apiKey) {
      throw new Exception("You must specify a TeslaFi API key");
    }
  }
  
  fetchData() {
    var self =  this;
    
     var url = buildUrl("https://www.teslafi.com", {
      path: "feed.php",
      queryParams: {
        token: this.config.apiKey,
        command: this.config.apiCommand
      }
    });

    Log.info("Sending request to TeslaFi");
    request(
      {
        url: url,
        method: "GET",
        headers: { TeslaFi_API_TOKEN: this.config.apiKey }
      },
      function (error, response, body) {
        Log.info("TeslaFi response was " + response.statusCode);
        if (!error && response.statusCode === 200) {
          self.callback(body);
        }
      }
    );
  }
}