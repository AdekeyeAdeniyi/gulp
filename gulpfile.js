
"use strict";

const gulp = require('gulp');
const sass = require("gulp-sass")(require("node-sass"));
const autoprefixer = require('gulp-autoprefixer');
const cssnano = require('gulp-cssnano');
const jshint = require('gulp-jshint');
const uglify = require('gulp-terser');
const plumber = require("gulp-plumber");
const rename = require('gulp-rename');
const concat = require('gulp-concat');
const babel = require('gulp-babel');
const notify = require('gulp-notify');
const livereload = require('gulp-livereload');
const del = require('del');
const imagemin     = require('gulp-imagemin');
const sourcemaps   = require('gulp-sourcemaps');
const browsersync = require('browser-sync').create();


// Optimize Images
function images() {
  return gulp
    .src("../../../media/**/*")
    //.pipe(newer("./_site/assets/img"))
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [
            {
              removeViewBox: false,
              collapseGroups: true
            }
          ]
        })
      ])
    )
    .pipe(gulp.dest("../../../media_optimised/"));
}
 
function styles() {
  return gulp.src('assets/scss/layouts/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(autoprefixer())
    .pipe(cssnano())
    .pipe(concat('main'))
    .pipe(rename({
        extname: '.min.css'
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist/css'))
    .pipe(notify({
        "title": "Styles Complete",
        "message": "Message"
    }))
    .pipe(browsersync.stream())
}


// Lint scripts
function scriptsLint() {
  return gulp
    .src(["./assets/js/**/*", "./gulpfile.js"])
    .pipe(plumber())
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
}

function scripts() {
    return gulp.src([
      'node_modules/gsap/dist/gsap.min.js',
      'node_modules/jquery/dist/jquery.min.js',
      //'node_modules/@barba/core/dist/barba.js',
      //'node_modules/svg4everybody/dist/svg4everybody.js',
      //'node_modules/jquery.stellar/jquery.stellar.js',
      //'assets/scripts/jquery.smoothState.min.js',
      'node_modules/owl.carousel2/dist/owl.carousel.min.js',
      'assets/scripts/utility.js',
      //'assets/scripts/page-transitions.js',
      'assets/scripts/scripts.js'
    ])
    .pipe(babel({
      presets: ['@babel/preset-env']
    }))
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(concat('main'))
    .pipe(rename({
      extname: '.min.js'
    }))
    .pipe(uglify({
        compress: {
                unused: false
            }
        }
    ))
    .on('error', onError)
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist/js'))
    .pipe(notify({
      "title": "Scripts Complete",
      "message": "Message"
     }))
    .pipe(browsersync.stream())
}

function clean() {
    return del(['dist/css/*.min.css', 'dist/js/*.min.js']);
}

// BrowserSync
function browserSyncFunc(done) {
  done();
}

// BrowserSync Reload
function browserSyncReload(done) {
  browsersync.reload();
  done();
}

// Watch files
function watchFiles() {
  gulp.watch('assets/scss/layouts/*.scss', styles);
  gulp.watch(['assets/scripts/utility.js', 'assets/scripts/scripts.js'],gulp.series(scriptsLint, scripts));
  gulp.watch(["**/*.php",],gulp.series(browserSyncReload));
  gulp.watch("./assets/img/**/*", images);
}

function onError(err) {
  console.log(err.toString());
  this.emit('end');
}

// define complex tasks
const js = gulp.series(scriptsLint, scripts);
const build = gulp.series(clean, gulp.parallel(styles, images, scripts));
const watch = gulp.series(clean, browserSyncFunc, watchFiles);


// export tasks
exports.browserSyncFunc = browserSyncFunc;
exports.images = images;
exports.styles = styles;
exports.scripts = scripts;
exports.onError = onError;
exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = build;





