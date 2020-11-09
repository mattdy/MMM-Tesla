/*
 * This is the base class for any extension that provides a data item
 */

var DataItemProvider = Class.extend({
  itemName: null,

  icon: null,
  field: null,
  value: null,

  config: null, // Copy of the module configuration
  context: null, // Reference to the module itself, for any function access

  display: true, // Whether or not to display this row (for instance, missing data)

  // Called when this provider is loaded, provides a copy of the configuration of the module
  init: function (context) {
    this.config = context.config;
    this.context = context;
  },

  // Called when the main module is started
  start: function () {},

  // Called when we get new data from TeslaFi
  // We should use this to update the icon, field and value variables
  // This should be overridden in any sub-classes
  updateData: function (data) {}
});

// Collection of all DataItemProviders that are registered with the module
DataItemProvider.providers = [];

// Register a new DataItemProvider with the module
DataItemProvider.register = function (identifier, details) {
  DataItemProvider.providers[
    identifier.toLowerCase()
  ] = DataItemProvider.extend(details);
};
