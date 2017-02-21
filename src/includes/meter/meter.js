/**
* Base meter class for M-Bus and WM-Bus meters.
*/
class Meter {

  constructor() {
    // Initialize values
    this._disableMeterFilter = false;
    this._filter = [];
    this._meterData = new Map();
  }

  /**
  * Describe meter.
  *
  * @param telegram
  * @return information
  */
  describeMeter(telegram) {
    return 'Base Meter';
  }

  /**
  * Apply meter configuration settings.
  *
  * @param options
  *   disableMeterFilter - Boolean value to indicate if meter filter should
  *     be disabled. Defaults to false. This means that only listed meters
  *     will be passed further.
  */
  applySettings(options) {

    if (options.hasOwnProperty('disableMeterDataCheck'))
      this._disableMeterDataCheck = options.disableMeterDataCheck;

    if (options.hasOwnProperty('meterData'))
      this._meterData = options.meterData;

    if (options.hasOwnProperty('filter'))
      this._filter = options.filter;
  }

  /**
  * Retrieve requested meter settings based on telegram address.
  *
  * @param telegram
  * @return meter data or false if meter is unknown.
  */
  getMeterData(telegram) {
    return false;
  }

  /**
  * Process telegram by fetching meter values from raw data packet.
  *
  * @param telegram
  *   Telegram to be processed.
  * @return boolean succeed
  */
  processTelegramData(telegram) {
    if (!telegram)
      return false;

    return true;
  }

  /**
  * Method checks if telegram should be passed to future processing.
  *
  * @param telegram
  * @return boolean pass
  */
  passTelegram(telegram) {
    // Check if we have definition for this meter...
    if (!this._disableMeterDataCheck && !this.getMeterData(telegram))
      return false;

    // Check if we have meter filter
    if (this._filter && this._filter.length > 0) {
      let meterAddress = this.getAddressField(telegram).toString('hex');
      if (this._filter.indexOf(meterAddress) < 0)
        return false;
    }
    return true;
  }

  /**
  * Extract basic meter information from telegram data packet.
  *
  * @param packet
  *   Data packet object or buffer object
  * @param map
  *   Map for fetching packet detais
  * return meter details or null
  */
  fetchData(packet, map) {
    if (packet == undefined || packet == null)
      return null;

    let details = new Map();
    let rawData = typeof packet.getBuffer === 'function' ?
      packet.getBuffer() : packet;

    Object.keys(map).forEach(key => {
      let value = Buffer(map[key].length);
      value.fill(0);

      // Apply buffer data from packet
      let index = 0;
      let pointer = map[key].start + map[key].length;

      for (let i = map[key].start; i < pointer; i++) {
        value[index] = rawData[i];
        index++;
      }
      details.set(key, value);
    });
    return details;
  }

  /**
  * Following methods should be implemented by class that extends Meter class.
  */

  /**
  * Returns instructions how to map telegram data packet to meter information.
  *
  * @return mapping
  *   Object with mapping details
  */
  getDLLMap() {
    return {};
  }

  /**
  * Returns instructions how to map telegram data packet to extended data link
  * layer.
  *
  * @return mapping
  *   Object with mapping details
  */
  getELLMap() {
    return {};
  }

  /**
  * Extract meter address from details.
  *
  * @param details
  * @return address
  */
  getMeterAddress(details) {
    return null;
  }

  /**
  * Builds and returns reverse buffer.
  *
  * @param buffer
  * @return reverse buffer
  */
  static reverseBuffer(buffer) {
    let t = new Buffer(buffer.length)
    for (let i = 0, j = buffer.length - 1; i <= j; ++i, --j) {
      t[i] = buffer[j];
      t[j] = buffer[i];
    }
    return t;
  }

  /**
  * Returns singleton instance of meter.
  *
  * @return instance
  */
  static getInstance() {
    return null;
  }


  /**
  * Build manufacturer id.
  *
  * @param name
  *   Manufacturer name with three letter, for example "KAM" for Kamstrup.
  * @return id
  *   Buffer for manufacturer id of false
  */
  static buildManufacturerId(name) {
    if (name === undefined || name.length < 3 || name.length > 3)
      return false;

    // Make sure name is uppercase
    name = name.toUpperCase();

    // Build name
    let label = (name.charCodeAt(0) - 64) * 32 * 32 +
                (name.charCodeAt(1) - 64) * 32 +
                (name.charCodeAt(2) - 64);

    return (0x0421 <= label && label <= 0x6b5a) ?
      new Buffer(label.toString(16), 'hex') : false;
  }
}

export default Meter;