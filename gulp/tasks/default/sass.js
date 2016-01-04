// gulp/tasks/default/sass.js
'use strict';

// ----------------------------------
// available tasks: 
//    'gulp sass'          : main sass task
//    'gulp sass:compile'  : compile scss to css
//    'gulp sass:doc'      : release sass docs
// ----------------------------------
// plugins:
//     gulp-sass        : $.sass
//     browser-sync     : $.browserSync
//     gulp-changed     : $.changed
//     gulp-newer       : $.newer
//     gulp-flatten     : $.flatten
//     gulp-cached      : $.cached
//     gulp-sourcemaps  : $.sourcemaps
//     gulp-autoprefixer: $.autoprefixer
//     sassdoc          : $.sassdoc
//     lazypipe         : $.lazypipe
//     gulp-plumber     : $.plumber
//     gulp-filter      : $.filter
// ----------------------------------
// config:
//     config.task.sass : task name
// ----------------------------------

module.exports = function(gulp, $, path, config) {

    // split out commonly used stream chains [ changed - newer - cached ]
    var cacheFiles = $.lazypipe()
        // only pass through changed files
        .pipe($.changed, path.to.sass.dist.dev + '/**/*.css')
        // only pass through newer source files
        .pipe($.newer, path.to.sass.dist.dev + '/**/*.css')
        // start cache
        .pipe($.cached, 'sass');

    // compile sass task
    gulp.task(config.task.sass + ':compile', function() {

        // avoid writing sourcemaps of sourcemaps
        var filter = $.filter(['*.css', '!*.map'], {
            restore: true
        });

        return gulp.src(path.to.sass.src)
            // prevent breaking errors
            .pipe($.plumber({
                errorHandler: config.error
            }))
            // only pass through changed & newer & not cached files
            .pipe(cacheFiles())
            // initialize sourcemaps
            .pipe($.sourcemaps.init())
            // start compile
            .pipe($.sass(
                config.sass.options // options
            ))
            // writing sourcemaps
            .pipe($.sourcemaps.write('./_maps'))
            // filter css files
            .pipe(filter)
            // prefixing css
            .pipe($.autoprefixer())
            // restoring filtered files
            .pipe(filter.restore)
            // replace relative path for files
            // .pipe($.flatten())
            .pipe(gulp.dest(path.to.sass.dist.dev))
            .pipe($.browserSync.reload({
                stream: true
            }));

    });

    // release sass docs task
    gulp.task(config.task.sass + ':doc', function() {

        return gulp.src(path.to.sass.src)
            // only pass through changed & newer & not cached files
            .pipe(cacheFiles())
            // start sassdoc
            .pipe($.sassdoc(
                config.sass.sassdocOptions // options
            ))
            .resume();

    });

    // main sass task
    gulp.task(config.task.sass, function(cb) {

        $.runSequence(
            config.task.sass + ':compile',
            config.task.sass + ':doc',
            cb
        )

    });

};