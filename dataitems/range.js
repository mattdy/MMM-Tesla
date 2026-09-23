/*
 * Display the current (ideal) range of the vehicle
 *
 * Created by Matt Dyson
 * Adapted from original code by Adrian Chrysanthou
 */
DataItemProvider.register('range', {
  icon: '<span class="zmdi zmdi-gas-station zmdi-hc-fw"></span>',
  field: 'Range',

  onDataUpdate (data) {
    const range = parseFloat(data.ideal_battery_range)

    // Hide the row rather than displaying 'NaN' if the source gave us no range
    this.display = !isNaN(range)
    if (!this.display) {
      return
    }

    this.value = this.context.convertDistance(range)
  }
})

/*
 * Display the current estimated range of the vehicle, based off recent performance
 *
 * Created by Matt Dyson
 * Adapted from original code by Adrian Chrysanthou
 */
DataItemProvider.register('range-estimated', {
  icon: '<span class="zmdi zmdi-gas-station zmdi-hc-fw"></span>',
  field: 'Range',

  onDataUpdate (data) {
    const range = parseFloat(data.est_battery_range)

    this.display = !isNaN(range)
    if (!this.display) {
      return
    }

    this.value = this.context.convertDistance(range)
    this.value += ' (estimated)'
  }
})
