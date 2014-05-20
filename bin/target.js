var fs = require('fs'),
	path = require('path'),
	util = require('../lib/util');

var	makeDirectory = function (root, pathname) {
		pathname = path.dirname(pathname);

		(function next(pathname) {
			if (!fs.existsSync(pathname)) {
				// At first, make parent directory.
				next(path.resolve(pathname, '..'));
				// Then, make current directory.
				fs.mkdirSync(pathname);
			}
		}(path.join(root, pathname)));
	},

	Target = util.inherit(Object, {
		_initialize: function (root) {
			this._root = root;
		},

		write: function (pathname, data) {
			var root = this._root;

			makeDirectory(root, pathname);
			fs.writeFileSync(path.join(root, pathname), data);
		}
	});

module.exports = Target;
