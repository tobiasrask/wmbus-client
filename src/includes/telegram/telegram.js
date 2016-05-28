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

    // Telegram data values, check out Maters.
    this._values = new Map();
  }

  /**
  * Merge passed values to telegram.
  *
  * @param values
  *   Map of values
  */
  setValues(values) {
    values.forEach((value, key) => {
      this._values.set(key, value);
    }, this);
  }

  /**
  * Set telegram value.
  *
  * @param key
  * @param value
  */
  setValue(key, value) {
    this._values.set(key, value);
  }

  /**
  * Get telegram values.
  *
  * @return values
  */
  getValues() {
    return this._values;
  }

  /**
  * Get telegram values.
  *
  * @param key
  * @return values
  */
  getValue(key) {
    return this._values.has(key) ? this._values.get(key) : null;
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

}

export default Telegram;