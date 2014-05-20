var compiler = require('../../compiler'),
	path = require('path'),
	util = require('../../util');

var PATTERN_DEFINE = /^[ \f\t\v]*define\s*\(\s*(function\s*\(.*?\)|\{)/m,

	PATTERN_REQUIRE = /[^\.]require\s*\(\s*['"]([^'"]+?)['"]\s*\)/g,

	Compiler = util.inherit(Object, {
		/**
		 * Initializer.
		 * @param config {Object}
		 */
		_initialize: function (config) {

		},

		/**
		 * Parse lite dependencies.
		 * @param file {Object}
		 * @return {Array}
		 */
		_parse: function (data) {
			var deps = [];

			PATTERN_REQUIRE.lastIndex = 0;

			while (re = PATTERN_REQUIRE.exec(data)) { // Assign.
				deps.push(re[1]);
			}

			return deps;
		},

		/**
		 * Compile CMD module.
		 * @param context {Object}
		 * @param callback {Function}
		 */
		compile: function (file) {
			var meta = file.meta,
				requires = this._parse(file.data);

			if (!meta.requires) {
				meta.requires = requires;
			} else {
				meta.requires = meta.requires.concat(requires);
			}

			requires = requires.length === 0 ?
				'[]' : '[ "' + requires.join('", "') + '" ]';

			file.data = file.data
				.replace(PATTERN_DEFINE, function (all, suffix) {
					if (suffix === '{') {
						return util.format('define("%s", %s, {',
							file.pathname, requires);
					} else {
						return util.format('define("%s", %s, function (require, exports, module)',
							file.pathname, requires);
					}
				});
		}
	});

module.exports = Compiler;
