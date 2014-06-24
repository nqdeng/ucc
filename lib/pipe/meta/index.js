module.exports = function (config) {

    var include = config.include || 'relative',
        prefix = config.name || '' + '/' + config.version || '';
        dependencies = Object.keys(config.dependencies || {});
	/**
	 * Write meta to file
	 * @param file {Object}
	 */
	return function (file) {

        if(include == 'relative'){

           if(file.meta.requires){
               file.meta.requires = file.meta.requires.filter(function(dep){
                   //private module
                   if(dep.indexOf(prefix) === 0){
                       return true;
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