var immutable = require('immutable');
var React = require('react');

module.exports = {
  contextTypes: {
    shared: React.PropTypes.object
  },

  data: function () {
    return this.props.data;
  },

  shared: function () {
    return this.context.shared;
  },

  dispatch: function (name, value) {
    this.shared().dispatcher.dispatch(name, value);
  }
};
