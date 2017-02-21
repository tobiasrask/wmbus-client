'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _telegram = require('./telegram');

var _telegram2 = _interopRequireDefault(_telegram);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
* M-Bus telegram object.
*/
var MBusTelegram = function (_Telegram) {
  _inherits(MBusTelegram, _Telegram);

  function MBusTelegram() {
    _classCallCheck(this, MBusTelegram);

    return _possibleConstructorReturn(this, (MBusTelegram.__proto__ || Object.getPrototypeOf(MBusTelegram)).apply(this, arguments));
  }

  return MBusTelegram;
}(_telegram2.default);

exports.default = MBusTelegram;