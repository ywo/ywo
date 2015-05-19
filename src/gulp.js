var JS_BASEPATH = '';
var io = require('./io').io,
    _ = require('lodash'),
    path = require('path'),
    fs = require('fs');
const MAPS = {
    'ts'   : ['js',   '.js'],
    'scss' : ['sass', '.css'],
    'jpg'  : ['img',  '.jpg'],
    'png'  : ['img',  '.png'],
    'gif'  : ['img',  '.gif']
}
// 获取被构建的文件
var _built=function(){try{return require("./.built.json")}catch(e){return[]}}()
var _built_timer;
function _getBuildFiles(input) {
    if(!input) return _built;
    var ext = path.extname(input);
    var dest = input.replace(ext, MAPS[ext.slice(1)][1]);
    var map = dest + '.map';
    !~_built.indexOf(dest) && _built.push(dest);
    !~_built.indexOf(map) && _built.push(map);
    _built_timer = setTimeout(function() {
        clearTimeout(_built_timer);
        fs.writeFile(__dirname + '/.built.json', JSON.stringify(_built), 'utf-8'); //debugger
    }, 1000);
    return _built;
}
function getConfig(staticPath, searchFiles) {
    var config = {
        root : staticPath,
        ts: {
            src: '**/*.ts',
            // dest: path.join(staticPath, '/js/'),
            options: {
                browserify: {
                    // entries:path.join(staticPath, '/js/gift/main.ts'),
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
            src: '**/*.scss',
            config: {
                outputStyle:'expanded'/*nested, expanded, compact, compressed*/
            }
        }
    };

    var main = io.findMainSync(staticPath, searchFiles);
    _.merge(config, main);
    return config;
}

function registerTask(gulp, config) {
    var browserify = require('browserify'),
        tsify      = require('tsify'),
        notifier   = require('node-notifier'),
        source     = require('vinyl-source-stream'),
        buffer     = require('vinyl-buffer'),
        sourcemaps = require('gulp-sourcemaps'),
        notify     = require('gulp-notify'),
        sass       = require('gulp-sass'),
        del        = require('del');

    gulp.task('ts', function () {
        config.ts.main.forEach(function(input){
            var destPath = path.dirname(input);
            var tmp = input.split('/'), outName = tmp[tmp.length - 1].replace('.ts', '.js');
            _getBuildFiles(input);
            config.ts.options.browserify.entries = input;
            browserify(config.ts.options.browserify)
                .plugin(tsify, config.ts.options.tsify)
                .bundle()
                .on('error', function (err) {
                    notifier.notify({ message: err.message});
                    console.log(err.message);
                    err.end();
                    process.exit(1);
                })
                .pipe(source(outName))
                .pipe(buffer())
                .pipe(sourcemaps.init({loadMaps: true}))
                .pipe(sourcemaps.write('./', {
                    includeContent: false,
                    sourceRoot: path.relative(input, config.root)
                }))
                // .pipe(gulp.dest(config.ts.dest))
                .pipe(gulp.dest(destPath))
                .pipe(notify({ message: 'ts task complete' }));
        });

    });

    gulp.task('sass', function(){
        config.scss.main.forEach(function(input){
            _getBuildFiles(input);
            gulp.src(input)
                .pipe(sourcemaps.init())
                .pipe(sass(config.scss.config))
                .on('error', function(err){
                    notifier.notify({ message: err})
                    sass.logError();
                    // err.end();
                })
                .pipe(sourcemaps.write('./', {
                    includeContent: false,
                    sourceRoot: ''
                }))
                .pipe(gulp.dest(path.dirname(input)))
        });
    });

    gulp.task('clear', function(cb) {
        del(_getBuildFiles(), cb);
    });
}
exports.gulp = {
    getConfig : getConfig,
    registerTask : registerTask,
}