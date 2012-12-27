var createServer = require('../');
var through = require('through');
var test = require('tap').test;
var net = require('net');

var server = createServer();
server.on('upgrade', function (req, ws) {
    var rs = req.createRawStream();
    ws.write('HTTP/1.1 200 OK\r\n\r\n');
    rs.pipe(upper()).pipe(ws);
});
server.listen(0);
var port = server.address().port;

server.on('listening', function () {
    test('upgrade with headers', upgradeTest);
    
    test(function (t) {
        server.close();
        t.end();
    });
});

function upgradeTest (t) {
    t.plan(1);
    var c = net.connect(port);
    var data = '';
    c.on('data', function (buf) {
        data += buf;
    });
    c.on('end', function () {
        t.equal(data, [
            'HTTP/1.1 200 OK\r\n\r\n',
            'PUT / HTTP/1.1\r\n',
            'HOST: BEEP.BOOP\r\n',
            'UPGRADE: YES PLEASE\r\n',
            '\r\n',
            'ABC\nDEF\nH\nIJK'
        ].join(''));
    });
    
    c.write([
        'PUT / HTTP/1.1',
        'Host: beep.boop',
        'Upgrade: yes please',
        '',
        ''
    ].join('\r\n'));
    
    setTimeout(function () {
        c.write('abc\ndef\nh\n');
    }, 50);
    
    setTimeout(function () {
        c.end('ijk');
    }, 100);
}

function upper () {
    return through(function (buf) {
        this.emit('data', String(buf).toUpperCase());
    });
}
