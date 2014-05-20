var fs = require('fs'),
	path = require('path'),
	util = require('../lib/util');

var Source = util.inherit(Object, {
		_initialize: function (root) {
			this._root = root;
		},

		travel: function (callback, pathname) {
			pathname = pathname || '';

			var root = this._root,
				node = path.join(root, pathname),
				stats = fs.statSync(node),
				self = this;

			if (stats.isFile()) {
				callback(pathname, fs.readFileSync(node));
			} else if (stats.isDirectory()) {
				fs.readdirSync(node).forEach(function (filename) {
					self.travel(callback, path.join(pathname, filename));
				});
			}
		}
	});

module.exports = Source;
