DataItemProvider.register("speed", {

  itemName: "speed",

  icon: `<span class="zmdi zmdi-time-countdown zmdi-hc-fw"></span>`,
  field: 'Speed',

  updateData(data) {
    if(data.carState!=="Driving") {
      this.display = false;
    } else {
      this.display = true;
      this.value = this.context.convertSpeed(data.speed);
    }
  }

});

DataItemProvider.register("heading", {

  itemName: "heading",

  icon: `<span class="zmdi zmdi-compass zmdi-hc-fw"></span>`,
  field: 'Heading',

  updateData(data) {
    if(data.carState!=="Driving") {
      this.display = false;
    } else {
      this.display = true;
      this.value = this.context.convertHeading(data.heading);
    }
  }

});

