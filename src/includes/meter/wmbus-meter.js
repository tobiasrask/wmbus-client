
import Meter from "./meter"

// Static instance
var instance = null;

/**
* Wireless M-Bus meter.
*/
class WirelessMBusMeter extends Meter {

  /**
  * Returns singleton instance of meter.
  *
  * @return instance
  */
  static getInstance() {
    if (!instance) instance = new WirelessMBusMeter();
    return instance;
  }

  /**
  * Process telegram by fetching meter values from raw data packet.
  *
  * @param telegram
  *   Telegram to be processed.
  * @options
  *    
  * @return boolean succeed
  */
  processTelegramData(telegram, options = {}) {
    if (!telegram)
      return false;

    // Get existing values and apply data
    let packet = telegram.getPacket();

    // Process DLL
    telegram.setValues(this.fetchData(packet, this.getDLLMap()));

    // If filter is enabled, we make sure that meter is 'whitelisted' and
    // that we have predefined settings for it.
    if (options.disableMeterFilter && !this.getMeterData(telegram))
      return false;

    // Process ELL    
    telegram.setValues(this.fetchData(packet, this.getELLMap()));

    return true;
  }

  /**
  * Retrieve requested meter settings based on telegram address.
  *
  * @param telegram
  * @return configuration or false if meter is unknown.
  */
  getMeterData(telegram) {
    let buffer = this.getAddressField(telegram);

    if (!buffer)
      return false;

    let meterAddress = buffer.toString('hex');

    return this._meterData.has(meterAddress) ?
      this._meterData.get(meterAddress) : false;
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
  * Returns instructions how to map telegram data packet to meter information.
  * With WM-Bus telegram we have following set:
  *
  * The device ID is 8 bytes, where:
  *   2 bytes are for manufacturer id
  *   4 bytes are device address
  *   1 byte is for version
  *   1 byte is for device type
  *
  * Structure or Wirelees M-Bus telegram:
  *
  * Block 1 (Data Link Layer)
  *
  * L-FIELD (1 byte)
  *   Length field excluding L-FIELD and all CRCs.
  *
  * C-FIELD (1 byte)
  *   Control field, packet type.
  *
  * M-FIELD (2 bytes)
  *   Manufacturer id, see DLMS:
  *   http://dlms.com/organization/flagmanufacturesids/index.html
  *
  * A-FIELD (6 bytes total)
  *   Device address, composes from:
  *     device id (4 bytes)
  *     device version (1 byte) and
  *     device type (1 byte)
  * @return mapping
  *   Object with mapping details
  */
  getDLLMap() {
    return {
      'BLOCK1_L': {
        start: 0,
        length: 1
        },
      'BLOCK1_C': {
        start: 1,
        length: 1
        },
      'BLOCK1_M': {
        start: 2,
        length: 2
        },
      'BLOCK1_A': {
        start: 2,
        length: 8
        },
      'BLOCK1_ID': {
        start: 4,
        length: 4
        },
      'BLOCK1_VERSION': {
        start: 8,
        length: 1
        },
      'BLOCK1_TYPE': {
        start: 9,
        length: 1
        }
      };
  }

  /**
  * Extract meter address from details.
  *
  * @param telegram
  * @return address field
  */
  getAddressField(telegram) {
    let values = telegram.getValues();

    return values.has('BLOCK1_A') ?
      values.get('BLOCK1_A') : null;
  }

  /**
  * Extract meter control field from details.
  *
  * @param telegram
  * @return control field
  */
  getControlField(telegram) {
    let values = telegram.getValues();

    return values.has('BLOCK1_C') ?
      values.get('BLOCK1_C') : null;
  }

  /**
  * Extract meter manufacturer id.
  *
  * @param telegram
  * @return manufacturer field
  */
  getManufacturerField(telegram) {
    let values = telegram.getValues();

    return values.has('BLOCK1_M') ?
      values.get('BLOCK1_M') : null;
  }

  /**
  * Extract meter version id.
  *
  * @param telegram
  * @return version field
  */
  getVersionField(telegram) {
    let values = telegram.getValues();
    
    return values.has('BLOCK1_VERSION') ?
      values.get('BLOCK1_VERSION') : null;
  }
}

export default WirelessMBusMeter;