module.exports = function (config) {

    var include = config.include || 'relative',
        prefix = config.name || '' + '/' + config.version || '';
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
                   }else{
                        // dependency package
                        // check dependency had define
                        dependencies.forEach(function(depend){
                            if(dep.indexOf(depend) >= 0){
                                hasDefine = true;
                            }
                        });
                        if(!hasDefine){
                            throw new Error(file.pathname + ' depends < ' + dep + ' > has not define!');
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