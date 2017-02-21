'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// Static instance
var instance = null;

/**
* Log writer.
*/

var LogWriter = function (_Logger) {
  _inherits(LogWriter, _Logger);

  /**
  * Construct log writer.
  *
  * @param options
  */
  function LogWriter() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, LogWriter);

    var _this = _possibleConstructorReturn(this, (LogWriter.__proto__ || Object.getPrototypeOf(LogWriter)).call(this));

    if (!options.hasOwnProperty('logFile')) throw new Error("Log file was not provided for writer");

    if (!options.hasOwnProperty('logFileSuffix')) options.logFileSuffix = new Date().toISOString().slice(0, 10).replace(/-/g, "");

    _this._logFile = options.logFile + '--' + options.logFileSuffix + '.log';
    console.log('Log file: ' + _this._logFile);
    // No more!
    return _this;
  }

  /**
  * Data queue callback.
  *
  * @param DataPacket
  *   Raw data apcket
  */


  _createClass(LogWriter, [{
    key: 'writeRawTelegram',
    value: function writeRawTelegram(dataPacket) {
      var build = dataPacket.getTimestamp();
      build += ",";
      build += dataPacket.getBuffer().toString("hex");
      build += '\n';

      if (!this._logFile) return console.log("No log file!");

      _fs2.default.appendFile(this._logFile, build, function (err) {
        if (err) throw err;
      });
    }

    /**
    * Returns singleton instance of meter.
    *
    * @return instance
    */

  }], [{
    key: 'getInstance',
    value: function getInstance() {
      if (!instance) instance = new LogWriter();
      return instance;
    }
  }]);

  return LogWriter;
}(_logger2.default);

exports.default = LogWriter;