var http = require('http');
var https = require('https');
var createReadStream = require('./lib/read');
var createWriteStream = require('./lib/write');

exports = module.exports = fromServer(http.createServer);
exports.http = fromServer(http.createServer);
exports.https = fromServer(https.createServer, 'secureConnection');
exports.fromServer = fromServer;

function fromServer (Server, evName) {
    return function (opts, cb) {
        if (typeof opts === 'function') {
            cb = opts;
            opts = undefined;
        }
        var server = new Server(opts);
        server.on('request', function (req, res) {

            injectRaw(req);

            // clear any previous buffered info
            req.connection._rawBuffers = [];

            res.createRawStream = createWriteStream.bind(null, req);
            if (cb) cb.apply(this, arguments);
        });
        
        server.on(evName || 'connection', onconnection);
        server.on('upgrade', function (req) {

            injectRaw(req);

            // clear any previous buffered info
            req.connection._rawBuffers = [];
        });
        return server;
    };
}

function onconnection (con) {
    con._rawBuffers = [];
    
    var ondata = con.ondata;
    con.ondata = function (buf, start, end) {
        var copy = new Buffer(end - start);
        buf.copy(copy, 0, start, end);

        con._rawBuffers.push(copy);

        if (!con._upgraded) return ondata.apply(this, arguments);
    };
    
    var onend = con.onend;
    con.onend = function () {
        con._rawBuffers = [];
        if (!con._upgraded) return onend.apply(this, arguments);
    };
}

function injectRaw (req) {
    var buffers = req.connection._rawBuffers;
    
    req.createRawStream = function () {
        req.connection._upgraded = true;
        
        var s = createReadStream(req);
        s.buffers = buffers;

        process.nextTick(function () {
            if (s._pause) {
                return;
            }

            s.resume();
        });
        
        return s;
    };
    
    req.createRawBodyStream = function () {
        req.connection._upgraded = true;

        var s = createReadStream(req);
        
        if (buffers.length > 0) {
            var b = buffers[buffers.length-1];
            var str = String(b);

            var ix = str.indexOf('\r\n\r\n');
            if (ix >= 0) {
                ix += 4
            }
            else {
                ix = str.indexOf('\n\n');
                if (ix < 0) return s;
                ix += 2;
            }

            var b = str.slice(ix);
            if (b.length > 0) {
                // store to use in .resume if needed
                s.body_buf = Buffer(b);
            }
        }

        // raw buffers no longer needed
        buffers = [];
        s.buffers = [];

        process.nextTick(function () {
            if (s._pause) {
                return;
            }

            s.resume();
        });

        return s;
    };
}
