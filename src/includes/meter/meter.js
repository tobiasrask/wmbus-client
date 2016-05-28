/**
* Base meter class for M-Bus and WM-Bus meters.
*/
class Meter {

  /**
  * Process telegram by fetching meter values from raw data packet.
  *
  * @param telegram
  *   Telegram to be processed.
  * @return boolean succeed
  */
  processTelegramData(telegram) {
    return false;
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
  reverseBuffer(buffer) {
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
}

export default Meter;