/**
* Telegram object.
*/
class Telegram {

  /**
  * Construct telegram with buffer data.
  *
  * @param packet
  *   Data packet for telegram. Packet contains raw buffer and other options.
  * @param options with following keys
  */
  constructor(packet = null, options = {}) {
    this._packet = packet;
    this._meter = options.hasOwnProperty('meter') ? options.meter : null;

    // Process packet data
    this.processTelegramData();
  }

  /**
  * Process telegram data.
  */
  processTelegramData() {
    this._meterDetails = this._meter ?
      this._meter.getMeterDetails(this._packet ) : null;
  }

  /**
  * Return telegram raw packet.
  *
  * @return packet
  *   Data packet
  */
  getPacket() {
    return this._packet;
  }

  /**
  * Set telegram meter.
  *
  * @param meter
  */
  setMeter(meter) {
    this._meter = meter;
  }

  /**
  * Get source meter for telegram.
  *
  * @return meter objector null, if meter is not defined.
  */
  getMeter() {
    return this._meter;
  }

  /**
  * Returns meter address based on data packet.
  *
  * @return telegram id of null if meter not recognized or meter not assigned
  */
  getAddress() {
    return this._meter ?
      this._meter.getMeterAddress(this._meterDetails) : null;
  }

  /*
  * Returns meter address based on data packet.
  *
  * @return telegram id of null if meter not recognized or meter not assigned
  */
  getControlField() {
    return this._meter ?
      this._meter.getMeterControlField(this._meterDetails) : null;
  }

  /*
  * Returns meter address based on data packet.
  *
  * @return telegram id of null if meter not recognized or meter not assigned
  */
  getManufacturer() {
    return this._meter ?
      this._meter.getMeterManufacturerField(this._meterDetails) : null;
  }

  /*
  * Returns meter address based on data packet.
  *
  * @return telegram id of null if meter not recognized or meter not assigned
  */
  getVersion() {
    return this._meter ?
      this._meter.getVersionField(this._meterDetails) : null;
  }
}

export default Telegram;