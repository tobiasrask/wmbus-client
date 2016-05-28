import fs from "fs"

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
  *     "serial": "00000000",
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
      items.forEach(keyData => {
        if (keyData.hasOwnProperty('serial'))
          meterData.set(keyData['serial'], keyData);
        else
          console.log("No match...", keyData);
      });
      callback(null, meterData);
    });
  }
}

export default MeterImporter;
