const {src,dest,parallel,series,watch} = require('gulp');

//Load Plugins
const uglify = require('gulp-uglify');
const sass = require('gulp-sass')(require('node-sass'));
const autoprefixer = require('gulp-autoprefixer');
const notify = require('gulp-notify');
const cssnano = require('gulp-cssnano');
const rename = require('gulp-rename');
const imagemin = require('gulp-imagemin');
const del = require('del');
const sourcemaps = require('gulp-sourcemaps');
// const jshint = require('gulp-jshint');
const concat = require('gulp-concat');
// const babel = require('gulp-babel');
const eslint = require('eslint');
const plumber = require('gulp-plumber');
const browsersync = require('browser-sync').create();

// Lint scripts
function scriptsLint() {
    return gulp
      .src(["./assets/scripts/**/*", "./gulpfile.js"])
      .pipe(plumber())
      .pipe(eslint())
      .pipe(eslint.format())
      .pipe(eslint.failAfterError());
}

function js() {
    const source = [
        './assets/scripts/*.js',
        './node_modules/jquery/dist/jquery.js',
        './node_modules/gsap/dist/gsap.js',
        './node_modules/owl.carousel/dist/owl.carousel.js',
        './assets/scripts/script.js'
    ];

    return src(source)
        .pipe(concat('bundle.js'))
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(uglify({
            compress: {
                    unused: false
                }
            }
        ))
        .on('error', onError)
        .pipe(rename({
            extname: '.min.js'
        }))
        .pipe(sourcemaps.write('./'))
        .pipe(dest('./dists/scripts/'))
        .pipe(notify({
            "title": "Scripts Complete",
            "message": "Message"
        }))
        .pipe(browsersync.stream());
}

function css() {
    const source = './assets/scss/main.scss';

    return src(source)
        .pipe(sass().on('error', sass.logError))
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(autoprefixer())
        .pipe(cssnano())
        .pipe(rename({
            extname: '.min.css'
        }))
        .pipe(sourcemaps.write('./'))
        .pipe(dest('./dists/style/'))
        .pipe(notify({
            "title": "Styles Complete",
            "message": "Message"
        }))
        .pipe(browsersync.stream());
}

function img() {
    return src('./assets/img/*')
        .pipe(imagemin([
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
          ]))
        .pipe(dest('./dists/img'));
}


function clean() {
    return del(['dists/style', 'dists/scripts']);
}

function onError(err) {
    console.log(err.toString());
    this.emit('end');
}

function watchFiles() {
    // watch(["**/*.php",],gulp.series(browserSyncReload));
    watch('./assets/scss/*', css);
    watch('./assets/scripts/*', js);
    watch('./assets/img/*', img);
}

function browserSync() {
    browsersync.init({
        server: {
            baseDir: './'
        },
        port: 3000
    });
};

// Tasks to define the execution of the functions simultaneously or in series
exports.watch = parallel(clean, watchFiles, browserSync);
exports.default = series(clean, parallel(js, css, img));