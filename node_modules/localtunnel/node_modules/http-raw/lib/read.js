var Stream = require('stream');

module.exports = function (req) {
    var c = req.connection;
    
    var s = new Stream;
    s.readable = true;
    
    s.pause = function() {
        this._pause = true;
        return c.pause();
    }

    s.resume = function() {
        var self = this;
        this._pause = false;
        c.resume();

        var buffers = self.buffers;
        for (var i = 0; i < buffers.length; i++) {
            s.emit('data', buffers[i]);
        }
        self.buffers = [];

        // body buffer
        if (s.body_buf) {
            s.emit('data', Buffer(s.body_buf));
        }
        s.body_buf = undefined;
    }
    
    c.on('data', s.emit.bind(s, 'data'));
    c.on('end', s.emit.bind(s, 'end'));
    c.on('drain', s.emit.bind(s, 'drain'));
    c.on('error', function () {
        req.destroy();
    });
    
    return s;
};
