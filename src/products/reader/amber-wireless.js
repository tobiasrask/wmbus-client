import WMBusReader from "./../../includes/reader/wmbus-reader"
import DataSource from "./../../includes/reader/data-source"
import DataPacket from "./../../includes/buffer/data-packet"
import stream from 'stream'
import xor  from 'bitwise-xor'

// Node v0.10+ uses native Transform, else polyfill
const Transform = stream.Transform ||
  require('readable-stream').Transform;

/**
* Wireless M-Bus reader. Provides data source.
*/
class AmberWirelessReader extends WMBusReader {

  /**
  * Constructor
  *
  * @param options
  *   source Source file to read data from
  * @param buffer
  *   Data buffer to send data
  */
  constructor(options = {}) {
    super(options);

    this._buffer = options.hasOwnProperty('buffer') ?
      options.buffer : false;

    this._serialPortPath = options.hasOwnProperty('serialPortPath') ?
      options.serialPortPath : false;

    this._enabled = false;    
    this._done = false;
    this._processing = false;
  }

  /**
  * Implementation of enableSource().
  */
  enableSource() {
    let self = this;
    let telegramStream = new TelegramStrem();

    let SerialPort = require("serialport");

    let serialPort = new SerialPort(this._serialPortPath, {
      baudRate: 9600,
      dataBits: 8,
      stopBits: 1,
      parity: 'none'
    });

      serialPort.on("error", () => {
          this.emit("error");
      console.log(`Unable to connect serial port: ${self._serialPortPath}`);
    });

      serialPort.on("close", () => {
          this.emit("disconnected");
          this._enabled = false;
          console.log(`Port: ${self._serialPortPath} closed.`)
      });

      serialPort.on("open", () => {
      this.emit("connected");
      console.log('Connection opened');
      this._enabled = true;

      serialPort.on('data', (data) => {
        // Push data to telegram stream
        telegramStream.write(data);
      });
    });

    telegramStream.on('readable', () => {
      let data = null;

      while (null !== (data = telegramStream.read())) {
        // console.log("Push raw telegram data...");
        self._buffer.push(new DataPacket(data));
      }
    });
  }

  /**
  * Disables the source after use
  */
  disableSource() {
      let serialPort = this._serialPort;
      serialPort.close();
  }

  /**
  * Returns boolean value to indicate if source is ready.
  *
  * @return boolean is ready
  */
  isReady() {
    return this._done;
  }

  /**
   * Returns boolean value to indicate if source is enabled 
   */
  isEnabled() {
      return this._enabled;
  }
}

/**
* Telegram Stream handles processing of imput data packets.
*/
class TelegramStrem extends Transform {

  /**
  * Constructor.
  *
  * @param options
  */
  constructor(options = {}) {
    // Make sure object mode is enabled
    options.objectMode = true;
    super(options);

    this._frameLength = -1;
    this._bufferedChunk = false;

    // Start byte for Amber Wireless
    this._startByte = Buffer.alloc(1,'FF', 'hex');
  }

  /**
  * Implementation of hook _transform()
  */
  _transform(chunk, enc, cb) {
    let self = this;
    let proceed = true;
    let data = this._bufferedChunk ?
      Buffer.concat([this._bufferedChunk, chunk]) : chunk;

    while (proceed) {
      // Find telegram start by comparing start hex code xFF.
      if (this._frameLength < 0) {
        for (var i = 0; i < (data.length - 2); i++) {
          if (data[i] == self._startByte[0]) {
            // Remove leading bytes, since they are not part of this telegram
            if (i > 0)
              data = data.slice(i);
            // Get telegram length, and apply CRCS
            this._frameLength = (data[2] + 4);
            break;
          }
        }
      }

      var frameLength = this._frameLength ? this._frameLength : -1;

      if (frameLength > 0 && data.length >= frameLength) {
        // Validate raw telegram data
        var telegramData = data.slice(0, frameLength);

        if (self.validateChecksum(telegramData)) {
          // This is valid telegram, register and remove
          this.push(telegramData.slice(2));
          data = data.slice(frameLength - 4);
        } else {
          // This is not valid telegram, remove leading value
          data = data.slice(1);
        }
        this._frameLength = -1;

      } else {
        this._bufferedChunk = data;
        proceed = false;
      }
    }

    cb();
  }

  /**
  * Implementation of hook_flush()
  */
  _flush(cb) {
    //console.log("Telegram stream flush...");
    this.push(this.digester.digest('hex'));
    cb();
  }

  /**
  * Validate raw telegram packet checksum.
  *
  * @param buffer
  * @return boolean is valid
  */
  validateChecksum(buffer) {
    // console.log("Validate buffer: ", buffer);
    let lastIndex = buffer.length - 1;

    return this.bufferEquals(this.countChecksum(buffer, lastIndex),
      buffer.slice(lastIndex, buffer.length));
  }

  /**
  * Count telegram data checksum
  *
  * @param buffer
  * @param numBits
  */
  countChecksum(buffer, numBits) {
    let cs = buffer.slice(0, 1);

    if (numBits === undefined)
      numBits = buffer.length;

    for (var i = 1; i < numBits; i++)
      cs = xor(cs, buffer.slice(i, (i + 1)));

    return cs;
  }

  /**
  * Check if two given buffers equals.
  *
  * @param a
  * @param b
  * @return boolean is equal
  */
  bufferEquals(a, b) {
    if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b))
      return undefined;

    if (typeof a.equals === 'function')
      return a.equals(b);

    if (a.length !== b.length)
      return false;

    for (var i = 0; i < a.length; i++)
      if (a[i] !== b[i])
        return false;

    return true;
  }
}

export default AmberWirelessReader;