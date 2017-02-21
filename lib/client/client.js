'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
* Client application.
*/
var Client = function () {

  /**
  * Constructor.
  */
  function Client() {
    _classCallCheck(this, Client);

    this._eventLoopStatus = false;
    this._eventListeners = new Map();
    this._dataSources = [];
    this._filters = [];

    this.prepareEventLoop();
  }

  /**
  * Prepare event loop.
  *
  * @param options
  */


  _createClass(Client, [{
    key: 'prepareEventLoop',
    value: function prepareEventLoop() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var self = this;
      var freq = options.hasOwnProperty('freq') ? options.freq : 500;
      this._eventLoop = setInterval(self.eventLoop(), freq);
    }

    /**
    * Apply filters to filter telegrams before processing.
    */

  }, {
    key: 'applyFilters',
    value: function applyFilters(options) {
      this._filters = [];
    }

    /**
    * Start telegram processing.
    */

  }, {
    key: 'startProcessing',
    value: function startProcessing() {
      this._eventLoopStatus = true;
    }

    /**
    * Stop telegram processing.
    */

  }, {
    key: 'stopProcessing',
    value: function stopProcessing() {
      this._eventLoopStatus = false;
    }

    /**
    * Event loop to handle processing.
    */

  }, {
    key: 'eventLoop',
    value: function eventLoop() {
      if (!this._eventLoopStatus) return;

      // TODO:
    }

    /**
    * Register data source.
    *
    * @param dataSource
    */

  }, {
    key: 'registerDataSource',
    value: function registerDataSource(dataSource) {}

    /**
    * Subscribe listener to fetch information about processed telegrams.
    *
    * @param name
    * @param callback
    */

  }, {
    key: 'subscribeListener',
    value: function subscribeListener(name, callback) {
      this._eventListeners.set(name, callback);
    }
  }]);

  return Client;
}();

exports.default = Client;