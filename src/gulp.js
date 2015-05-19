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
        config.ts.main.forEach(function(out){
            out = out.split('/');
            out = out[out.length - 1].replace('.ts', '.js');
            browserify(config.ts.options.browserify)
                .plugin(tsify, config.ts.options.tsify)
                .bundle()
                .on('error', function (err) {
                    notifier.notify({ message: err.message});
                    console.log(err.message);
                    err.end();
                    process.exit(1);
                })
                .pipe(source(out))
                .pipe(buffer())
                .pipe(sourcemaps.init({loadMaps: true}))
                .pipe(sourcemaps.write('./', {includeContent: true, sourceRoot: '/src/scss/'}))
                .pipe(gulp.dest(config.ts.dest))
                .pipe(notify({ message: 'ts task complete' }));
        });
    });

    gulp.task('sass', function(){
        gulp.src(config.scss.main)
            .pipe(sourcemaps.init())
            .pipe(sass({outputStyle:'expanded'/*nested, expanded, compact, compressed*/}))
            .on('error', function(err){
                notifier.notify({ message: err})
                sass.logError();
                // err.end();
            })
            .pipe(sourcemaps.write('./', {sourceRoot: config.scss.dest}))
            .pipe(gulp.dest(config.scss.dest))
    });

    gulp.task('clear', function(cb) {
        del('./resource', cb);
    });
}
exports.gulp = {
    getConfig : getConfig,
    registerTask : registerTask,
}