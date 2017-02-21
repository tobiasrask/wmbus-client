"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
* Telegram object.
*/
var Telegram = function () {

  /**
  * Construct telegram with buffer data.
  *
  * @param packet
  *   Data packet for telegram. Packet contains raw buffer and other options.
  * @param options with following keys
  */
  function Telegram() {
    var packet = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Telegram);

    this._packet = packet;

    // Telegram data values, check out Maters.
    this._values = new Map();
  }

  /**
  * Merge passed values to telegram.
  *
  * @param values
  *   Map of values
  */


  _createClass(Telegram, [{
    key: "setValues",
    value: function setValues() {
      var _this = this;

      var values = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      if (!values) return;

      values.forEach(function (value, key) {
        _this._values.set(key, value);
      }, this);
    }

    /**
    * Set telegram value.
    *
    * @param key
    * @param value
    */

  }, {
    key: "setValue",
    value: function setValue(key, value) {
      this._values.set(key, value);
    }

    /**
    * Get telegram values.
    *
    * @return values
    */

  }, {
    key: "getValues",
    value: function getValues() {
      return this._values;
    }

    /**
    * Get telegram values.
    *
    * @param key
    * @return values
    */

  }, {
    key: "getValue",
    value: function getValue(key) {
      return this._values.has(key) ? this._values.get(key) : null;
    }

    /**
    * Return telegram raw packet.
    *
    * @return packet
    *   Data packet
    */

  }, {
    key: "getPacket",
    value: function getPacket() {
      return this._packet;
    }
  }]);

  return Telegram;
}();

exports.default = Telegram;