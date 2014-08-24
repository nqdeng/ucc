'use strict';

var fs = require('fs'),
	gs = require('glob-stream'),
	path = require('path'),
	File = require('./file'),
	util = require('./util');

var PLUGIN_DIR = './plugin/',
	PLUGINS = fs.readdirSync(path.join(__dirname, PLUGIN_DIR));

/**
 * Plugin factory.
 * @return {Object}
 */
function filer() {
	/**
	 * Convert passed-in file info into File object.
	 * @param file {Object}
	 * @param next {Function}
	 */
	return util.plugin('filer', function (file, next) {
		fs.readFile(file.path, function (err, data) {
			if (!err) {
				file.data = data;
			}
			next(err || new File(file));
		});
	});
}

/**
 * Create the source stream.
 * @param glob {string|Array}
 * @param cwd {string}
 * @return {Object}
 */
function source(glob, cwd) {
	// Make the filer plugin to be the second.
	return gs.create(glob, { cwd: cwd }).pipe(filer());
}

/**
 * The factory of Chain Factory.
 * @param pkg {Object}
 * @param cwd {string}
 * @return {Function}
 */
module.exports = function (pkg, cwd) {
	/**
	 * Chain Factory.
	 * @param extname {string}
	 * @return {Object}
	 */
	return function (extname) {
		// The container for chain functions.
		var chain = Object.create(null);
		// Generate Globs parameters.
		extname = extname.split('|').map(function (value) {
			return util.format('%s/**/*.%s', pkg.source, value);
		});
		// Wrap the source stream.
		chain.__proto__ = source(extname, cwd);
		// Create chain functions.
		PLUGINS.forEach(function (name) {
			chain[name] = function () {
				var args = util.toArray(arguments);
				// pkg is always the 1st argument to the plugin factory.
				args.unshift(pkg);
				// Pipe the stream and change the wrapping target to the tail.
				this.__proto__ = this.__proto__.pipe(
					require(PLUGIN_DIR + name).apply(null, args));
				// Enable chaining.
				return this;
			};
		});
		// The chaining origin.
		return chain;
	};
};
