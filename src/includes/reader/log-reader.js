import fs from "fs"
import DataSource from "./data-source"
import DataPacket from "./../buffer/data-packet"

/**
* Data log reader. Provides data source 
*/
class LogReader extends DataSource {

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
    this._buffer = options.hasOwnProperty('buffer') ? options.buffer : false;
    this._source = options.hasOwnProperty('source') ? options.source : false;
    this._done = false;
    this._processing = false;
  }

  /**
  * Set source file.
  *
  * @param source
  */
  setSourceFile(source) {
    this._source = source;
    this._done = false;
    this._processing = false;
  }

  /**
  * Implementation of enableSource().
  */
  enableSource() {
    if (this._source && !this._processing) {
      this._processing = true;
      this.loadFile(this._source);
    }
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
  * Load source file and build satellite data file.
  *
  * @param filename
  */
  loadFile(filename) {
    let self = this;
    // console.log(`Loading data from file: ${filename}`);    
    fs.readFile(filename, function(err, data) {
      if (err)
        return;

      self._done = true;
      self._processing = false;
      self.processLog(data);
    });
  }

  /**
  * Process log data.
  *
  * @param data
  */
  processLog(data) {
    let self = this;
    if (!this._buffer)
      return;

    data.toString().split("\n").forEach((row, index) => {
      let rowData = row.split(",");

      if (!rowData.length == 2 ||
          !rowData[0] ||
          !rowData[1])
        return;

      self._buffer.push(new DataPacket(Buffer(rowData[1], "hex"), {
        timestamp: rowData[0]
      }));
    });
  }
}

export default LogReader;