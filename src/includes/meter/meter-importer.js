import fs from "fs"
import Meter from "./meter"

/**
* Meter and keyfile importer.
*/
class MeterImporter {

  /**
  * Load list of meter settings to has Map to be used by program.
  * Settings file is json file, with array of meters.
  *
  * Example:
  * [
  *   {
  *     "manufacturer": "KAM",
  *     "serial": "00000000",
  *     "version": "1b",
  *     "deviceType": "06",
  *     "aes": "0000000000000000",
  *     "label": "My meter"
  *   }
  * ]
  *
  * @param source file
  *   Source file path. File content should be valid JSON with expected data.  
  * @param callback
  *   Passes error or Map of meters
  */
  static loadMeterSettings(source, callback) {
    let self = this;
    // console.log(`Loading meter key file from file: ${source}`);

    fs.readFile(source, function(err, data) {
      if (err)
        return callback(err);

      let items = false;
      try {
        items = JSON.parse(data)
      } catch (e) {
        // TODO
      }

      if (!items)
        return callback(new Error("Unable to parse meter data"));

      let meterData = new Map();

      items.forEach(row => {

        // Validate input values
        if (!row.hasOwnProperty('manufacturer') ||
            !row.hasOwnProperty('serial') ||
            !row.hasOwnProperty('version') ||
            !row.hasOwnProperty('deviceType'))
          return;

        // Build meter address
        let meterAddress = Buffer.concat([
          Meter.reverseBuffer(Meter.buildManufacturerId(row['manufacturer'])),
          Meter.reverseBuffer(new Buffer(row['serial'], 'hex')),
          new Buffer(row['version'], 'hex'),
          new Buffer(row['deviceType'], 'hex')
        ]);

        // We use String keys as since Map requires original buffer to match
        meterData.set(meterAddress.toString('hex'), row);
      });
      callback(null, meterData);
    });
  }
}

export default MeterImporter;
