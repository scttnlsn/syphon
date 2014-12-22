var React = require('react');

module.exports = Context;

function Context(component, state, options) {
  this.component = component;
  this.state = state;

  this.options = options || {};
  this.shared = this.options.shared || {};
  this.shared.dispatcher = this.options.dispatcher;
}

Context.prototype.element = function () {
  var self = this;

  return React.withContext({ shared: this.shared }, function () {
    return React.createElement(self.component, { data: self.state.deref() });
  });
};

Context.prototype.render = function (el) {
  if (el) {
    return React.render(this.element(), el);
  } else {
    return React.renderToString(this.element());
  }
};

Context.prototype.mount = function (el) {
  var self = this;

  this.state.addWatch('render', function () {
    self.render(el);
  });
};
