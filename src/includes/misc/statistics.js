var instance = false;

/**
* Statistics.
*/
class Statistics {

  /**
  * Constructor.
  *
  * @param options
  */
  constructor(options = {}) {
    this._stasts = {};
    if (options.hasOwnProperty('meterData'))
      this.prepareStats(options.meterData);
  }

  /**
  * Prepare meter data.
  *
  * @param meterData
  */
  prepareStats(meterData = {}) {
    meterData.forEach((item, key) => {
      this._stasts[key] = false;
    });
  }

  /**
  * Returns meter stats.
  *
  * @param meter
  * @param telegram
  * @return statistics
  */
  getMeterStats(meter, telegram) {
    // See if telegram has been initialized yet
    let address = meter.getAddressField(telegram).toString('hex');

    let currentValue = meter.getMeterValue(telegram);
    let currentTargetValue = meter.getMeterTargetValue(telegram);

    if (!this._stasts.hasOwnProperty(address) ||
        !this._stasts[address]) {

      this._stasts[address] = {
        // Meter address
        address: address,
        // Meter identification
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

    this._stasts[address]['deltaValue'] = currentValue -
        this._stasts[address]['initValue'] ;
    
    this._stasts[address]['deltaTargetValue'] = currentTargetValue -
        this._stasts[address]['initTargetValue'];

    return this._stasts[address];
  }

  /**
  * Get statistics.
  *
  * @return statistics
  */
  getStats() {
    return this._stasts;
  }

  /**
  * Get instance.
  *
  * @return instace
  */
  static getInstance() {
   if (!instance) instance = new Statistics();
    return instance;
  }
}

export default Statistics;