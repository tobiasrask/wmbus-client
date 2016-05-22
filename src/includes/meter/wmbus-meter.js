import Meter from "./meter"

/**
* Wireless M-Bus meter.
*
*/
class WirelessMBusMeter extends Meter {

  /**
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
  *   Control field, packet type
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
  *
  */

export default WirelessMBusMeter;