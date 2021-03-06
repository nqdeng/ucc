var path = require('path'),
	url = require('url'),
	util = require('../../util');

var PATTERN_INLINE = /([^\.])require\s*\(\s*['"]([^'"]+?\.(?:json|tpl))['"]\s*\)/g,
	
	PATTERN_ID = /^\s*(['"])([^'"]+)\1\s*$/,

	PATTERN_SINGLE_ID = /([^\.])(require|seajs\.use|require\.async)\s*\(\s*(['"].*?['"])/g,

	PATTERN_MULTIPLE_ID = /([^\.])(seajs\.use|require\.async)\s*\(\s*\[(.*?)\]/g,

	PATTERN_PLACEHOLDER = /\{\w+\}/,

	DEFAULT_REPLACEMENT = {
		'.json': '{}',
		'.tpl': '""'
	},

	Preprocessor = util.inherit(Object, {
		/**
		 * Initializer.
		 * @param config {Object}
		 */
		_initialize: function (config) {
			this._alias = config.alias || {};
		},

		/**
		 * Replace inline module requirement.
		 * @param context {Object}
		 * @param callback {Function}
		 */
		_inline: function (context, callback) {
			var file = context.file,
				data = file.data,
				includes = [];

			PATTERN_INLINE.lastIndex = 0;

			while (re = PATTERN_INLINE.exec(data)) { // Assign.
				includes.push(re[2]);
			}

			if (includes.length > 0) {
				context.use(includes, function (files) {
					file.data = file.data
						.replace(PATTERN_INLINE, function (all, prefix, pathname) {
							var f = files.shift();

							if (f === null) {
								context.error('Cannot read dependency: "%s" -> "%s"',
									file.pathname, pathname);
								return prefix + DEFAULT_REPLACEMENT[path.extname(pathname)];
							} else {
								return prefix + f.data.toString('binary');
							}
						});
					callback();
				});
			} else {
				callback();
			}
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
					id = id.replace(PATTERN_ID, function (all, quote, id) {
						return '"' + self._resolveId(id, ref) + '"';
					});

					return util.format('%s%s(%s', prefix, method, id);
				})
				.replace(PATTERN_MULTIPLE_ID, function (all, prefix, method, ids) {
					ids = ids.split(',')
						.map(function (value) {
							return value.replace(PATTERN_ID, function (all, quote, id) {
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

			if (!PATTERN_PLACEHOLDER.test(id)) { // Append stamp placehoder.
				switch (path.extname(id)) {
				case '.js': // Fall through.
				case '.css':
					id += '?{stamp}';
					break;
				}
			}

			return id;
		},

		/**
		 * Preprocess CMD module.
		 * @param context {Object}
		 * @param callback {Function}
		 */
		process: function (context, callback) {
			this._normalizeId(context.file);
			this._inline(context, callback);
		}
	});

module.exports = Preprocessor;