var path = require('path'),
	util = require('../../util');

var PATTERN_REQUIRE = /^\s*\/[\/\*]\s*#require\s+(["<])([\w\/\.-]+)[">](?:\s*\*\/)?\s*$/gm,

	PATTERN_SLASH = /\\/g,

	/**
	 * Normalize pathname.
	 * @param base {string}
	 * @param pathname {string}
	 * @return {string}
	 */
	normalize = function (base, pathname) {
		return path
			.join(base, pathname)
			.replace(PATTERN_SLASH, '/'); // Correct slash under windows.
	},

	/**
	 * Parse lite dependencies.
	 * @param file {Object}
	 * @return {Object}
	 */
	parse = function (pathname, data) {
		var deps = [],
			re;

		PATTERN_REQUIRE.lastIndex = 0;

		while (re = PATTERN_REQUIRE.exec(data)) { // Assign.
			deps.push(normalize(re[1] === '"' ?
				path.dirname(pathname) : '.', re[2]));
		}

		return deps;
	};

module.exports = function (config) {
	/**
	 * Parse dependencies comments.
	 * @param file {Object}
	 */
	return function (file) {
		file.meta.requires = parse(file.pathname, file.data);
	};
};