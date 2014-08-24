'use strict';

var path = require('path'),
	util = require('ucc').util;

var PATTERN_REQUIRE = /(^|[^\.])\brequire\s*\(\s*(['"])([^'"]+?)\2\s*\)/g,
	PATTERN_IMPORT = /@import\s+(['"])([^'"]+?)\1;?/g;

/**
 * Unique an array.
 * @param arr {Array}
 * @return {Array}
 */
function unique(arr) {
	var out = [],
		len = arr.length,
		i = 0,
		value;
		
	for (; i < len; ++i) {
		value = arr[i];
		if (out.indexOf(value) === -1) {
			out.push(value);
		}
	}
	
	return out;
}

/**
 * Record dependencies data.
 * @param file {Object}
 */
function record(file) {
	var data = file.data,
		requires = [],
		meta, len;
	
	// Handle with depenencies declarations.
	data = data
		.replace(PATTERN_REQUIRE, function (all, prefix, quote, id) {
			requires.push(id);
			// Treat Weak dependency declaration as fake code.
			return id[0] === '@' ? prefix + 'null': all;
		})
		.replace(PATTERN_IMPORT, function (all, quote, id) {
			requires.push(id);
			// Remove @import statement to avoid many problems such as combo.
			return '';
		});
		
	if (requires.length === 0) { // No depenencies data.
		return;
	}
		
	/* META format.
	 * +-------+-----+-----+------+------+
	 * | MAGIC | VER | LEN | JSON | TAIL |
	 * +-------+-----+-----+------+------+
	 */
	
	// Generate meta header.
    meta = JSON.stringify({
    	requires: unique(requires)
    });
    
    len = meta.length.toString(16);
    
    meta = '/*!meta '                                // MAGIC: 8 bytes
    	+ '   0'                                     // VER  : 4 bytes
    	+ '    '.substring(0, 4 - len.length) + len  // LEN  : 4 bytes
    	+ meta                                       // JSON : n bytes
    	+ '*/';                                      // TAIL : 2 bytes
    
	// Attach to file.
	file.data = meta + '\n' + data;
}

/**
 * Plugin factory.
 * @param pkg {Object}
 * @return {Object}
 */
module.exports = function (pkg) {
	/**
	 * Record depenencies data by meta header.
	 * This plugin assumes all IDs in source code have been normalized.
	 * @param file {Object}
	 * @param next {Function}
	 */
	return util.plugin('dependencies', function (file, next) {
		try {
			record(file);
			next(file);
		} catch (err) {
			next(err);
		}
	});
};

