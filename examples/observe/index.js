var React = require('react');
var syphon = require('../../lib/index');

var state = syphon.atom({ text: 'Hello World' });

var dispatcher = syphon.dispatcher();

dispatcher.handler('update-text', function (state, text) {
  return state.set('text', text);
});

var Child = React.createClass({
  mixins: [syphon.mixin],

  componentWillMount: function () {
    this.text = this.observe(['text']);
  },

  setText: function (e) {
    this.dispatch('update-text', e.currentTarget.value);
  },

  render: function () {
    var text = this.text();

    return React.DOM.div({},
      React.DOM.input({ value: text, onChange: this.setText }),
      React.DOM.p({}, text));
  }
});

var Component = React.createClass({
  render: function () {
    // Notice that we are not passing any props to the child
    return React.createElement(Child);
  }
});

syphon.root(Component, state, {
  dispatcher: dispatcher,
  el: document.getElementById('app')
});
