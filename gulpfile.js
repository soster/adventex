// generated on 2017-10-16 using generator-webapp 3.0.1
"use strict";
const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const browserSync = require('browser-sync').create();
const del = require('del');
const runSequence = require('run-sequence');
var version = require('gulp-version-number');
const mocha = require('gulp-mocha');
var gutil = require('gulp-util');
var jsonminify = require('gulp-jsonminify');
var sass = require('gulp-sass');
var gulp_jspm = require('gulp-jspm');
var removeCode = require('gulp-remove-code');

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

const versionConfig = {
  'value': '%MDS%',
  'append': {
    'key': 'v',
    'to': ['css', 'js'],
  },
};

let dev = true;



gulp.task('test', function () {
  return gulp.src(['app/scripts/**/!(main.js)','test/**/*.js'], { read: false })
  .pipe(mocha({ reporter: 'list' }))
  .on('error', gutil.log);
});

gulp.task('jspm', function(){
    return gulp.src('app/scripts/main.js')
    .pipe($.sourcemaps.init())
    .pipe(gulp_jspm({selfExecutingBundle: true}))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('dist/scripts'));
});


gulp.task('sass', function () {
  return gulp.src('app/styles/**/*.scss')
    .pipe(sass.sync().on('error', sass.logError))
    .pipe($.if(dev, gulp.dest('.tmp/styles'), gulp.dest('dist/styles')))
    .pipe(reload({stream: true}));
});


function lint(files) {
  return gulp.src(files)
  .pipe($.eslint())
  .pipe($.eslint.result(result => {
      // Called for each ESLint result. 
      console.log(`ESLint result: ${result.filePath}`);
      console.log(`# Messages: ${result.messages.length}`);
      console.log(`# Warnings: ${result.warningCount}`);
      console.log(`# Errors: ${result.errorCount}`);
  }))
    .pipe(reload({stream: true, once: true}))
    .pipe($.eslint.format())
    .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
}

gulp.task('lint', () => {
  return lint('app/scripts/**/*.js')
    .pipe(gulp.dest('app/scripts'));
});

gulp.task('lint:test', () => {
  return lint('test/spec/**/*.js')
    .pipe(gulp.dest('test/spec'));
});

gulp.task('html', ['sass', 'jspm', 'json'], () => {
  return gulp.src('app/*.html')
    .pipe($.useref({searchPath: ['.tmp', 'app', '.']}))
    .on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
    .pipe($.if(/\.css$/, $.cssnano({safe: true, autoprefixer: false})))
    .pipe($.versionNumber(versionConfig))
    .pipe(removeCode({ production: true }))
    .pipe(gulp.dest('dist'));
});

gulp.task('images', () => {
  return gulp.src('app/images/**/*')
    .pipe($.cache($.imagemin()))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('json', () => {
  return gulp.src('app/json/**/*')
    .pipe(jsonminify())
    .pipe(gulp.dest('dist/json'));
});

gulp.task('fonts', () => {
  return gulp.src(require('main-bower-files')('**/*.{eot,svg,ttf,woff,woff2}', function (err) {})
    .concat('app/fonts/**/*'))
    .pipe($.if(dev, gulp.dest('.tmp/fonts'), gulp.dest('dist/fonts')));
});

gulp.task('extras', () => {
  return gulp.src([
    'app/*',
    '!app/*.html'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('serve', () => {
  runSequence(['clean'], ['sass', 'fonts'], () => {
    browserSync.init({
      notify: false,
      port: 9000,
      server: {

        baseDir: ['.tmp', '.', 'app'],
        routes: {
          '/jspm_packages': 'jspm_packages',
          '/config': '.'
        }
      }
    });

    gulp.watch([
      'app/*.html',
      'app/images/**/*',
      'app/json/*',
      '.tmp/fonts/**/*'
    ]).on('change', reload);

    gulp.watch('app/styles/**/*.scss', ['sass']);
    gulp.watch('app/scripts/**/*.js', ['scripts']);
    gulp.watch('app/fonts/**/*', ['fonts']);
    gulp.watch('app/peg/**/*', ['pegjs']);

  });
});

gulp.task('serve:dist', ['default'], () => {
  browserSync.init({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['dist']
    }
  });
});

gulp.task('serve:test', [], () => {
  browserSync.init({
    notify: false,
    port: 9000,
    ui: false,
    server: {
      baseDir: ['test','app', '.', '.tmp'],
      routes: {
        '/jspm_packages': 'jspm_packages',
        '/test': 'test',
        '/config': '.'
      }
    }
  });

  gulp.watch('app/scripts/**/*.js', ['scripts']);
  gulp.watch(['test/spec/**/*.js', 'test/index.html']).on('change', reload);
  gulp.watch('test/spec/**/*.js', ['lint:test']);
});


gulp.task('build', ['json', 'html', 'images', 'fonts', 'extras'], () => {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', () => {
  return new Promise(resolve => {
    dev = false;
    runSequence(['clean'], 'build', resolve);
  });
});
