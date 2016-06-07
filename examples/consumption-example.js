/**
* This example shows how to view meter consumption.
*/
import WirelessMBusTelegram from "./../src/includes/telegram/wmbus-telegram"
import KamstrupMultical21Meter from "./../src/products/meters/kamstrup-multical-21-meter"
import DataPacket from "./../src/includes/buffer/data-packet"
import AmberWirelessReader from "./../src/products/reader/amber-wireless"
import MeterImporter from "./../src/includes/meter/meter-importer"
import DataBuffer from "./../src/includes/buffer/data-buffer"
import LogWriter from "./../src/includes/logger/log-writer"
import Statistics from "./../src/includes/misc/statistics"
import path from "path"

class Example {

  /**
  * Run example
  *
  * @param configurationPath
  *   Path to configuration.
  */
  run(options) {
    let self = this;
    let filepath = path.join(__dirname, options.configurationPath);
    MeterImporter.loadMeterSettings(filepath, (err, meterData) => {
      if (err)
        throw new Error("Unable to load meter settings");
      self.prepareMeter(options, meterData);
    });
    return this;
  }


  /**
  * Run example
  *
  * @param options
  *   Options
  * @param meterData
  *   Meter configuration data
  */
  prepareMeter(options, meterData) {

    let statistics = Statistics.getInstance();

    // First we create meter for Kamstup Multical 21 with meter configuration
    // settings.
    let meter = KamstrupMultical21Meter.getInstance();
    meter.applySettings({
      meterData: meterData,
    });

    // Create data buffer. All raw data will be buffered before processing
    let buffer = new DataBuffer();

    // Register log writer as listener. This allows us to write all
    // raw data to log file to be used later if needed.
    let filepath = path.join(__dirname, options.logWriterPath);    
    let logWriter = new LogWriter({ logFile: filepath});

    buffer.registerListener('logWriter', {
      onPush: (arg) => { logWriter.writeRawTelegram(arg) }
    });

    console.log("Start Wireless M-Bus reader...");

    let reader = new AmberWirelessReader({
      buffer: buffer,
      serialPortPath: options.serialPortPath
    });

    // Enabled data source, now all data will be sent to out data buffer.
    reader.enableSource();

    // Process buffer data.
    let interval = setInterval(() => {

      if (reader.isReady())
        return clearInterval(interval);

      if (!buffer.hasData())
        return;

      let telegram = new WirelessMBusTelegram(buffer.fetch());
      meter.processTelegramData(telegram);

      // Just write data to console
      let stats = statistics.getMeterStats(meter, telegram);
      console.log(`Meter: ${stats.description} Value: ${stats.currentValue}  Delta value: ${stats.deltaValue}`);

    }, options.bufferInterval);
  }

}

let example = new Example().run({

  // Meter configuration path
  configurationPath: './../../data/meters.json',

  // Log writer path. The extension will be .log and there will be date based
  // suffix.
  logWriterPath: './../../data/consumption-export',

  // Serial port path
  serialPortPath: '/dev/cu.usbserial-2701A795',

  // Interval to check buffer status
  bufferInterval: 1000,
});