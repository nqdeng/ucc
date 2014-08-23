var Compiler = require('./compiler'),
    util = require('./util');



/**
 * Create a compiler.
 * @param [options] {Object}
 * @return {Object}
 */
module.exports = function (options) {


    options = options || {};

    var alias = options.alias || {},
        dependencies = options.dependencies || {},
        aliasNoDeps = {},
        errors = [],
        _alias = util.mix({},alias);

    // Check the definition of the alias did not define dependency
    if (!Object.keys(dependencies).length && Object.keys(alias).length) {
        throw new Error('dependencies can not be empty object!');
    }


    util.each(dependencies, function (value, key) {
        // if only define dependencies
        // faker alias use dependencies
        if (!_alias[key]) {
            _alias[key] = {
                name: key + '/' + value,
                package: key + '/' + value
            };
        }
        util.each(alias, function (aliasValue, aliasKey) {
            var reg = new RegExp('^' + key);

            if (reg.test(alias[aliasKey])) {
                _alias[aliasKey] = {
                    name: alias[aliasKey].replace(reg, key + '/' + dependencies[key]),
                    package: key + '/' + dependencies[key]
                };
                aliasNoDeps[aliasKey] = false;
            } else {
                if (aliasNoDeps[aliasKey] !== false) {
                    aliasNoDeps[aliasKey] = true;
                }
            }
        });
    })


    // Check the alias no corresponding dependency
    for (var key in aliasNoDeps) {
        if (!aliasNoDeps[key]) {
            delete aliasNoDeps[key];
        }
    }

    if (Object.keys(aliasNoDeps).length) {
        throw new Error('alias < ' + Object.keys(aliasNoDeps).join(',') + ' > no version control!');
    }

    options._alias = _alias;

    var compiler = new Compiler(options);

    compiler
        .mount('.js', [
            'decode', 'placeholder', 'dependency', 'nocomment', 'modular', 'meta', 'encode'
        ])
        .mount('.css', [
            'decode', 'placeholder', 'dependency', 'meta', 'encode'
        ])
        .mount('.json', [
            'decode', 'json', 'meta', 'encode'
        ])
        .mount('.tpl', [
            'decode', 'template', 'meta', 'encode'
        ]);

    return compiler;
};


