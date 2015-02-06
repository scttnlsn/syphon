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

  it('calls dirty method with observing component', function () {
    var dirty = sinon.stub(this.context, 'dirty');

    this.context.watch();

    this.state.swap(function (state) {
      return state.set('text', 'world');
    });

    expect(dirty.calledOnce).to.eq(true);
    expect(dirty.getCall(0).args[0].name).to.eq('child');
  });
});
