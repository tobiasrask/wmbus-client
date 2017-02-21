"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _dataSource = require("./data-source");

var _dataSource2 = _interopRequireDefault(_dataSource);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
* Base class for all data source readers.
*/
var Reader = function (_DataSource) {
  _inherits(Reader, _DataSource);

  function Reader() {
    _classCallCheck(this, Reader);

    return _possibleConstructorReturn(this, (Reader.__proto__ || Object.getPrototypeOf(Reader)).apply(this, arguments));
  }

  return Reader;
}(_dataSource2.default);

exports.default = Reader;