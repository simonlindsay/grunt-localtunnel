var createServer = require('../');
var test = require('tap').test;

var http = require('http');
var net = require('net');

var server = createServer(function (req, res) {
    var c = net.connect(7001);
    req.createRawStream()
        .pipe(c, { end : false })
        .pipe(res.createRawStream())
    ;
});
server.listen(0);
var port = server.address().port;

var target = http.createServer(function (req, res) {
    if (req.url === '/') {
        res.end('beep boop\n');
    }
    else {
        res.write('abc');
        setTimeout(function () {
            res.end('def');
        }, 200);
    }
});
target.listen(7001);

server.on('listening', function () {
    test('bounce a request', testBounce);
    test('bounce a request with a delayed response', testDelayedBounce);
    test(function (t) {
        server.close();
        target.close();
        t.end();
    });
});

function testBounce (t) {
    t.plan(2);
    
    var c = net.connect(port);
    var data = '';
    c.on('data', function (buf) { data += buf });
    c.on('end', function () {
        var parts = data.split(/\r\n\r\n|\n\n/);
        t.ok(/^HTTP\/1.1 200 OK/.test(parts[0]));
        t.equal(parts[1], 'a\r\nbeep boop\n\r\n0');
    });
    c.end([
        'GET / HTTP/1.1',
        'Host: localhost',
        'Connection: close',
        '',
        ''
    ].join('\r\n'));
}

function testDelayedBounce (t) {
    t.plan(2);
    
    var c = net.connect(port);
    var data = '';
    c.on('data', function (buf) { data += buf });
    c.on('end', function () {
        var parts = data.split(/\r\n\r\n|\n\n/);
        t.ok(/^HTTP\/1.1 200 OK/.test(parts[0]));
        t.equal(parts[1], '3\r\nabc\r\n3\r\ndef\r\n0');
    });
    c.end([
        'GET /delay HTTP/1.1',
        'Host: localhost',
        'Connection: close',
        '',
        ''
    ].join('\r\n'));
}
