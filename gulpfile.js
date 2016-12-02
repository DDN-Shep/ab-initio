'use strict';

let gulp = require('gulp'),
    prefixer = require('gulp-autoprefixer'),
    clean = require('gulp-clean'),
    concat = require('gulp-concat'),
    cssmin = require('gulp-cssmin'),
    data = require('gulp-data'),
    eslint = require('gulp-eslint'),
    pug = require('gulp-pug'),
    rename = require('gulp-rename'),
    robots = require('gulp-robots'),
    sass = require('gulp-sass'),
    sitemap = require('gulp-sitemap'),
    uglify = require('gulp-uglify'),
    watch = require('gulp-watch'),
    zip = require('gulp-zip'),
    path = require('path'),
    fs = require('fs'),
    historyApi = require('connect-history-api-fallback'),
    browserSync = require('browser-sync');

let settings = {
  url: 'https://ab-initio.com',
  pretty: false,
  package: path.join(__dirname, 'package.json'),
  config: path.join(__dirname, 'config.json'),
  zip: {
    name: 'ab-initio-package.zip',
    path: path.join(__dirname, '_package')
  }
};

gulp.task('eslint', () => {
  gulp.src('./server/scripts/**/*.js')
    .pipe(eslint())
    .pipe(eslint.format());
});

gulp.task('clean', () => {
  gulp.src('./client', {
      read: false
    })
    .pipe(clean());
});

gulp.task('images', () => {
  gulp.src('./server/images/**')
    .pipe(gulp.dest('./client/img'));
});

gulp.task('fonts', () => {
  gulp.src('./server/fonts/**')
    .pipe(gulp.dest('./client/fonts'));
});

gulp.task('scripts', ['eslint'], () => {
  gulp.src('./vendor/**/*.js')
    .pipe(uglify({
      beautify: settings.pretty
    }))
    .pipe(concat('vendor-bundle.js'))
    .pipe(rename({
      dirname: '',
      suffix: '.min'
    }))
    .pipe(gulp.dest('./client/js'));

  gulp.src('./server/scripts/**/*.js')
    .pipe(uglify({
      beautify: settings.pretty
    }))
    .pipe(concat('app-bundle.js'))
    .pipe(rename({
      dirname: '',
      suffix: '.min'
    }))
    .pipe(gulp.dest('./client/js'));
});

gulp.task('styles', () => {
  gulp.src('./lib/**/*.css')
    .pipe(cssmin({
      keepBreaks: settings.pretty
    }))
    .pipe(concat('lib-bundle.css'))
    .pipe(rename({
      dirname: '',
      suffix: '.min'
    }))
    .pipe(gulp.dest('./client/css'));

  gulp.src('./server/styles/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(prefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(cssmin({
      keepBreaks: settings.pretty
    }))
    .pipe(concat('app-bundle.css'))
    .pipe(rename({
      dirname: '',
      suffix: '.min'
    }))
    .pipe(gulp.dest('./client/css'));
});

gulp.task('views', () => {
  gulp.src('./server/views/pages/**/*.pug')
    .pipe(data(function(file) {
      return require(settings.config);
    }))
    .pipe(pug({
      pretty: settings.pretty
    }))
    .pipe(rename({
      dirname: ''
    }))
    .pipe(gulp.dest('./client'));

  gulp.src('./server/views/partials/**/*.pug')
    .pipe(pug({
      pretty: settings.pretty
    }))
    .pipe(gulp.dest('./client/partials'));
});

gulp.task('sitemap', () => {
  gulp.src('./client/**/*.html', {
      read: false
    })
    .pipe(sitemap({
      siteUrl: settings.url
    }))
    .pipe(gulp.dest('./client'));
});

gulp.task('robots', ['sitemap'], () => {
  gulp.src('./client/index.html')
    .pipe(robots({
      useragent: '*',
      allow: ['/'], // TODO
      disallow: ['/'], // TODO
      sitemap: settings.url + '/sitemap.xml'
    }))
    .pipe(gulp.dest('./client'));
});

gulp.task('browser-sync', () => {
  browserSync.create().init(['./client/**'], {
    server: {
      baseDir: './client',
      middleware: [historyApi()]
    }
  });
});

gulp.task('watch', () => {
  gulp.watch('./server/scripts/**', ['scripts']);
  gulp.watch('./server/styles/**', ['styles']);
  gulp.watch('./server/views/**', ['views']);
});

gulp.task('package', () => {
  let excludes = ['**',
      '!**/_package/**',
      '!_package',
      '!gulpfile.js'
    ],
    packageJSON = JSON.parse(fs.readFileSync(settings.package, 'utf8')),
    devDependencies = packageJSON.devDependencies;

  // Add exclusion patterns for all dev dependencies
  for (var property in devDependencies) {
    excludes.push("!**/node_modules/" + property + "/**");
    excludes.push("!**/node_modules/" + property);
  }

  return gulp.src(packagePaths)
    .pipe(zip(settings.zip.name))
    .pipe(gulp.dest(settings.zip.path));
});

gulp.task('build', ['images', 'fonts', 'scripts', 'styles', 'views', 'robots']);

gulp.task('default', ['build', 'watch', 'browser-sync']);
