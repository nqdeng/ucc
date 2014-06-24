var path = require('path'),
    url = require('url'),
    util = require('../../util'),
    PATTERN_PLACEHOLDER = /\$\{\s*([\s\w-]*?)\s*\}/g,
    PATTERN_IMAGE_DEPS = /url\s*\(\s*(["']?)([^\/][^"'\)]*?\.(?:png|jpg|gif|jpeg))(?:\?[^"']+?)?\1\s*\)/g,
    PATTERN_ID = /^\s*['"]((?:[\w\-\.\{\}\$]+\/?)+)['"]\s*$/,
    PATTERN_SINGLE_ID = /([^\.])(require|seajs\.use|require\.async)\s*\(\s*(['"].*?['"])/g,
    PATTERN_MULTIPLE_ID = /([^\.])(seajs\.use|require\.async)\s*\(\s*\[(.*?)\]/g,
    PATTERN_REQUIRE = /^\s*\/[\/\*]\s*#require\s+(["<])([\w\/\.-]+)[">](?:\s*\*\/)?\s*$/gm,
    PATTERN_SLASH = /\\/g,
    PATTERN_DEFINE = /^\s*define\s*\(\s*(?:function|\{)/m;


var resolveId = function (id, ref, alias) {
    if (util.isArray(id)) {
        return id.map(function (id) {
            return resolveId(id, ref, alias);
        }, this);
    }

    // Resolve alias.
    var parts = id.split('/'),
        first = parts[0];

    if (alias[first]) {
        parts[0] = alias[first].name;
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
normalize = function (base, pathname) {
    return path
        .join(base, pathname)
        .replace(PATTERN_SLASH, '/'); // Correct slash under windows.
};

module.exports = function(config){
    var alias = config.alias || {}

    return function(file){

        file.data = file.data
            //replace ${key} syntax
            .replace(PATTERN_PLACEHOLDER, function(all, key){
                return all.replace(PATTERN_PLACEHOLDER,alias[key] || '');
            })
            //replace background:url(xxx)
            .replace(PATTERN_IMAGE_DEPS, function(all, quote, pathname){
                return all.replace(pathname, resolveId(pathname, file.pathname, alias));
            })

            //replace /* #require "xxx" */
            .replace(PATTERN_REQUIRE, function(all, quote, pathname){
                return all.replace(pathname, normalize(quote === '"' ?
                    path.dirname(file.pathname) : '.', pathname));
            });

        if(PATTERN_DEFINE.test(file.data)){
            //replace require(xxx)
        file.data = file.data
            .replace(PATTERN_SINGLE_ID, function (all, prefix, method, id) {
                id = id.replace(PATTERN_ID, function (all, id) {
                    return '"' + resolveId(id, file.pathname, alias) + '"';
                });

                return util.format('%s%s(%s', prefix, method, id);
            })
            //replace seajs.use([])
            .replace(PATTERN_MULTIPLE_ID, function (all, prefix, method, ids) {
                    ids = ids.split(',')
                        .map(function (value) {
                            return value.replace(PATTERN_ID, function (all, id) {
                                return '"' + resolveId(id, file.pathname, alias) + '"';
                            });
                        })
                        .join(',');

                    return util.format('%s%s([ %s ]', prefix, method, ids);
             });
        }
    }
};