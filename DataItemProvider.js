/*
 * This is the base class for any extension that provides a data item
 */

class DataItemProvider {
  // Called when this provider is loaded, provides a copy of the configuration of the module
  constructor (context) {
    this.config = context.config // Copy of the module configuration
    this.context = context // Reference to the module itself, for any function access
  }

  // Called when the main module is started
  start () {}

  // Called when we get new data from TeslaFi
  // We should use this to update the icon, field and value variables
  // This should be overridden in any sub-classes
  onDataUpdate (data) {}
}

// Defaults live on the prototype so that values given to register() can override them
Object.assign(DataItemProvider.prototype, {
  icon: null,
  field: null,
  value: null,
  display: true // Whether or not to display this row (for instance, missing data)
})

// Collection of all DataItemProviders that are registered with the module
DataItemProvider.providers = []

// Register a new DataItemProvider with the module
DataItemProvider.register = function (identifier, details) {
  const provider = class extends DataItemProvider {}
  Object.assign(provider.prototype, details)
  DataItemProvider.providers[identifier.toLowerCase()] = provider
}
