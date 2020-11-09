/*
 * Display the currently installed software version
 *
 * Created by Matt Dyson
 * Adapted from original code by Justyn R
 */
DataItemProvider.register("version", {
  itemName: "version",

  icon: `<span class="zmdi zmdi-download zmdi-hc-fw"></span>`,
  field: "Version",

  updateData(data) {
    this.display = data.carState !== "Driving";
    this.value = data.car_version.split(" ")[0];
  }
});

/*
 * Display a message if there is a new software version available for installation
 *
 * Created by Matt Dyson
 * Adapted from original code by Justyn R
 */
DataItemProvider.register("version-new", {
  itemName: "version-new",

  icon: `<span class="zmdi zmdi-download zmdi-hc-fw newVersion">`,
  field: "New Version Available",

  updateData(data) {
    this.display = data.newVersionStatus !== "";
    this.value = data.newVersion;
  }
});
