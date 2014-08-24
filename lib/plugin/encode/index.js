'use strict';

var util = require('ucc').util;

/**
 * Plugin factory.
 * @param pkg {Object}
 * @param [charset] {string}
 * @return {Object}
 */
module.exports = function (pkg, charset) {
	charset = charset || 'utf8';

	/**
	 * Encode string to buffer.
	 * @param file {Object}
	 * @param next {Function}
	 */
	return util.plugin('encode', function (file, next) {
		try {
			if (util.isString(file.data)) {
				file.data = new Buffer(file.data, charset);
			}
			next(file);
		} catch (err) {
			next(err);
		}
	});
};