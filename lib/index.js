var Compiler = require('./compiler');

/**
 * Create a compiler.
 * @param [options] {Object}
 * @return {Object}
 */
exports.create = function (options) {
    var compiler = new Compiler(options || {});

    compiler
        .mount('.js', [
            'decode', 'dependency', 'modular', 'meta', 'encode'
        ])
        .mount('.json', [
            'decode', 'json', 'meta', 'encode'
        ])
        .mount('.tpl', [
            'decode', 'template', 'meta', 'encode'
        ]);

    return compiler;
};