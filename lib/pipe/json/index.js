module.exports = function (config) {
	/**
	 * Validate and minify JSON data.
	 * @param context {Object}
	 * @param next {Function}
	 */
	return function (file) {
		file.meta.mime = 'application/javascript';
		file.data = 'define("' + file.pathname + '", [], '
			+ JSON.stringify(JSON.parse(file.data))
			+ ');'
	};
};