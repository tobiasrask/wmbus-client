"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _dataBuffer = require("./../includes/buffer/data-buffer");

var _dataBuffer2 = _interopRequireDefault(_dataBuffer);

var _Imst = require("./../products/reader/Imst");

var _Imst2 = _interopRequireDefault(_Imst);

var _amberWireless = require("./../products/reader/amber-wireless");

var _amberWireless2 = _interopRequireDefault(_amberWireless);

var _wmbusTelegram = require("./../includes/telegram/wmbus-telegram");

var _wmbusTelegram2 = _interopRequireDefault(_wmbusTelegram);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } //var util = require("util");


var EventEmitter = require("events").EventEmitter;

var TelegramClient = function (_EventEmitter) {
    _inherits(TelegramClient, _EventEmitter);

    function TelegramClient(dongleType, serielPort) {
        _classCallCheck(this, TelegramClient);

        //setup a buffer
        var _this = _possibleConstructorReturn(this, (TelegramClient.__proto__ || Object.getPrototypeOf(TelegramClient)).call(this));

        var buffer = new _dataBuffer2.default({ disableStoring: true });

        //Create the reader based on the settings
        if (dongleType == "Imst") {
            _this.reader = new _Imst2.default({
                buffer: buffer,
                serialPortPath: serielPort
            });
        } else {
            _this.reader = new _amberWireless2.default({
                buffer: buffer,
                serialPortPath: serielport
            });
        }

        _this.shouldbeConnected = false;

        //if an listner hooks up to the emitter then with the data event then connect the source
        _this.on("newListener", function (event) {
            if (_this.listenerCount("data") == 0 && event == "data" && !_this.isConnected()) {
                _this.connect();
            }
        });

        //If the reader connects the pass this info on
        _this.reader.on("connected", function () {
            _this.emit("connected");
        });

        _this.reader.on("disconnected", function () {
            _this.emit("disconnected");
            //if stick was pulled then attemp to reconnect
            if (_this.shouldbeConnected) {
                _this.reader.enableSource();
            }
        });

        _this.reader.on("error", function () {
            _this.emit("error");

            //if it should be connected, then retry connection
            if (_this.shouldbeConnected && !_this.isConnected) {
                var retryInterval = setInterval(function () {
                    clearInterval(retryInterval);
                    _this.reader.enableSource();
                }, 5000);
            }
        });

        //register this as a listner for new packages
        buffer.registerListener("telegramClient", {
            onPush: function onPush(arg) {
                var telegram = new _wmbusTelegram2.default(arg);
                _this.emit("data", telegram);
            }
        });

        return _this;
    }

    _createClass(TelegramClient, [{
        key: "connect",
        value: function connect() {
            this.shouldbeConnected = true;
            if (!this.isConnected()) {
                this.reader.enableSource();
            }
        }
    }, {
        key: "disconnect",
        value: function disconnect() {
            this.shouldbeConnected = false;
            if (this.isConnected()) {
                this.reader.disableSource();
            }
        }
    }, {
        key: "isConnected",
        value: function isConnected() {
            return this.reader.isEnabled();
        }
    }]);

    return TelegramClient;
}(EventEmitter);

exports.default = TelegramClient;