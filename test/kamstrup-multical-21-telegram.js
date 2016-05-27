import WirelessMBusTelegram from "./../src/includes/telegram/wmbus-telegram"
import KamstrupMultical21Meter from "./../src/products/meters/kamstrup-multical-21-meter"
import DataPacket from "./../src/includes/misc/data-packet"

import path from "path"
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

      let packet = new DataPacket(Buffer(input['telegram'], "hex"));
      let telegram = new WirelessMBusTelegram(packet);

      let meter = KamstrupMultical21Meter.getInstance();
      
      // Process telegram
      let options = {
        key: Buffer(input['key'], 'hex')
      }
      meter.processTelegramData(telegram, options);

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

      done();
    })
  });
});