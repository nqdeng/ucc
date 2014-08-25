'use strict';

var path = require('path'),
	util = require('ucc').util;

var PATTERN_REQUIRE = /(?:^|[^\.])\brequire\s*\(\s*(['"])([^'"]+?)\1\s*\)/g,
	PATTERN_SLASH = /\\/g,
	PATTERN_SPECIAL_CHAR = /["\\\r\n\t\f]/g,
	PATTERN_OFF = /(['"])modular\soff\1;?/g;

var	ESCAPE = {
	'"': '\\"',
	'\r': '\\r',
	'\n': '\\n',
	'\t': '\\t',
	'\f': '\\f'
};

var TEMPLATE = [
	'define("%s", [%s], function(require, exports, module) {',
	'%s',
	'});'
].join('\n');

var TRANSPORTER = {
	/**
	 * Transport JS source file.
	 * @parma file {Object}
	 * @param fid {fid}
	 */
	'.js': function (file, fid) {
		var data = file.data,
			requires = [],
			re, id;
			
		PATTERN_REQUIRE.lastIndex = 0;
		
		while (re = PATTERN_REQUIRE.exec(data)) {
			if ((id = re[2])[0] !== '@') { // Skip weak dependencies.
				requires.push(id);
			}
		}
		
		// Generate dependencies code fragment.
		requires = requires.map(function (id) {
			return '"' + id + '"';
		}).join(',');

		file.data = util.format(TEMPLATE, fid, requires, data);
	},
	
	/**
	 * Transport JSON source file.
	 * @parma file {Object}
	 * @param fid {fid}
	 */
	'.json': function (file, fid) {
		var data = file.data;
	
		try {
			data = JSON.stringify(JSON.parse(data));
		} catch (err) {
			throw new Error('JSON syntax error.');
		}
			
		file.data = util.format(TEMPLATE, fid, '',
	    	'return '
	    	+ data
	    	+ ';');
	},
	
	/**
	 * Transport TPL source file.
	 * @parma file {Object}
	 * @param fid {fid}
	 */
	'.tpl': function (file, fid) {
		file.data = util.format(TEMPLATE, fid, '',
	    	'return "'
			+ file.data.replace(PATTERN_SPECIAL_CHAR, function (char) {
				return ESCAPE[char];
			})
			+ '";');
	}
};

/**
 * Do some preparations before the actual transport.
 * @parma file {Object}
 * @parma prefix {string}
 */
function transport(file, prefix) {
	var extname = file.extname,
		fn = TRANSPORTER[extname];
		
	if (fn) {
		if (extname !== '.js') { // Always output a JS file.
			file.relative += '.js';
		}
		
		fn(file, path.join(prefix, file.relative)
			.replace(PATTERN_SLASH, '/'));
	}
}

/**
 * Plugin factory.
 * @param pkg {Object}
 * @return {Object}
 */
module.exports = function (pkg) {
	var prefix = [];
	
	// Generate ID prefix.
	pkg.name && prefix.push(pkg.name);
	pkg.version && prefix.push(pkg.version);
	prefix = prefix.join('/');

	/**
	 * Transport JS/JSON/TPL into a SeaJS module.
	 * This plugin assumes all IDs in source code have been normalized.
	 * @param file {Object}
	 * @param next {Function}
	 */
	return util.plugin('modular', function (file, next) {
		try {
			// Check the "modular off" statement.
			if (!PATTERN_OFF.test(file.data)) {
				transport(file, prefix);
			} else {
				file.data = file.data.replace(PATTERN_OFF, '');
			}

			next(file);
		} catch (err) {
			next(err);
		}
	});
};
