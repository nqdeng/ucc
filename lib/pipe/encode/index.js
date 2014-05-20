module.exports = function (config) {
	/**
	 * Convert string to binary data.
	 * @param context {Object}
	 * @param next {Function}
	 */
	return function (file) {
		var data = file.data;

		file.data = new Buffer(data, 'binary');
	};
};