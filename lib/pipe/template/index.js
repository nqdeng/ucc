var	PATTERN_SPECIAL_CHAR = /["\\\r\n\t\f]/g,

	ESCAPE = {
		'"': '\\"',
		'\r': '\\r',
		'\n': '\\n',
		'\t': '\\t',
		'\f': '\\f'
	};

module.exports = function (config) {
	/**
	 * Convert text file to JS string.
	 * @param context {Object}
	 * @param next {Function}
	 */
	return function (file) {
		file.meta.mime = 'application/javascript';
		file.data = 'define("' + file.pathname + '", [], function () {'
			+ '' + 'return "'
			+ file.data.replace(PATTERN_SPECIAL_CHAR, function (char) {
				return ESCAPE[char];
			})
			+ '";'
			+ '});';
	};
};