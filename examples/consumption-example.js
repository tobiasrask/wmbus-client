import WirelessMBusTelegram from "./../src/includes/telegram/wmbus-telegram"
import KamstrupMultical21Meter from "./../src/products/meters/kamstrup-multical-21-meter"
import DataPacket from "./../src/includes/buffer/data-packet"
import AmberWirelessReader from "./../src/products/reader/amber-wireless"
import ImstReader from "./../src/products/reader/Imst"
import MeterImporter from "./../src/includes/meter/meter-importer"
import DataBuffer from "./../src/includes/buffer/data-buffer"
import LogWriter from "./../src/includes/logger/log-writer"
import LogReader from "./../src/includes/reader/log-reader"
import Statistics from "./../src/includes/misc/statistics"
import path from "path"
import moment from "moment"
import fs from "fs"

/**
* This example shows how to view meter consumption.
*/
class Example {

  constructor() {
    this._csvMap = {};
    this._csvFile = false;
  }

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
  * Prepare example meters and collect data.
  *
  * @param options
  *   Options
  * @param meterData
  *   Meter configuration data
  */
  prepareMeter(options, meterData) {
    // First we create meter for Kamstup Multical 21 with meter configuration
    // settings.
    let meter = KamstrupMultical21Meter.getInstance();
    meter.applySettings({
      meterData: meterData,
    });

    let statistics = Statistics.getInstance();
    statistics.prepareStats(meterData);

    // Create data buffer. All raw data will be buffered before processing
    let buffer = new DataBuffer();
    let reader = false;

    if (options.hasOwnProperty('csvFile'))
      this._csvFile = options.csvFile;

    if (options.readerType == 'log') {
      // Load test data log file(s) containing list of keyed values
      reader = new LogReader({ source: options.logReaderSource, buffer: buffer });
    } else {
      // Register log writer as listener. This allows us to write all
      // raw data to log file to be used later if needed.
      let filepath = path.join(__dirname, options.logWriterPath);
      let logWriter = new LogWriter({ logFile: filepath});

      buffer.registerListener('logWriter', {
        onPush: (arg) => { logWriter.writeRawTelegram(arg) }
      });

      console.log("Start Wireless M-Bus reader...");

      reader = new ImstReader({
        buffer: buffer,
        serialPortPath: options.serialPortPath
      });
    }

    // Enabled data source, now all data will be sent to out data buffer.
    reader.enableSource();

    // Process buffer data.
    let interval = setInterval(() => {
      if (!buffer.hasData())
        return;
      let telegram = new WirelessMBusTelegram(buffer.fetch());
      meter.processTelegramData(telegram);
      // Just write data to console
      let stats = statistics.getMeterStats(meter, telegram);
      console.log(`${stats.description} ${stats.deviceType}, ${stats.initTargetValue} -> ${stats.currentValue} = ${stats.monthUsage}, delta: ${stats.deltaTargetValue} -> ${stats.deltaValue}`);

      // Write composed data to csv file, one row for one meter per day
      this.writeCSV(stats);

    }, options.bufferInterval);

    if (options.previewInterval) {
      let previewInterval = setInterval(() => {
        let stats = statistics.getStats()
        Object.keys(stats).forEach(key => {
          if (stats[key])
            console.log(`Meter: ${stats[key].description} Count telegrams: ${stats[key].counter}`);
          else
            console.log(`No meter data for: ${meter.describeMeterData(meterData.get(key))}`);
        });
      }, options.previewInterval);
    }
  }

  /**
  * Write compose data to csv file.
  *
  * @param stats
  */
  writeCSV(stats) {
    let date = moment(parseInt(stats.lastMeasure)).format("DD.MM.YYYY");
    let key = `${date}:${stats.address}`;

    // Write only one line per day
    if (this._csvMap.hasOwnProperty(key))
      return;

    this._csvMap[key] = true;
    let build = `${date},${stats.deviceType},${stats.address},${stats.description},${stats.initTargetValue},${stats.currentTargetValue},${stats.deltaTargetValue},${stats.currentValue},${stats.monthUsage},${stats.deltaValue}` + '\n';
    console.log(build);

    if (!this._csvFile)
      return console.log("No csv file!");

    fs.appendFile(this._csvFile, build, err => {
      if (err)
        throw err;
    });
  }
}

let example = new Example().run({
  // Meter configuration path
  configurationPath: './../../data/meters.json',
  // Log writer path. The extension will be .log and there will be date based
  // suffix.
  logWriterPath: './../../data/consumption-export',
  // Serial port path
  serialPortPath: 'com5',
  // Interval to check buffer status
  bufferInterval: 20,
  // Preview interval
  previewInterval: 60000,
  // If READER_METHOD env variable is 'log', we just read provided log files and
  // print out the total consumption between first and last reading.
  logReaderSource: [
    './../../data/consumption-export--20160131.log',
    './../../data/consumption-export--20170103.log'
    ],
  // CSV log path
  csvFile: `./../../composed/composed--${moment(Date.now()).format("YYYYMMDD-HHmmss")}.csv`,

  // Reader type: 'collect' or 'log'
  readerType: process.env.READER_METHOD ? process.env.READER_METHOD : 'collect'
  }
);