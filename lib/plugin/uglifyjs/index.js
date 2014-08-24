'use strict';

var	uglify = require('uglify-js'),
	util = require('ucc').util;
	
/**
 * Plugin factory.
 * @return {Object}
 */
module.exports = function () {
	var options = {
		fromString: true,
		output: {
			comments: /^!/i // Keep important! comments.
		}
	};

	/**
	 * Minify JS.
	 * @param file {Object}
	 * @param next {Function}
	 */
	return util.plugin('uglifyjs', function (file, next) {
		try {
			file.data = uglify.minify(file.data, options).code;
			next(file);
		} catch (err) { // UglifyJS does not throw a real Error object.
			next(new Error(
				util.format('%s (line: %s, col: %s)',
					err.message, err.line, err.col)
			));
		}
	});
};
