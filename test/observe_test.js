var expect = require('chai').expect;
var React = require('react');
var sinon = require('sinon');
var components = require('./components');
var syphon = require('../lib');

describe('Observe', function () {
  beforeEach(function () {
    this.state = syphon.atom({ text: 'hello' });
    this.context = syphon.context(components.Parent, this.state);
  });

  it('renders observed value', function () {
    expect(this.context.render()).to.include('hello');
  });

  it('calls dirty listener with observing component', function (done) {
    var dirty = this.context.observers.listeners('dirty')[0];
    this.context.observers.removeAllListeners();
    this.context.observers.on('dirty', function (component) {
      expect(component.name).to.eq('child');
      done();
    });

    this.context.watch();

    this.state.swap(function (state) {
      return state.set('text', 'world');
    });
  });

  it('forces component to update', function () {
    var dirty = this.context.observers.listeners('dirty')[0];
    var component = { forceUpdate: sinon.spy() };
    dirty(component);
    expect(component.forceUpdate.calledOnce).to.eq(true);
  });
});
