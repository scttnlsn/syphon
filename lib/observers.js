var events = require('events');
var im = require('immutable');
var util = require('util');

module.exports = Observers;

function Observers() {
  this.observers = [];
}

util.inherits(Observers, events.EventEmitter);

Observers.prototype.add = function (path, component) {
  this.observers.push({
    path: path,
    component: component
  });
};

Observers.prototype.remove = function (component) {
  this.observers = this.observers.filter(function (observer) {
    return observer.component !== component;
  });
};

Observers.prototype.count = function () {
  return this.observers.length;
};

Observers.prototype.run = function (delta) {
  var self = this;

  this.observers.forEach(function (observer) {
    if (!delta.equal(observer.path)) {
      self.emit('dirty', observer.component);
    }
  });
};
