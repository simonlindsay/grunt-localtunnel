# http-raw

expose the raw request data in an http server

[![build status](https://secure.travis-ci.org/substack/http-raw.png)](http://travis-ci.org/substack/http-raw)

# example

``` js
var createServer = require('http-raw');
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
```

```
$ node example/server.js &
$ nc localhost 7000
PUT / HTTP/1.1
Host: robots

HTTP/1.1 200 OK


beep 
BEEP
boop
BOOP
```

# methods

``` js
var httpRaw = require('http-raw')
```

The http-raw api is exactly like the `http.createServer(cb)` api from core,
except for the extra functions documented below that get attached to the `req`
and `res` objects in the
[`'request'`](http://nodejs.org/docs/latest/api/http.html#http_event_request)
and
[`'upgrade'`](http://nodejs.org/docs/latest/api/http.html#http_event_upgrade)
events.

## var server = httpRaw(cb)

Create a new http server with extended raw stream functions.

## var server = httpRaw.https(options, cb)

Create a new https server with extended raw stream functions.

## var rs = req.createRawStream()

Return a readable stream `rs`. `rs` will emit all the raw data from the
connection, including the buffered header data without doing any parsing on the
data beforehand.

To get all the data, `req.createRawStream()` must be fired on the same tick as
the response callback.

On the same tick as the response handler, `s.buffers` will have all all the
buffer slices formatted as an array where each element is an array:

``` js
[ buffer, start, end ]
```

On the next tick `s.buffers` gets set to undefined to it can be garbage
collected.

## var ws = res.createRawStream()

Return a writable stream `ws` that will be written directly to the underlying
network socket without any additional framing added.

## var bs = req.createRawBodyStream()

Return a readable stream `bs` like the stream returned by
`req.createRawStream()`, but only emit the raw body data, not the headers.

To get all the data, `req.createRawBodyStream()` must be fired on the same tick
as the response callback.

# install

With [npm](https://npmjs.org) do:

```
npm install http-raw
```

# license

MIT
