'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var instance = false;

/**
* Statistics.
*/

var Statistics = function () {

  /**
  * Constructor.
  *
  * @param options
  */
  function Statistics() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Statistics);

    this._stasts = {};
    if (options.hasOwnProperty('meterData')) this.prepareStats(options.meterData);
  }

  /**
  * Prepare meter data.
  *
  * @param meterData
  */


  _createClass(Statistics, [{
    key: 'prepareStats',
    value: function prepareStats() {
      var _this = this;

      var meterData = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      meterData.forEach(function (item, key) {
        _this._stasts[key] = false;
      });
    }

    /**
    * Returns meter stats.
    *
    * @param meter
    * @param telegram
    * @return statistics
    */

  }, {
    key: 'getMeterStats',
    value: function getMeterStats(meter, telegram) {
      // See if telegram has been initialized yet
      var address = meter.getAddressField(telegram).toString('hex');
      var currentValue = meter.getMeterValue(telegram);
      var currentTargetValue = meter.getMeterTargetValue(telegram);

      if (!this._stasts.hasOwnProperty(address) || !this._stasts[address]) {

        this._stasts[address] = {
          // Meter address
          address: address,
          // Meter device type
          deviceType: meter.getDeviceType(telegram),
          // Meter description
          description: meter.describeMeter(telegram),
          // Updated timestamp
          updated: Date.now(),
          // Timestamp of first measure
          firstMeasure: meter.getTelegramTimestamp(telegram),
          // Timestamp of last measure
          lastMeasure: false,
          // Current value
          initValue: currentValue,
          // Target value (since beginning of this month)
          initTargetValue: currentTargetValue,
          // Current value
          currentValue: false,
          // Current value
          currentTargetValue: false,
          // Usage since beginning of month
          monthUsage: false,
          // Delta since first measurement
          deltaValue: false,
          // Delta since first measurement
          deltaTargetValue: false,
          // Counter
          counter: 0
        };
      }

      this._stasts[address]['counter']++;

      this._stasts[address]['lastMeasure'] = meter.getTelegramTimestamp(telegram);
      this._stasts[address]['currentValue'] = currentValue;
      this._stasts[address]['currentTargetValue'] = currentTargetValue;

      this._stasts[address]['monthUsage'] = currentValue - currentTargetValue;

      this._stasts[address]['deltaValue'] = currentValue - this._stasts[address]['initValue'];

      this._stasts[address]['deltaTargetValue'] = currentTargetValue - this._stasts[address]['initTargetValue'];

      return this._stasts[address];
    }

    /**
    * Get statistics.
    *
    * @return statistics
    */

  }, {
    key: 'getStats',
    value: function getStats() {
      return this._stasts;
    }

    /**
    * Get instance.
    *
    * @return instace
    */

  }], [{
    key: 'getInstance',
    value: function getInstance() {
      if (!instance) instance = new Statistics();
      return instance;
    }
  }]);

  return Statistics;
}();

exports.default = Statistics;