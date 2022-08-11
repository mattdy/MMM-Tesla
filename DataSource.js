/*
 * This is the base class for any extension that provides a source for data
 */

var DataSource = Class.extend({
  config: null, // Copy of the provider configuration

  // Called when this provider is loaded, provides a copy of the configuration of this provider only
  init: function (config) {
    this.config = config;
    this.callback = null;
  },
  
  setCallback: function (callback) {
    Log.info("Received callback function: " + callback)
    this.callback = callback;
  },

  // Called when the main module is started
  // Throws an exception if the configuration is not correct
  start: function () {},

  // Called when we want to get new data from TeslaFi
  // This should be overridden in any sub-classes
  fetchData: function () {}
});

// Collection of all DataItemProviders that are registered with the module
DataSource.providers = [];

// Register a new DataItemProvider with the module
DataSource.register = function (identifier, details) {
  DataSource.providers[identifier.toLowerCase()] =
    DataSource.extend(details);
};