DataItemProvider.register("temperature", {
  itemName: "temperature",

  icon: `<span class="zmdi zmdi-sun zmdi-hc-fw"></span>`,
  field: "Temperature",

  updateData(data) {
    if (!data.outside_temp || !data.inside_temp) {
      this.display = false;
      return;
    } else {
      this.display = true;
    }

    this.value = this.context.convertTemperature(data.outside_temp);
    this.value += " / ";
    this.value += this.context.convertTemperature(data.inside_temp);
  }
});
