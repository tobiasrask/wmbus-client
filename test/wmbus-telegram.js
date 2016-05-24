import WirelessMBusTelegram from "./../src/includes/telegram/wmbus-telegram"
import DataPacket from "./../src/includes/misc/data-packet"

import assert from "assert"
import Utils from './utils'

describe('Tests for WirelessMBusTelegram class', () => {

  describe('Test telegram initialization' , () => {
    it('It should initialize without errors', done => {
      let packet = new DataPacket(Buffer(""));
      let telegram = new WirelessMBusTelegram(packet);

      if (telegram.getPacket() != packet)
        return done(new Error("Telegram didn't return expected packet"));
      
      done();
    })
  });


  describe('Test telegram general processing' , () => {
    it('It should return telegram basic info', done => {

      let packet = new DataPacket(Buffer("21442d2c0011223344556677000000"));

      let telegram = new WirelessMBusTelegram(packet);

      if (telegram.getPacket() != packet)
        return done(new Error("Telegram didn't return expected packet"));

      //if (telegram.getMeterAddress() != null)
      //  return done(new Error("Telegram didn't return expected address"));

      done();
    })
  });
});