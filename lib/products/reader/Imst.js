"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _wmbusReader = require("../../includes/reader/wmbus-reader");

var _wmbusReader2 = _interopRequireDefault(_wmbusReader);

var _dataSource = require("../../includes/reader/data-source");

var _dataSource2 = _interopRequireDefault(_dataSource);

var _dataPacket = require("../../includes/buffer/data-packet");

var _dataPacket2 = _interopRequireDefault(_dataPacket);

var _stream = require("stream");

var _stream2 = _interopRequireDefault(_stream);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// Node v0.10+ uses native Transform, else polyfill
var Transform = _stream2.default.Transform || require('readable-stream').Transform;

/**
* Wireless M-Bus reader. Provides data source.
*/

var ImstReader = function (_WMBusReader) {
    _inherits(ImstReader, _WMBusReader);

    /**
    * Constructor
    *
    * @param options
    *   source Source file to read data from
    * @param buffer
    *   Data buffer to send data
    */
    function ImstReader() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, ImstReader);

        var _this = _possibleConstructorReturn(this, (ImstReader.__proto__ || Object.getPrototypeOf(ImstReader)).call(this, options));

        _this._buffer = options.hasOwnProperty('buffer') ? options.buffer : false;

        _this._serialPortPath = options.hasOwnProperty('serialPortPath') ? options.serialPortPath : false;

        _this._enabled = false;
        _this._done = false;
        _this._processing = false;
        return _this;
    }

    /**
    * Implementation of enableSource().
    */


    _createClass(ImstReader, [{
        key: "enableSource",
        value: function enableSource() {
            var _this2 = this;

            var self = this;
            var telegramStream = new TelegramStrem();

            var SerialPort = require("serialport");

            var serialPort = new SerialPort(this._serialPortPath, {
                baudRate: 57600,
                dataBits: 8,
                stopBits: 1,
                parity: 'none'
            });

            this._serialPort = serialPort;

            serialPort.on("error", function () {
                _this2.emit("error");
                console.log("Unable to connect serial port: " + self._serialPortPath);
            });

            serialPort.on("close", function () {
                _this2.emit("disconnected");
                _this2._enabled = false;
                console.log("Port: " + self._serialPortPath + " closed.");
            });

            serialPort.on("open", function () {
                _this2.emit("connected");
                console.log('Connection opened');
                _this2._enabled = true;
                //setup the wbus reader for Link mode: C1 TF-B,  Device mode:Other, Send RSSI:no, Send Timestamp: no
                var configBuff = Buffer.alloc(12, "A501030800030007b0000000", "hex");
                serialPort.write(configBuff);
                serialPort.on('data', function (data) {
                    // Push data to telegram stream
                    telegramStream.write(data);
                });
            });

            telegramStream.on('readable', function () {
                var data = null;

                while (null !== (data = telegramStream.read())) {
                    //console.log("Push raw telegram data...");
                    self._buffer.push(new _dataPacket2.default(data));
                }
            });
        }

        /**
         * Disables the source after use
         */

    }, {
        key: "disableSource",
        value: function disableSource() {
            var serialPort = this._serialPort;
            serialPort.close();
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

        /**
        * Returns boolean value to indicate if source is enabled 
        */

    }, {
        key: "isEnabled",
        value: function isEnabled() {
            return this._enabled;
        }
    }]);

    return ImstReader;
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

        var _this3 = _possibleConstructorReturn(this, (TelegramStrem.__proto__ || Object.getPrototypeOf(TelegramStrem)).call(this, options));

        _this3._frameLength = -1;
        _this3._bufferedChunk = false;

        // Start byte for Imst Wireless
        _this3._startByte = Buffer.alloc(1, 'A5', 'hex');
        return _this3;
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
                // Find telegram start by comparing start hex code.
                if (this._frameLength < 0) {
                    //As lengt is places in byte 3 there must be at least 3 bytes more in the stream than the start byte
                    for (var i = 0; i < data.length - 3; i++) {
                        if (data[i] == self._startByte[0]) {
                            // Remove leading bytes, since they are not part of this telegram
                            if (i > 0) data = data.slice(i);
                            //check that we have the length byte (enough bytes), if not data will be processed next time
                            this._frameLength = data[3] + 4;

                            break;
                        }
                    }
                }

                var frameLength = this._frameLength ? this._frameLength : -1;

                if (frameLength > 0 && data.length >= frameLength) {
                    var hasCRC = data[1] & 0x80;
                    // Extract the telegram, check for CRC
                    if (hasCRC) {
                        var telegramData = data.slice(0, frameLength + 2);
                    } else {
                        var telegramData = data.slice(0, frameLength);
                    }
                    // Only accept RadioLink messages
                    if ((telegramData[1] & 0x0F) == 0x02) {
                        // Check if checksum is proviced, if so check it else just accept it
                        if (hasCRC) {
                            // This is valid telegram, register and remove
                            if (self.validateChecksum(telegramData.slice(1, frameLength + 2), telegramData.slice(frameLength, frameLength + 2))) {
                                this.push(telegramData.slice(3, frameLength));
                                data = data.slice(frameLength + 2);
                            } else {
                                //crc didn't match skip the telegram
                                data = data.slice(1);
                            }
                        } else {
                            // This is valid telegram, register and remove but without CRC
                            this.push(telegramData.slice(3));
                            data = data.slice(frameLength);
                        }
                        //device management package, these are not used, so dump it
                    } else if ((telegramData[1] & 0x0F) == 0x01) {
                        if (hasCRC) {
                            if (self.validateChecksum(telegramData.slice(1, frameLength + 2), telegramData.slice(frameLength, frameLength + 2))) {
                                data = data.slice(frameLength + 2);
                            } else {
                                //crc didn't match skip the telegram
                                data = data.slice(1);
                            }
                        } else {
                            data = data.slice(frameLength);
                        }
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
    }, {
        key: "validateChecksum",
        value: function validateChecksum(data, checksum) {
            var crc = require("node-crc");
            var checkValue = crc.crc(16, true, 0x8408, 0x0000, 0xFFFF, 0x00, 0xffff, 0, data);

            return checkValue[0] == 15 && checkValue[1] == 71;
        }
    }]);

    return TelegramStrem;
}(Transform);

exports.default = ImstReader;