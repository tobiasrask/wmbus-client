'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _meter = require('./meter');

var _meter2 = _interopRequireDefault(_meter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// Static instance
var instance = null;

/**
* Wireless M-Bus meter.
*
* Data Record Header DRH
* Data Information Block DIB
* Value Information Block VIB
* DIF
* DIFE
* VIF
* VIFE
* Data
*/

var WirelessMBusMeter = function (_Meter) {
  _inherits(WirelessMBusMeter, _Meter);

  function WirelessMBusMeter() {
    _classCallCheck(this, WirelessMBusMeter);

    return _possibleConstructorReturn(this, (WirelessMBusMeter.__proto__ || Object.getPrototypeOf(WirelessMBusMeter)).apply(this, arguments));
  }

  _createClass(WirelessMBusMeter, [{
    key: 'processTelegramData',


    /**
    * Process telegram by fetching meter values from raw data packet.
    *
    * @param telegram
    *   Telegram to be processed.
    * @options
    *
    * @return boolean succeed
    */
    value: function processTelegramData(telegram) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};


      if (!_get(WirelessMBusMeter.prototype.__proto__ || Object.getPrototypeOf(WirelessMBusMeter.prototype), 'processTelegramData', this).call(this, telegram, options)) return false;

      // Get existing values and apply data
      var packet = telegram.getPacket();

      // Process DLL
      telegram.setValues(this.fetchData(packet, this.getDLLMap()));

      // If filter is enabled, we make sure that meter is 'whitelisted' and
      // that we have predefined settings for it.
      if (!this.passTelegram(telegram)) return false;

      // Process ELL
      telegram.setValues(this.fetchData(packet, this.getELLMap()));
      return true;
    }

    /**
    * Returns telegram data buffer timestamp.
    *
    * @param telegram
    * @return timestam
    */

  }, {
    key: 'getTelegramTimestamp',
    value: function getTelegramTimestamp(telegram) {
      return telegram ? telegram.getPacket().getTimestamp() : false;
    }

    /**
    * Retrieve requested meter settings based on telegram address.
    *
    * @param telegram
    * @return configuration or false if meter is unknown.
    */

  }, {
    key: 'getMeterData',
    value: function getMeterData(telegram) {
      var buffer = this.getAddressField(telegram);
      if (!buffer) return false;

      var meterAddress = buffer.toString('hex');

      return this._meterData.has(meterAddress) ? this._meterData.get(meterAddress) : false;
    }

    /**
    * Returns instructions how to map telegram data packet to extended data link
    * layer.
    *
    * @return mapping
    *   Object with mapping details
    */

  }, {
    key: 'getELLMap',
    value: function getELLMap() {
      return {};
    }

    /**
    * Returns instructions how to map telegram data packet to meter information.
    * With WM-Bus telegram we have following set:
    *
    * The device ID is 8 bytes, where:
    *   2 bytes are for manufacturer id
    *   4 bytes are device address
    *   1 byte is for version
    *   1 byte is for device type
    *
    * Structure or Wirelees M-Bus telegram:
    *
    * Block 1 (Data Link Layer)
    *
    * L-FIELD (1 byte)
    *   Length field excluding L-FIELD and all CRCs.
    *
    * C-FIELD (1 byte)
    *   Control field, packet type.
    *
    * M-FIELD (2 bytes)
    *   Manufacturer id, see DLMS:
    *   http://dlms.com/organization/flagmanufacturesids/index.html
    *
    * A-FIELD (6 bytes total)
    *   Device address, composes from:
    *     device id (4 bytes)
    *     device version (1 byte) and
    *     device type (1 byte)
    * @return mapping
    *   Object with mapping details
    */

  }, {
    key: 'getDLLMap',
    value: function getDLLMap() {
      return {
        'BLOCK1_L': {
          start: 0,
          length: 1
        },
        'BLOCK1_C': {
          start: 1,
          length: 1
        },
        'BLOCK1_M': {
          start: 2,
          length: 2
        },
        'BLOCK1_A': {
          start: 2,
          length: 8
        },
        'BLOCK1_ID': {
          start: 4,
          length: 4
        },
        'BLOCK1_VERSION': {
          start: 8,
          length: 1
        },
        'BLOCK1_TYPE': {
          start: 9,
          length: 1
        }
      };
    }

    /**
    * Extract meter address from details.
    *
    * @param telegram
    * @return address field
    */

  }, {
    key: 'getAddressField',
    value: function getAddressField(telegram) {
      var values = telegram.getValues();

      return values.has('BLOCK1_A') ? values.get('BLOCK1_A') : null;
    }

    /**
    * Extract meter control field from details.
    *
    * @param telegram
    * @return control field
    */

  }, {
    key: 'getControlField',
    value: function getControlField(telegram) {
      var values = telegram.getValues();

      return values.has('BLOCK1_C') ? values.get('BLOCK1_C') : null;
    }

    /**
    * Extract meter manufacturer id.
    *
    * @param telegram
    * @return manufacturer field
    */

  }, {
    key: 'getManufacturerField',
    value: function getManufacturerField(telegram) {
      var values = telegram.getValues();

      return values.has('BLOCK1_M') ? values.get('BLOCK1_M') : null;
    }

    /**
    * Extract meter version id.
    *
    * @param telegram
    * @return version field
    */

  }, {
    key: 'getVersionField',
    value: function getVersionField(telegram) {
      var values = telegram.getValues();

      return values.has('BLOCK1_VERSION') ? values.get('BLOCK1_VERSION') : null;
    }
  }], [{
    key: 'getInstance',


    /**
    * Returns singleton instance of meter.
    *
    * @return instance
    */
    value: function getInstance() {
      if (!instance) instance = new WirelessMBusMeter();
      return instance;
    }
  }]);

  return WirelessMBusMeter;
}(_meter2.default);

exports.default = WirelessMBusMeter;