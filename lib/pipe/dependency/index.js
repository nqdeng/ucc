var path = require('path');

var PATTERN_REQUIRE = /^\s*\/[\/\*]\s*#require\s+(["<])([\w\/\.-]+)[">](?:\s*\*\/)?\s*$/gm,



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
			deps.push(re[2]);
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
        file.data = file.data.replace(PATTERN_REQUIRE,'');
	};
};