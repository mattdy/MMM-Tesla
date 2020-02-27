# MMM-TeslaFi

This an extension for the [MagicMirror](https://github.com/MichMich/MagicMirror).

It monitors a your Tesla Stats, such as Battery Level, Temperature, Lock status and much more! A valid API key is required, the key can be requested here: https://teslafi.com

This is a partial re-write of the original MMM-TeslaFi by [f00d4tehg0dz](https://github.com/f00d4tehg0dz), which can be found [here](https://github.com/f00d4tehg0dz/MMM-TeslaFi). I have chosen to not merge this version back in as it breaks some functionality of the original module.

I am happy to accept any [bug reports](https://github.com/mattdy/MMM-TeslaFi/issues) or [pull requests](https://github.com/mattdy/MMM-TeslaFi/pulls) for new features or fixes.

## Screenshot

![screenshot.png](doc/screenshot.png)

## Installation

Open a terminal session, navigate to your MagicMirror's `modules` folder and execute `git clone https://github.com/mattdyson/MMM-TeslaFi.git`, a new folder called MMM-TeslaFi will be created.

Activate the module by adding it to the config.js file as shown below. Of course the position is up to you.

## Notes

### Config Options

| Option | Details | Example |
| --- | --- | --- |
| apiKey | **Required** - The API key from [TeslaFi.com](https://teslafi.com/api.php) | `4de3736a68714869d3e2fbda1f1b83ff` |
| batteryDanger | The percentage at which your battery level will highlight in red | `40` |
| batteryWarning | The percentage at which your battery level will highlight in orange | `60` |
| apiBase | The URL to use for the TeslaFi API | `https://www.teslafi.com/feed.php?token=` |
| apiQuery | Extra parameters to add on to the end of the TeslaFi API call | `&command=lastGoodTemp` |
| items | The rows of data you want the module to show. See list below. By default will show all available | `['battery','range-estimated','locked','odometer']` |
| initialLoadDelay | How many seconds to delay initial API call |

### Available fields

| Field name | Data display |
| --- | --- |
| battery | Shows the current charge level (percent) and the charge limit |
| range | The range (in miles) that the vehicle has available |
| range-estimated | The estimated range (in miles) that the vehicle has available |
| power-connected | Whether or not the vehicle is connected to a charger. If so, also displays the charge state |
| charge-time | How long left until the charge is complete |
| charge-added | How much energy has been added on this charge session |
| locked | Whether or not the vehicle is locked |
| odometer | Total mileage of the vehicle (rounded to 2 decimal places) |
| temperature | Temperature outside and inside the vehicle (see note below) |
| data-time | How long ago the data was collected by TeslaFi |

* Some fields (charge-time, charge-added) are only enabled if the vehicle is plugged in
* The temperature field may not be populated if you use TeslaFi's sleep mode, which will stop this row from showing entirely. You may need to use `apiQuery: "lastGoodTemp"` if this fails to show

## Future work

* Re-add support for metric & imperial units
* Display Tesla location on Google Maps

## Credits

* Thanks to [Adrian](https://github.com/f00d4tehg0dz) for the [original version](https://github.com/f00d4tehg0dz/MMM-TeslaFi)
* Big thanks to [aduyng](https://github.com/aduyng) for their [TeslaStatus](https://github.com/aduyng/MMM-TeslaStatus) module used as a template!

## Using the module

````javascript
modules: [
		{
			module:		'MMM-TeslaFi',
			position:	'top_left',
			config: {
				apiKey: 'ENTER YOUR KEY HERE',
			}
		},
]
````
