var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var sh = require('shelljs');
var gulpDocs = require('gulp-ngdocs');



var paths = {
    sass: ['./scss/**/*.scss', './www/directives/**/*.scss'],
    js: ['./scripts/*.js']
};



// Default task
gulp.task('default', ['sass', 'js', 'watch']);

// Sass task
gulp.task('sass', function(done) {
    gulp.src(paths.sass, { 'base': './scss/' })
    .pipe(concat('appStyles.scss'))
    .pipe(sass({ errLogToConsole: true }))
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({ keepSpecialComments: 0 }).on('error', function() { console.log('css parsing error'); this.emit( 'end' ); }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

// Js task
gulp.task('js', function(done) {
    gulp.src(paths.js)
    .pipe(concat('appScripts.js'))
    .pipe(gulp.dest('./www/js/'))
    .pipe(uglify({ mangle: false }).on('error', function() { console.log('js parsing error'); this.emit( 'end' ); }))
    .pipe(rename({ extname: '.min.js' }))
    .pipe(gulp.dest('./www/js/'))
    .on('end', done);
});

// Watch task
gulp.task('watch', function() {
    gulp.watch(paths.sass, ['sass']);
    gulp.watch(paths.js, ['js']);
});

// NgDocs task
gulp.task('ngdocs', [], function () {
    var options = {
        html5Mode: true,
        startPage: '/api',
        title: 'CivilConnectApp',
        image: 'www/img/docsLogo.png',
        imageLink: '',
        titleLink: ''
    };
    return gulp.src(paths.js)
    .pipe(gulpDocs.process(options))
    .pipe(gulp.dest('./docs'));
});

// Other tasks
gulp.task('install', ['git-check'], function() {
    return bower.commands.install()
    .on('log', function(data) {
        gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
    if (!sh.which('git')) {
        console.log(
            '  ' + gutil.colors.red('Git is not installed.'),
            '\n  Git, the version control system, is required to download Ionic.',
            '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
            '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
        );
        process.exit(1);
    }
    done();
});