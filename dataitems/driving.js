/*
 * Display the current speed of the vehicle
 *
 * Created by Matt Dyson
 * Adapted from original code by Justyn R
 */
DataItemProvider.register('speed', {
  icon: '<span class="zmdi zmdi-time-countdown zmdi-hc-fw"></span>',
  field: 'Speed',

  onDataUpdate (data) {
    if (data.carState !== 'Driving') {
      this.display = false
    } else {
      this.display = true
      this.value = this.context.convertSpeed(data.speed)
    }
  }
})

/*
 * Display the current heading of the vehicle
 *
 * Created by Matt Dyson
 * Adapted from original code by Justyn R
 */
DataItemProvider.register('heading', {
  icon: '<span class="zmdi zmdi-compass zmdi-hc-fw"></span>',
  field: 'Heading',

  onDataUpdate (data) {
    if (data.carState !== 'Driving') {
      this.display = false
    } else {
      this.display = true
      this.value = this.context.convertHeading(data.heading)
    }
  }
})
