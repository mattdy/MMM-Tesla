/*
 * Display the current inside and outside temperatures from the vehicle
 * Note that TeslaFi may not always include these variables - see the README for more information
 *
 * Created by Matt Dyson
 * Adapted from original code by Adrian Chrysanthou
 */
DataItemProvider.register("temperature", {
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
