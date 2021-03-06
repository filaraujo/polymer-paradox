/*
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

'use strict';

// Include Gulp & tools we'll use
var browserSync = require('browser-sync');
var del = require('del');
var gulp = require('gulp');
var historyApiFallback = require('connect-history-api-fallback');
var reload = browserSync.reload;
var ghPages = require('gulp-gh-pages');
var seq = require('run-sequence');

// Clean output directory
gulp.task('clean', function(cb) {
  del(['.tmp', 'dist'], cb);
});

gulp.task('copy:bower', function() {
  return gulp.src('bower_components/**', {base: '.'})
    .pipe(gulp.dest('.tmp'));
});

gulp.task('copy:app', function() {
  return gulp.src('app/**/*')
    .pipe(gulp.dest('.tmp'));
});

gulp.task('deploy:gh', function() {
  return seq(
    'clean',
    'copy:bower',
    'copy:app',
    'build:gh'
  );
});

gulp.task('build:gh', function() {
  return gulp.src('.tmp/**/*')
    .pipe(require('gulp-debug')())
    .pipe(ghPages());
});

// Watch files for changes & reload
gulp.task('serve', function() {
  browserSync({
    port: 5000,
    notify: false,
    logPrefix: 'PSK',
    snippetOptions: {
      rule: {
        match: '<span id="browser-sync-binding"></span>',
        fn: function(snippet) {
          return snippet;
        }
      }
    },
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: {
      baseDir: ['.tmp', 'app'],
      middleware: [historyApiFallback()],
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });

  gulp.watch(['app/**/*.html'], reload);
  gulp.watch(['app/styles/**/*.css'], ['styles', reload]);
  gulp.watch(['app/elements/**/*.css'], ['elements', reload]);
  gulp.watch(['app/{scripts,elements}/**/{*.js,*.html}']);
  gulp.watch(['app/images/**/*'], reload);
});
