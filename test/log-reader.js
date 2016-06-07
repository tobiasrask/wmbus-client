import assert from "assert"
import path from "path"
import LogReader from "./../src/includes/reader/log-reader"
import DataBuffer from "./../src/includes/buffer/data-buffer"


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

        let dataPacket = buffer.fetch();
        let lineCounter = 0;
        let testBufferProbe1 = Buffer("2d2c845142631b", "hex");
        let testBufferProbe2 = Buffer("2d2c745142631b", "hex");

        do {
          if (!dataPacket ||
              dataPacket.getTimestamp() != lineCounter || (
              dataPacket.getBuffer().indexOf(testBufferProbe1) < 0 &&
              dataPacket.getBuffer().indexOf(testBufferProbe2) < 0)) {
            errors = true;            
          }
          dataPacket = buffer.fetch();
          lineCounter++;
        } while (dataPacket != null);

        if (lineCounter != 47)
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