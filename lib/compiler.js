var path = require('path'),
    util = require('./util');

    // Compiler constructor.
var	Compiler = util.inherit(Object, {
    
        /**
         * Initializer.
         * @param options {Object}
         */
        _initialize: function (options) {
            this._mountTable = {};
            this._pipe = {};
            this._options = options || {};
        },

        /**
         * Compile a file.
         * @param pathname {string}
         * @param data {Buffer}
         * @return {file}
         */
        compile: function (pathname, data) {
            var mountTable = this._mountTable,
                extname = path.extname(pathname),
                pipeline = mountTable[extname]
                    || mountTable['*']
                    || [],
                file = {
                    data: data,
                    meta: {},
                    pathname: pathname
                },
                i = 0,
                len = pipeline.length;

            for (; i < len; ++i) {
                file = pipeline[i](file) || file;
            }

            if (file.meta.requires) {
                file.meta.requires = util.unique(file.meta.requires);
            }

            return file;
        },

        /**
         * Assemble a pipeline.
         * @param extname {string}
         * @param pipeline {Array | Function | String}
         * @return {Object}
         */
        mount: function (extname, pipeline) {
            var pipe = this._pipe,
                mountTable = this._mountTable,
                options = this._options;

            if(!util.isArray(pipeline)){
                pipeline = [ pipeline ];
            }

            pipeline = pipeline.map(function (name) {
                if(util.isFunction(name)){
                    return name;
                }else{
                    try {
                        return require('./pipe/' + name)(options[name] || {})
                    } catch (e){
                        return function () {
                            console.log('UCC: can\'t find <' + name + '> pipeline');
                        };
                    }
                }
            });

            extname.split('|').forEach(function (extname) {
                mountTable[extname] = pipeline;
            });

            return this;
        }
    });

module.exports = Compiler;

