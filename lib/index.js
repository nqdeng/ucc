var Compiler = require('./compiler');

/**
 * Create a compiler.
 * @param [options] {Object}
 * @return {Object}
 */
module.exports = function (options) {

    var compiler = new Compiler(options || {});

    var alias = options.alias || {},
        dependencies = options.dependencies || {},
        aliasNoDeps = {};

    if(!Object.keys(dependencies).length && Object.keys(alias).length){
        throw new Error('dependencies can not be empty object!');
    }

    for(var key in dependencies){
        for(var aliasKey in alias){
            var reg = new RegExp('^' + key);
            if(reg.test(alias[aliasKey])){
                alias[aliasKey] = {
                    name: alias[aliasKey].replace(reg, key + '/' + dependencies[key]),
                    package: key
                };
                aliasNoDeps[aliasKey] = false;
            }else{
                if(aliasNoDeps[aliasKey] !== false){
                    aliasNoDeps[aliasKey] = true;
                }
            }
        }
    }

    for(var key in aliasNoDeps){
        if(!aliasNoDeps[key]){
            delete aliasNoDeps[key];
        }
    }

    if(Object.keys(aliasNoDeps).length){
        throw new Error('alias < '+ Object.keys(aliasNoDeps).join(',') + ' > no version control!');
    }

    compiler
        .mount('.js', [
            'decode', 'placeholder', 'dependency', 'modular', 'meta', 'encode'
        ])
        .mount('.css',[
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


