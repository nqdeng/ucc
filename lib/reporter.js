'use strict';

var through = require('through2'),
	util = require('./util');

/**
 * Plugin factory.
 * @param [pkg] {Object}
 * @param ...
 * @return {Object}
 */
module.exports = function (pkg) {
	var errors = [];

	function transform(obj, enc, next) {
		if (util.isError(obj)) { // Catch all error objects.
			errors.push(obj);
		}
		next();
	}
	
	function flush(next) {
		if (errors.length > 0) { // Combo all errors and throw.
			var message = [],
				error;
			
			errors.forEach(function (err) { // Assemble error message.
				message.push((err.plugin || '') + ': ' + err.message +
					(err.src ? ' (' + err.src + ')' : ''));
			});
			
			error = new Error(message.join('\n'));
			error.stack = error.message;
			next(error);
		} else {
			next();
		}
	}

	return through.obj(transform, flush);
};