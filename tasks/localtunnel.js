/*
 * Start LocalTunnel service using localtunnel.me
 *
 * grunt localtunnel
 * grunt localtunnel:start
 * grunt localtunnel:stop
 *
 * @author Simon Lindsay <simonlindsay@gmail.com>
 */

module.exports = function(grunt) {
	grunt.registerTask('localtunnel', 'start a localtunnel service', function(port) {


		this.async();
		grunt.log.write('Requesting localtunne.me url...\n');

		var lt_client = require('localtunnel').client;

		var client = lt_client.connect({
			// the localtunnel server
			host: 'http://localtunnel.me',
			// your local application port
			port: 80
		});

		// when your are assigned a url
		client.on('url', function(url) {
			// you can now make http requests to the url
			// they will be proxied to your local server on port [12345]
			grunt.log.ok('localtunnel started at ' + url);
		});

		client.on('error', function(err) {
			grunt.log.ok('localtunnel error ' + err);
			// uh oh!
		});

	});
};
