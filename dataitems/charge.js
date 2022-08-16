/*
 * Display the time remaining until the battery reaches the specified charge limit.
 *
 * Created by Matt Dyson
 * Adapted from original code by Adrian Chrysanthou
 */
DataItemProvider.register("charge-time", {
  icon: '<span class="zmdi zmdi-battery-flash zmdi-hc-fw"></span>',
  field: "Charging",

  onDataUpdate(data) {
    var timeLeft = parseInt(data.time_to_full_charge);
    if (!data.charging_state || timeLeft === 0) {
      this.display = false;
      return;
    } else {
      this.display = true;
    }

    this.value = "Done ";
    this.value += moment().add(data.time_to_full_charge, "hours").fromNow();
  }
});

/*
 * Display the energy added to the car within the current charge cycle
 *
 * Created by Matt Dyson
 * Adapted from original code by Adrian Chrysanthou
 */
DataItemProvider.register("charge-added", {
  icon: '<span class="zmdi zmdi-flash zmdi-hc-fw"></span>',
  field: "Charge Added",

  onDataUpdate(data) {
    if (!data.charging_state || data.charging_state === "Disconnected") {
      this.display = false;
      return;
    } else {
      this.display = true;
    }

    this.value = this.context.numberFormat(data.charge_energy_added);
    this.value += " kWh";
  }
});

/*
 * Display the current energy being provided by the car charger
 *
 * Created by Matt Dyson
 * Adapted from original code by Justyn R
 */
DataItemProvider.register("charge-power", {
  icon: '<span class="zmdi zmdi-flash zmdi-hc-fw"></span>',
  field: "Charger Power",

  onDataUpdate(data) {
    var power = parseInt(data.charger_power);
    if (power === 0) {
      this.display = false;
      return;
    } else {
      this.display = true;
    }

    this.value = this.context.numberFormat(data.charger_power);
    this.value += " kW";
  }
});

/*
 * Display whether or not the car is currently connected to a charger
 *
 * Created by Matt Dyson
 * Suggestion by johnny-co
 */
DataItemProvider.register("power-connected", {
  icon: `<span class="zmdi zmdi-input-power zmdi-hc-fw"></span>`,

  onDataUpdate(data) {
    if (!data.charging_state) {
      this.display = false;
      return;
    } else {
      this.display = true;
    }

    if (data.charging_state !== "Disconnected") {
      this.field = "Connected";
      this.value = data.charging_state;
      if (data.scheduled_charging_pending === "1") {
        this.value = "Scheduled ";
        this.value += moment
          .unix(parseInt(data.scheduled_charging_start_time))
          .fromNow();
      }
    } else {
      this.field = "Disconnected";
      this.value = null;
    }
  }
});
