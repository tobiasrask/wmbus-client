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
    // console.log(this._meterDetails);
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
  getMeterAddress() {
    if (!this._meter)
      return null;

    return this._meter.getMeterAddress(this._meterDetails);
  }

}

export default Telegram;