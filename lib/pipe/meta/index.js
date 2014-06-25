var path = require('path');

module.exports = function (config, context) {

    var include = config.include || 'all',
        prefix = path.join(config.name || '', config.version || '').replace(/\\/g,'/');
        dependencies = Object.keys(config.dependencies || {});

	/**
	 * Write meta to file
	 * @param file {Object}
	 */
	return function (file) {

        var hasDefine = false;

        file.meta.dependencies = file.meta.dependencies || [];

        if(include == 'relative'){

           if(file.meta.requires){
               file.meta.requires = file.meta.requires.filter(function(dep){

                   //private module
                   if(dep.indexOf(prefix) === 0){
                       return true;
                   }
                   else{
                        // check version
                        var name = config.name,
                            version = config.version,
                            pathname = dep.split('/');

                        if(dep.indexOf(name) >= 0) {
                            context.error('package.json defined version < ' + version
                                + ' > is inconsistent with access version < ' + pathname[1] + ' >');
                        }else if(dep.indexOf(version) >= 0){
                            context.error('package.json defined name < ' + name
                                + ' > is inconsistent with access name < ' + pathname[0] + ' >');
                        }else{
                            // dependency package
                            // check dependency had define
                            dependencies.forEach(function(depend){
                                if(dep.indexOf(depend) >= 0){
                                    hasDefine = true;
                                }
                            });
                            if(!hasDefine){
                                context.error(file.pathname + ' depends < ' + dep + ' > has not define!');
                            }
                        }

                        file.meta.dependencies.push(dep);
                   }
               });
           }

        }

		var m = JSON.stringify(file.meta),
			d = '/*!meta ',
			t = m.length.toString(16);

		d += '        '.substring(0, 8 - t.length) + t;
		d += m + '*/\n';

		file.data = d + file.data;
	};
};