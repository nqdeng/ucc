'use strict';

var through = require('through2');

exports = module.exports = Object.create(require('mini-util'));

/**
 * Create a compiler plugin.
 * @param name {string}
 * @param transform {Function}
 * @param [flush] {Function}
 * @return {Object}
 */
exports.plugin = function (name, transform, flush) {
	return through.obj(function (obj, enc, next) {
		var self = this;
		
		if (exports.isError(obj)) { // Ignore Error object.
			this.push(obj);
			return next();
		}
		
		transform(obj, function (o) {
			// Normalize return value to an Array.
			[].concat(o).forEach(function (o) {
				if (exports.isError(o)) { // Attach associated information.
					o.src = obj.path;
					o.plugin = name;
				}
				self.push(o);
			});
			next();
		});
	}, flush);
};