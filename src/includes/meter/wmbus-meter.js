import Meter from "./meter"

// Static instance
var instance = null;

/**
* Wireless M-Bus meter.
*
* Block 2
* 
* Data header contans CI, ACC, STAT, SIG.
* 
*
* CI-FIELD (1 byte)
*   Application header, indicates application data type.
*
* ACC/CC-FIELD (1 byte)
*   Access counter number, runs from 00 to ff
*
* STATUS-FIELD (1 byte)
*   Signals about alars and errors
*
* CONGIGURATION/SIG-FIELD (2 bytes)
*   Information about encryption method, 
*
* DATA-FIELD (n bytes)
*
* CRC-FIELD (2 bytes)
*
*
* OR Encrypted Extended Link Layer (ELL):
*
* CI-FIELD (1 byte)
*   Application header, indicates application data type.
*
* CC-FIELD (1 byte)
*
* ACC-FIELD (1 byte)
*
* SN-FIELD (4 bytes)
*   Encryption mode, time field, session counter
*
* FN-FIELD (2 bytes)
*   Frame number
*
* BC-FIELD (1 byte)
*   Block counter
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
  *
  * CRC-FIELD (2 bytes)
  *   Cyclic Redundancy Check for data.
  * 
  * @return mapping
  *   Object with mapping details
  */
  getDataLinkLayerMap() {
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
        start: 4,
        length: 6
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
        },
      'BLOCK1_CRC': {
        start: 10,
        length: 2
        }
      };
  }

  /**
  * Extract meter address from details.
  *
  * @param details
  * @return address
  */
  getMeterAddress(details) {
    return details && details.has('BLOCK1_A') ? details.get('BLOCK1_A') : null;
  }

  /**
  * Extract meter control field from details.
  *
  * @param details
  * @return address
  */
  getMeterControlField(details) {
    return details && details.has('BLOCK1_C') ? details.get('BLOCK1_C') : null;
  }

  /**
  * Extract meter manufacturer id.
  *
  * @param details
  * @return address
  */
  getMeterManufacturerField(details) {
    return details && details.has('BLOCK1_M') ? details.get('BLOCK1_M') : null;
  }

  /**
  * Extract meter version id.
  *
  * @param details
  * @return address
  */
  getVersionField(details) {
    return details && details.has('BLOCK1_VERSION') ?
      details.get('BLOCK1_VERSION') : null;
  }
}

export default WirelessMBusMeter;