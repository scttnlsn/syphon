var im = require('immutable');

module.exports = Delta;

function Delta(a, b) {
  this.a = a;
  this.b = b;
}

Delta.prototype.equal = function (path) {
  return im.is(this.a.getIn(path), this.b.getIn(path));
};
