/**
* Base meter class for M-Bus and WM-Bus meters.
*/
class Meter {

  /**
  * Extract basic meter information from telegram data packet.
  *
  * @param packet
  *   Data packet object
  * return meter details or null
  */
  getMeterDetails(packet) {

    if (packet == undefined || packet == null)
      return null;

    let details = new Map();
    let rawData = packet.getBuffer();
    let map = this.getDataLinkLayerMap();

    Object.keys(map).forEach(key => {
      // Prepare value
      let value = Buffer(map[key].length);
      value.fill(0);

      // Apply buffer data from packet
      let index = 0;
      for (let i = map[key].start; i < (map[key].start + map[key].length); i++) {
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
  * Returns singleton instance of meter.
  *
  * @return instance
  */
  static getInstance() {
    return null;
  }

  /**
  * Returns instructions how to map telegram data packet to meter information.
  * 
  * @return mapping
  *   Object with mapping details
  */
  getDataLinkLayerMap() {
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
}

export default Meter;