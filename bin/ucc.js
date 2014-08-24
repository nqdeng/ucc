#!/usr/bin/env node

'use strict';

var commander = require('commander'),
	fs = require('fs'),
	path = require('path'),
	ph = require('pretty-hrtime'),
	ucc = require('ucc'),
	util = ucc.util,
	version = require('../package.json').version;
	
var CONFIG_DIR = '../conf/',

	CONFIG = {},
	
	DEFAULT_PKG = {
		name: '',
		version: '',
		source: 'src',
		target: 'build',
		dependencies: {}
	};

// Global Mission status marker.
var failed = false;

// Exit code based on the marker.
process.on('exit', function (code) {
	if (code === 0 && failed) {
		process.exit(1);
	}
});

/**
 * Load pre-defined config.
 */
function loadConfig() {
	fs.readdirSync(path.join(__dirname, CONFIG_DIR)).forEach(function (name) {
		name = path.basename(name, '.js');
		CONFIG[name] = require(CONFIG_DIR + name);
	});
}

/**
 * Initiate the building environment.
 * @param cwd {string}
 * @param callback {Function}
 */
function env(cwd, callback) {
	(function next(cwd) {
		var pkg = path.join(cwd, 'package.json');
		
		fs.exists(pkg, function (exist) {
			if (exist) {
				fs.readFile(pkg, 'utf8', function (err, data) {
					if (err) {
						err = new Error(
							'Cannot read "' + pkg + '"');
					} else {
						try {
							pkg = JSON.parse(data);
							pkg = util.mix(DEFAULT_PKG, pkg);
						} catch (e) {
							err = new Error(
								'Syntax error in "' + pkg + '"');
						}
					}
					callback(err, pkg, cwd);
				});
			} else {
				var parent = path.join(cwd, '../');
				
				if (cwd === parent) {
					callback(new Error(
						'Please run ucc under a project directory'));
				} else {
					next(parent);
				}
			}
		});
	}(cwd || process.cwd()));
}

/**
 * Log to stdout with a pretty prefix.
 */
function info() {
	console.log('[i] %s', util.format.apply(null, arguments));
}

/**
 * Log to stderr with a pretty prefix.
 */
function warn() {
	failed = true; // There is a warning, there the mission failed.
	console.error('[!] %s', util.format.apply(null, arguments));
}

/**
 * Setup how to log.
 * @param ucc {Object}
 * @param pkg {Object}
 * @param cwd {string}
 * @return {Object}
 */
function log(ucc, pkg, cwd) {
	return ucc
	// Project level events.
		.on('start', function (e) {
			info('Project "%s@%s" start ..', pkg.name, pkg.version);
		})
		.on('stop', function (e) {
			info('.. done');
		})
		.on('err', function (e) {
			failed = true;
		})
	// Task level events.
		.on('task_start', function (e) {
			info('Task "%s" start ..', e.task);
		})
		.on('task_stop', function (e) {
			info('Task "%s" finished in %s', e.task, ph(e.hrDuration));
		})
		.on('task_err', function (e) {
			var message = (e.err.message || '')
				.split('\n').map(function (line) {
					return '    ' + line;
				}).join('\n');
		
			warn('Task "%s" failed in %s\n%s',
				e.task, ph(e.hrDuration), message);
		})
		.on('task_not_found', function (e) {
			warn('Task "%s" is not found', e.task);
		})
		.on('task_recursion', function (e) {
			warn('Hungry snake eats own tail: "%s"',
				e.recursiveTasks.join(' -> '));
		});
}

/**
 * Start mission with pre-defined configuration.
 * @param callback {Function}
 */
function run(conf, pkg, cwd) {
	var config = CONFIG[conf];

	if (config) {
		log(config(ucc({ pkg: pkg, cwd: cwd })), pkg, cwd).start('default');
	} else {
		warn('Config "%s" is undefined', conf);
	}
}

/**
 * App entrance.
 */
function main() {
	commander
		.option('-c, --conf [name]', 'use a pre-defined config', 'release')
		.option('-s, --slient', 'discard info-level output')
		.usage('[options] [dir]')
		.version(version)
		.parse(process.argv);

	if (commander.slient) {
		info = function () {};
	}

	env(commander.args[0], function (err, pkg, cwd) {
		if (err) {
			warn(err.message);
		} else {
			loadConfig();
			process.chdir(cwd);
			run(commander.conf, pkg, cwd);
		}
	});
}

main();