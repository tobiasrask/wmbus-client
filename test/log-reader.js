import assert from "assert"
import path from "path"
import LogReader from "./../src/includes/reader/log-reader"
import DataBuffer from "./../src/includes/misc/data-buffer"


describe('Log reader', () => {

  describe('Test log reader initialization' , () => {
    it('It should initialize without errors', done => {
      let reader = new LogReader();
      done();
    })
  });

  describe('Test log loading' , () => {
    it('It should load log file and push data to provided buffer', done => {

      // Load test data log file, which contains list of keyed values
      let logFile = path.join(__dirname, './test_data/log-reader-test-data.log');

      let buffer = new DataBuffer();
      let reader = new LogReader({ source: logFile, buffer: buffer });
      
      // Enabled source
      reader.enableSource();

      let interval = setInterval(() => {
        // See if reader is ready yet
        if (!reader.isReady())
          return;

        clearInterval(interval);

        let errors = false;

        let bufferItem = buffer.fetch();
        let lineCounter = 0;

        do {
          if (!bufferItem || 
              !bufferItem.hasOwnProperty('timestamp') ||
              !bufferItem.hasOwnProperty('telegram') ||
              bufferItem.timestamp != lineCounter ||
              bufferItem.telegram.indexOf('2d2c845142631b0') < 0) {
            errors = true;            
          }
          bufferItem = buffer.fetch();
          lineCounter++;
        } while (bufferItem != null);

        if (lineCounter != 30)
          return done(new Error("LogReader didn't provide all telegrams"));

        if (errors)
          return done(new Error("LogReader didn't provide expected telegrams"));

        if (buffer.fetch() != null)
          return done(new Error("Empty buffer didn't return null value"));
        
        done();
        
      }, 10);
    })
  });
});