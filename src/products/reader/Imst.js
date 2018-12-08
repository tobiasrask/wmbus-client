import WMBusReader from "../../includes/reader/wmbus-reader"
import DataSource from "../../includes/reader/data-source"
import DataPacket from "../../includes/buffer/data-packet"
import stream from 'stream'

// Node v0.10+ uses native Transform, else polyfill
const Transform = stream.Transform ||
    require('readable-stream').Transform;

/**
* Wireless M-Bus reader. Provides data source.
*/
class ImstReader extends WMBusReader {

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
            baudRate: 57600,
            dataBits: 8,
            stopBits: 1,
            parity: 'none'
        });

        this._serialPort = serialPort;

        serialPort.on("error", () => {
            this.emit("error");
            console.log(`Unable to connect serial port: ${self._serialPortPath}`);
        });

        serialPort.on("close", () => {
            this.emit("disconnected");
            console.log(`Port: ${self._serialPortPath} closed.`)
        });

        serialPort.on("open", () => {
            this.emit("connected");
            console.log('Connection opened');
            this._enabled = true;
            //setup the wbus reader for Link mode: C1 TF-B,  Device mode:Other, Send RSSI:no, Send Timestamp: no
            var configBuff = Buffer.alloc(12, "A501030800030007b0000000", "hex");
            serialPort.write(configBuff);
            serialPort.on('data', (data) => {
                // Push data to telegram stream
                telegramStream.write(data);
            });
        });

        telegramStream.on('readable', () => {
            let data = null;

            while (null !== (data = telegramStream.read())) {
                //console.log("Push raw telegram data...");
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
        this._enabled = false;
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

        // Start byte for Imst Wireless
        this._startByte = Buffer.alloc(1, 'A5', 'hex');
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
            // Find telegram start by comparing start hex code.
            if (this._frameLength < 0) {
                //As lengt is places in byte 3 there must be at least 3 bytes more in the stream than the start byte
                for (var i = 0; i < (data.length - 3); i++) {
                    if (data[i] == self._startByte[0]) {
                        // Remove leading bytes, since they are not part of this telegram
                        if (i > 0)
                            data = data.slice(i);
                        //check that we have the length byte (enough bytes), if not data will be processed next time
                        this._frameLength = (data[3] + 4);


                        break;
                    }
                }
            }

            var frameLength = this._frameLength ? this._frameLength : -1;

            if (frameLength > 0 && data.length >= frameLength) {
                var hasCRC = (data[1] & 0x80)
                // Extract the telegram, check for CRC
                if (hasCRC) {
                    var telegramData = data.slice(0, frameLength + 2);
                } else {
                    var telegramData = data.slice(0, frameLength);
                }
                // Only accept RadioLink messages
                if ((telegramData[1] & 0x0F) == 0x02) {
                    // Check if checksum is proviced, if so check it else just accept it
                    if (hasCRC) {
                        // This is valid telegram, register and remove
                        if (self.validateChecksum(telegramData.slice(1, frameLength + 2), telegramData.slice(frameLength, frameLength + 2))) {
                            this.push(telegramData.slice(3, frameLength));
                            data = data.slice(frameLength + 2);
                        } else {
                            //crc didn't match skip the telegram
                            data = data.slice(1);
                        }

                    } else {
                        // This is valid telegram, register and remove but without CRC
                        this.push(telegramData.slice(3));
                        data = data.slice(frameLength);
                    }
                    //device management package, these are not used, so dump it
                } else if ((telegramData[1] & 0x0F) == 0x01) {
                    if (hasCRC) {
                        if (self.validateChecksum(telegramData.slice(1, frameLength + 2), telegramData.slice(frameLength, frameLength + 2))) {
                            data = data.slice(frameLength + 2);
                        } else {
                            //crc didn't match skip the telegram
                            data = data.slice(1);
                        }
                    } else {
                        data = data.slice(frameLength);
                    }

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

    validateChecksum(data, checksum) {
        const crc = require("node-crc");
        var checkValue = crc.crc(16, true, 0x8408, 0x0000, 0xFFFF, 0x00, 0xffff, 0, data);

        return checkValue[0] == 15 && checkValue[1] == 71;
    }


}

export default ImstReader;