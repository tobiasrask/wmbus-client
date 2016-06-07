import WirelessMBusMeter from "./../../includes/meter/wmbus-meter"
import crypto from 'crypto'

// Static instance
var instance = null;

/**
* Kamstrup Multical 21 wireless M-Bus meter.
*
* Notes:
* Multical 21 uses wireless M-Bus, 868 MHz, Mode C1. Data packets are sent every
* 16 seconds, and every eight packet is "full" string. Other packets are
* "compact" strings.
*
* Data packets are sent at intervals of approx. 16 seconds. Every eights packet is a ”full string”, whereas the 7 intervening packets are ”compact strings”.
*
* All data packets are encrypted with 128 bit AES counter mode encryption
*
* This implementation is used with C1 mode meters with encrypted ELL.
*/
class KamstrupMultical21Meter extends WirelessMBusMeter {

  /**
  * Process telegram by fetching meter values from raw data packet.
  *
  * @param telegram
  *   Telegram to be processed.
  * @param options
  *   aes - AES key if needed
  *
  * @return boolean succeed
  */
  processTelegramData(telegram, options = {}) {

    if (!super.processTelegramData(telegram, options)) {
      return false;
    }

    telegram.setValue('BLOCKX_FN', Buffer('0000', "hex"));
    telegram.setValue('BLOCKX_BC', Buffer('00', "hex"));

    // If AES key is not provided directly, try to load it from meter data
    if (!options.hasOwnProperty('aes')) {
      let meterData = this.getMeterData(telegram);
      
      if (meterData && meterData.hasOwnProperty('aes'))
        options['aes'] = meterData['aes'];
    }

    if (options.hasOwnProperty('aes')) {
      telegram.setValue('BLOCK2_DECRYPTED_ELL_DATA',
        this.decryptTelegram(telegram, options));

      // Fetch meter information
      telegram.setValues(this.processTelegramValues(telegram, options));
      //console.log('---');
      //console.log(telegram.getPacket().getBuffer().toString('hex'));
      //console.log(this.getDecryptedELLData(telegram).toString('hex'));
      //console.log('-**-');
    }
    return true;
  }

  /**
  * Method returns meter information.
  *
  * @param telegram
  * @return meter information
  */
  describeMeter(telegram) {
    let meterData = this.getMeterData(telegram);
    let types = {
      '06': 'VolumeHeat',
      '16': 'VolumeCold'
    }
    return meterData ?
      meterData['label'] + " (" + types[meterData['deviceType']] +")" : 'unknown meter';
  }

  /**
  * Returns extended data link layer map.
  *
  * Block 2 (Extended Data Link Layer)
  * CI (1 byte) CC(1 byte)   ACC(1 byte)  SN(4 bytes)  CRC(2  bytes)
  *
  * CI-FIELD (1 byte)
  *   Application header, indicates application data payload type.
  *
  * DATA-field
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
  * Extract meter 
  *
  * @param telegram
  * @return telegram
  */
  getDecryptedELLData(telegram) {
    let values = telegram.getValues();
    return values.has('BLOCK2_DECRYPTED_ELL_DATA') ?
      values.get('BLOCK2_DECRYPTED_ELL_DATA') : null;
  }

