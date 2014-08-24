'use strict';

var	CleanCSS = require('clean-css'),
	util = require('ucc').util;

/**
 * Plugin factory.
 * @return {Object}
 */
module.exports = function () {
	var clean = new CleanCSS();
	
	/**
	 * Minify CSS.
	 * @param file {Object}
	 * @param next {Function}
	 */
	return util.plugin('cleancss', function (file, next) {
		try {
			file.data = clean.minify(file.data);
			next(file);
		} catch (err) {
			next(err);
		}
	});
};
