var util = require('util'),
	Compiler = require('../lib/compiler');

var createCompiler = function (reader, writer) {
		compiler = new Compiler({
			options: {
				'modular': {
					'alias': {},
					'whitelist': [ "" ]
				}
			},
			reader: reader,
			writer: writer
		});

		compiler
			.mount('.js', [ 'modular' ]);

		return compiler;
	},

	createSource = function (depth) {
		var cache = {},

			range = [],

			i, j, req, tmp, name;

		for (i = 1; i < depth; ++i) {
			tmp = '';
			for (j = 1; j <= i; ++j) {
				name = i + '-' + j + '.js';
				tmp += util.format('\trequire("./%s");\n', name);

				cache[name] = req || '';

				range.push(name);
			}
			req = 'define(function () {\n'
				+ tmp
				+ '});';
		}

		return {
			read: function (name, callback) {
				callback({
					pathname: name,
					data: cache[name]
				});
			},
			range: function () {
				return range
			}
		};
	},

	createTarget = function () {
		var cache = {};

		return {
			write: function (file, callback) {
				//console.log(file.meta);
				delete file.data;
				callback();
			}
		};
	},

	test = function (depth, callback) {
		var source = createSource(depth),

			target = createTarget(),

			compiler = createCompiler(source.read, target.write),

			t = new Date(),

			range = source.range();

		console.log('depth: %s, files: %s', depth, range.length);

		compiler.compile(range, function (files) {
			var time = new Date() - t;

			console.log('\tTotal time: %s', time);
			console.log('\tTime per file: %s', time / range.length);

			callback();
		});
	},

	main = function () {
		var i = 2;

		(function next() {
			if (i <= 30) {
				test(i++, function () {
					setImmediate(next);
				});
			}
		}());
	};

main();