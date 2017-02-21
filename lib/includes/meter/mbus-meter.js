"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _meter = require("./meter");

var _meter2 = _interopRequireDefault(_meter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
* M-Bus meter.
*/
var MBusMeter = function (_Meter) {
  _inherits(MBusMeter, _Meter);

  function MBusMeter() {
    _classCallCheck(this, MBusMeter);

    return _possibleConstructorReturn(this, (MBusMeter.__proto__ || Object.getPrototypeOf(MBusMeter)).apply(this, arguments));
  }

  return MBusMeter;
}(_meter2.default);

exports.default = MBusMeter;