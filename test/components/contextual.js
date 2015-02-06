var React = require('react')
var syphon = require('../../lib');

module.exports = React.createClass({
  mixins: [syphon.mixin],

  componentWillMount: function () {
    this.dispatch('foo', 'bar');
  },

  render: function () {
    return React.DOM.div({},
      React.DOM.p({}, this.props.data.get('text')),
      React.DOM.p({}, this.shared().foo));
  }
});
