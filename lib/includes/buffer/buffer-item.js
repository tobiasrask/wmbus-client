"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
* Buffer item.
*/
var BufferItem = function () {

  /**
  * Construct buffer item.
  *
  * @param packet
  *   Data packet
  */
  function BufferItem(packet) {
    _classCallCheck(this, BufferItem);

    this._next = null;
    this._packet = packet;
  }

  /**
  * Returns data packet.
  *
  * @return packet
  *   Returns DataPacket
  */


  _createClass(BufferItem, [{
    key: "getPacket",
    value: function getPacket() {
      return this._packet;
    }

    /**
    * Set reference to next data buffer item.
    *
    * @param next
    *   BufferItem
    */

  }, {
    key: "setNext",
    value: function setNext(next) {
      this._next = next;
    }

    /**
    * Returns reference to next data buffer item.
    *
    * @return next
    *   Returns BufferItem or null, if not assigned.
    */

  }, {
    key: "getNext",
    value: function getNext() {
      return this._next;
    }

    /**
    * Reset buffer item.
    */

  }, {
    key: "resetBufferItem",
    value: function resetBufferItem() {
      this._next = null;
    }
  }]);

  return BufferItem;
}();

exports.default = BufferItem;