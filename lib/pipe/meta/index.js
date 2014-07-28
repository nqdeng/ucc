var path = require('path');

module.exports = function (config) {

    var include = config.include || 'relative',
        prefix = path.join(config.name || '', config.version || '').replace(/\\/g,'/'),
        dependencies = Object.keys(config.dependencies);

	/**
	 * Write meta to file
	 * @param file {Object}
	 */
	return function (file) {
        //file.meta.dependencies = file.meta.dependencies || [];
           if(file.meta.requires){
               file.meta.requires = file.meta.requires.filter(function(dep){
                   //private module
                   if(dep.indexOf(prefix) !== 0){
                        // dependency package
                       // check dependency had define
                       var hasDefine = dependencies.some(function (depend) {
                           return dep.indexOf(depend) >= 0;
                       });
                       if (!hasDefine) {
                           throw new Error(file.pathname + ' depends < ' + dep + ' > has not define!');
                       }

                       //file.meta.dependencies.push(dep);
                   }
                   return true;
               });
           }

		var m = JSON.stringify(file.meta),
			d = '/*!meta ',
			t = m.length.toString(16);

		d += '        '.substring(0, 8 - t.length) + t;
		d += m + '*/\n';

		file.data = d + file.data;
	};
};