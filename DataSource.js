/*
 * This is the base class for any extension that provides a source for data
 */

class DataSource {
  // Called when this provider is loaded, provides a copy of the configuration of this provider only
  constructor(config) {
    this.config = config;
    this.callback = null;
  }
  
  // Called when the main module is started
  // Throws an exception if the configuration is not correct
  start() {}

  // Called when we want to get new data from TeslaFi
  // This should be overridden in any sub-classes
  fetchData() {}
}

module.exports = DataSource;