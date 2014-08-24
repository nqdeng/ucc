'use strict';

var path = require('path'),
	url = require('url'),
	util = require('ucc').util;

// For all.
var PATTERN_SLASH = /\\/g,
	PATTERN_TAIL_SLASH = /\/+$/,
	PATTERN_PROTOCOL = /^(:?\w+\:)?\/\//,
	PATTERN_VAR = /\$\{(.+?)\}/g;
	
// For JS.
var PATTERN_REQUIRE = /((?:^|[^\.])\brequire\s*\(\s*['"])([^'"]+?)(['"]\s*\))/g,
	PATTERN_ASYNC_S = /((?:^|[^\.])\brequire\.async\s*\(\s*['"])([^'"]+?)(['"])/g,
	PATTERN_ASYNC_M = /((?:^|[^\.])\brequire\.async\s*\(\s*\[)(.*?)(\])/g,
	PATTERN_ID = /^\s*(['"])([^'"]+?)\1\s*$/;
	
// For CSS
var PATTERN_IMPORT = /@import\s+(['"])([^'"]+?)\1;?/g,
	PATTTEN_URL = /url\s*\(\s*(['"]?)([^'"]+?)\1\s*\)/g;

/**
 * Resolve an ID.
 * @param id {string}
 * @param relative {string}
 * @param name {string}
 * @param deps {string}
 * @param namePattern {RegExp}
 * @return {string}
 */
function resolve(id, relative, name, deps, namePattern) {
	if (PATTERN_PROTOCOL.test(id)) { // URL is not an ID.
		return id;
	}

	var extname = path.extname(relative),
		weak = '';
		
	// Trim slash at tail.
	id = id.replace(PATTERN_TAIL_SLASH, '');
		
	// Weak id.
	if (id[0] === '@') {
		weak = '@';
		id = id.substring(1);
	}

	// The shortcut to the package main module.
	if (deps.hasOwnProperty(id)) {
		id = path.join(id, 'index' + extname).replace(PATTERN_SLASH, '/');
	}
	
	// Related to current file.
	if (id[0] === '.') {
		id = url.resolve(relative, id);
		id = path.join(name, url.resolve('/', id))
			.replace(PATTERN_SLASH, '/');
	}

	// Related to current package root.
	if (id[0] === '/') {
		id = path.join(name, id)
			.replace(PATTERN_SLASH, '/');
	}
	
	// Validate the ID.
	if (!namePattern.test(id)) {
		throw new Error('"' + id + '" is an invalid ID');
	}
	
	// Insert version number.
	id = id.replace(namePattern, function (all, name, suffix) {
		if (!deps.hasOwnProperty(name)) { // Undeclared package.
			throw new Error('Package "' + name + '" is undeclared');
		}
		
		name = path.join(name, deps[name])
			.replace(PATTERN_SLASH, '/');
		
		return name + suffix;
	});

	// Assemble Id;
	return weak + id;
}

/**
 * Append a default extname.
 * @param id {string}
 * @param extname {string}
 * @return {string}
 */
function defaultExt(id, extname) {
	if (path.extname(id) !== extname) {
		id += extname;
	}
	return id;
}
	
var NORMALIZER = {
	/**
	 * Normalize IDs in JS.
	 * @param data {string}
	 * @param relative {string}
	 * @param name {string}
	 * @param deps {string}
	 * @param namePattern {RegExp}
	 * @return {string}
	 */
	'.js': function (data, r, n, d, p) {
		data = data
			// Handle require('id')
			.replace(PATTERN_REQUIRE, function (all, prefix, id, suffix) {
				id = resolve(id, r, n, d, p);
				id = defaultExt(id, '.js');
				return prefix + id + suffix;
			})
			// Handle require.async('id', cb)
			.replace(PATTERN_ASYNC_S, function (all, prefix, id, suffix) {
				id = resolve(id, r, n, d, p);
				id = defaultExt(id, '.js');
				return prefix + id + suffix;
			})
			// Handle require.async([ 'id', 'id' ], cb)
			.replace(PATTERN_ASYNC_M, function (all, prefix, id, suffix) {
				id = id.split(',').map(function (value) {
					return value.replace(PATTERN_ID, function (all, quote, id) {
						id = resolve(id, r, n, d, p);
						id = defaultExt(id, '.js');
						return quote + id + quote;
					});
				});
				
				return prefix + id + suffix;
			});
			
		return NORMALIZER.all(data, r, n, d, p);
	},
	/**
	 * Normalize IDs in CSS.
	 * @param data {string}
	 * @param relative {string}
	 * @param name {string}
	 * @param deps {string}
	 * @param namePattern {RegExp}
	 * @return {string}
	 */
	'.css': function (data, r, n, d, p) {
		data = data
			// Handle url(id)
			.replace(PATTTEN_URL, function (all, quote, id) {
				quote = quote || '';
				id = resolve(id, r, n, d, p);
				return 'url(' + quote + id + quote + ')';
			})
			// Handle @import "id"
			.replace(PATTERN_IMPORT, function (all, quote, id) {
				id = resolve(id, r, n, d, p);
				id = defaultExt(id, '.css');
				return '@import ' + quote + id + quote;
			});
		
		return NORMALIZER.all(data, r, n, d, p);
	},
	/**
	 * Normalize IDs in all type of files.
	 * @param data {string}
	 * @param relative {string}
	 * @param name {string}
	 * @param deps {string}
	 * @param namePattern {RegExp}
	 * @return {string}
	 */
	'all': function (data, r, n, d, p) {
		return data.replace(PATTERN_VAR, function (all, id) {
			id = unescape(id);
			id = resolve(id, r, n, d, p);
			return id;
		});
	}
};

/**
 * Plugin factory.
 * @param pkg {Object}
 * @return {Object}
 */
module.exports = function (pkg) {
	var name = pkg.name,
		version = pkg.version,
		deps = pkg.dependencies,
		namePattern;
		
	deps[name] = version;
	namePattern = new RegExp(
		'^(' + name.split('/').map(function () {
			return '[\\w\\-]+';
		}).join('/') + ')(/)'
	);

	/**
	 * Normaize IDs in source code.
	 * @param file {Object}
	 * @param next {Function}
	 */
	return util.plugin('id', function (file, next) {
		try {
			var data = file.data,
				relative = file.relative,
				fn = NORMALIZER[file.extname] || NORMALIZER.all;
				
			file.data = fn(data, relative, name, deps, namePattern);
			next(file);
		} catch (err) {
			next(err);
		}
	});
};