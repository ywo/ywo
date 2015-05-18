var fs = require('fs');
var PATH = require('path');
var child_process = require('child_process');
var _filesCount = 0;
var io = {
    /*
    递归处理文件,文件夹
    path 路径
    ruler 规则 [.js, .css, .html...]
    _floor 层数
    _filesCount :文件数（不包括文件夹）
    handleFile 文件,文件夹处理函数

    */
    walk : function walk (path, handleFile, _floor) {
        _floor = _floor || 0;
        _filesCount = _filesCount || 0;
        handleFile(path, _floor, _filesCount);
        _floor++;
        path = PATH.normalize(path);
        fs.readdir(path, function(err, files) {
            if (err) {
                console.log('read dir error');
            } else {
                files.forEach(function(item) {
                    var tmpPath = PATH.join(path, item);

                    fs.stat(tmpPath, function(err1, stats) {
                        if (err1) {
                            console.log('stat error');
                        } else {
                            if (stats.isDirectory()) {
                                walk(tmpPath, handleFile, _floor);
                            } else {
                                _filesCount++;
                                handleFile(tmpPath, _floor, _filesCount);
                            }
                        }
                    })
                });

            }
        });
    },
    walkSync : function walk (path, handleFile, _floor) {
        _floor = _floor || 0;
        _filesCount = _filesCount || 0;
        handleFile(path, _floor, _filesCount);
        _floor++;
        path = PATH.normalize(path);
        try{
            var files = fs.readdirSync(path);
            files.forEach(function(item) {
                var tmpPath = PATH.join(path, item);
                try{
                    var stats = fs.statSync(tmpPath);
                    if (stats.isDirectory()) {
                        walk(tmpPath, handleFile, _floor);
                    } else {
                        _filesCount++;
                        handleFile(tmpPath, _floor, _filesCount);
                    }
                } catch(err1) {
                    console.log('stat error');
                }
            });
        } catch(err) {
            console.log('read dir error');
        }
    },
    mkdirSync: function(path) {
        var i, currentPath = '', dirNames = path.split(/[\/\\]/);
        for (i = 0; i < dirNames.length; i++) {
            currentPath += (i===0 ? '' : '/') + dirNames[i];
            if (fs.existsSync(currentPath)) {
                continue;
            }
            fs.mkdirSync(currentPath);
        }
    },
    // 文件中如果第一行含有 '%ywoMain%'关键字，认为是入口文件;
    isMain: function(path) {
        var code = fs.readFileSync(path, 'utf-8');
        return !!~code.indexOf('%ywoMain%');
    },

    // 遍历找出所有入口文件，返回以扩展名为key的对象
    findMainSync: function(rootPath, extnames) {
        var _this = this;
        var ret = {};
        // var total = child_process.execSync('find src -type f | wc -l', {encoding: 'utf8'});
        _this.walkSync(rootPath, function(path, _floor, _filesCount){
            extnames.forEach(function(extname){
                var key = extname.slice(1);
                if(extname === PATH.extname(path) && _this.isMain(path)){
                    if(!ret[key]) {
                        ret[key] = {main:[]}
                    }
                    ret[key].main.push(path);
                }
            });
        });
        return ret;
    }

}
exports.io = io;