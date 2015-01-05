var events = require('events');
var util = require('util');

module.exports = Dispatcher;

function Dispatcher(handlers) {
  this.queue = [];
  this.handlers = {};
  this.state = null;

  if (handlers) {
    for (var name in handlers) {
      this.handler(name, handlers[name]);
    }
  }
}

util.inherits(Dispatcher, events.EventEmitter);

Dispatcher.prototype.handler = function (name, handler) {
  this.handlers[name] = handler;
  return this;
};

Dispatcher.prototype.dispatch = function (name, value) {
  if (!this.handlers[name]) throw new Error('No handler for: ' + name);
  this.queue.push({ name: name, value: value });
  setTimeout(this.flush.bind(this), 0);
};

Dispatcher.prototype.flush = function () {
  if (!this.state) return;

  var self = this;

  while (this.queue.length > 0) {
    var result = this.queue.shift();
    var name = result.name;
    var value = result.value;
    var handler = this.handlers[name];

    this.state.swap(function (current) {
      return handler.call(self, value, current);
    });

    this.emit('dispatch', {
      name: name,
      value: value,
      state: this.state.deref()
    });
  }
};

Dispatcher.prototype.start = function (state) {
  this.state = state;
  this.flush();
};
