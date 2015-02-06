var expect = require('chai').expect;
var sinon = require('sinon');
var Observers = require('../lib/observers');

describe('Observers', function () {
  beforeEach(function () {
    this.observers = new Observers();
    this.component = {};
  });

  describe('#add', function () {
    it('stores path and component', function () {
      this.observers.add(['foo'], this.component);
      expect(this.observers.count()).to.eq(1);
    });
  });

  describe('#remove', function () {
    it('removes component observer', function () {
      this.observers.add(['foo'], this.component);
      this.observers.remove(this.component);
      expect(this.observers.count()).to.eq(0);
    });
  });

  describe('#run', function () {
    beforeEach(function () {
      this.observers.add(['foo'], this.component);
      this.observers.add(['bar'], this.component);
    });

    it('emits `dirty` event when delta is not equal at path', function () {
      var count = 0;
      var components = [];

      this.observers.on('dirty', function (component) {
        count++;
        components.push(component);
      });

      this.observers.run({
        equal: function (path) {
          return path[0] !== 'foo';
        }
      });

      expect(count).to.eq(1);
      expect(components).to.deep.eq([this.component]);
    });
  });
});