  /**
  * Returns initialization vector for decrypt the ELL data.
  * Kamstrup uses AES with CTR (no padding) encryption. To decrypt data,
  * we need to fetch iv from M, A, CC and SN field with FN and BC (Validate these).
  *
  * @param telegram
  * @return iv buffer
  */
  getIV(telegram) {
    let buffers = [];
    let values = telegram.getValues();
    let blockMap = [
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
  * Decrypt telegram
  *
  * @param telegram
  * @param options with following key values:
  *   key - AES key for this telegram meter
  */
  decryptTelegram(telegram, options = {}) {
    if (!options.hasOwnProperty('aes'))
      return false;

    let AESKey = Buffer(options['aes'], 'hex');

    let encryptedData = this.getEncryptedELLData(telegram)
      .get('BLOCK2_ENCRYPTED_ELL_DATA');

    let initializationVector = this.getIV(telegram);
    return this.decryptBuffer(encryptedData, AESKey, initializationVector);    
  }

  /**
  * Decrypt given buffer using AES.
  * TODO: Move this to own module?
  *
  * @param buffer
  *   Encrypted buffer
  * @param key
  *   AES key
  * @param iv
  *   Initialize vector
  * @return decrypted data
  */
  decryptBuffer(buffer, key, iv, algorithm = 'aes-128-ctr') {
    let decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAutoPadding(false);
    return Buffer.concat([decipher.update(buffer), decipher.final()]);
  }

  /**
  * Returns encrypted ELL data.
  *
  * @param telegram
  * @return data buffer
  */
  getEncryptedELLData(telegram) {
    let packet = telegram.getPacket();
    let startIndex = 17;
    let length = packet.getBuffer().length - startIndex;

    return this.fetchData(packet, {
      BLOCK2_ENCRYPTED_ELL_DATA: {
        start: startIndex,
        length: length
      }
    });
  }

  /**
  * Process telegram values
  *
  * @param telegram
  */
  processTelegramValues(telegram) {
    // Retrieve if this is short frame or long frame
    let data = this.getDecryptedELLData(telegram);

    // Get frame type
    let fV = this.fetchData(data, {
      'BLOCK3_FRAME_TYPE': {
        start: 2,
        length: 1
        }      
    });

    let frameTypeCode = fV.get('BLOCK3_FRAME_TYPE').toString('hex');
    /*
    console.log('---');
    console.log(frameTypeCode);
    console.log(telegram.getPacket().getBuffer().toString('hex'));
    console.log(this.getDecryptedELLData(telegram).toString('hex'));
    console.log('-**-');
    */
    switch (frameTypeCode) {
      case '79':
        // This telegram is short frame
        return this.fetchData(data, {
          'BLOCK3_PLCRC': {
            start: 0,
            length: 2
            },
          'BLOCK3_FRAME_TYPE': {
            start: 2,
            length: 1
            },      
          'BLOCK3_EXTRA_CRC': {
            start: 3,
            length: 4
            },
          'DATA_RECORD_1_VALUE': {
            start: 7,
            length: 2
            },
          'DATA_RECORD_2_VALUE': {
            start: 9,
            length: 4
            },
          'DATA_RECORD_3_VALUE': {
            start: 13,
            length: 4
            }
          });
        break;

      case '78':
        // TODO: Add symbol table to support short frames...

        // This telegram is full frame
        return this.fetchData(data, {
          'BLOCK3_PLCRC': {
            start: 0,
            length: 2
            },
          'BLOCK3_FRAME_TYPE': {
            start: 2,
            length: 1
            },      
          'DATA_RECORD_1_DIF': {
            start: 3,
            length: 1
            },
          'DATA_RECORD_1_VIF': {
            start: 4,
            length: 1
            },
          'DATA_RECORD_1_VIFE': {
            start: 5,
            length: 1
            },
          'DATA_RECORD_1_VALUE': {
            start: 6,
            length: 2
            },
          'DATA_RECORD_2_DIF': {
            start: 8,
            length: 1
            },
          'DATA_RECORD_2_VIF': {
            start: 9,
            length: 1
            },
          'DATA_RECORD_2_VALUE': {
            start: 10,
            length: 4
            },
          'DATA_RECORD_3_DIF': {
            start: 14,
            length: 1
            },
          'DATA_RECORD_3_VIF': {
            start: 15,
            length: 1
            },
          'DATA_RECORD_3_VALUE': {
            start: 16,
            length: 4
            },
          });
        break;        
    }
  }

  /**
  * Returns meter value.
  *
  * @param telegram
  * @return meter value
  *   Reverse buffer converted to number value.
  */
  getMeterValue(telegram) {
    let values = telegram.getValues();
  
    return values.has('DATA_RECORD_2_VALUE') ?
      this.parseMeterValue(values.get('DATA_RECORD_2_VALUE').readUInt32LE()) : null;
  }

  /**
  * Returns meter target value
  *
  * @param telegram
  */
  getMeterTargetValue(telegram) {
    let values = telegram.getValues();

    return values.has('DATA_RECORD_3_VALUE') ?
      this.parseMeterValue(values.get('DATA_RECORD_3_VALUE').readUInt32LE()) : null;
  }

  /**
  * Parse float value.
  *
  * @param value
  * @return value
  */
  parseMeterValue(value) {
    return parseFloat(value) / 1000;
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