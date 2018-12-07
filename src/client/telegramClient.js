//var util = require("util");
import DataBuffer from "./../includes/buffer/data-buffer"
import ImstReader from "./../products/reader/Imst"
import AmberWirelessReader from "./../products/reader/amber-wireless"
import WirelessMBusTelegram from "./../includes/telegram/wmbus-telegram"
var EventEmitter = require("events").EventEmitter;


class TelegramClient extends EventEmitter {

    constructor(dongleType, serielPort) {

        super();
        //setup a buffer
        let buffer = new DataBuffer({ disableStoring: true });

        //Create the reader based on the settings
        if (dongleType == "Imst") {
            this.reader = new ImstReader({
                buffer: buffer,
                serialPortPath: serielPort
            });
        }
        else {
            this.reader = new AmberWirelessReader({
                buffer: buffer,
                serialPortPath: serielport
            });
        }

        this.shouldbeConnected = false;

        //if an listner hooks up to the emitter then with the data event then connect the source
        this.on("newListener", event => {
            if ((this.listenerCount("data") > 0 || event == "data") && !this.isConnected()) {
                this.connect();
            }
        });

        //If the reader connects the pass this info on
        this.reader.on("connected", () => {
            this.emit("connected"); });

        this.reader.on("disconnected", () => {
            this.emit("disconnected");
            //if stick was pulled then attemp to reconnect
            if (this.shouldbeConnected) {
                this.reader.enableSource();
            }
        })

        this.reader.on("error", () => {
            this.emit("error");

            //if it should be connected, then retry connection
            if (this.shouldbeConnected) {
                var retryInterval = setInterval(() => {
                    clearInterval(retryInterval);
                    this.reader.enableSource();
                }
                    , 5000);
            }
            
            
        })

        //register this as a listner for new packages
        buffer.registerListener("telegramClient", {
            onPush: (arg) => {
                let telegram = new WirelessMBusTelegram(arg);
                this.emit("data", telegram);
            }
        });

    }

    connect() {
        this.shouldbeConnected = true;
        if (!this.isConnected()) {
            this.reader.enableSource();
        }          
    }

    disconnect() {
        this.shouldbeConnected = false;
        if (this.isConnected()) {
            this.reader.disableSource();
        }
            
    }

    isConnected() {
        return this.reader.isEnabled();
    }
}
export default TelegramClient;