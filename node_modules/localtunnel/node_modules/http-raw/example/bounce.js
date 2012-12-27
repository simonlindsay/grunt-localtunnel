var createServer = require('../');
var http = require('http');
var net = require('net');

var server = createServer(function (req, res) {
    req.createRawStream()
        .pipe(net.connect(7001), { end : false })
        .pipe(res.createRawStream())
    ;
});
server.listen(7000);

http.createServer(function (req, res) {
    res.end('beep boop\n');
}).listen(7001);
