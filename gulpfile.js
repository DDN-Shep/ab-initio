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
    nodemon = require('nodemon'),
    sequence = require('run-sequence'),
    browserSync = require('browser-sync');

let settings = {
  url: 'https://ab-initio.com',
  pretty: false,
  package: path.join(__dirname, 'package.json'),
  config: path.join(__dirname, 'config.json'),
  zip: {
    name: 'ab-initio-package.zip',
    path: path.join(__dirname, '_package')
  },
  vendor: {
    assets: {
      './semantic/dist/themes/default/**': './client/css/themes/default',
      './node_modules/owl.carousel/dist/assets/*.{gif,png}': './client/css'
    },
    styles: [
      './node_modules/owl.carousel/dist/assets/owl.carousel.min.css',
      './node_modules/owl.carousel/dist/assets/owl.theme.default.min.css',
      './semantic/dist/semantic.min.css'
    ],
    scripts: [
      './node_modules/jquery/dist/jquery.min.js',
      './node_modules/jquery-migrate/dist/jquery-migrate.min.js',
      './node_modules/owl.carousel/dist/owl.carousel.min.js',
      './semantic/dist/semantic.min.js'
    ]
  }
};

gulp.task('eslint', () => {
  return gulp.src('./server/scripts/**/*.js')
    .pipe(eslint())
    .pipe(eslint.format());
});

gulp.task('clean', () => {
  return gulp.src('./client', {
      read: false
    })
    .pipe(clean());
});

gulp.task('images', () => {
  return gulp.src('./server/images/**')
    .pipe(gulp.dest('./client/img'));
});

gulp.task('fonts', () => {
  return gulp.src('./server/fonts/**')
    .pipe(gulp.dest('./client/fonts'));
});

gulp.task('vendor-scripts', () => {
  return gulp.src(settings.vendor.scripts)
    .pipe(concat('lib.js'))
    .pipe(gulp.dest('./client/js'));
});

gulp.task('scripts', ['eslint', 'vendor-scripts'], () => {
  return gulp.src('./server/scripts/**/*.js')
    .pipe(uglify({
      beautify: settings.pretty
    }))
    .pipe(concat('app.js'))
    .pipe(gulp.dest('./client/js'));
});

gulp.task('vendor-styles', () => {
  Object.keys(settings.vendor.assets).forEach((i) => {
    gulp.src(i)
      .pipe(gulp.dest(settings.vendor.assets[i]));
  });

  return gulp.src(settings.vendor.styles)
    .pipe(concat('lib.css'))
    .pipe(gulp.dest('./client/css'));
});

gulp.task('styles', ['vendor-styles', 'fonts'], () => {
  return gulp.src('./server/styles/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(prefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(cssmin({
      keepBreaks: settings.pretty
    }))
    .pipe(concat('app.css'))
    .pipe(gulp.dest('./client/css'));
});

gulp.task('partials', () => {
  return gulp.src('./server/views/partials/**/*.pug')
    .pipe(pug({
      pretty: settings.pretty
    }))
    .pipe(gulp.dest('./client/partials'));
});

gulp.task('views', ['partials'], () => {
  return gulp.src('./server/views/static/**/*.pug')
    .pipe(data((file) => {
      return require(settings.config);
    }))
    .pipe(pug({
      pretty: settings.pretty
    }))
    .pipe(rename({
      dirname: ''
    }))
    .pipe(gulp.dest('./client'));
});

gulp.task('sitemap', () => {
  return gulp.src('./client/**/*.html', {
      read: false
    })
    .pipe(sitemap({
      siteUrl: settings.url
    }))
    .pipe(gulp.dest('./client'));
});

gulp.task('robots', () => {
  return gulp.src('./client/index.html')
    .pipe(robots({
      useragent: '*',
      allow: ['/'], // TODO
      disallow: ['/'], // TODO
      sitemap: settings.url + '/sitemap.xml'
    }))
    .pipe(gulp.dest('./client'));
});

gulp.task('browser-sync', ['nodemon'], () => {
  browserSync.create().init({
    proxy: 'https://localhost:1337',
    port: 3000,
    files: ['./client/**']
    // httpModule: 'http2' // Not supported for proxy servers, yet...
  });
});

gulp.task('nodemon', (next) => {
  var started = false;

  return nodemon({
      script: './server.js'
    })
    .on('start', () => {
      if (!started) {
        next();
        started = true; // Prevent nodemon being started multiple times
      }
    });
});

gulp.task('watch', () => {
  gulp.watch('./server/scripts/**', ['scripts']);
  gulp.watch('./server/styles/**', ['styles']);
  gulp.watch('./server/views/**', ['views']);
});

gulp.task('package', () => {
  let packageJSON = JSON.parse(fs.readFileSync(settings.package, 'utf8')),
      packagePaths = [
        '**',
        '!**/gulp*',
        '!**/gulp*/**',
        '!**/_package/**',
        '!_package',
        '!gulpfile.js'
      ];

  // Add exclusion patterns for all dev-dependencies
  for (var property in packageJSON.devDependencies) {
    packagePaths.push('!**/node_modules/' + property + '/**');
    packagePaths.push('!**/node_modules/' + property);
  }

  return sequence('clean', ['build'], () => {
    return gulp.src(packagePaths)
      .pipe(zip(settings.zip.name))
      .pipe(gulp.dest(settings.zip.path));
  });
});

gulp.task('seo', ['robots', 'sitemap']);

gulp.task('build', ['images', 'styles', 'scripts', 'views', 'seo']);

gulp.task('default', () => {
  return sequence('build', 'watch', 'browser-sync');
});

gulp.task('rebuild', () => {
  return sequence('clean', 'build');
});
