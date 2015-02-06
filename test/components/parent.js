var React = require('react');
var Child = require('./child');
var syphon = require('../../lib');

module.exports = React.createClass({
  mixins: [syphon.mixin],

  render: function () {
    return React.createElement(Child);
  }
});
