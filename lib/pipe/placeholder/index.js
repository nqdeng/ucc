var PATTERN_PLACEHOLDER = /$\{\s*([\s\w-]*?)\s*\}/g;

//replace ${key} syntax
module.exports = function(config){
    var alias = config.alias;

    return function(file){
        file.data = file.data.replace(PATTERN_PLACEHOLDER,function(all,key){
            return all.replace(PATTERN_PLACEHOLDER,alias[key] || {});
        });
    }
};