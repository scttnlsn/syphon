var im = require('immutable');
var React = require('react');
var assign = require('react/lib/Object.assign');
var Delta = require('./delta');
var Observers = require('./observers');

module.exports = Context;

function Context(component, state, options) {
  options || (options = {});

  this.component = wrapper(component);
  this.state = state;
  this.dispatcher = options.dispatcher;
  this.shared = options.shared || {};
  this.el = null;

  this.observers = new Observers();
  this.observers.on('dirty', function (component) {
    component.forceUpdate();
  });
}

Context.prototype.watch = function () {
  var self = this;

  this.state.addWatch('syphon', function (_, _, prev, next) {
    var delta = new Delta(prev, next);
    self.update(delta);
  });
};

Context.prototype.update = function (delta) {
  this.render(this.el);
  this.observers.run(delta);
};

Context.prototype.render = function (el) {
  if (el) {
    return React.render(this.element(), el);
  } else {
    return React.renderToString(this.element());
  }
};

Context.prototype.element = function () {
  return React.createElement(this.component, { shared: this.serialize() });
};

Context.prototype.serialize = function () {
  return assign({}, this.shared, {
    data: this.state.deref(),
    dispatcher: this.dispatcher,
    observers: this.observers
  });
};

Context.prototype.mount = function (el) {
  this.el = el;
  this.render(el);
  this.watch();
};

// Helpers

function wrapper(component) {
  return React.createClass({
    childContextTypes: {
      shared: React.PropTypes.object.isRequired
    },

    displayName: 'Context',

    getChildContext: function () {
      return {
        shared: this.props.shared
      };
    },

    render: function () {
      return React.createElement(component, { data: this.props.shared.data });
    }
  });
}
