/** Gulp template for static one page websites */
var projectname = "Dee Music Dee";
var main_dir = "/home/aleksandar/www/" + projectname + "/";

/** CONFIG */

var src_dir = main_dir + "src/";
var build_dir = main_dir + "build/";


/** END CONFIG */

var gulp = require('gulp');
var sass = require('gulp-sass');
var bs = require('browser-sync').create();
var inject = require('gulp-inject');
var bowerFiles = require('main-bower-files');
var es = require('event-stream');
var wiredep = require('wiredep').stream;
var concatCss = require('gulp-concat-css');
var cleanCSS = require('gulp-clean-css');
var rename = require("gulp-rename");
var runSequence = require('run-sequence');
var concatjs = require('gulp-concat');
var uglifyjs = require('gulp-uglifyjs');
var del = require('del');


/** SCSS */

gulp.task('sass', function(){
  return gulp.src('src/scss/main.scss')
  .pipe(sass().on('error', sass.logError))
  .pipe(gulp.dest('src/css/'));

});

gulp.task('concatcss',function(){
  return gulp.src(['src/css/reset.css','src/css/main.css'])
  .pipe(concatCss('bundle.css'))
  .pipe(gulp.dest('src/css'));

});

gulp.task('minifycss',function(){
   return gulp.src('src/css/bundle.css')
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(rename('main.min.css'))
    .pipe(gulp.dest('build/css'))
    .pipe(bs.reload({
      "stream":true
    }))
});

gulp.task('css', function(callback){
  runSequence(
    'sass',
    'concatcss',
    'minifycss',
    callback);
});

/** Javascript */

gulp.task('deletejs', function(){
  return del('src/js/bundle.min.js');
});



gulp.task('concatminjs', function() {
  return gulp.src('src/js/*.js')
    .pipe(concatjs({path :'bundle.min.js'}))
    .pipe(uglifyjs())
    .pipe(gulp.dest('src/js'));
});

gulp.task('copyjs', function(){
  return gulp.src('src/js/bundle.min.js')
  .pipe(gulp.dest('build/js'))
  .pipe(bs.reload({
    "stream":true
  }));
});

gulp.task('js', function(callback){
  runSequence(
    'deletejs',
    'concatminjs',
    'copyjs',
    'browserreload',
    callback);
});

/** HTML inject */

gulp.task('bowerdep', function() {
    return gulp.src('src/index.html')
        .pipe(wiredep({}))
        .pipe(gulp.dest('build'));
});

gulp.task('projectdepcss', function () {
  return gulp.src('build/index.html')
  .pipe(inject(
    gulp.src('build/css/*.min.css', {read: false}), {
    transform: function (filepath) {
        filepath = filepath.replace("/build","");
        return '<link rel="stylesheet" href="' + filepath  + '"/>';
    }
  }
))
.pipe(gulp.dest('build'))
.pipe(bs.reload({
  "stream":true
}));;
});

gulp.task('projectdepjs', function () {
  return gulp.src('build/index.html')
  .pipe(inject(
    gulp.src('build/js/*.js', {read: false}), {
    transform: function (filepath) {
        filepath = filepath.replace("/build","");
        return '<script src="' + filepath  + '"></script>';
    }
  }
))
.pipe(gulp.dest('build'));
});

gulp.task('inject', function(callback){
  runSequence(
    'bowerdep',
    'projectdepcss',
    'projectdepjs',
    callback);
});

/** gulp build */

gulp.task('build', function(callback){
  runSequence(
    'css',
    'js',
    'inject',
    callback);
});

/** gulp watch */



gulp.task('browserSync', function() {
  bs.init({
    browser: "google-chrome",
    notify: false,
    server: {
      baseDir: [main_dir,build_dir,src_dir]
    },
  })
});

gulp.task('browserreload', function(){
  bs.reload({
    "stream":true
  });
});

gulp.task('watch_', function(callback){
  runSequence(
    'inject',
    callback);
});

gulp.task('watch',['browserSync'], function(){
  gulp.watch('src/scss/*.scss',['css']);
  gulp.watch('src/js/*.js',['js']);
  gulp.watch('src/*.html',['inject']);

});

gulp.task('default', ['css','watch']);
