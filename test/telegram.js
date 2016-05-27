import Telegram from "./../src/includes/telegram/telegram"
import assert from "assert"
import Utils from './utils'

describe('Telegram base class', () => {

  describe('Test telegram initialization' , () => {
    it('It should initialize without errors', done => {
      
      let packet = 'probe:' + Utils.getUUID();
      let telegram = new Telegram(packet);

      if (telegram.getPacket() != packet)
        return done(new Error("Telegram didn't return expected packet"));

      // TODO: Test telegram setValue /setValue
      
      done();
    })
  });

});