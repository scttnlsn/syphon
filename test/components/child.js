var React = require('react');
var syphon = require('../../lib');

module.exports = React.createClass({
  mixins: [syphon.mixin],

  componentWillMount: function () {
    this.name = 'child';
    this.text = this.observe(['text']);
  },

  render: function () {
    return React.DOM.p({}, this.text());
  }
});
