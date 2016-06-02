/**
* This example shows how to view meter consumption.
*/
import WirelessMBusTelegram from "./../src/includes/telegram/wmbus-telegram"
import KamstrupMultical21Meter from "./../src/products/meters/kamstrup-multical-21-meter"
import DataPacket from "./../src/includes/misc/data-packet"
import AmberWirelessReader from "./../src/products/reader/amber-wireless"
import MeterImporter from "./../src/includes/meter/meter-importer"
import DataBuffer from "./../src/includes/misc/data-buffer"
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
    let mc = path.join(__dirname, options.configurationPath);

    MeterImporter.loadMeterSettings(mc, (err, meterData) => {
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
    let meter = KamstrupMultical21Meter.getInstance();

    // console.log(meterData);
    meter.applySettings({
      meterData: meterData,
    });

    let buffer = new DataBuffer();
    
    /*
    // Load test data log file, which contains list of keyed values
    let logFile = path.join(__dirname, './../test/test_data/log-reader-test-data.log');

    
    let reader = new LogReader({ source: logFile, buffer: buffer });
    
    */

    console.log("Starting reader...");

    let reader = new AmberWirelessReader({
      buffer: buffer,
      serialPortPath: options.serialPortPath
    });

    // Enabled source
    console.log("Enable source...");
    reader.enableSource();

    // TODO: Apply callback to handle data pushes...

    let interval = setInterval(() => {
      // See if reader is ready yet

      // Stop processing if ready
      if (reader.isReady())
        return clearInterval(interval);

      if (!buffer.hasData())
        return;

      let telegram = new WirelessMBusTelegram(buffer.fetch());
      meter.processTelegramData(telegram);

      // Get label...
      console.log(`Meter: ${meter.describeMeter(telegram)}      Value: ${meter.getMeterValue(telegram)}       Target value: ${meter.getMeterTargetValue(telegram)}         (${meter.getAddressField(telegram).toString('hex')})`);

    }, 1000);
  }

}

let example = new Example().run({
  // Meter configuration path
  configurationPath: './../../data/meters.json',

  // Serial port path
  serialPortPath: '/dev/cu.usbserial-2701A795',
});