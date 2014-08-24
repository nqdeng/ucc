'use strict';

var Orchestrator = require('orchestrator'),
	Stream = require('stream').Stream,
	chain = require('./chain'),
	reporter = require('./reporter'),
	util = require('./util');

/**
 * Compiler constructor.
 */
var UCC = util.inherit(Orchestrator, {
	/**
	 * Constructor.
	 * @param config {Object}
	 */
	constructor: function (config) {
		// Parent constructor.
		Orchestrator.call(this);
		// Bind project information to a Chain instance.
		this.read = chain(config.pkg, config.cwd);
		// Expose project information to the end-user.
		this.pkg = config.pkg;
		this.cwd = config.cwd;
	},
	
	// Hide the super class API.
	add: null,
	
	/**
	 * Define a task.
	 * @param name {string}
	 * @param [dependencies] {Array}
	 * @param [action] {Function}
	 * @return {Object}
	 */
	task: function () {
		var args = util.toArray(arguments),
			last = args.length - 1,
			fn = args[last],
			self = this;
			
		// Wrap the action function in stream/promise mode.
		if (util.isFunction(fn) && fn.length === 0) {
			args[last] = function () { // Hack on the returned stream.
				var ret = fn.call(self);
			
				return ret instanceof Stream ?
					// Take the wrapped stream out from the chain by __proto__.
					// And make the reporter plugin to be the last.
					ret.__proto__.pipe(reporter()) : ret;
			};
		}
		
		// Pass to super class to add a task.
		return UCC.super.add.apply(this, args);
	}
});

// Factory-style API is more elegant.
exports = module.exports = function (config) {
	return new UCC(config);
};

// Expose util to the end-user.
exports.util = util;
