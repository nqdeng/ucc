'use strict';

var del = require('del'),
	path = require('path');
	
var PATTERN_SLASH = /\\/g,

	PREFIX = '';

module.exports = function (ucc) {
	return ucc
		.task('default', [ 'script', 'stylesheet', 'image', 'flash', 'font' ])
		
		.task('initiate', function (cb) {
			PREFIX = path.join(this.pkg.name, this.pkg.version)
				.replace(PATTERN_SLASH, '/') + '/';
	
			del([ this.pkg.target + '/*' ], cb);
		})
		
		.task('script', [ 'initiate' ], function () {
			return this.read('js|tpl|json')
				.decode()
				.nocomment()
				.id()
				.modular()
				.dependencies()
				.write(/^(.*)(\.\w+)$/, PREFIX + '$1.debug$2')
				.uglifyjs()
				.write(/^(.*)$/, PREFIX + '$1');
		})
		
		.task('stylesheet', [ 'initiate' ], function () {
			return this.read('css')
				.decode()
				.nocomment()
				.id()
				.dependencies()
				.write(/^(.*)(\.\w+)$/, PREFIX + '$1.debug$2')
				.cleancss()
				.write(/^(.*)$/, PREFIX + '$1');
		})
		
		.task('image', [ 'initiate' ], function () {
			return this.read('png|jpg|jpeg|gif')
				.write(/^(.*)$/, PREFIX + '$1');
		})
		
		.task('flash', [ 'initiate' ], function () {
			return this.read('swf')
				.write(/^(.*)$/, PREFIX + '$1');
		})
		
		.task('font', [ 'initiate' ], function () {
			return this.read('otf|eot|svg|ttf|woff')
				.write(/^(.*)$/, PREFIX + '$1');
		});
}