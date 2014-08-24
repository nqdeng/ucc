'use strict';

var del = require('del');

module.exports = function (ucc) {
	return ucc
		.task('default', [ 'script', 'stylesheet', 'image', 'flash', 'font' ])
		
		.task('clean', function (cb) {
			del([ this.pkg.target + '/*' ], cb);
		})
		
		.task('script', [ 'clean' ], function () {
			return this.read('js|tpl|json')
				.decode()
				.nocomment()
				.id()
				.modular()
				.dependencies()
				.write(/(\.\w+)$/, '.debug$1')
				.write();
		})
		
		.task('stylesheet', [ 'clean' ], function () {
			return this.read('css')
				.decode()
				.nocomment()
				.id()
				.dependencies()
				.write(/(\.\w+)$/, '.debug$1')
				.write();
		})
		
		.task('image', [ 'clean' ], function () {
			return this.read('png|jpg|jpeg|gif')
				.write();
		})
		
		.task('flash', [ 'clean' ], function () {
			return this.read('swf')
				.write();
		})
		
		.task('font', [ 'clean' ], function () {
			return this.read('otf|eot|svg|ttf|woff')
				.write();
		});
}