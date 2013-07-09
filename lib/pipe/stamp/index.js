var PATTERN_STAMP = /(['"])((?:\w+\:)?(?:\/\/[^\/'"]*)?\/?)([^'"]+?\.(?:js|css))\?\{stamp\}\1/g;

module.exports = function (config) {
	/**
	 * Stamp JS or CSS pathnames.
	 * @param context {Object}
	 * @param next {Function}
	 */
	return function (context, next) {
		var file = context.file,
			data = file.data,
			pathnames = [];

		PATTERN_STAMP.lastIndex = 0;

		while (re = PATTERN_STAMP.exec(data)) { // Assign.
			pathnames.push(re[3]);
		}

		context.use(pathnames, function (files) {
			file.data = data
				.replace(PATTERN_STAMP, function (all, quote, prefix, pathname) {
						var f = files.shift();

						if (f === null) {
							context.error('Cannot read stamped file: "%s" -> "%s"',
								file.pathname, pathname);
							return quote + prefix + pathname + quote;
						} else {
							return quote
								+ prefix
								+ pathname
								+ '?t='
								+ f.meta.dataHash.toString(16)
								+ '_'
								+ f.meta.depsHash.toString(16)
								+ quote;
						}
					});

			next();
		});
	};
};

