var Stream = require('stream');

module.exports = function (req) {
    var c = req.connection;
    
    var s = new Stream;
    s.writable = true;
    
    s.write = c.write.bind(c);
    s.end = function (buf) {
        if (buf !== undefined) s.write(buf);
        c.end();
        close();
    };
    s.destroy = c.destroy.bind(c);
    s.pause = c.pause.bind(c);
    s.resume = c.resume.bind(c);
    
    var closed = false;
    function close () {
        if (closed) return;
        s.emit('close');
        closed = true;
        req.destroy();
    }
    
    return s;
};
