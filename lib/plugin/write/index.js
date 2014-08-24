'use strict';

var fs = require('fs'),
	mkdirp = require('mkdirp'),
	path = require('path'),
	util = require('ucc').util;

/**
 * Plugin factory.
 * @param pkg {Object}
 * @param [pattern] {RegExp}
 * @param [replacement] {Object}
 * @return {Object}
 */
module.exports = function (pkg, pattern, replacement) {
	var target = pkg.target;

	/**
	 * Write file to disk.
	 * @param file {Object}
	 * @param next {Function}
	 */
	return util.plugin('write', function (file, next) {
		var relative = file.relative;
		
		if (pattern) { // Relative path needs to be replaced.
			relative = relative.replace(pattern, replacement || '');
		}

		var pathname = path.join(file.cwd, target, relative),
			dirname = path.dirname(pathname);
			
		mkdirp(dirname, function (err) { // Make all parent directories first.
			if (err) {
				next(err);
			} else {
				fs.writeFile(pathname, file.data, function (err) {
					next(err || file);
				});
			}
		});
	});
};
