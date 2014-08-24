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
	 * Decode buffer to string.
	 * @param file {Object}
	 * @param next {Function}
	 */
	return util.plugin('decode', function (file, next) {
		try {
			if (util.isBuffer(file.data)) {
				file.data = file.data.toString(charset);
			}
			next(file);
		} catch (err) {
			next(err);
		}
	});
};