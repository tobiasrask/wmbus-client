import WirelessMBusTelegram from "./../src/includes/telegram/wmbus-telegram"
import KamstrupMultical21Meter from "./../src/products/meters/kamstrup-multical-21-meter"
import DataPacket from "./../src/includes/buffer/data-packet"
import MeterImporter from "./../src/includes/meter/meter-importer"
import LogReader from "./../src/includes/reader/log-reader"
import DataBuffer from "./../src/includes/buffer/data-buffer"

import path from "path"
import fs  from "fs"
import assert from "assert"
import Utils from './utils'

describe('Tests for KamstrupMultical21Meter', () => {

  describe('Test telegram initialization' , () => {
    it('It should initialize without errors', done => {
      let meter = KamstrupMultical21Meter.getInstance();
      done();
    })
  });

  describe('Test Kamstrup Multical 21 telegram processing' , () => {
    it('It should return telegram basic info like ell', done => {

      // Load test data log file, which contains list of keyed values
      let tests = require('./test_data/test-meters');
      let input = tests['kamstrup']['multical21'][0];

      let packet = new DataPacket(Buffer.from(input['telegram'], "hex"));
      let telegram = new WirelessMBusTelegram(packet);

      let meter = KamstrupMultical21Meter.getInstance();

      meter.applySettings({
        disableMeterDataCheck: true
      });

      if (!meter.processTelegramData(telegram, {
          aes: input['aes']
        }))
        return done(new Error("Meter telegram was filtered out"));


      if (telegram.getPacket() != packet)
        return done(new Error("Telegram didn't return expected packet"));

      if (meter.getCIField(telegram).toString('hex') != "8d")
        return done(new Error("Invalid CI field"));

      if (meter.getCCField(telegram).toString('hex') != "20")
        return done(new Error("Invalid CC field"));

      if (meter.getACCField(telegram).toString('hex') != "6a")
        return done(new Error("Invalid ACC field"));

      if (meter.getSNField(telegram).toString('hex') != "31fb7c20")
        return done(new Error("Invalid SN field"));

      if (meter.getELLCRC(telegram).toString('hex') != "39a3")
        return done(new Error("Invalid ELL CRC field"));

      if (meter.getIV(telegram).toString('hex') != input['iv'])
        return done(new Error("Invalid initialization vector"));

      if (meter.getDecryptedELLData(telegram).toString('hex') != input['value'])
        return done(new Error("Telegram decryption failed"));

      if (meter.getMeterValue(telegram) != 0)
        return done(new Error("Telegram meter value test failed"));

      if (meter.getMeterTargetValue(telegram) != 0)
        return done(new Error("Telegram meter target value test failed"));

      done();
    })
  });

  describe('Test reading telegrams from log file' , () => {
    it('It should read an decrypt telegrams from log file', done => {

      // This test requires external AES-key files. Keys are not included with
      // git repository, and will be skipped if following file doesn't exits.
      let meterSettings = path.join(__dirname, './../../data/meters-test.json');

      if (!fs.existsSync(meterSettings)) {
        // This test requires external AES-key files and real log data.
        // GIT repository doesn't contain this data, so let's skip this test.
        return done();
      }


      // TODO: Make this promise based implementation...
      MeterImporter.loadMeterSettings(meterSettings, (err, meterData) => {
        if (err) return done(err);

        let meter = KamstrupMultical21Meter.getInstance();

        meter.applySettings({
          meterData: meterData,
          //filter: ['63425184']
        });

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

          // TODO: Fetch key automatically
          //if (!meterData.has(Buffer("2d2c725142631b16", "hex")))
          //  return done(new Error("No telegram info found for test data"));
          // let meterInfo = meterData.get('2d2c845142631b06');
          do {
            let telegram = new WirelessMBusTelegram(dataPacket);
            meter.processTelegramData(telegram);

            let value = meter.getMeterValue(telegram);
            console.log("Meter value: " + value);

            let targetValue = meter.getMeterTargetValue(telegram);
            console.log("Meter target value: " + targetValue);
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
      });
    })
  });
});