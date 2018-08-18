cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
  {
    "id": "cordova-plugin-splashscreen.SplashScreen",
    "file": "plugins/cordova-plugin-splashscreen/www/splashscreen.js",
    "pluginId": "cordova-plugin-splashscreen",
    "clobbers": [
      "navigator.splashscreen"
    ]
  },
  {
    "id": "phonegap-plugin-barcodescanner.BarcodeScanner",
    "file": "plugins/phonegap-plugin-barcodescanner/www/barcodescanner.js",
    "pluginId": "phonegap-plugin-barcodescanner",
    "clobbers": [
      "cordova.plugins.barcodeScanner"
    ]
  },
  {
    "id": "pushbots-cordova-plugin.PushbotsPlugin",
    "file": "plugins/pushbots-cordova-plugin/www/pushbots.js",
    "pluginId": "pushbots-cordova-plugin",
    "clobbers": [
      "PushbotsPlugin"
    ]
  }
];
module.exports.metadata = 
// TOP OF METADATA
{
  "cordova-plugin-whitelist": "1.3.3",
  "cordova-plugin-splashscreen": "5.0.2",
  "phonegap-plugin-barcodescanner": "7.1.1",
  "pushbots-cordova-plugin": "1.5.13",
  "cordova-plugin-browsersync": "0.1.7"
};
// BOTTOM OF METADATA
});