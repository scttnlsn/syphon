var React = require('react');
var syphon = require('../../lib/index');

var state = syphon.atom({ text: 'Hello World' });

var dispatcher = syphon.dispatcher({
  example: function (obj, state) {
    var name = obj[0];
    var value = obj[1];

    switch (name) {
      case 'update-text':
        return state.set('text', value);
      default:
        return state;
    }
  }
});

var Component = React.createClass({
  mixins: [syphon.mixin],

  setText: function (e) {
    this.dispatch('example', ['update-text', e.currentTarget.value]);
  },

  render: function () {
    var text = this.data().get('text');

    return React.DOM.div({},
      React.DOM.input({ value: text, onChange: this.setText }),
      React.DOM.p({}, text));
  }
});

syphon.root(Component, state, {
  dispatcher: dispatcher,
  el: document.getElementById('app')
});
