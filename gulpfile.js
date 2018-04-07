var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    livereload = require('gulp-livereload'),
    concat = require('gulp-concat');
    minifyCss = require('gulp-minify-css'),
    // autoprefixer does not work with less, use alternate less plugins
    autoprefixer = require('gulp-autoprefixer'),
    plumber = require('gulp-plumber'),
    sourcemaps = require('gulp-sourcemaps'),
    sass = require('gulp-sass'),
    // babel requires babel-preset-es2015 npm package
    babel = require('gulp-babel'),
    del = require('del'),
    zip = require('gulp-zip');


//less plugins
var less = require('gulp-less'),
    LessAutoprefix = require('less-plugin-autoprefix');

var lessAutoprefix = new LessAutoprefix({
  browsers: ['last 2 versions']
});

// Handlebars Plugins

var handlebars = require('gulp-handlebars'), // Takes hbs files and converts them into templates
    handlebarsLib = require('handlebars'); // Runs files through specific version of the handlebars libary
    declare = require('gulp-declare'), // Lets us create new variables inside Gulp
    wrap = require('gulp-wrap'); // Lets us wrap our files in a set of code

var imagemin = require('gulp-imagemin'),
    imageminPngquant = require('imagemin-pngquant'),
    imageminJpegcompress = require('imagemin-jpeg-recompress');

// File paths
var DIST_PATH = 'public/dist';
var SCRIPTS_PATH = 'public/scripts/**/*.js';
// var CSS_PATH = 'public/css/**/*.css';
var TEMPLATES_PATH = 'templates/**/*.hbs';
var IMAGES_PATH = 'public/images/**/*.{png,jpeg,jpg,svg,gif}';

// CSS Styles
// gulp.task('styles', function () {
//   console.log('starting styles task');
//   return gulp.src(['public/css/reset.css', CSS_PATH])
//   .pipe(plumber(function (err) {
//     console.log('Styles Task Error');
//     console.log(err);
//     this.emit('end');
//   }))
//   .pipe(sourcemaps.init())
//   .pipe(autoprefixer())
//   .pipe(concat('styles.css'))
//   .pipe(minifyCss())
//   .pipe(sourcemaps.write())
//   .pipe(gulp.dest(DIST_PATH))
//   .pipe(livereload());
// });

// SCSS Styles
// gulp.task('styles', function () {
//   console.log('starting styles task');
//   return gulp.src('public/scss/**/*.scss')
//   .pipe(plumber(function (err) {
//     console.log('Styles Task Error');
//     console.log(err);
//     this.emit('end');
//   }))
//   .pipe(sourcemaps.init())
//   .pipe(autoprefixer())
//   .pipe(sass({
//     outputStyle: 'compressed'
//   }))
//   .pipe(sourcemaps.write())
//   .pipe(gulp.dest(DIST_PATH))
//   .pipe(livereload());
// });

// LESS Styles
gulp.task('styles', function () {
  console.log('starting styles task');

  return gulp.src('public/less/styles.less')
  .pipe(plumber(function (err) {
    console.log('Styles Task Error');
    console.log(err);
    this.emit('end');
  }))
  .pipe(sourcemaps.init())
  .pipe(less({
    plugins: [lessAutoprefix]
  }))
  .pipe(minifyCss())
  .pipe(sourcemaps.write())
  .pipe(gulp.dest(DIST_PATH))
  .pipe(livereload());
});

// Scripts
gulp.task('scripts', function () {
  console.log('starting scripts task');

  return gulp.src(SCRIPTS_PATH)
  .pipe(plumber(function (err) {
    console.log('Scripts Task Error');
    console.log(err);
    this.emit('end');
  }))
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(uglify())
    .pipe(concat('scripts.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(DIST_PATH))
    .pipe(livereload());
});

// Images
gulp.task('images', function () {
  console.log('starting images task');

  return gulp.src(IMAGES_PATH)
  .pipe(plumber(function (err) {
    console.log('Scripts Task Error');
    console.log(err);
    this.emit('end');
  }))
  .pipe(imagemin(
    [
      imagemin.gifsicle(),
      imagemin.jpegtran(),
      imagemin.optipng(),
      imagemin.svgo(),
      imageminPngquant(),
      imageminJpegcompress()
    ]
  ))
  .pipe(gulp.dest(DIST_PATH + '/images'))
});

gulp.task('clean', function () {
  console.log('starting clean task');

  return del.sync([
    DIST_PATH
  ]);
})

// Templates
gulp.task('templates', function () {
  // Run templates through the proces
  return gulp.src(TEMPLATES_PATH)
    // Calls the gulp-handlebars library to compile as handlebars templates
    .pipe(handlebars({
      // Pass in options object of the handlebars version library to use
      handlebars: handlebarsLib
    }))
    // Wrap takes content so far and wraps it inside of string
    // Inject output of content of handlebars inside the () via <%= contents %>
    .pipe(wrap('Handlebars.template(<%= contents %>)'))
    // Delcare a template variable we can access inside of Javascript
    .pipe(declare({
      // Options object: the name of the variable we want to delcare
      namespace: 'templates',
      // Options object: Prevents gulp from re-defining templates if they already exist
      noRedeclare: true,
    }))
    // 1 of 2 -Concatenate files from TEMPLATES_PATH
    // Set Name for the Combined version of file
    .pipe(concat('templates.js'))
    // 2 of 2 -Save concatenated+minified file into public/dist directory
    .pipe(gulp.dest(DIST_PATH))
    // livereload - listens to the public/dist directory for changes
    .pipe(livereload());
});

// Default
// Second argument (the array []) runs declared scripts first
gulp.task('default', ['clean', 'images', 'templates', 'styles', 'scripts', 'watch'], function () {
  console.log('starting default task');
});

gulp.task('export', function() {
  return gulp.src('public/**/*')
  // declare output zip file
  .pipe(zip('website.zip'))
  .pipe(gulp.dest('./'))
})

// Watch
gulp.task('watch', function () {
  console.log('starting watch task');
  require('./server.js');
  livereload.listen();
  gulp.watch(SCRIPTS_PATH, ['scripts']);
  // gulp.watch(CSS_PATH, ['styles']);
  // gulp.watch('public/scss/**/*.scss', ['styles']);
  gulp.watch('public/less/**/*.less', ['styles']);
  gulp.watch(TEMPLATES_PATH, ['templates']);
});
