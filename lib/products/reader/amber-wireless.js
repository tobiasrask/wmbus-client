"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _wmbusReader = require("./../../includes/reader/wmbus-reader");

var _wmbusReader2 = _interopRequireDefault(_wmbusReader);

var _dataSource = require("./../../includes/reader/data-source");

var _dataSource2 = _interopRequireDefault(_dataSource);

var _dataPacket = require("./../../includes/buffer/data-packet");

var _dataPacket2 = _interopRequireDefault(_dataPacket);

var _stream = require("stream");

var _stream2 = _interopRequireDefault(_stream);

var _bitwiseXor = require("bitwise-xor");

var _bitwiseXor2 = _interopRequireDefault(_bitwiseXor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// Node v0.10+ uses native Transform, else polyfill
var Transform = _stream2.default.Transform || require('readable-stream').Transform;

/**
* Wireless M-Bus reader. Provides data source.
*/

var AmberWirelessReader = function (_WMBusReader) {
  _inherits(AmberWirelessReader, _WMBusReader);

  /**
  * Constructor
  *
  * @param options
  *   source Source file to read data from  
  * @param buffer
  *   Data buffer to send data
  */
  function AmberWirelessReader() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, AmberWirelessReader);

    var _this = _possibleConstructorReturn(this, (AmberWirelessReader.__proto__ || Object.getPrototypeOf(AmberWirelessReader)).call(this, options));

    _this._buffer = options.hasOwnProperty('buffer') ? options.buffer : false;

    _this._serialPortPath = options.hasOwnProperty('serialPortPath') ? options.serialPortPath : false;

    _this._done = false;
    _this._processing = false;
    return _this;
  }

  /**
  * Implementation of enableSource().
  */


  _createClass(AmberWirelessReader, [{
    key: "enableSource",
    value: function enableSource() {
      var self = this;
      var telegramStream = new TelegramStrem();

      var SerialPort = require("serialport").SerialPort;

      var serialPort = new SerialPort(this._serialPortPath, {
        baudrate: 9600,
        databits: 8,
        stopbits: 1,
        parity: 'none'
      });

      serialPort.on("error", function () {
        console.log("Unable to connect serial port: " + self._serialPortPath);
      });

      serialPort.on("open", function () {
        console.log('Connection opened');

        serialPort.on('data', function (data) {
          // Push data to telegram stream
          telegramStream.write(data);
        });
      });

      telegramStream.on('readable', function () {
        var data = null;

        while (null !== (data = telegramStream.read())) {
          // console.log("Push raw telegram data...");
          self._buffer.push(new _dataPacket2.default(data));
        }
      });
    }

    /**
    * Returns boolean value to indicate if source is ready.
    *
    * @return boolean is ready
    */

  }, {
    key: "isReady",
    value: function isReady() {
      return this._done;
    }
  }]);

  return AmberWirelessReader;
}(_wmbusReader2.default);

/**
* Telegram Stream handles processing of imput data packets.
*/


var TelegramStrem = function (_Transform) {
  _inherits(TelegramStrem, _Transform);

  /**
  * Constructor.
  *
  * @param options
  */
  function TelegramStrem() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, TelegramStrem);

    // Make sure object mode is enabled
    options.objectMode = true;

    var _this2 = _possibleConstructorReturn(this, (TelegramStrem.__proto__ || Object.getPrototypeOf(TelegramStrem)).call(this, options));

    _this2._frameLength = -1;
    _this2._bufferedChunk = false;

    // Start byte for Amber Wireless
    _this2._startByte = new Buffer('FF', 'hex');
    return _this2;
  }

  /**
  * Implementation of hook _transform()
  */


  _createClass(TelegramStrem, [{
    key: "_transform",
    value: function _transform(chunk, enc, cb) {
      var self = this;
      var proceed = true;
      var data = this._bufferedChunk ? Buffer.concat([this._bufferedChunk, chunk]) : chunk;

      while (proceed) {
        // Find telegram start by comparing start hex code xFF.
        if (this._frameLength < 0) {
          for (var i = 0; i < data.length - 2; i++) {
            if (data[i] == self._startByte[0]) {
              // Remove leading bytes, since they are not part of this telegram
              if (i > 0) data = data.slice(i);
              // Get telegram length, and apply CRCS
              this._frameLength = data[2] + 4;
              break;
            }
          }
        }

        var frameLength = this._frameLength ? this._frameLength : -1;

        if (frameLength > 0 && data.length >= frameLength) {
          // Validate raw telegram data 
          var telegramData = data.slice(0, frameLength);

          if (self.validateChecksum(telegramData)) {
            // This is valid telegram, register and remove
            this.push(telegramData.slice(2));
            data = data.slice(frameLength - 4);
          } else {
            // This is not valid telegram, remove leading value
            data = data.slice(1);
          }
          this._frameLength = -1;
        } else {
          this._bufferedChunk = data;
          proceed = false;
        }
      }

      cb();
    }

    /**
    * Implementation of hook_flush()
    */

  }, {
    key: "_flush",
    value: function _flush(cb) {
      //console.log("Telegram stream flush...");
      this.push(this.digester.digest('hex'));
      cb();
    }

    /**
    * Validate raw telegram packet checksum.
    *
    * @param buffer
    * @return boolean is valid
    */

  }, {
    key: "validateChecksum",
    value: function validateChecksum(buffer) {
      // console.log("Validate buffer: ", buffer);
      var lastIndex = buffer.length - 1;

      return this.bufferEquals(this.countChecksum(buffer, lastIndex), buffer.slice(lastIndex, buffer.length));
    }

    /**
    * Count telegram data checksum
    *
    * @param buffer
    * @param numBits
    */

  }, {
    key: "countChecksum",
    value: function countChecksum(buffer, numBits) {
      var cs = buffer.slice(0, 1);

      if (numBits === undefined) numBits = buffer.length;

      for (var i = 1; i < numBits; i++) {
        cs = (0, _bitwiseXor2.default)(cs, buffer.slice(i, i + 1));
      }return cs;
    }

    /**
    * Check if two given buffers equals.
    *
    * @param a
    * @param b
    * @return boolean is equal
    */

  }, {
    key: "bufferEquals",
    value: function bufferEquals(a, b) {
      if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) return undefined;

      if (typeof a.equals === 'function') return a.equals(b);

      if (a.length !== b.length) return false;

      for (var i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
      }return true;
    }
  }]);

  return TelegramStrem;
}(Transform);

exports.default = AmberWirelessReader;