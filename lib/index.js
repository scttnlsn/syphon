var events = require('events');
var immutable = require('immutable');
var atom = require('js-atom/atom');
var React = require('react');
var Context = require('./context');
var Dispatcher = require('./dispatcher');
var mixin = require('./mixin');

exports.dispatcher = function (handlers) {
  return new Dispatcher(handlers);
};

exports.atom = function (data) {
  return atom.createAtom(immutable.fromJS(data));
};

exports.context = function (component, state, options) {
  return new Context(component, state, options);
};

exports.root = function (component, state, options) {
  var context = this.context(component, state, options);

  if (options) {
    if (options.el) {
      context.mount(options.el);
    }

    if (options.dispatcher) {
      options.dispatcher.start(state);
    }
  }

  return context;
};

exports.mixin = mixin;
exports.Dispatcher = Dispatcher;
