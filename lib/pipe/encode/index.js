module.exports = function (config) {
	/**
	 * Convert string to binary data.
	 * @param file {Object}
	 */
	return function (file) {
		var data = file.data;

		file.data = new Buffer(data, 'binary');
	};
};