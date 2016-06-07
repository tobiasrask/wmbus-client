import BufferItem from './buffer-item'

/**
* FIFO data buffer.
*/
class DataBuffer {

  /**
  * Construct buffer.
  */
  constructor() {
    // Link to first buffer item
    this._firstBufferItem = null;
    this._lastBufferItem = null;
    this._listeners = new Map();
  }

  /**
  * Push packet to buffer. Methdo will notify all buffer listeners 
  * implementing "onPush" callback.
  *
  * @param packet
  *   Bufferable data packet
  * @param options
  */
  push(packet) {
    let bufferItem = new BufferItem(packet);
    
    if (this._firstBufferItem == null)
      this._firstBufferItem = bufferItem;

    if (this._lastBufferItem == null) {
      this._lastBufferItem = bufferItem;

    } else {
      this._lastBufferItem.setNext(bufferItem);
      this._lastBufferItem = bufferItem;
    }

    // Notify listeners which extends onPush callback
    this._listeners.forEach((listener, listenerKey) => {
      if (listener.hasOwnProperty('onPush'))
        listener.onPush(packet);
    });
  }

  /**
  * Fetch next packet from buffer.
  *
  * @return packet
  *   Data packet or null if buffer is empty.
  */
  fetch() {
    let bufferItem = this._firstBufferItem;
    let packet = bufferItem != null ? bufferItem.getPacket() : null;

    let nextBufferItem = bufferItem != null ? bufferItem.getNext() : null;

    if (nextBufferItem != null)
      this._firstBufferItem = nextBufferItem;
    else
      this._firstBufferItem = this._lastBufferItem = null;

    return packet;
  }

  /**
  * Method to check if buffer has data available.
  *
  * @return boolean hasData
  */
  hasData() {
    return this._firstBufferItem == null ? false : true;
  }

  /**
  * Register event listener for data buffer.
  *
  * @param name
  *   Listener key name to be used when unregistering listener.
  * @param callback
  *   Listener callback
  */
  registerListener(name, listener) {
    this._listeners.set(name, listener);
  }

  /**
  * Unregister listener.
  *
  * @param name
  */
  unregisterListener(name) {
    if (this._listeners.has(name))
      return this._listeners.delete(name)
  }
}

export default DataBuffer;