'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _wmbusMeter = require('./../../includes/meter/wmbus-meter');

var _wmbusMeter2 = _interopRequireDefault(_wmbusMeter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// Static instance
var instance = null;

/**
* TI CC1310 code for use with temperature sensor ID TIS
*/

var Hummie1Meter = function (_WirelessMBusMeter) {
  _inherits(Hummie1Meter, _WirelessMBusMeter);

  function Hummie1Meter() {
    _classCallCheck(this, Hummie1Meter);

    return _possibleConstructorReturn(this, (Hummie1Meter.__proto__ || Object.getPrototypeOf(Hummie1Meter)).apply(this, arguments));
  }

  _createClass(Hummie1Meter, [{
    key: 'processTelegramData',


    /**
    * Process telegram by fetching meter values from raw data packet.
    *
    * @param telegram
    *   Telegram to be processed.
    * @param options
    *   aes - AES key if needed
    *
    * @return boolean succeed
    */
    value: function processTelegramData(telegram) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};


      if (!_get(Hummie1Meter.prototype.__proto__ || Object.getPrototypeOf(Hummie1Meter.prototype), 'processTelegramData', this).call(this, telegram, options)) {
        return false;
      }
      telegram.setValue('BLOCK2_DECRYPTED_ELL_DATA', this.getEncryptedELLData(telegram).get('BLOCK2_ENCRYPTED_ELL_DATA')); // mon det er hele pakken??
      telegram.setValues(this.processTelegramValues(telegram, options)); //KJEP
      return true;
    }

    /**
    * Method returns meter information.
    *
    * @param telegram
    * @return meter information
    */

  }, {
    key: 'describeMeter',
    value: function describeMeter(telegram) {
      return this.describeMeterData(this.getMeterData(telegram));
    }

    /**
    * Metod returns label for meter data
    *
    * @param meterData
    * @return label
    */

  }, {
    key: 'describeMeterData',
    value: function describeMeterData() {
      var meterData = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      if (!meterData) return 'unknown';
      var types = {
        '1b': 'Temperature'
      };

      var meterType = types.hasOwnProperty(meterData['deviceType']) ? types[meterData['deviceType']] : "unknown";
      return meterData['label'] + ' (' + meterType + ')';
    }

    /**
    * Describe device type.
    *
    * @param telegram
    * @return label
    */

  }, {
    key: 'getDeviceType',
    value: function getDeviceType(telegram) {
      var meterData = this.getMeterData(telegram);
      return meterData ? meterData['deviceType'] : 'unknown';
    }

    /**
    * Returns extended data link layer map.
    *
    * Block 2 (Extended Data Link Layer)
    * CI (1 byte) CC(1 byte)   ACC(1 byte)  SN(4 bytes)  CRC(2  bytes)
    *
    * CI-FIELD (1 byte)
    *   Application header, indicates application data payload type.
    *
    * DATA-field
    *
    * CC-FIELD (1 byte)
    * CC is a communication control field and is coded using the following bitmask
    * Bit 7  |  Bit 6  |  Bit 5  |  Bit 4  |  Bit 3  |  Bit 2  |  Bit 1
    * B-field| D-field | S-field | H-field | P-field | A-field | Reserved
    * 
    * B-field,  when  set  to  1,  indicates  that the  sending  device  implements  bidirectional communication
    * D-field controls  the  response  delay  of  the  responding  device,  indicating  whether  a fast (D-field set) or slow (D-field cleared) response delay should be used
    * S-field, when set to 1, indicates a synchronized frame
    * H-field, when set to 1, indicates that the frame has been relayed by a repeater
    * P-field, when set to 1, indicates a high priority frame
    * A-field (Accessibility) is used in conjunction with the B-field to specify when a meter enables radio reception after a frame transmission
    * R-field (Repeated  Access) is  used  by  single  hop  repeaters  according  to  the  rules  in the EN 13757-5 specification
    *
    * ACC (1 byte)
    *   Access counter number, runs from 00 to ff.
    *
    * @return mapping
    *   Object with mapping details
    */

  }, {
    key: 'getELLMap',
    value: function getELLMap() {
      return {
        'BLOCK2_CI': {
          start: 10,
          length: 1
        },
        'BLOCK2_CC': {
          start: 11,
          length: 1
        },
        'BLOCK2_ACC': {
          start: 12,
          length: 1
        }
      };
    }

    /**
    * Extract meter Application Header from details.
    *
    * @param telegram
    * @return ci field
    */

  }, {
    key: 'getCIField',
    value: function getCIField(telegram) {
      var values = telegram.getValues();
      return values.has('BLOCK2_CI') ? values.get('BLOCK2_CI') : null;
    }

    /**
    * Extract meter CC details.
    *
    * @param telegram
    * @return ci field
    */

  }, {
    key: 'getCCField',
    value: function getCCField(telegram) {
      var values = telegram.getValues();
      return values.has('BLOCK2_CC') ? values.get('BLOCK2_CC') : null;
    }

    /**
    * Extract meter Access Counter Number.
    *
    * @param telegram
    * @return ACN
    */

  }, {
    key: 'getACCField',
    value: function getACCField(telegram) {
      var values = telegram.getValues();
      return values.has('BLOCK2_ACC') ? values.get('BLOCK2_ACC') : null;
    }

    /**
    * Extract meter SN field.
    *
    * @param telegram
    * @return SN field
    */

  }, {
    key: 'getSNField',
    value: function getSNField(telegram) {
      var values = telegram.getValues();
      return values.has('BLOCK2_SN') ? values.get('BLOCK2_SN') : null;
    }

    /**
    * Extract meter ELL CRC field.
    *
    * @param telegram
    * @return telegram
    */

  }, {
    key: 'getELLCRC',
    value: function getELLCRC(telegram) {
      var values = telegram.getValues();
      return values.has('BLOCK2_CRC') ? values.get('BLOCK2_CRC') : null;
    }

    /**
    * Extract meter
    *
    * @param telegram
    * @return telegram
    */

  }, {
    key: 'getDecryptedELLData',
    value: function getDecryptedELLData(telegram) {
      var values = telegram.getValues();
      return values.has('BLOCK2_DECRYPTED_ELL_DATA') ? values.get('BLOCK2_DECRYPTED_ELL_DATA') : null;
    }

    /**
    * Returns encrypted ELL data.
    *
    * @param telegram
    * @return data buffer
    */

  }, {
    key: 'getEncryptedELLData',
    value: function getEncryptedELLData(telegram) {
      var packet = telegram.getPacket();
      var startIndex = 18;
      var length = packet.getBuffer().length - startIndex;

      return this.fetchData(packet, {
        BLOCK2_ENCRYPTED_ELL_DATA: {
          start: startIndex,
          length: length
        }
      });
    }

    /**
    * Process telegram values
    *
    * @param telegram
    */

  }, {
    key: 'processTelegramValues',
    value: function processTelegramValues(telegram) {
      // Retrieve if this is short frame or long frame
      var data = this.getDecryptedELLData(telegram);

      // Get frame type
      var fV = this.fetchData(data, {
        'BLOCK3_FRAME_TYPE': {
          start: 0,
          length: 1
        }
      });

      var frameTypeCode = fV.get('BLOCK3_FRAME_TYPE').toString('hex');

      console.log('---');
      console.log(frameTypeCode);
      console.log(telegram.getPacket().getBuffer().toString('hex'));
      console.log(this.getDecryptedELLData(telegram).toString('hex'));
      console.log('-**-');

      switch (frameTypeCode) {
        case '02':
          // This telegram is short frame
          return this.fetchData(data, {
            'DATA_RECORD_1_DIF': {
              start: 0,
              length: 1
            },
            'DATA_RECORD_1_VIF': {
              start: 1,
              length: 1
            },
            'DATA_RECORD_1_VALUE': {
              start: 2,
              length: 2
            },
            'DATA_RECORD_2_DIF': {
              start: 4,
              length: 1
            },
            'DATA_RECORD_2_VIF': {
              start: 5,
              length: 1
            },
            'DATA_RECORD_2_VIFE': {
              start: 6,
              length: 1
            },
            'DATA_RECORD_2_VALUE': {
              start: 7,
              length: 1
            },
            'DATA_RECORD_3_DIF': {
              start: 8,
              length: 1
            },
            'DATA_RECORD_3_VIF': {
              start: 9,
              length: 1
            },
            'DATA_RECORD_3_VIFE': {
              start: 10,
              length: 1
            },
            'DATA_RECORD_3_VALUE': {
              start: 11,
              length: 1
            }
          });
          break;
      }
    }

    /**
    * Returns meter value.
    *
    * @param telegram
    * @return meter value
    *   Reverse buffer converted to number value.
    */

  }, {
    key: 'getMeterValue_temp',
    value: function getMeterValue_temp(telegram) {
      var values = telegram.getValues();
      return values.has('DATA_RECORD_1_VALUE') ? values.get('DATA_RECORD_1_VALUE').readInt16LE() / 10 : null;
    }
  }, {
    key: 'getMeterValue_hum',
    value: function getMeterValue_hum(telegram) {
      var values = telegram.getValues();
      return values.has('DATA_RECORD_2_VALUE') ? values.get('DATA_RECORD_2_VALUE').readUInt8() : null;
    }
  }, {
    key: 'getMeterValue_batt',
    value: function getMeterValue_batt(telegram) {
      var values = telegram.getValues();
      return values.has('DATA_RECORD_3_VALUE') ? values.get('DATA_RECORD_3_VALUE').readUInt8() / 10 : null;
    }

    /**
    * Returns singleton instance of meter.
    *
    * @return instance
    */

  }], [{
    key: 'getInstance',
    value: function getInstance() {
      if (!instance) instance = new Hummie1Meter();
      return instance;
    }
  }]);

  return Hummie1Meter;
}(_wmbusMeter2.default);

exports.default = Hummie1Meter;