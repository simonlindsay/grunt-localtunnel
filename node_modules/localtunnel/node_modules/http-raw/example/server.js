var createServer = require('../');
var through = require('through');

var server = createServer(function (req, res) {
    if (req.method === 'GET') {
        res.end('beep boop\n');
    }
    else {
        var rs = req.createRawBodyStream();
        var ws = res.createRawStream();
        
        ws.write('HTTP/1.1 200 OK\r\n\r\n');
        rs.pipe(upper()).pipe(ws)
    }
});
server.listen(7000);

function upper () {
    return through(function (buf) {
        this.emit('data', String(buf).toUpperCase());
    });
}
