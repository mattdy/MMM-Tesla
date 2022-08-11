/*
 * This is the base class for any extension that provides a source for data
 */

var DataSource = Class.extend({
  config: null, // Copy of the module configuration
  context: null, // Reference to the module itself, for any function access

  // Called when this provider is loaded, provides a copy of the configuration of the module
  init: function (context) {
    this.config = context.config;
    this.context = context;
    this.helper = null;
  },
  
  setHelper: function (helper) {
    this.helper = helper;
  },

  // Called when the main module is started
  // Throws an exception if the configuration is not correct
  start: function () {},

  // Called when we want to get new data from TeslaFi
  // This should be overridden in any sub-classes
  // 'helper' is a copy of the node_helper object for sending data back
  fetchData: function () {}
});

// Collection of all DataItemProviders that are registered with the module
DataSource.providers = [];

// Register a new DataItemProvider with the module
DataSource.register = function (identifier, details) {
  DataSource.providers[identifier.toLowerCase()] =
    DataSource.extend(details);
};