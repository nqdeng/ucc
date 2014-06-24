var Compiler = require('./compiler');

var PATTERN_DEFINE = /^\s*define\s*\(\s*(?:function|\{)/m;

module.exports = function (config) {
	var compiler = new Compiler(config);

	/**
	 * Compile anonymous CMD module.
	 */
	return function (file) {
		if (PATTERN_DEFINE.test(file.data)) {
			compiler.compile(file);
		}
	};
};
