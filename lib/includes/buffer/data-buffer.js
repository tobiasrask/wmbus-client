'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _bufferItem = require('./buffer-item');

var _bufferItem2 = _interopRequireDefault(_bufferItem);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
* FIFO data buffer.
*/
var DataBuffer = function () {

  /**
  * Construct buffer.
  */
  function DataBuffer() {
    _classCallCheck(this, DataBuffer);

    // Link to first buffer item
    this._firstBufferItem = null;
    this._lastBufferItem = null;
    this._listeners = new Map();
  }

  /**
  * Push packet to buffer. Methdo will notify all buffer listeners 
  * implementing "onPush" callback.
  *
  * @param packet
  *   Bufferable data packet
  * @param options
  */


  _createClass(DataBuffer, [{
    key: 'push',
    value: function push(packet) {
      var bufferItem = new _bufferItem2.default(packet);

      if (this._firstBufferItem == null) this._firstBufferItem = bufferItem;

      if (this._lastBufferItem == null) {
        this._lastBufferItem = bufferItem;
      } else {
        this._lastBufferItem.setNext(bufferItem);
        this._lastBufferItem = bufferItem;
      }

      // Notify listeners which extends onPush callback
      this._listeners.forEach(function (listener, listenerKey) {
        if (listener.hasOwnProperty('onPush')) listener.onPush(packet);
      });
    }

    /**
    * Fetch next packet from buffer.
    *
    * @return packet
    *   Data packet or null if buffer is empty.
    */

  }, {
    key: 'fetch',
    value: function fetch() {
      var bufferItem = this._firstBufferItem;
      var packet = bufferItem != null ? bufferItem.getPacket() : null;

      var nextBufferItem = bufferItem != null ? bufferItem.getNext() : null;

      if (nextBufferItem != null) this._firstBufferItem = nextBufferItem;else this._firstBufferItem = this._lastBufferItem = null;

      return packet;
    }

    /**
    * Method to check if buffer has data available.
    *
    * @return boolean hasData
    */

  }, {
    key: 'hasData',
    value: function hasData() {
      return this._firstBufferItem == null ? false : true;
    }

    /**
    * Register event listener for data buffer.
    *
    * @param name
    *   Listener key name to be used when unregistering listener.
    * @param callback
    *   Listener callback
    */

  }, {
    key: 'registerListener',
    value: function registerListener(name, listener) {
      this._listeners.set(name, listener);
    }

    /**
    * Unregister listener.
    *
    * @param name
    */

  }, {
    key: 'unregisterListener',
    value: function unregisterListener(name) {
      if (this._listeners.has(name)) return this._listeners.delete(name);
    }
  }]);

  return DataBuffer;
}();

exports.default = DataBuffer;