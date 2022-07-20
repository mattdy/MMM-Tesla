/*
 * Display whether or not the vehicle is locked
 *
 * Created by Matt Dyson
 * Adapted from original code by Adrian Chrysanthou
 */

DataItemProvider.register("locked", {
  onDataUpdate(data) {
    if (data.locked === "1") {
      this.icon = `<span class="zmdi zmdi-lock-outline zmdi-hc-fw"></span>`;
      this.field = "Locked";
    } else {
      this.icon = `<span class="zmdi zmdi-lock-open zmdi-hc-fw"></span>`;
      this.field = "Unlocked";
    }
  }
});

/*
 * Display the odometer value from the vehicle
 *
 * Created by Matt Dyson
 * Adapted from original code by Adrian Chrysanthou
 */
DataItemProvider.register("odometer", {
  icon: `<span class="zmdi zmdi-globe zmdi-hc-fw"></span>`,
  field: "Odometer",

  onDataUpdate(data) {
    this.value = this.context.convertDistance(data.odometer);
  }
});

/*
 * Display the state of the vehicle (whether or not it is driving etc)
 *
 * Created by Matt Dyson
 * Adapted from original code by Justyn R
 */
DataItemProvider.register("state", {
  field: "State",

  onDataUpdate(data) {
    this.value = data.carState;

    switch (data.carState) {
      case "Sentry":
        this.icon = `<span class="zmdi zmdi-hc-fw zmdi-dot-circle sentry"></span>`;
        break;

      case "Idling":
        this.icon = `<span class="zmdi zmdi-hc-fw zmdi-parking"></span>`;
        break;

      case "Driving":
        this.icon = `<span class="zmdi zmdi-hc-fw zmdi-car"></span>`;
        break;

      case "Charging":
        this.icon = `<span class="zmdi zmdi-hc-fw zmdi-input-power"></span>`;
        break;

      case "Sleeping":
        this.icon = `<span class="zmdi zmdi-hc-fw zmdi-power"></span>`;
        break;

      default:
        this.icon = `&nbsp;`;
        break;
    }
  }
});

/*
 * Display how long ago the currently loaded data was pulled by TeslaFi
 *
 * Created by Matt Dyson
 */
DataItemProvider.register("data-time", {
  icon: `<span class="zmdi zmdi-time zmdi-hc-fw"></span>`,

  onDataUpdate(data) {
    var secondsPassed = moment().diff(moment(data.Date), "seconds");
    if (secondsPassed > this.config.dataTimeout) {
      this.display = true;
      this.field = moment(data.Date).fromNow();
    } else {
      this.display = false;
    }
  }
});
