var im = require('immutable');
var React = require('react');
var assign = require('react/lib/Object.assign');

module.exports = Context;

function Context(component, state, options) {
  options || (options = {});

  this.component = wrapper(component);
  this.state = state;
  this.dispatcher = options.dispatcher;
  this.shared = options.shared || {};
  this.observers = [];
  this.el = null;
}

Context.prototype.watch = function () {
  var self = this;

  this.state.addWatch('syphon', function (_, _, prev, next) {
    self.update(prev, next);
  });
};

Context.prototype.update = function (prev, next) {
  var self = this;

  this.render(this.el);

  this.observers.forEach(function (observer) {
    if (!im.is(prev.getIn(observer.path), next.getIn(observer.path))) {
      self.dirty(observer.component);
    }
  });
};

Context.prototype.dirty = function (component) {
  component.forceUpdate();
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
