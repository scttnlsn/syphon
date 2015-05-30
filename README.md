syphon
====

[![NPM](https://img.shields.io/npm/v/syphon.svg?style=flat)](http://npm.im/syphon)
[![Build Status](https://img.shields.io/travis/scttnlsn/syphon.svg?style=flat)](https://travis-ci.org/scttnlsn/syphon)

Syphon is an implementation of the [Flux](https://facebook.github.io/flux/) architectural pattern for [React](http://facebook.github.io/react/) applications inspired by [ClojureScript](https://github.com/clojure/clojurescript) and [Om](https://github.com/swannodette/om).  It helps structure your application around a single immutable state value and implements the dispatching of actions to various state-transitioning handler functions.

* [Example](#example)
* [State](#state)
* [Handlers](#handlers)
* [Dispatcher](#dispatcher)
* [Components](#components)
* [Observe](#observe)
* [Mixin](#mixin)
* [Install](#install)
* [License](#license)

## Example

```javascript
var syphon = require('syphon');

var state = syphon.atom({ text: 'Hello World' });

var dispatcher = syphon.dispatcher();

dispatcher.handler('update-text', function (value, state) {
  return state.set('text', value);
});

var Component = React.createClass({
  mixins: [syphon.mixin],

  setText: function (e) {
    this.dispatch('update-text', e.currentTarget.value);
  },

  render: function () {
    return React.DOM.div({},
      React.DOM.input({ onChange: this.setText }),
      React.DOM.p({}, this.props.data.get('text')));
  }
});

syphon.root(Component, state, {
  dispatcher: dispatcher,
  el: document.getElementById('app')
});
```

## State

Application state is stored in an [immutable](http://facebook.github.io/immutable-js/) data structure and passed as a prop (called `data`) to the root component in the hierarchy.  A single mutable reference to the immutable state is held in an [atom](https://github.com/cjohansen/js-atom):

```js
var state = syphon.atom({ foo: 'bar' });
```

To access the value inside the atom you must `deref` it:

```js
var data = state.deref();
```

This will return the [Immutable.js](http://facebook.github.io/immutable-js/) data structure.  Since the data cannot be mutated directly, our only way to update the application state is to swap the atom's reference with a new state value:

```js
var state = syphon.atom({ foo: 'bar' });

state.swap(function (current) {
  // `current` is an Immutable.js map
  console.log(current.toJS());
  // => { foo: 'bar' }

  // Return a new state by modifying the current state.
  // Refer to the Immutable.js docs for availble methods.
  return current.set('foo', 'baz');
});

console.log(state.deref().toJS());
// => { foo: 'baz' }
```

Handlers (see below) are responsible for implementing these state transitioning functions.

You can watch for state changes via a callback:

```js
state.addWatch('mywatcher', function (key, ref, old, state) {
  console.log('the state is now:', state);
});
```

Refer to the [js-atom](https://github.com/cjohansen/js-atom) docs for more information about atoms.

## Handlers

Handlers are functions of the form:

```js
function (value, currentState) {
  return newState;
}
```

* The first argument is the dispatched value.
* The second argument is the current (dereferenced) application state.
* The handler must return a new immutable state.  Refer to the [Immutable.js](http://facebook.github.io/immutable-js/) docs for information about mofifying the state.

While handlers are pure functions in the sense that they do not directly mutate application state, they may have other side-effects (such as making a network request or calling out to some other stateful browser API).  Since the handler functions are called synchronously, any asynchronous results must re-dispatched and handled elsewhere:

```js
dispatcher.handler('fetch-post', function (id, state) {
  var self = this;

  // Make network request
  fetchPost(id, function (err, post) {
    if (err) {
      self.dispatch('fetch-post-error', err);
    } else {
      self.dispatch('fetch-post-success', post);
    }
  });

  return state.set('loading', true);
});

dispatcher.handler('fetch-post-success', function (post, state) {
  return state
    .set('loading', false)
    .set('post', post);
});

dispatcher.handler('fetch-post-error', function (err, state) {
  return state
    .set('loading', false)
    .set('notice', 'There was an error fetching the post.')
    .set('error', err);
});
```

## Dispatcher

You will typically only need a single dispatcher per application since it can coordinate multiple handlers.  To add handlers to a dispatcher either pass them to the constructor or call the `handler` function:

```js
var dispatcher = syphon.dispatcher({
  foo: function (value, state) { ... },
  bar: function (value, state) { ... }
});
```

or

```js
var dispatcher = syphon.dispatcher();

dispatcher.handler('foo', function (value, state) { ... });
dispatcher.handler('bar', function (value, state) { ... });
```

To dispatch a value, call the `dispatch` function, passing the handler name and any contextual value:

```js
dispatcher.dispatch('example', { foo: 'bar', baz: 123 });
```

The dispatcher emits a `dispatch` event after each handler is called:

```js
dispatcher.on('dispatch', function (dispatch) {
   console.log(dispatch.name);  // name of the handler invoked
   console.log(dispatch.value); // value passed to the handler
   console.log(dispatch.state); // state returned from the handler
});
```

## Components

To mount your component hierarchy and automatically re-render when the state changes, Syphon provides the `root` function:

```js
syphon.root(MyComponent, state, {
  dispatcher: dispatcher,
  el: document.getElementById('app')
});
```

On every render, your root component will receive the current (dereferenced) state in a prop called `data`.  Your component can then pass parts of the state to child components and so on.

## Observe

You may encounter cases where your data hierarchy does not directly correspond to your component hierarchy and a component needs to access application state it was not passed as a prop.  In these cases you can observe arbitrary paths in the application state:

```javascript
var Component = React.createClass({
  mixins: [syphon.mixin],

  componentWillMount: function () {
    this.text = this.observe(['path', 'to', 'text']);
  },

  render: function () {
    return React.DOM.p({}, this.text());
  }
});
```

Syphon tracks which components are observing certain paths and ensures that they update when the application state changes at those paths.

## Mixin

The Syphon mixin adds some helpers to your components that make it easier to dispatch values, observe state, and access shared data.  It also implements React's `shouldComponentUpdate` method to take advantage of fast immutable data structure equality checks.

By using the mixin you can...

Dispatch new values:

```js
var MyComponent = React.createClass({
  mixins: [syphon.mixin],

  onClick: function () {
    this.dispatch('button-clicked');
  }
});
```

Share data with the entire component hierarchy:

```js
var MyComponent = React.createClass({
  mixins: [syphon.mixin],

  componentWillMount: function () {
    console.log(this.shared().foo); // => 'bar'
  }
});

syphon.root(MyComponent, state, {
  dispatcher: dispatcher,
  el: document.getElementById('app'),
  shared: { foo: 'bar' }
});
```

And observe application state:

```javascript
var MyComponent = React.createClass({
  mixins: [syphon.mixin],

  componentWillMount: function () {
    this.text = this.observe(['path', 'to', 'text']);
  },

  render: function () {
    return React.DOM.p({}, this.text());
  }
});
```

## Install

    npm install syphon

## License

The MIT License (MIT)

Copyright (c) 2014-2015 Scott Nelson

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
