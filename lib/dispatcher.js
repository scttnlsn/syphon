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

Dispatcher.prototype.dispatch = function (name /* args */) {
  var args = [].slice.call(arguments)
  var name = args.shift();

  if (!this.handlers[name]) throw new Error('No handler for: ' + name);

  this.queue.push({ name: name, args: args });
  setTimeout(this.flush.bind(this), 0);
};

Dispatcher.prototype.flush = function () {
  if (!this.state) return;

  var self = this;

  while (this.queue.length > 0) {
    var result = this.queue.shift();
    var handler = this.handlers[result.name];

    this.state.swap(function (current) {
      var args = [current].concat(result.args);
      return handler.apply(self, args);
    });

    this.emit('dispatch', {
      name: result.name,
      args: result.args,
      state: this.state.deref()
    });
  }
};

Dispatcher.prototype.start = function (state) {
  this.state = state;
  this.flush();
};
