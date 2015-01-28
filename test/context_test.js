var expect = require('chai').expect;
var React = require('react');
var sinon = require('sinon');
var syphon = require('../lib/index');

describe('Context', function () {
  beforeEach(function () {
    this.dispatcher = { dispatch: sinon.spy() };
    this.state = syphon.atom({ text: 'hello' });

    this.component = React.createClass({
      mixins: [syphon.mixin],

      componentWillMount: function () {
        this.dispatch('foo', 'bar');
      },

      render: function () {
        return React.DOM.div({},
          React.DOM.p({}, this.data().get('text')),
          React.DOM.p({}, this.shared().foo));
      }
    });

    this.context = syphon.context(this.component, this.state, {
      shared: { foo: 'bar' },
      dispatcher: this.dispatcher
    });
  });

  describe('#render', function () {
    it('passes data to component', function () {
      expect(this.context.render()).to.include('hello');
    });

    it('updates element when state changes', function () {
      this.state.swap(function (state) {
        return state.set('text', 'world');
      });

      expect(this.context.render()).to.not.include('hello');
      expect(this.context.render()).to.include('world');
    });

    it('passes shared object to component', function () {
      expect(this.context.render()).to.include('bar');
    });

    it('passes dispatcher in shared context', function () {
      this.context.render();
      expect(this.dispatcher.dispatch.callCount).to.eq(1);
      expect(this.dispatcher.dispatch.getCall(0).args).to.deep.eq(['foo', 'bar']);
    });
  });

  describe('#mount', function () {
    beforeEach(function () {
      this.render = sinon.spy(this.context, 'render')
      this.context.mount(null);
    });

    afterEach(function () {
      this.render.restore();
    });

    it('calls render', function () {
      expect(this.render.callCount).to.eq(1);
    });

    it('calls render on state change', function () {
      this.state.swap(function (state) {
        return state.set('text', 'world');
      });

      expect(this.render.callCount).to.eq(2);
    });
  });
});
