var browserify = require('browserify');
var fs = require('fs');
var http = require('http');

var server = http.createServer(function (req, res) {
    if (req.url === '/index.js') {
        browserify().add('./index.js').bundle().pipe(res);
    } else {
        fs.createReadStream('./index.html').pipe(res);
    }
});

server.listen(3000);
