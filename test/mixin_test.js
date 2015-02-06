var expect = require('chai').expect;
var im = require('immutable');
var mixin = require('../lib/mixin');

describe('Mixin', function () {
  describe('#shouldComponentUpdate', function () {
    beforeEach(function () {
      this.props = {
        data: im.Map({ foo: 'bar' })
      };

      this.state = {
        foo: 'bar'
      };

      this.ctx = {
        props: {
          data: im.Map({ foo: 'bar' })
        },
        state: {
          foo: 'bar'
        }
      };
    });

    it('should return false if props and state are the same', function () {
      expect(mixin.shouldComponentUpdate.call(this.ctx, this.props, this.state)).to.eq(false);
    });

    it('returns true if props change', function () {
      var props = { data: im.Map({ foo: 'qux' }) };
      expect(mixin.shouldComponentUpdate.call(this.ctx, props, this.state)).to.eq(true);
    });

    it('returns true if state changes', function () {
      var state = { foo: 'qux' };
      expect(mixin.shouldComponentUpdate.call(this.ctx, this.props, state)).to.eq(true);
    });

    it('returns true on deep equal', function () {
      // No way around this
      // Use immutable data for deep structures

      var ctx = {
        props: this.props,
        state: { foo: { bar: 'baz' } }
      };

      var state = {
        foo: { bar: 'baz' }
      };

      expect(mixin.shouldComponentUpdate.call(this.ctx, this.props, state)).to.eq(true);
    });
  });
});
