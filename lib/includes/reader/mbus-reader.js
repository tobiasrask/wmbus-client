"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _reader = require("./reader");

var _reader2 = _interopRequireDefault(_reader);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
* M-Bus based data source.
*/
var MBusReader = function (_Reader) {
  _inherits(MBusReader, _Reader);

  function MBusReader() {
    _classCallCheck(this, MBusReader);

    return _possibleConstructorReturn(this, (MBusReader.__proto__ || Object.getPrototypeOf(MBusReader)).apply(this, arguments));
  }

  return MBusReader;
}(_reader2.default);

exports.default = MBusReader;