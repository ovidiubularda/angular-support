'use strict';
//noinspection JSUnresolvedFunction
var gulp = require('gulp-help')(require('gulp'));
var gutil = require('gulp-util');
var bower = require('gulp-bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var jscs = require('gulp-jscs');
var stylish = require('gulp-jscs-stylish');
var notify = require('gulp-notify');
var jshint = require('gulp-jshint');
var inject = require('gulp-inject');
var wiredep = require('wiredep').stream;
var shell = require('gulp-shell');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync').create();
var karma = require('gulp-karma');
var plato = require('gulp-plato');
var gulpDocs = require('gulp-ngdocs');
var angularFilesort = require('gulp-angular-filesort');
var ngAnnotate = require('gulp-ng-annotate');
var minifyJS = require('gulp-minify');
var mainBowerFiles = require('main-bower-files');
var templateCache = require('gulp-angular-templatecache');
var replaceTag = require('gulp-html-replace');
var replace = require('gulp-replace');
var noop = function () {};
var config = {
    sass: ['scss/**/*.scss', 'js/**/*.scss'],
    js: ['js/**/*.js'],
    watch: ['scss/**/*.scss', 'js/**/*.scss', 'js/**/*.js', './bower_components/**'],
    bower: 'bower_components',
    html: ['./index.html'],
    copyFonts: ['./bower_components/components-font-awesome/fonts/**'],
    copyToDist: ['./css/**/*.min.css', './img/**', './fonts/**'],
    distFolder: './public',
    wiredep: {
        exclude: ['bootstrap-sass', 'jquery']
    },
    htmlTemplates: ['**/*.html', '!index.html'],
    cleanPaths: '.sass/* bower_components/* ./css/* ./coverage/* ./report/* ./public/* ./docs/*'
};
config.distCSSFolder = config.distFolder + '/css';
config.distJSFolder = config.distFolder + '/js';

gulp.task('default', false,
    function () {
        return gulp.src('./', {read: false})
            .pipe(shell([
                'gulp help'
            ]));
    });

gulp.task('build-dist', 'Build distributable web application', function () {
    runSequence('build-clean-dist', ['sass', 'index'],
        ['build-assets-fonts', 'build-assets-html', 'build-assets', 'templates'],
        ['build-bower-css', 'build-bower-js'],
        'build-minify-js', 'build-inject');
});
gulp.task('build-clean-dist', false, function () {
    return gulp.src('./', {read: false})
        .pipe(shell([
            'rm -rf ' + config.distFolder + '/*'
        ]));
});

gulp.task('build-assets-html', false, function () {
    return gulp.src(config.html, {base: '.'})
        .pipe(replaceTag('dev', ''))
        .pipe(gulp.dest(config.distFolder));
});
gulp.task('build-assets-fonts', false, function () {
    return gulp.src(config.copyFonts)
        .pipe(gulp.dest(config.distFolder + '/fonts'));
});

gulp.task('build-assets', false, function () {
    return gulp.src(config.copyToDist, {base: '.'})
        //.pipe(replaceTag('dev', ''))
        .pipe(gulp.dest(config.distFolder));
});

gulp.task('build-bower-css', false, function () {
    return gulp.src(mainBowerFiles({
            filter: function (path) {
                var exclude = /(bootstrap-sass|jquery)/;
                var css = /\.css$/;
                return !exclude.test(path) && css.test(path);
            }
        }))
        .pipe(minifyCss({
            keepSpecialComments: 0
        }))
        .pipe(gulp.dest(config.distCSSFolder));
});

gulp.task('build-bower-js', false, function () {
    return gulp.src(mainBowerFiles({
            filter: function (path) {
                var exclude = /(bootstrap-sass|jquery)/;
                var isJs = /\.js$/;
                return !exclude.test(path) && isJs.test(path);
            }
        }))
        .pipe(concat('_dist-lib.js'))
        .pipe(minifyJS())
        .pipe(gulp.dest(config.distJSFolder));
});

gulp.task('build-inject', false, function () {
    return gulp.src('./public/index.html')
        .pipe(inject(gulp.src([config.distCSSFolder + '/**/*.css'],
            {read: false}), {relative: true}))
        .pipe(inject(gulp.src([config.distJSFolder + '/**/*-min.js'],
            {read: false}), {relative: true}))
        .pipe(gulp.dest(config.distFolder));
});

gulp.task('build-minify-js', false, function () {
    return gulp.src('./js/**/*.js')
        //.pipe(wiredep(config.wiredep))
        .pipe(ngAnnotate())
        .pipe(concat('dist.js'))
        .pipe(minifyJS())
        .pipe(gulp.dest(config.distJSFolder));
});

gulp.task('ngdocs', 'Generate ng-docs from our src', function () {
    var options = {
        html5Mode: false,
        title: 'Q Docs'
    };
    return gulp.src('js/**/*.js')
        .pipe(gulpDocs.process(options))
        .pipe(gulp.dest('./docs'));
});

// Static Server + watching scss/html files
gulp.task('serve', 'Run the application via browser sync in development mode', ['sass', 'index', 'templates'],
    function () {
        gulp.watch(config.sass, ['sass']);
        gulp.watch(config.js, ['index', 'jscs']).on('change', browserSync.reload);
        gulp.watch(config.htmlTemplates, ['templates']).on('change', browserSync.reload);
        browserSync.init({
            server: './',
            files: './css/**/*.css'
        });

        notify({
            title: 'Browser Sync Started'
        });
    });

gulp.task('clean', 'Delete all generated directories and assets', function () {
    return gulp.src('./', {read: false})
        .pipe(shell([
            'rm -rf ' + config.cleanPaths
        ]));
});

gulp.task('test', 'Run the tests from inside gulp', function () {
    // Be sure to return the stream
    // NOTE: Using the fake './foobar' so as to run the files
    // listed in karma.conf.js INSTEAD of what was passed to
    // gulp.src !
    return gulp.src('./foobar')
        .pipe(karma({
            configFile: 'karma.conf.js',
            action: 'run'
        }))
        .on('error', function (err) {
            // Make sure failed tests cause gulp to exit non-zero
            console.log(err);
            this.emit('end'); //instead of erroring the stream, end it
        });
});

gulp.task('bower', false, function () {
    return bower()
        .pipe(gulp.dest(config.bower));
});

gulp.task('install', 'Install all dependencies', function () {
    runSequence('bower', 'templates', 'sass', 'index');
});

gulp.task('install.clean', 'Clean working directory and install all dependencies', function () {
    runSequence('clean', 'bower', 'templates', 'sass', 'index');
});

gulp.task('templates', false, function () {
    return gulp.src('./js/**/*.html')
        .pipe(templateCache({
            standalone: true,
            transformUrl: function (url) {
                return 'js/' + url;
            }
        }))
        .pipe(gulp.dest('./js'));
});

gulp.task('sass', false, function (done) {
    gulp.src(config.sass)
        .on('error', notify.onError(function (error) {
            return 'SASS Compile Error: ' + error.message;
        }))
        .pipe(sass())
        .pipe(gulp.dest('./css/'))
        .pipe(minifyCss({
            keepSpecialComments: 0
        }))
        .pipe(rename({extname: '.min.css'}))
        .pipe(gulp.dest('./css/'))
        .on('error', noop)
        .on('end', done);
});

gulp.task('index', 'Inject assets (js/css) into our project index.html', function () {
    return gulp.src('./index.html')
        .pipe(wiredep({
            exclude: ['bootstrap-sass', 'jquery']
        }))
        .pipe(inject(gulp.src(['./css/**/*.min.css'], {read: false}), {relative: true}))
        .pipe(inject(gulp.src(['./js/**/*.js']).pipe(angularFilesort()), {relative: true}))
        .pipe(gulp.dest('.'));
});

gulp.task('jscs', 'Check js for code styling violations', function () {
    return gulp.src(['./js/**/*.js', '!./js/templates.js'])
        .pipe(jshint())
        .pipe(jscs({
            configPath: './.jscsrc',
            fix: false
        }))
        .pipe(stylish.combineWithHintResults())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(notify(function (file) {
            if (file.jshint.success) {
                // Don't show something if success
                return false;
            }

            var errors = file.jshint.results.map(function (data) {
                if (data.error) {
                    return '(' + data.error.line + ':' + data.error.character + ') ' +
                        data.error.reason;
                }
            }).join('\n');
            return file.relative + ' (' + file.jshint.results.length + ' errors)\n' + errors;
        }))
        .on('error', noop); // don't stop on error
});

gulp.task('git-check', false, function (done) {
    if (!sh.which('git')) {
        console.log(
            '  ' + gutil.colors.red('Git is not installed.'),
            '\n  Git, the version control system, is required',
            '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
            '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
        );
        process.exit(1);
    }
    done();
});

gulp.task('plato', 'Generate maintainability report', function () {
    return gulp.src('./js/**/*.js')
        .pipe(plato('report', {
            jshint: {
                options: {
                    strict: true
                }
            },
            complexity: {
                trycatch: true
            }
        }));
});

gulp.task('fix-quotes', false, function () {
    var pattern = /(\\')/g;
    return gulp.src('js/**/*.html')
        .pipe(replace(pattern, '’'))
        .pipe(gulp.dest('js/'));
});
gulp.task('extract', false, function () {
    var pattern = /{{::'([^'}}]*)'([^\n]*}})/g;
    return gulp.src('js/**/*.html')
        .pipe(replace(pattern, function (match) {
                var lbl = match.replace(pattern, '$1');
                console.log(lbl);
                return match;
            }
        ));
});
gulp.task('replace', false, function () {
    var pattern = /{{::'([^']*)'([^\n]*}})/g;
    return gulp.src('js/**/*.html')
        .pipe(replace(pattern, '{{\'$1\' | translate $2 '))
        .pipe(gulp.dest('js/'));
});
