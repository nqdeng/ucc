'use strict';

var path = require('path'),
	util = require('./util');

var PATTERN_SLASH = /\\/g;

/**
 * Remove UTF8 BOM.
 * @param data {Buffer}
 * @return {Buffer}
 */
function removeBOM(data) {
	// UTF8 BOM signature is [ EF BB BF ]
	if (data.length > 2
	&& !(data[0] ^ 0xEF) && !(data[1] ^ 0xBB) && !(data[2] ^ 0xBF)) {
		data = data.slice(3);
	}
	return data;
}

/**
 * File constructor.
 */
var File = util.inherit(Object, {
	/**
	 * Constructor.
	 * @param config {Object}
	 */
	constructor: function (config) {
		// Unchangeable properties.
		this._cwd = config.cwd;
		this._base = config.base;
		// Wash the initial data.
		this.data = removeBOM(config.data || new Buffer(0));
		// Initiate changeable properties based on the relative path.
		this.relative = config.path.replace(config.base, '');
	},
	
	/**
	 * CWD is unchangeable.
	 * @return {string}
	 */
	get cwd() {
		return this._cwd;
	},
	
	/**
	 * CWD is unchangeable.
	 * @return {string}
	 */
	get base() {
		return this._base;
	},
	
	/**
	 * Path is changeable based on the relative path.
	 * @return {string}
	 */
	get path() {
		return this._path;
	},
	
	/**
	 * Relative path is changeable.
	 * @return {string}
	 */
	get relative() {
		return this._relative;
	},
	
	/**
	 * Update relative properties based on the new value.
	 * @param value {string}
	 */
	set relative(value) {
		this._path = path.join(this._base, value);
		
		this._relative = this._path
			.replace(this._base, '')
			.replace(PATTERN_SLASH, '/');
			
		this._extname = path.extname(this._relative);
	},
	
	/**
	 * Extname is changeable based on the relative path.
	 * @return {string}
	 */
	get extname() {
		return this._extname;
	}
});

module.exports = File;