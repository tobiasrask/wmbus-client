
import DataPacket from "./../src/includes/buffer/data-packet"
import WirelessMBusTelegram from "./../src/includes/telegram/wmbus-telegram"
import WirelessMBusMeter from "./../src/includes/meter/wmbus-meter"

import assert from "assert"
import Utils from './utils'

describe('Tests for WirelessMBusTelegram class', () => {

  describe('Test telegram initialization' , () => {
    it('It should initialize without errors', done => {

      let packet = new DataPacket(Buffer("21442d2c0011223344556677000000", "hex"));
      let telegram = new WirelessMBusTelegram(packet);

      if (telegram.getPacket() != packet)
        return done(new Error("Telegram didn't return expected packet"));

      done();
    })
  });

  describe('Test telegram general processing' , () => {
    it('It should return telegram basic info like meter address', done => {

      let packet = new DataPacket(Buffer("21442d2c0011223344556677000000", "hex"));
      let telegram = new WirelessMBusTelegram(packet);

      let meter = WirelessMBusMeter.getInstance();
      meter.processTelegramData(telegram);

      if (telegram.getPacket() != packet)
        return done(new Error("Telegram didn't return expected packet"));

      if (meter.getAddressField(telegram).toString('hex') != "2d2c001122334455")
        return done(new Error("Invalid telegram address"));

      if (meter.getControlField(telegram).toString('hex') != "44")
        return done(new Error("Invalid control field"));

      if (meter.getManufacturerField(telegram).toString('hex') != "2d2c")
        return done(new Error("Invalid manufacturer id"));

      if (meter.getVersionField(telegram).toString('hex') != "44")
        return done(new Error("Invalid telegram version id"));

      done();
    })
  });
});