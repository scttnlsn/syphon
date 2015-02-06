var React = require('react');
var Child = require('./child');

module.exports = React.createClass({
  render: function () {
    return React.createElement(Child);
  }
});
