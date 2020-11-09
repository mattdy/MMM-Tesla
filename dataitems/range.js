/*
 * Display the current (ideal) range of the vehicle
 *
 * Created by Matt Dyson
 * Adapted from original code by Adrian Chrysanthou
 */
DataItemProvider.register("range", {
  icon: '<span class="zmdi zmdi-gas-station zmdi-hc-fw"></span>',
  field: "Range",

  updateData(data) {
    this.value = this.context.convertDistance(data.ideal_battery_range);
  }
});

/*
 * Display the current estimated range of the vehicle, based off recent performance
 *
 * Created by Matt Dyson
 * Adapted from original code by Adrian Chrysanthou
 */
DataItemProvider.register("range-estimated", {
  icon: '<span class="zmdi zmdi-gas-station zmdi-hc-fw"></span>',
  field: "Range",

  updateData(data) {
    this.value = this.context.convertDistance(data.est_battery_range);
    this.value += " (estimated)";
  }
});
