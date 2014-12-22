var expect = require('chai').expect;
var syphon = require('../lib');

describe('Dispatcher', function () {
  beforeEach(function () {
    this.state = syphon.atom({ foo: 'bar' });
    this.dispatcher = syphon.dispatcher({ test: noop });

    this.run = function () {
      this.dispatcher.start(this.state);
      this.dispatcher.dispatch('test', 'hello');
    };
  });

  it('emits `dispatch` events', function (done) {
    this.dispatcher.once('dispatch', function (dispatch) {
      expect(dispatch.name).to.eq('test');
      expect(dispatch.value).to.eq('hello');
      expect(dispatch.state.get('foo')).to.eq('bar');
      done();
    });

    this.run();
  });

  it('calls handler with dispatched value and current state', function (done) {
    this.dispatcher.handler('test', function (value, state) {
      expect(value).to.eq('hello');
      expect(state.get('foo')).to.eq('bar');
      return state;
    });

    this.dispatcher.once('dispatch', function () {
      done();
    });

    this.run();
  });

  it('calls handler in the context of the dispatcher', function (done) {
    var self = this;

    this.dispatcher.handler('test', function (value, state) {
      expect(this).to.eq(self.dispatcher);
      return state;
    });

    this.dispatcher.once('dispatch', function () {
      done();
    });

    this.run();
  });

  it('swaps state with value returned from handler', function (done) {
    var self = this;

    this.dispatcher.handler('test', function (value, state) {
      return state.set('foo', 'baz');
    });

    this.dispatcher.once('dispatch', function (dispatch) {
      expect(dispatch.state.get('foo')).to.eq('baz');
      expect(self.state.deref().get('foo')).to.eq('baz');
      done();
    });

    this.run();
  });
});

// Helpers

function noop(value, state) {
  return state;
}
