'use_strict';

const {src, dest, series, parallel, watch} = require("gulp");
const clean = require('gulp-clean');
const through2 = require("through2");
const flatten = require("gulp-flatten");
const autoprefixer = require('gulp-autoprefixer');
const sass = require("gulp-sass");

const config = {

  scripts: {
    vendor: [
      {
        name: "bootstrap",
        src: ["node_modules/bootstrap/dist/js/bootstrap.bundle.min.js"],
        active: true
      }, {
        name: "jquery",
        src: ["node_modules/jquery/dist/jquery.min.js"],
        active: true
      }, {
        name: "popper",
        src: [
          "node_modules/popper.js/dist/popper-utils.min.js",
          "node_modules/popper.js/dist/popper.min.js"
        ],
        active: true
      }, {
        name: "tether",
        src: ["node_modules/tether/dist/js/tether.min.js"],
        active: true
      }
    ]
  },
  styles: {
    vendor: [
      {
        name: "bootstrap",
        src: ["node_modules/bootstrap/scss/**/*"],
        type: "sass",
        active: true
      }, {
        name: "fontawesome",
        src: ["node_modules/@fortawesome/fontawesome-free/scss/**/*"],
        type: "sass",
        active: false
      }, {
        name: "fontawesome",
        src: ["node_modules/@fortawesome/fontawesome-free/css/all.min.css"],
        type: "css",
        active: true
      }, {
        name: "weathericons",
        src: ["node_modules/weathericons/sass/**/*"],
        type: "sass",
        active: false
      }, {
        name: "weathericons",
        src: ["node_modules/weathericons/css/*.min.css"],
        type: "css",
        active: false
      }
    ]
  },
  webfonts: {
    vendor: [
      {
        name: "fontawesome",
        src: ["node_modules/@fortawesome/fontawesome-free/webfonts/**/*"],
        active: true
      }, {
        name: "weathericons",
        src: ["node_modules/weathericons/font/**/*"],
        active: false
      }
    ]
  }
};


////////////////////////////////////////////////////////////////////////
// TASKS
////////////////////////////////////////////////////////////////////////
function cleanBuild() {
  return src('build', {
      read: false, 
      allowEmpty: true
    })
    .pipe(clean());
}

function cleanVendorScripts() {
  return src('src/scripts/vendor', {
      read: false, 
      allowEmpty: true
    })
    .pipe(clean());
}

function copyVendorScripts(done) {

  var sources = config.scripts.vendor.actives();

  var doneCounter = 0;
  function incDoneCounter() {
    doneCounter += 1;
    if (doneCounter >= sources.length) {
      done();
    }
  }

  sources.forEach(source => {
    source.src.forEach(ppp => {
      src(ppp)
        .pipe(dest("src/scripts/vendor/" + source.name + "/"))
        .pipe(synchro(incDoneCounter));
    });
  });
}

function buildVendorScripts(done) {
  return src('src/scripts/vendor/**/*.js')
    .pipe(flatten())
    .pipe(dest('build/scripts/vendor'));
}

function cleanVendorStyles() {
  return src(['src/styles/vendor', 'src/sass/vendor'], {
      read: false, 
      allowEmpty: true
    })
    .pipe(clean());
}

function copyVendorStyles(done) {

  var sources = config.styles.vendor.actives();

  var doneCounter = 0;
  function incDoneCounter() {
    doneCounter += 1;
    if (doneCounter >= sources.length) {
      done();
    }
  }

  sources.forEach(source => {
      if (source.type === "sass") {
        source.src.forEach(ppp => {
          src(ppp)
            .pipe(dest("src/sass/vendor/" + source.name + "/"))
            .pipe(synchro(incDoneCounter));
        });
      } else if (source.type === "css") {
        source.src.forEach(ppp => {
          src(ppp)
            .pipe(dest("src/styles/vendor/" + source.name + "/"))
            .pipe(synchro(incDoneCounter));
        });
      }
  });
}

