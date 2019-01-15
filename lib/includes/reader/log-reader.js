"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _dataSource = require("./data-source");

var _dataSource2 = _interopRequireDefault(_dataSource);

var _dataPacket = require("./../buffer/data-packet");

var _dataPacket2 = _interopRequireDefault(_dataPacket);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
* Data log reader. Provides data source 
*/
var LogReader = function (_DataSource) {
  _inherits(LogReader, _DataSource);

  /**
  * Constructor
  *
  * @param options
  *   source Source file to read data from  
  * @param buffer
  *   Data buffer to send data
  */
  function LogReader() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, LogReader);

    var _this = _possibleConstructorReturn(this, (LogReader.__proto__ || Object.getPrototypeOf(LogReader)).call(this, options));

    _this._buffer = options.hasOwnProperty('buffer') ? options.buffer : false;

    if (options.hasOwnProperty('source')) _this.setSourceFile(options.source);
    return _this;
  }

  /**
  * Set source file.
  *
  * @param source
  *   Source file or array of source files, that will be processed.
  */


  _createClass(LogReader, [{
    key: "setSourceFile",
    value: function setSourceFile(source) {
      // Support single files
      if (!Array.isArray(source)) source = [source];

      this._sources = source;
      this._done = false;
      this._processing = false;
    }

    /**
    * Implementation of enableSource().
    */

  }, {
    key: "enableSource",
    value: function enableSource() {
      var self = this;

      // Check if we are processing already
      if (!this._sources || this._processing) return;

      this._sources.reduce(function (sequence, filePath) {
        return sequence.then(function () {
          return self.loadFile(filePath);
        });
      }, Promise.resolve()).then(function () {
        self._done = true;
        self._processing = false;
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

    /**
    * Load source file and build satellite data file.
    *
    * @param filePath
    *   File path ro file
    * @return promise
    */

  }, {
    key: "loadFile",
    value: function loadFile(filePath) {
      var self = this;

      return new Promise(function (resolve, reject) {
        console.log("Loading data from file: " + filePath);

        _fs2.default.readFile(filePath, function (err, data) {
          if (err) return reject(err);

          self.processLog(data);

          resolve();
        });
      });
    }

    /**
    * Process log data.
    *
    * @param data
    */

  }, {
    key: "processLog",
    value: function processLog(data) {
      var self = this;
      if (!this._buffer) return;

      data.toString().split("\n").forEach(function (row, index) {
        var rowData = row.split(",");

        if (!rowData.length == 2 || !rowData[0] || !rowData[1]) return;

        self._buffer.push(new _dataPacket2.default(Buffer.alloc(rowData[1].length / 2, rowData[1], "hex"), {
          timestamp: rowData[0]
        }));
      });
    }
  }]);

  return LogReader;
}(_dataSource2.default);

exports.default = LogReader;