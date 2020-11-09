DataItemProvider.register("charge-time", {

  itemName: "charge-time",

  icon: '<span class="zmdi zmdi-battery-flash zmdi-hc-fw"></span>',
  field: 'Charging',

  updateData(data) {
    if(!data.charging_state || data.time_to_full_charge === "0.0") {
      this.display = false;
      return;
    } else {
      this.display = true;
    }

    this.value = "Done ";
    this.value += moment().add(t.time_to_full_charge, "hours").fromNow();
  }

});

DataItemProvider.register("charge-added", {

  itemName: "charge-added",

  icon: '<span class="zmdi zmdi-flash zmdi-hc-fw"></span>',
  field: 'Charge Added',

  updateData(data) {
    if(!data.charging_state || data.charging_state === "Disconnected") {
      this.display = false;
      return;
    } else {
      this.display = true;
    }

    this.value = this.context.numberFormat(data.charge_energy_added);
    this.value += " kWh";
  }

});

DataItemProvider.register("charge-power", {

  itemName: "charge-power",

  icon: '<span class="zmdi zmdi-flash zmdi-hc-fw"></span>',
  field: 'Charger Power',

  updateData(data) {
    if(!data.charging_state || data.charging_state === "Disconnected") {
      this.display = false;
      return;
    } else {
      this.display = true;
    }

    this.value = this.context.numberFormat(data.charger_power);
    this.value += " kW";
  }

});

DataItemProvider.register("power-connected", {

  itemName: "power-connected",

  icon: `<span class="zmdi zmdi-input-power zmdi-hc-fw"></span>`,

  updateData(data) {
    if(!data.charging_state) {
      this.display = false;
      return;
    } else {
      this.display = true;
    }

    if(data.charging_state !== "Disconnected") {
      this.field = "Connected";
      this.value = data.charging_state;
      if(data.scheduled_charging_pending === "1") {
        this.value = "Scheduled ";
        this.value += moment(data.scheduled_charging_start_time).fromNow();
      }
    } else {
      this.field = "Disconnected";
      this.value = null;
    }

  }

});