function buildVendorStyles() {
  return src('src/styles/vendor/**/*.css')
    .pipe(flatten())
    .pipe(dest('build/styles/vendor'));
}

function vendorSass() {
  return (
    src(["src/sass/vendor/**/*.scss"])
    .pipe(
      sass
      .sync({
        outputStyle: "expanded"
      })
      .on("error", sass.logError)
    )
    .pipe(autoprefixer())
    //.pipe(concat("vendor.min.css"))
    .pipe(dest("src/styles/vendor"))
  );
}

function buildThemeScripts() {
  return src('src/scripts/theme/*.js')
    .pipe(flatten())
    .pipe(dest('build/scripts/theme'));
}

function cleanThemeStyles() {
  return src('src/styles/theme', {
      read: false, 
      allowEmpty: true
    })
    .pipe(clean());
}

function themeSass(done) {
  return (
    src(["src/sass/theme/**/*.scss"])
    .pipe(
      sass
      .sync({
        outputStyle: "expanded"
      })
      .on("error", sass.logError)
    )
    .pipe(autoprefixer())
    //.pipe(concat("vendor.min.css"))
    .pipe(dest("src/styles/theme"))
  );
}

function buildThemeStyles(done) {
  return src('src/styles/theme/**/*.css')
    .pipe(flatten())
    .pipe(dest('build/styles/theme')); 
}

function cleanVendorWebfonts() {
  return src("src/webfonts/vendor/", {
      read: false,
      allowEmpty: true
    })
    .pipe(clean());
}

function copyVendorWebfonts(done) {
  
  var sources = config.webfonts.vendor.actives();

  var doneCounter = 0;
  function incDoneCounter() {
    doneCounter += 1;
    if (doneCounter >= sources.length) {
      done();
    }
  }

  sources.forEach(source => {
    if (source.active === true) {
      source.src.forEach(ppp => {
        src(ppp)
          .pipe(dest("src/webfonts/vendor/" + source.name + "/"))
          .pipe(synchro(incDoneCounter));
      });
    }
  });
}

function buildVendorWebfonts() {
  // Copy all webfonts to build/webfonts
  // No jerarquic structure is needed, since webfonts must be in its own folder
  return src("src/webfonts/vendor/**/*.*")
    .pipe(flatten())
    .pipe(dest("build/webfonts"));
}

function buildHtml() {
  return src("src/html/**/*.*").pipe(dest("build"));
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

// Add a new array functionallity that offer us only resources maked as "active=true"
Array.prototype.actives = function() {
  return this.filter(function (value, index, self) {
    return self.indexOf(value) === index && value.active === true;
  });
};

////////////////////////////////////////////////////////////////////////
// COMPLEX TASKS
////////////////////////////////////////////////////////////////////////
const _clean                = parallel(cleanBuild, cleanVendorScripts, cleanVendorStyles, cleanVendorWebfonts);
const _buildVendorScripts   = series(cleanVendorScripts, copyVendorScripts, buildVendorScripts);
const _buildVendorStyles    = series(cleanVendorStyles, copyVendorStyles, vendorSass, buildVendorStyles);
const _buildThemeScripts    = buildThemeScripts;
const _buildThemeStyles     = series(cleanThemeStyles, themeSass, buildThemeStyles);
const _buildVendorWebfonts  = series(cleanVendorWebfonts, copyVendorWebfonts, buildVendorWebfonts);
const _scripts              = parallel(_buildVendorScripts, _buildThemeScripts);
const _styles               = parallel(_buildVendorStyles, _buildThemeStyles);
const _webfonts             = _buildVendorWebfonts;
const _html                 = buildHtml;
const _build                = series(parallel(_scripts, _styles, _webfonts), _html);

////////////////////////////////////////////////////////////////////////
// PUBLIC TASKS
////////////////////////////////////////////////////////////////////////
exports.build     = _build;
exports.clean     = _clean;
exports.default   = _build;