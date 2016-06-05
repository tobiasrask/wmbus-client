import Logger from './logger'
import fs from 'fs';

// Static instance
var instance = null;

/**
* Log writer.
*/
class LogWriter extends Logger {

  /**
  * Construct log writer.
  *
  * @param options
  */
  constructor(options = {}) {
    super();
    this._logFile = options.hasOwnProperty('logFile') ? options.logFile : false;
    console.log(`Log file: ${this._logFile}`);
  }

  /**
  * Data queue callback.
  *
  * @param DataPacket
  *   Raw data apcket
  */
  writeRawTelegram(dataPacket) {
    let build = dataPacket.getTimestamp();
    build += ",";
    build += dataPacket.getBuffer().toString("hex");
    build += '\n';

    if (!this._logFile)
      return console.log("No log file!");

    fs.appendFile(this._logFile, build, err => {
      if (err)
        throw err;
    });
  }

  /**
  * Returns singleton instance of meter.
  *
  * @return instance
  */
  static getInstance() {
    if (!instance) instance = new LogWriter();
    return instance;
  }
}

export default LogWriter;