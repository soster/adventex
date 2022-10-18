// generated on 2017-10-16 using generator-webapp 3.0.1

import gulp from 'gulp';
//import gulpLoadPlugins from 'gulp-load-plugins';

// workaround for not using require anymore:
import { createRequire } from 'module';
const gulpLoadPlugins = createRequire(import.meta.url)('gulp-load-plugins');


import browserSync from 'browser-sync';
import del from 'del';
import runSequence from 'run-sequence';
import version from 'gulp-version-number';
import mocha from 'gulp-mocha';
import gutil from 'gulp-util';
import jsonminify from 'gulp-jsonminify';

import dartSass from 'sass';
import gulpSass from 'gulp-sass';
const sass = gulpSass(dartSass);

import gulp_jspm from 'gulp-jspm'
import removeCode from 'gulp-remove-code';
import uglify from 'gulp-uglify';
import mbf from 'main-bower-files';


const $ = gulpLoadPlugins();
const reload = browserSync.create().reload;

const versionConfig = {
  'value': '%DT%',
  'append': {
    'key': 'v',
    'to': ['css', 'js'],
  },
  'replaces': ['VERSION_REPLACE']
};

let dev = true;





gulp.task('jspm', function(){
    return gulp.src('app/scripts/main.js')
    .pipe($.sourcemaps.init())
    .pipe(gulp_jspm({selfExecutingBundle: true}))
    .pipe(uglify())    
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('dist/scripts'));
});


gulp.task('sass', function () {
  return gulp.src('app/styles/**/*.scss')
    .pipe(sass().on('error', sass.logError))
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

gulp.task('json', () => {
  return gulp.src('app/json/**/*')
    .pipe(jsonminify())
    .pipe(gulp.dest('dist/json'));
});

gulp.task('html', gulp.series('sass', 'jspm', 'json', () => {
  return gulp.src('app/*.html')
    .pipe($.useref({searchPath: ['.tmp', 'app', '.']}))
    .on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
    .pipe($.if(/\.css$/, $.cssnano({safe: true, autoprefixer: false})))
    .pipe($.versionNumber(versionConfig))
    .pipe(removeCode({ production: true }))
    .pipe(gulp.dest('dist'));
}));

gulp.task('images', () => {
  return gulp.src('app/images/**/*')
    .pipe(gulp.dest('dist/images'));
});



gulp.task('fonts', () => {
  return gulp.src(mbf('**/*.{eot,svg,ttf,woff,woff2}', function (err) {})
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



// Static Server + watching scss/html files
gulp.task('serve', gulp.series('sass', () => {

  browserSync.init({
    notify: false,
    port: 9000,
    server: {

      baseDir: ['.tmp', '.', 'app'],
      routes: {
        '/jspm_packages': 'jspm_packages',
      }
    }
  });

  gulp.watch([
    'app/*.html',
    'app/images/**/*',
    'app/json/*',
    '.tmp/fonts/**/*'
  ]).on('change', reload);

  gulp.watch('app/styles/**/*.scss', gulp.series('sass'));
  gulp.watch('app/scripts/**/*.js', gulp.series('jspm'));
  gulp.watch(['app/scripts/**/*.js', 'test/index.html']).on('change', reload);
  gulp.watch('app/fonts/**/*', gulp.series('fonts'));
}));


gulp.task('default', () => {
  return new Promise(resolve => {
    dev = false;
    runSequence(['clean'], 'build', resolve);
  });
});

gulp.task('serve:dist', gulp.series('default', () => {
  browserSync.init({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['dist']
    }
  });
}));

gulp.task('serve:test', gulp.series(() => {
  browserSync.init({
    notify: false,
    port: 9000,
    ui: false,
    server: {
      baseDir: ['test','app', '.', '.tmp'],
      routes: {
        '/node_modules': 'node_modules',
        '/jspm_packages': 'jspm_packages',
        '/test': 'test',
      }
    }
  });

  gulp.watch(['app/scripts/**/*.js', 'test/index.html']).on('change', reload);
  gulp.watch(['test/spec/**/*.js', 'test/index.html']).on('change', reload);
  gulp.watch('test/spec/**/*.js', gulp.series('lint:test'));
}));


gulp.task('build', gulp.series('json', 'html', 'images', 'fonts', 'extras', () => {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
}));

// Test
gulp.task('test', /*gulp.series(['build', 'lint']), */function() {
  return gulp.src('test/spec/*.js', { read : false })
    .pipe(mocha({
      reporter: 'list'
    }))
});
