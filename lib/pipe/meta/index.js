module.exports = function (config) {
	/**
	 *
	 * @param file {Object}
	 * @param next {Function}
	 */
	return function (file) {
		var m = JSON.stringify(file.meta),
			d = '/*!meta ',
			t = m.length.toString(16);

		d += '        '.substring(0, 8 - t.length) + t;
		d += m + '*/\n';

		file.data = d + file.data;
	};
};