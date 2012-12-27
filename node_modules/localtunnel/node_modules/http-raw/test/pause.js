var createServer = require('../');
var through = require('through');
var test = require('tap').test;
var net = require('net');

var server = createServer(function (req, res) {
    var rs = req.createRawStream();
    var ws = res.createRawStream();
    rs.pause();

    setTimeout(function() {
        ws.write('HTTP/1.1 200 OK\r\n\r\n');
        rs.pipe(upper()).pipe(ws);
        rs.resume();
    }, 100);
});
server.listen(0);
var port = server.address().port;

server.on('listening', function () {
    test('simple GET', getTest);
    test(function (t) {
        server.close();
        t.end();
    });
});

function getTest (t) {
    t.plan(3);

    var c = net.connect(port);
    var data = '';
    c.on('data', function (buf) { data += buf });

    c.on('end', function () {
        var lines = data.split(/\r?\n/);
        t.equal(lines[0], 'HTTP/1.1 200 OK');
        t.equal(lines[2], 'GET / HTTP/1.1');
        t.equal(lines[3], 'HOST: BEEP.BOOP');
    });

    c.write([
        'GET / HTTP/1.1',
        'Host: beep.boop',
        '',
        ''
    ].join('\r\n'));
    setTimeout(c.end.bind(c), 200);
}

function upper () {
    return through(function (buf) {
        this.emit('data', String(buf).toUpperCase());
    });
}
