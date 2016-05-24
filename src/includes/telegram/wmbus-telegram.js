import Telegram from './telegram'
import WirelessMBusMeter from './../meter/wmbus-meter'

/**
* Wireless M-Bus telegram object.
*/
class WirelessMBusTelegram extends Telegram {

  /**
  * Construct telegram with buffer data.
  *
  * @param packet
  *   Data packet for telegram. Packet contains raw buffer and other options.
  * @param options with following keys
  */
  constructor(packet = null, options = {}) {
    // Apply default wm-bus meter if not provided
    if (!options.hasOwnProperty('meter'))
      options.meter = WirelessMBusMeter.getInstance();

    super(packet, options);
  }
}

export default WirelessMBusTelegram;