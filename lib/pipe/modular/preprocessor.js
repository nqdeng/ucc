var path = require('path'),
	url = require('url'),
	util = require('../../util');

var PATTERN_ID = /^\s*['"]((?:[\w\-\.\{\}\$]+\/?)+)['"]\s*$/,

	PATTERN_SINGLE_ID = /([^\.])(require|seajs\.use|require\.async)\s*\(\s*(['"].*?['"])/g,

	PATTERN_MULTIPLE_ID = /([^\.])(seajs\.use|require\.async)\s*\(\s*\[(.*?)\]/g,

	Preprocessor = util.inherit(Object, {
		/**
		 * Initializer.
		 * @param config {Object}
		 */
		_initialize: function (config) {
			this._alias = config.alias || {};
		},

		/**
		 * Normalize module Id.
		 * @param file {Object}
		 */
		_normalizeId: function (file) {
			var ref = file.pathname,
				self = this;

			file.data = file.data
				.replace(PATTERN_SINGLE_ID, function (all, prefix, method, id) {
					id = id.replace(PATTERN_ID, function (all, id) {
						return '"' + self._resolveId(id, ref) + '"';
					});

					return util.format('%s%s(%s', prefix, method, id);
				})
				.replace(PATTERN_MULTIPLE_ID, function (all, prefix, method, ids) {
					ids = ids.split(',')
						.map(function (value) {
							return value.replace(PATTERN_ID, function (all, id) {
								return '"' + self._resolveId(id, ref) + '"';
							});
						})
						.join(',');

					return util.format('%s%s([ %s ]', prefix, method, ids);
				});
		},

		/**
		 * Resolve module Id.
		 * @param id {string}
		 * @param ref {string}
		 * @return {string}
		 */
		_resolveId: function (id, ref) {
			if (util.isArray(id)) {
				return id.map(function (id) {
					return this.resolve(id, ref);
				}, this);
			}

			// Resolve alias.
			var alias = this._alias,
				parts = id.split('/'),
				first = parts[0];

			if (alias[first]) {
				parts[0] = alias[first];
			}

			id = parts.join('/');

			if (id.charAt(0) === '.') { // Relative pathname.
				id = url.resolve(ref, id);
			}

			if (path.extname(id) === '') { // Append default extname.
				id += '.js';
			}

			return id;
		},

		/**
		 * Preprocess CMD module.
		 * @param context {Object}
		 * @param callback {Function}
		 */
		process: function (file) {
			this._normalizeId(file);
		}
	});

module.exports = Preprocessor;