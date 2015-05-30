var React = require('react');
var syphon = require('../../lib/index');

var state = syphon.atom({ text: 'Hello World' });

var dispatcher = syphon.dispatcher();

dispatcher.handler('update-text', function (state, text) {
  return state.set('text', text);
});

var Component = React.createClass({
  mixins: [syphon.mixin],

  setText: function (e) {
    this.dispatch('update-text', e.currentTarget.value);
  },

  render: function () {
    var text = this.props.data.get('text');

    return React.DOM.div({},
      React.DOM.input({ value: text, onChange: this.setText }),
      React.DOM.p({}, text));
  }
});

syphon.root(Component, state, {
  dispatcher: dispatcher,
  el: document.getElementById('app')
});
