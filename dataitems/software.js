DataItemProvider.register("version", {
  itemName: "version",

  icon: `<span class="zmdi zmdi-download zmdi-hc-fw"></span>`,
  field: "Version",

  updateData(data) {
    this.display = data.carState !== "Driving";
    this.value = data.car_version.split(" ")[0];
  }
});

DataItemProvider.register("version-new", {
  itemName: "version-new",

  icon: `<span class="zmdi zmdi-download zmdi-hc-fw newVersion">`,
  field: "New Version Available",

  updateData(data) {
    this.display = data.newVersionStatus !== "";
    this.value = data.newVersion;
  }
});
