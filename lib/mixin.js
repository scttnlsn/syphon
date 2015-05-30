var im = require('immutable');
var React = require('react');

module.exports = {
  contextTypes: {
    shared: React.PropTypes.object.isRequired
  },

  componentWillUnmount: function () {
    this.shared().observers.remove(this);
  },

  shouldComponentUpdate: function (props, state) {
    return !equal(this.props, props) || !equal(this.state, state);
  },

  shared: function () {
    return this.context.shared;
  },

  dispatch: function (name /* args */) {
    var dispatcher = this.shared().dispatcher;
    dispatcher.dispatch.apply(dispatcher, arguments);
  },

  observe: function (path) {
    this.shared().observers.add(path, this);

    return function () {
      return this.shared().data.getIn(path);
    }.bind(this);
  }
};

// Helpers

function equal(a, b) {
  if (im.is(a, b)) {
    return true;
  }

  for (var key in a) {
    if (a.hasOwnProperty(key) &&
        (!b.hasOwnProperty(key) || !im.is(a[key], b[key]))) {
      return false;
    }
  }

  for (var key in b) {
    if (b.hasOwnProperty(key) && !a.hasOwnProperty(key)) {
      return false;
    }
  }

  return true;
}
