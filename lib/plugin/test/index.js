'use strict';

var util = require('ucc').util;

/**
 * Plugin factory.
 * @param pkg {Object}
 * @param fn {Function}
 * @return {Object}
 */
module.exports = function (pkg, fn) {
	fn = fn || function (file, next) {
		next(file);
	};

	/**
	 * Instant pulgin from config file!!
	 * @param file {Object}
	 * @param next {Function}
	 */
	return util.plugin('test', fn);
};