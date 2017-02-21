'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _telegram = require('./telegram');

var _telegram2 = _interopRequireDefault(_telegram);

var _wmbusMeter = require('./../meter/wmbus-meter');

var _wmbusMeter2 = _interopRequireDefault(_wmbusMeter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
* Wireless M-Bus telegram object.
*/
var WirelessMBusTelegram = function (_Telegram) {
  _inherits(WirelessMBusTelegram, _Telegram);

  /**
  * Construct telegram with buffer data.
  *
  * @param packet
  *   Data packet for telegram. Packet contains raw buffer and other options.
  * @param options with following keys
  */
  function WirelessMBusTelegram() {
    var packet = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, WirelessMBusTelegram);

    // Apply default wm-bus meter if not provided
    if (!options.hasOwnProperty('meter')) options.meter = _wmbusMeter2.default.getInstance();

    return _possibleConstructorReturn(this, (WirelessMBusTelegram.__proto__ || Object.getPrototypeOf(WirelessMBusTelegram)).call(this, packet, options));
  }

  return WirelessMBusTelegram;
}(_telegram2.default);

exports.default = WirelessMBusTelegram;