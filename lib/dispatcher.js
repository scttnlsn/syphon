var events = require('events');
var csp = require('js-csp');
var util = require('util');

module.exports = Dispatcher;

function Dispatcher(handlers) {
  this.channels = {};
  this.handlers = {};

  if (handlers) {
    for (var name in handlers) {
      this.handler(name, handlers[name]);
    }
  }
}

util.inherits(Dispatcher, events.EventEmitter);

Dispatcher.prototype.handler = function (name, handler) {
  var channel = csp.chan();
  channel.name = name;

  this.channels[name] = channel;
  this.handlers[name] = handler;

  return this;
};

Dispatcher.prototype.channel = function (name) {
  return this.channels[name];
};

Dispatcher.prototype.dispatch = function (name, value) {
  var chan = this.channel(name);
  if (!chan) throw new Error('No handler for: ' + name);

  csp.putAsync(chan, value);
};

Dispatcher.prototype.start = function (state) {
  var self = this;

  var handle = function(handler, channel, value) {
    state.swap(function (current) {
      return handler.call(self, value, current);
    });
  };

  csp.go(function* () {
    while (true) {
      var result = yield csp.alts(values(self.channels));

      var name = result.channel.name;
      var handler = self.handlers[name];

      handle(handler, result.channel, result.value);

      self.emit('dispatch', {
        name: name,
        value: result.value,
        state: state.deref()
      });
    }
  });
};

// Helpers

function values(obj) {
  var results = [];

  for (var key in obj) {
    results.push(obj[key]);
  }

  return results;
}
