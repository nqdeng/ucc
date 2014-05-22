var Compiler = require('./compiler'),
	Preprocessor = require('./preprocessor');

var PATTERN_DEFINE = /^\s*define\s*\(\s*(?:function|\{)/m;

module.exports = function (config) {
	var preprocessor = new Preprocessor(config),
		compiler = new Compiler(config);

	/**
	 * Compile anonymous CMD module.
	 */
	return function (file) {
		if (PATTERN_DEFINE.test(file.data)) {
			preprocessor.process(file);
			compiler.compile(file);
		}
	};
};
