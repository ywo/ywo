var package = require("../package.json");
var variables = {
    '%ywo_name%' : package.name,
    '%ywo_version%': package.version,
    '%ywo_lastbuild%': new Date().toLocaleString(),
    '%ywoMain%' : '',
}

var globalVar = function  (str) {
    for(var i in variables) {
        str = str.replace(new RegExp(i, 'ig'), variables[i]);
    }
    return str;
}
globalVar.add = function(keyvalues){
    for (var key in keyvalues) {
        variables[key] = keyvalues[key];
    }
}

exports.globalVar = globalVar;