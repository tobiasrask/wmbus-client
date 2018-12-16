import WirelessMBusMeter from "./../../includes/meter/wmbus-meter"


// Static instance
var instance = null;

/**
* TI CC1310 code for use with temperature sensor ID TIS
*/
class Hummie1Meter extends WirelessMBusMeter {

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
      telegram.setValue('BLOCK2_DECRYPTED_ELL_DATA', this.getEncryptedELLData(telegram).get('BLOCK2_ENCRYPTED_ELL_DATA')); // mon det er hele pakken??
      telegram.setValues(this.processTelegramValues(telegram, options)); //KJEP
    return true;
  }

  /**
  * Method returns meter information.
  *
  * @param telegram
  * @return meter information
  */
  describeMeter(telegram) {
    return this.describeMeterData(this.getMeterData(telegram));
  }

  /**
  * Metod returns label for meter data
  *
  * @param meterData
  * @return label
  */
  describeMeterData(meterData = false) {
    if (!meterData)
      return 'unknown';
    const types = {
        '1b': 'Temperature'
    }

    let meterType = types.hasOwnProperty(meterData['deviceType']) ?
      types[meterData['deviceType']] : "unknown";
    return `${meterData['label']} (${meterType})`;
  }

  /**
  * Describe device type.
  *
  * @param telegram
  * @return label
  */
  getDeviceType(telegram) {
    let meterData = this.getMeterData(telegram);
    return meterData ? meterData['deviceType'] : 'unknown';
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
  * CC is a communication control field and is coded using the following bitmask
  * Bit 7  |  Bit 6  |  Bit 5  |  Bit 4  |  Bit 3  |  Bit 2  |  Bit 1
  * B-field| D-field | S-field | H-field | P-field | A-field | Reserved
  * 
  * B-field,  when  set  to  1,  indicates  that the  sending  device  implements  bidirectional communication
  * D-field controls  the  response  delay  of  the  responding  device,  indicating  whether  a fast (D-field set) or slow (D-field cleared) response delay should be used
  * S-field, when set to 1, indicates a synchronized frame
  * H-field, when set to 1, indicates that the frame has been relayed by a repeater
  * P-field, when set to 1, indicates a high priority frame
  * A-field (Accessibility) is used in conjunction with the B-field to specify when a meter enables radio reception after a frame transmission
  * R-field (Repeated  Access) is  used  by  single  hop  repeaters  according  to  the  rules  in the EN 13757-5 specification
  *
  * ACC (1 byte)
  *   Access counter number, runs from 00 to ff.
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
  * Returns encrypted ELL data.
  *
  * @param telegram
  * @return data buffer
  */
  getEncryptedELLData(telegram) {
    let packet = telegram.getPacket();
    let startIndex = 18;
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
        start: 0,
        length: 1
        }
    });

    let frameTypeCode = fV.get('BLOCK3_FRAME_TYPE').toString('hex');
    
    console.log('---');
    console.log(frameTypeCode);
    console.log(telegram.getPacket().getBuffer().toString('hex'));
    console.log(this.getDecryptedELLData(telegram).toString('hex'));
    console.log('-**-');
    
      switch (frameTypeCode) {
          case '02':
              // This telegram is short frame
              return this.fetchData(data, {
                  'DATA_RECORD_1_DIF': {
                      start: 0,
                      length: 1
                  },
                  'DATA_RECORD_1_VIF': {
                      start: 1,
                      length: 1
                  },
                  'DATA_RECORD_1_VALUE': {
                      start: 2,
                      length: 2
                  },
                  'DATA_RECORD_2_DIF': {
                      start: 4,
                      length: 1
                  },
                  'DATA_RECORD_2_VIF': {
                      start: 5,
                      length: 1
                  },
                  'DATA_RECORD_2_VIFE': {
                      start: 6,
                      length: 1
                  },
                  'DATA_RECORD_2_VALUE': {
                      start: 7,
                      length: 1
                  },
                  'DATA_RECORD_3_DIF': {
                      start: 8,
                      length: 1
                  },
                  'DATA_RECORD_3_VIF': {
                      start: 9,
                      length: 1
                  },
                  'DATA_RECORD_3_VIFE': {
                      start: 10,
                      length: 1
                  },
                  'DATA_RECORD_3_VALUE': {
                      start: 11,
                      length: 1
                  }
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
    getMeterValue_temp(telegram) {
        let values = telegram.getValues();
        return values.has('DATA_RECORD_1_VALUE') ?
            values.get('DATA_RECORD_1_VALUE').readInt16LE() /10 : null;
    }

    getMeterValue_hum(telegram) {
        let values = telegram.getValues();
        return values.has('DATA_RECORD_2_VALUE') ?
            values.get('DATA_RECORD_2_VALUE').readUInt8() : null;
    }

    getMeterValue_batt(telegram) {
        let values = telegram.getValues();
        return values.has('DATA_RECORD_3_VALUE') ?
            values.get('DATA_RECORD_3_VALUE').readUInt8()/10 : null;
    }



  /**
  * Returns singleton instance of meter.
  *
  * @return instance
  */
  static getInstance() {
    if (!instance) instance = new Hummie1Meter();
    return instance;
  }
}

export default Hummie1Meter;