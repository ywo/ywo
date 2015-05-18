var JS_BASEPATH = '';
var io = require('./io').io,
    _ = require('lodash'),
    path = require('path');

function getConfig(staticPath, searchFiles) {
    var config = {
        ts: {
            src: path.join(staticPath, '/js/**/*.ts'),
            dest: path.join(staticPath, '/js/'),
            options: {
                browserify: {
                    entries:[path.join(staticPath, '/js/gift/main.ts')],
                    extensions: ['.ts'],
                    debug: true
                },
                tsify: {
                    target: 'ES5',
                    removeComments: true,
                    module: true,
                    debug: true
                }
            }
        },
        scss : {
            src: path.join(staticPath, '/css/**/*.scss'),
            dest: path.join(staticPath, '/css/'),
        }
    };

    var main = io.findMainSync(staticPath, searchFiles);
    _.merge(config, main);
    // fs.writeFile('./.debuglog.json', JSON.stringify(config, null, 4), 'utf-8');
    return config;
}

exports.gulp = {
    getConfig : getConfig,
}