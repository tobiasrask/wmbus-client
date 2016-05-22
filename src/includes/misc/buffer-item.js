/**
* Buffer item.
*/
class BufferItem {

  /**
  * Construct buffer item.
  *
  * @param packet
  *   Data packet
  */
  constructor(packet) {
    this._next = null;
    this._packet = packet;
  }

  /**
  * Returns data packet.
  *
  * @return packet
  *   Returns DataPacket
  */
  getPacket() {
    return this._packet;
  }

  /**
  * Set reference to next data buffer item.
  *
  * @param next
  *   BufferItem
  */
  setNext(next) {
    this._next = next;
  }

  /**
  * Returns reference to next data buffer item.
  *
  * @return next
  *   Returns BufferItem or null, if not assigned.
  */
  getNext() {
    return this._next;
  }

  /**
  * Reset buffer item.
  */
  resetBufferItem() {
    this._next = null;
  }
}

export default BufferItem;