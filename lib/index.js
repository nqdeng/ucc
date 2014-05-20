var compiler = require('./compiler');

module.exports = function (options) {
	return compiler.create(options);
};
