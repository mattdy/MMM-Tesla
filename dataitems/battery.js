/*
 * Display the current charge level (in percentage points) of the battery, and the
 * current charge limit set on the vehicle. Both values will be coloured according
 * to the `batteryDanger` and `batteryWarn` configuration values
 *
 * Created by Matt Dyson
 */
DataItemProvider.register('battery', {
  icon: '<span class="zmdi zmdi-battery zmdi-hc-fw"></span>',
  field: 'Battery',

  onDataUpdate (data) {
    this.display = data.usable_battery_level !== undefined
    if (!this.display) {
      return
    }

    this.value = this.formatLevel(data.usable_battery_level)

    // The charge limit isn't given by every source, so only show it if we have it
    if (data.charge_limit_soc !== undefined) {
      this.value += ' / ' + this.formatLevel(data.charge_limit_soc)
    }
  },

  formatLevel: function (level) {
    const levelClass = this.getBatteryLevelClass(level)
    return `<span class="battery-level-${levelClass}">${level}%</span>`
  },

  getBatteryLevelClass: function (bl) {
    if (bl < this.config.batteryDanger) {
      return 'danger'
    }
    if (bl < this.config.batteryWarning) {
      return 'warning'
    }
    if (bl >= this.config.batteryDanger) {
      return 'ok'
    }
  }
})
