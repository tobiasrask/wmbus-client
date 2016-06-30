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

    if (options.hasOwnProperty('source'))
      this.setSourceFile(options.source);
  }

  /**
  * Set source file.
  *
  * @param source
  *   Source file or array of source files, that will be processed.
  */
  setSourceFile(source) {
    // Support single files
    if (!Array.isArray(source))
      source = [source];

    this._sources = source;
    this._done = false;
    this._processing = false;
  }

  /**
  * Implementation of enableSource().
  */
  enableSource() {
    let self = this;

    // Check if we are processing already
    if (!this._sources || this._processing)
      return;

    this._sources.reduce((sequence, filePath) => {
      return sequence.then(() => {
        return self.loadFile(filePath);
      });
    }, Promise.resolve()).then(() => {
      self._done = true;
      self._processing = false;      
    });
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
  * @param filePath
  *   File path ro file
  * @return promise
  */
  loadFile(filePath) {
    let self = this;
    
    return new Promise((resolve, reject) => {
      console.log(`Loading data from file: ${filePath}`);

      fs.readFile(filePath, (err, data) => {
        if (err)
          return reject(err);
        
        self.processLog(data);

        resolve();
      });   
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