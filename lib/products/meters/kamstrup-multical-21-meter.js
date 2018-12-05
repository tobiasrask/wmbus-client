'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _wmbusMeter = require('./../../includes/meter/wmbus-meter');

var _wmbusMeter2 = _interopRequireDefault(_wmbusMeter);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// Static instance
var instance = null;

/**
* Kamstrup Multical 21 wireless M-Bus meter.
*
* Notes:
* Multical 21 uses wireless M-Bus, 868 MHz, Mode C1. Data packets are sent every
* 16 seconds, and every eight packet is "full" string. Other packets are
* "compact" strings.
*
* Data packets are sent at intervals of approx. 16 seconds. Every eights packet is a ”full string”, whereas the 7 intervening packets are ”compact strings”.
*
* All data packets are encrypted with 128 bit AES counter mode encryption
*
* This implementation is used with C1 mode meters with encrypted ELL.
*/

var KamstrupMultical21Meter = function (_WirelessMBusMeter) {
  _inherits(KamstrupMultical21Meter, _WirelessMBusMeter);

  function KamstrupMultical21Meter() {
    _classCallCheck(this, KamstrupMultical21Meter);

    return _possibleConstructorReturn(this, (KamstrupMultical21Meter.__proto__ || Object.getPrototypeOf(KamstrupMultical21Meter)).apply(this, arguments));
  }

  _createClass(KamstrupMultical21Meter, [{
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


      if (!_get(KamstrupMultical21Meter.prototype.__proto__ || Object.getPrototypeOf(KamstrupMultical21Meter.prototype), 'processTelegramData', this).call(this, telegram, options)) {
        return false;
      }

      telegram.setValue('BLOCKX_FN', Buffer.alloc(2, '0000', "hex"));
      telegram.setValue('BLOCKX_BC', Buffer.alloc(1, '00', "hex"));

      // If AES key is not provided directly, try to load it from meter data
      if (!options.hasOwnProperty('aes')) {
        var meterData = this.getMeterData(telegram);

        if (meterData && meterData.hasOwnProperty('aes')) options['aes'] = meterData['aes'];
      }

      if (options.hasOwnProperty('aes')) {
        telegram.setValue('BLOCK2_DECRYPTED_ELL_DATA', this.decryptTelegram(telegram, options));

        // Fetch meter information
        telegram.setValues(this.processTelegramValues(telegram, options));
        //console.log('---');
        //console.log(telegram.getPacket().getBuffer().toString('hex'));
        //console.log(this.getDecryptedELLData(telegram).toString('hex'));
        //console.log('-**-');
      }
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
        '06': 'VolumeHeat',
        '16': 'VolumeCold'
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
    * SN-FIELD (4 bytes)
    *   Encryption mode, time field, session counter
    *
    * CRC-FIELD (2 bytes)
    *   Cyclic Redundancy Check for data.
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
        },
        'BLOCK2_SN': {
          start: 13,
          length: 4
        },
        'BLOCK2_CRC': {
          start: 17,
          length: 2
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
    * Returns initialization vector for decrypt the ELL data.
    * Kamstrup uses AES with CTR (no padding) encryption. To decrypt data,
    * we need to fetch iv from M, A, CC and SN field with FN and BC (Validate these).
    *
    * @param telegram
    * @return iv buffer
    */

  }, {
    key: 'getIV',
    value: function getIV(telegram) {
      var buffers = [];
      var values = telegram.getValues();
      var blockMap = ['BLOCK1_A', 'BLOCK2_CC', 'BLOCK2_SN', 'BLOCKX_FN', 'BLOCKX_BC'].forEach(function (fieldName) {
        buffers.push(values.get(fieldName));
      });
      return Buffer.concat(buffers, 16);
    }

    /**
    * Decrypt telegram
    *
    * @param telegram
    * @param options with following key values:
    *   key - AES key for this telegram meter
    */

  }, {
    key: 'decryptTelegram',
    value: function decryptTelegram(telegram) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      if (!options.hasOwnProperty('aes')) return false;

      var AESKey = Buffer.alloc(options['aes'].length / 2, options['aes'], 'hex');

      var encryptedData = this.getEncryptedELLData(telegram).get('BLOCK2_ENCRYPTED_ELL_DATA');

      var initializationVector = this.getIV(telegram);
      return this.decryptBuffer(encryptedData, AESKey, initializationVector);
    }

    /**
    * Decrypt given buffer using AES.
    * TODO: Move this to own module?
    *
    * @param buffer
    *   Encrypted buffer
    * @param key
    *   AES key
    * @param iv
    *   Initialize vector
    * @return decrypted data
    */

  }, {
    key: 'decryptBuffer',
    value: function decryptBuffer(buffer, key, iv) {
      var algorithm = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'aes-128-ctr';

      var decipher = _crypto2.default.createDecipheriv(algorithm, key, iv);
      decipher.setAutoPadding(false);
      return Buffer.concat([decipher.update(buffer), decipher.final()]);
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
      var startIndex = 17;
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
          start: 2,
          length: 1
        }
      });

      var frameTypeCode = fV.get('BLOCK3_FRAME_TYPE').toString('hex');
      /*
      console.log('---');
      console.log(frameTypeCode);
      console.log(telegram.getPacket().getBuffer().toString('hex'));
      console.log(this.getDecryptedELLData(telegram).toString('hex'));
      console.log('-**-');
      */
      switch (frameTypeCode) {
        case '79':
          // This telegram is short frame
          return this.fetchData(data, {
            'BLOCK3_PLCRC': {
              start: 0,
              length: 2
            },
            'BLOCK3_FRAME_TYPE': {
              start: 2,
              length: 1
            },
            'BLOCK3_EXTRA_CRC': {
              start: 3,
              length: 4
            },
            'DATA_RECORD_1_VALUE': {
              start: 7,
              length: 2
            },
            'DATA_RECORD_2_VALUE': {
              start: 9,
              length: 4
            },
            'DATA_RECORD_3_VALUE': {
              start: 13,
              length: 4
            }
          });
          break;

        case '78':
          // TODO: Add symbol table to support short frames...

          // This telegram is full frame
          return this.fetchData(data, {
            'BLOCK3_PLCRC': {
              start: 0,
              length: 2
            },
            'BLOCK3_FRAME_TYPE': {
              start: 2,
              length: 1
            },
            'DATA_RECORD_1_DIF': {
              start: 3,
              length: 1
            },
            'DATA_RECORD_1_VIF': {
              start: 4,
              length: 1
            },
            'DATA_RECORD_1_VIFE': {
              start: 5,
              length: 1
            },
            'DATA_RECORD_1_VALUE': {
              start: 6,
              length: 2
            },
            'DATA_RECORD_2_DIF': {
              start: 8,
              length: 1
            },
            'DATA_RECORD_2_VIF': {
              start: 9,
              length: 1
            },
            'DATA_RECORD_2_VALUE': {
              start: 10,
              length: 4
            },
            'DATA_RECORD_3_DIF': {
              start: 14,
              length: 1
            },
            'DATA_RECORD_3_VIF': {
              start: 15,
              length: 1
            },
            'DATA_RECORD_3_VALUE': {
              start: 16,
              length: 4
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
    key: 'getMeterValue',
    value: function getMeterValue(telegram) {
      var values = telegram.getValues();
      return values.has('DATA_RECORD_2_VALUE') ? this.parseMeterValue(values.get('DATA_RECORD_2_VALUE').readUInt32LE()) : null;
    }

    /**
    * Returns meter target value
    *
    * @param telegram
    */

  }, {
    key: 'getMeterTargetValue',
    value: function getMeterTargetValue(telegram) {
      var values = telegram.getValues();
      return values.has('DATA_RECORD_3_VALUE') ? this.parseMeterValue(values.get('DATA_RECORD_3_VALUE').readUInt32LE()) : null;
    }
  }, {
    key: 'getInfoCodeDry',
    value: function getInfoCodeDry(telegram) {
      var values = telegram.getValues();
      if (values.has('DATA_RECORD_1_VALUE')) {
        var infoCodes = this.parseMeterValue(values.get('DATA_RECORD_1_VALUE').readUInt16LE());
        return (infoCodes & 0x01) != 0;
      } else return null;
    }
  }, {
    key: 'getInfoCodeReverse',
    value: function getInfoCodeReverse(telegram) {
      var values = telegram.getValues();
      if (values.has('DATA_RECORD_1_VALUE')) {
        var infoCodes = this.parseMeterValue(values.get('DATA_RECORD_1_VALUE').readUInt16LE());
        return (infoCodes & 0x02) != 0;
      } else return null;
    }
  }, {
    key: 'getInfoCodeLeak',
    value: function getInfoCodeLeak(telegram) {
      var values = telegram.getValues();
      if (values.has('DATA_RECORD_1_VALUE')) {
        var infoCodes = this.parseMeterValue(values.get('DATA_RECORD_1_VALUE').readUInt16LE());
        return (infoCodes & 0x04) != 0;
      } else return null;
    }
  }, {
    key: 'getInfoCodeBurst',
    value: function getInfoCodeBurst(telegram) {
      var values = telegram.getValues();
      if (values.has('DATA_RECORD_1_VALUE')) {
        var infoCodes = this.parseMeterValue(values.get('DATA_RECORD_1_VALUE').readUInt16LE());
        return (infoCodes & 0x08) != 0;
      } else return null;
    }
  }, {
    key: 'getInfoCodeDryDuration',
    value: function getInfoCodeDryDuration(telegram) {
      var values = telegram.getValues();
      if (values.has('DATA_RECORD_1_VALUE')) {
        var infoCodes = this.parseMeterValue(values.get('DATA_RECORD_1_VALUE').readUInt16LE());
        var infoDuration = (infoCodes & 0x70) >> 4;
        return this.transformDuration(infoDuration);
      } else return null;
    }
  }, {
    key: 'getInfoCodeReverseDuration',
    value: function getInfoCodeReverseDuration(telegram) {
      var values = telegram.getValues();
      if (values.has('DATA_RECORD_1_VALUE')) {
        var infoCodes = this.parseMeterValue(values.get('DATA_RECORD_1_VALUE').readUInt16LE());
        var infoDuration = (infoCodes & 0x0380) >> 7;
        return this.transformDuration(infoDuration);
      } else return null;
    }
  }, {
    key: 'getInfoCodeLeakDuration',
    value: function getInfoCodeLeakDuration(telegram) {
      var values = telegram.getValues();
      if (values.has('DATA_RECORD_1_VALUE')) {
        var infoCodes = this.parseMeterValue(values.get('DATA_RECORD_1_VALUE').readUInt16LE());
        var infoDuration = (infoCodes & 0x1C00) >> 10;
        return this.transformDuration(infoDuration);
      } else return null;
    }
  }, {
    key: 'getInfoCodeBurstDuration',
    value: function getInfoCodeBurstDuration(telegram) {
      var values = telegram.getValues();
      if (values.has('DATA_RECORD_1_VALUE')) {
        var infoCodes = this.parseMeterValue(values.get('DATA_RECORD_1_VALUE').readUInt16LE());
        var infoDuration = (infoCodes & 0x7000) >> 13;
        return this.transformDuration(infoDuration);
      } else return null;
    }
  }, {
    key: 'transformDuration',
    value: function transformDuration(durationCode) {
      switch (durationCode) {
        case 0:
          return '0 hours';
        case 1:
          return '1-8 hours';
        case 2:
          return '9-24 hours';
        case 3:
          return '25-72 hours';
        case 4:
          return '73-168 hours';
        case 5:
          return '169-336 hours';
        case 6:
          return '337-504 hours';
        case 7:
          return '≥505 hours';
        default:
          return 'Invalid duration code';
      }
    }

    /**
    * Parse float value.
    *
    * @param value
    * @return value
    */

  }, {
    key: 'parseMeterValue',
    value: function parseMeterValue(value) {
      return parseFloat(value) / 1000;
    }

    /**
    * Returns singleton instance of meter.
    *
    * @return instance
    */

  }], [{
    key: 'getInstance',
    value: function getInstance() {
      if (!instance) instance = new KamstrupMultical21Meter();
      return instance;
    }
  }]);

  return KamstrupMultical21Meter;
}(_wmbusMeter2.default);

exports.default = KamstrupMultical21Meter;