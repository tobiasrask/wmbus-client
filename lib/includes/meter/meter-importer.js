"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _meter = require("./meter");

var _meter2 = _interopRequireDefault(_meter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
* Meter and keyfile importer.
*/
var MeterImporter = function () {
  function MeterImporter() {
    _classCallCheck(this, MeterImporter);
  }

  _createClass(MeterImporter, null, [{
    key: "loadMeterSettings",


    /**
    * Load list of meter settings to has Map to be used by program.
    * Settings file is json file, with array of meters.
    *
    * Example:
    * [
    *   {
    *     "manufacturer": "KAM",
    *     "serial": "00000000",
    *     "version": "1b",
    *     "deviceType": "06",
    *     "aes": "0000000000000000",
    *     "label": "My meter"
    *   }
    * ]
    *
    * @param source file
    *   Source file path. File content should be valid JSON with expected data.  
    * @param callback
    *   Passes error or Map of meters
    */
    value: function loadMeterSettings(source, callback) {
      var self = this;
      // console.log(`Loading meter key file from file: ${source}`);

      _fs2.default.readFile(source, function (err, data) {
        if (err) return callback(err);

        var items = false;
        try {
          items = JSON.parse(data);
        } catch (e) {
          // TODO
        }

        if (!items) return callback(new Error("Unable to parse meter data"));

        var meterData = new Map();

        items.forEach(function (row) {

          // Validate input values
          if (!row.hasOwnProperty('manufacturer') || !row.hasOwnProperty('serial') || !row.hasOwnProperty('version') || !row.hasOwnProperty('deviceType')) return;

          // Build meter address
          var meterAddress = Buffer.concat([_meter2.default.reverseBuffer(_meter2.default.buildManufacturerId(row['manufacturer'])), _meter2.default.reverseBuffer(Buffer.alloc(4, row['serial'], 'hex')), Buffer.alloc(1, row['version'], 'hex'), Buffer.alloc(1, row['deviceType'], 'hex')]);

          // We use String keys as since Map requires original buffer to match
          meterData.set(meterAddress.toString('hex'), row);
        });
        callback(null, meterData);
      });
    }
  }]);

  return MeterImporter;
}();

exports.default = MeterImporter;