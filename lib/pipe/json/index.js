module.exports = function (config) {
	/**
	 * Validate and wrap JSON data as cmd module.
     * @param file {Object}
	 */
	return function (file) {
        var data = file.data;

        try {
            data = JSON.parse(data);
        } catch (e){
            data = {};
        }
        file.meta.mime = 'application/javascript';
		file.data = 'define("' + file.pathname + '", [], '
			+ JSON.stringify(data)
			+ ');'
	};
};