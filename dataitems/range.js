DataItemProvider.register("range", {
  itemName: "range",

  icon: '<span class="zmdi zmdi-gas-station zmdi-hc-fw"></span>',
  field: "Range",

  updateData(data) {
    this.value = this.context.convertDistance(data.ideal_battery_range);
  }
});

DataItemProvider.register("range-estimated", {
  itemName: "range-estimated",

  icon: '<span class="zmdi zmdi-gas-station zmdi-hc-fw"></span>',
  field: "Range",

  updateData(data) {
    this.value = this.context.convertDistance(data.est_battery_range);
    this.value += " (estimated)";
  }
});
