import DataBuffer from "./../src/includes/buffer/data-buffer"
import assert from "assert"

describe('Data buffer', () => {

  describe('Test buffer initialization' , () => {
    it('It should initialize without errors', done => {
      let buffer = new DataBuffer();
      
      if (buffer.fetch() != null)
        return done(new Error("Empty buffer didn't return null value"));
      
      done();
    })
  });

  describe('Test buffer FIFO' , () => {
    it('It should return items in insertion order', done => {

      let buffer = new DataBuffer();

      if (buffer.fetch() != null)
        return done(new Error("Empty buffer didn't return null value"));

      // Generate some packets
      let packets = ["a", "b", "c", "d", "e", "f"];

      packets.map(item => {
        buffer.push(item);
      });

      let errors = false;

      packets.map(item => {        
        if (item != buffer.fetch())
          errors = true;
      });

      if (errors)
        return done(new Error("Buffer didn't return packets in FIFO order."));

      if (buffer.fetch() != null)
        return done(new Error("Empty buffer didn't return null value"));
      
      done();
    })
  });


});