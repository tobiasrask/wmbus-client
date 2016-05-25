import WirelessMBusTelegram from "./../src/includes/telegram/wmbus-telegram"
import DataPacket from "./../src/includes/misc/data-packet"

import assert from "assert"
import Utils from './utils'

describe('Tests for WirelessMBusTelegram class', () => {

  describe('Test telegram initialization' , () => {
    it('It should initialize without errors', done => {
      let packet = new DataPacket(Buffer("", "hex"));
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

      if (telegram.getPacket() != packet)
        return done(new Error("Telegram didn't return expected packet"));

      if (telegram.getAddress().toString('hex') != "001122334455")
        return done(new Error("Invalid telegram address"));

      if (telegram.getControlField().toString('hex') != "44")
        return done(new Error("Invalid telegram control field"));

      if (telegram.getManufacturer().toString('hex') != "2d2c")
        return done(new Error("Invalid telegram manufacturer id"));

      if (telegram.getVersion().toString('hex') != "44")
        return done(new Error("Invalid telegram version id"));

      done();
    })
  });
});