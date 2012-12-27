var bouncy = require('bouncy');

module.exports = function (port) {
    return bouncy(function (req, bounce) { bounce(port) });
};
