'use_strict';

const {src, dest, series, parallel, watch} = require("gulp");
const clean = require('gulp-clean');
const through2 = require("through2");

////////////////////////////////////////////////////////////////////////
// TASKS
////////////////////////////////////////////////////////////////////////
function cleanBuild() {
  return src('build', {read: false, allowEmpty: true}).pipe(clean());
}

function cleanVendorScripts() {
  return src('src/scripts/vendor', {read: false, allowEmpty: true}).pipe(clean());
}

function copyVendorScripts(done) {
  const bootstrapSources = {
    src: ["node_modules/bootstrap/dist/js/bootstrap.bundle.min.js"],
    name: "bootstrap",
    active: true
  };
  const jquerySources = {
    src: ["node_modules/jquery/dist/jquery.min.js"],
    name: "jquery",
    active: true
  };
  const popperjsSources = {
    src: [
      "node_modules/popper.js/dist/popper-utils.min.js",
      "node_modules/popper.js/dist/popper.min.js"
    ],
    name: "popper",
    active: true
  };
  const tetherSources = {
    src: ["node_modules/tether/dist/js/tether.min.js"],
    name: "tether",
    active: true
  };

  var sources = [
    bootstrapSources,
    jquerySources,
    popperjsSources,
    tetherSources
  ];

  var doneCounter = 0;

  function incDoneCounter() {
    doneCounter += 1;
    if (doneCounter >= sources.length) {
      done();
    }
  }

  sources.forEach(source => {
    source.src.forEach(ppp => {
      if (source.active === true) {
        src(ppp)
          .pipe(dest("src/scripts/vendor/" + source.name + "/"))
          .pipe(synchro(incDoneCounter));
      }
    });
  });
}

function buildVendorScripts(done) {
  done();  
}

function copyVendorStyles(done) {
  done();
}

function cleanVendorStyles() {
  return src('src/styles/vendor', {read: false, allowEmpty: true}).pipe(clean());
}

function buildVendorStyles(done) {
  done();  
}

function vendorSass(done) {
  done();
}

function buildThemeScripts(done) {
  done();
}

function cleanThemeStyles(done) {
  return src('src/styles/theme', {read: false, allowEmpty: true}).pipe(clean());
}

function themeSass(done) {
  done();
}

function buildThemeStyles(done) {
  done();  
}

////////////////////////////////////////////////////////////////////////////////////////
// UTILS
////////////////////////////////////////////////////////////////////////////////////////
// Simple callback stream used to synchronize stuff
// Source: http://unobfuscated.blogspot.co.at/2014/01/executing-asynchronous-gulp-tasks-in.html
// https://andreasrohner.at/posts/Web%20Development/Gulp/How-to-synchronize-a-Gulp-task-that-starts-multiple-streams-in-a-loop/
function synchro(done) {
  return through2.obj(
    function (data, enc, cb) {
      cb();
    },
    function (cb) {
      cb();
      done();
    }
  );
}

////////////////////////////////////////////////////////////////////////
// COMPLEX TASKS
////////////////////////////////////////////////////////////////////////
const _clean                = series(cleanBuild);
const _buildVendorScripts   = series(cleanVendorScripts, copyVendorScripts, buildVendorScripts);
const _buildVendorStyles    = series(cleanVendorStyles, copyVendorStyles, vendorSass, buildVendorStyles);
const _buildThemeScripts    = buildThemeScripts;
const _buildThemeStyles     = series(cleanThemeStyles, themeSass, buildThemeStyles);
const _scripts              = parallel(_buildVendorScripts, _buildThemeScripts);
const _styles               = parallel(_buildVendorStyles, _buildThemeStyles);
const _build                = series(_clean, _scripts, _styles);

////////////////////////////////////////////////////////////////////////
// PUBLIC TASKS
////////////////////////////////////////////////////////////////////////
exports.build     = _build;
exports.clean     = _clean;
exports.default   = _build;