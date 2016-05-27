import WirelessMBusMeter from "./../../includes/meter/wmbus-meter"

// Static instance
var instance = null;

/**
* Kamstrup Multical 21 wireless M-Bus meter.
*
* This implementation is used with C1 mode meters with encrypted ELL.
*/
class KamstrupMultical21Meter extends WirelessMBusMeter {

  /**
  * Process telegram by fetching meter values from raw data packet.
  *
  * @param telegram
  *   Telegram to be processed.
  * @return boolean succeed
  */
  processTelegramData(telegram) {

    if (!super.processTelegramData(telegram))
      return false;

    telegram.setValue('BLOCKX_FN', Buffer('0000', "hex"));
    telegram.setValue('BLOCKX_BC', Buffer('00', "hex"));
    return true;
  }

  /**
  * Returns extended data link layer map.
  *
  * Block 2 (Extended Data Link Layer)
  * CI (1 byte) CC(1 byte)   ACC(1 byte)  SN(4 bytes)  CRC(2  bytes)
  *
  * CI-FIELD (1 byte)
  *   Application header, indicates application data type.
  *
  * CC-FIELD (1 byte)
  *   ???
  * 
  * ACC (1 byte)
  *   Access counter number, runs from 00 to ff.
  *
  * SN-FIELD (4 bytes)
  *   Encryption mode, time field, session counter
  *
  * CRC-FIELD (2 bytes)
  *   Cyclic Redundancy Check for data.
  * 
  * @return mapping
  *   Object with mapping details
  */
  getELLMap() {
    return {
      'BLOCK2_CI': {
        start: 10,
        length: 1
        },
      'BLOCK2_CC': {
        start: 11,
        length: 1
        },
      'BLOCK2_ACC': {
        start: 12,
        length: 1
        },
      'BLOCK2_SN': {
        start: 13,
        length: 4
        },
      'BLOCK2_CRC': {
        start: 17,
        length: 2
        }        
      };
  }

  /**
  * Extract meter Application Header from details.
  *
  * @param telegram
  * @return ci field
  */
  getCIField(telegram) {
    let values = telegram.getValues();

    return values.has('BLOCK2_CI') ?
      values.get('BLOCK2_CI') : null;
  }

  /**
  * Extract meter CC details.
  *
  * @param telegram
  * @return ci field
  */
  getCCField(telegram) {
    let values = telegram.getValues();

    return values.has('BLOCK2_CC') ?
      values.get('BLOCK2_CC') : null;
  }

  /**
  * Extract meter Access Counter Number.
  *
  * @param telegram
  * @return ACN
  */
  getACCField(telegram) {
    let values = telegram.getValues();

    return values.has('BLOCK2_ACC') ?
      values.get('BLOCK2_ACC') : null;
  }

  /**
  * Extract meter SN field.
  *
  * @param telegram
  * @return SN field
  */
  getSNField(telegram) {
    let values = telegram.getValues();

    return values.has('BLOCK2_SN') ?
      values.get('BLOCK2_SN') : null;
  }

  /**
  * Extract meter ELL CRC field.
  *
  * @param telegram
  * @return telegram
  */
  getELLCRC(telegram) {
    let values = telegram.getValues();

    return values.has('BLOCK2_CRC') ?
      values.get('BLOCK2_CRC') : null;
  }

  /**
  * Returns initialization vector for decrypt the ELL data.
  * Kamstrup uses AES with CTR (no padding) encryption. To decrypt data, 
  * we need to fetch iv from M, A, CC and SN field with FN and BC (Validate these).
  *
  * @param telegram
  * @return iv
  */
  getInitializationVector(telegram) {
    let buffers = [];
    let values = telegram.getValues();    
    let blockMap = [
      'BLOCK1_M',
      'BLOCK1_A',
      'BLOCK2_CC',
      'BLOCK2_SN',
      'BLOCKX_FN',
      'BLOCKX_BC'].forEach(fieldName => {
        buffers.push(values.get(fieldName));
      });
    return Buffer.concat(buffers, 16);
  }

  /**
  * Returns singleton instance of meter.
  *
  * @return instance
  */
  static getInstance() {
    if (!instance) instance = new KamstrupMultical21Meter();
    return instance;
  }
}

export default KamstrupMultical21Meter;