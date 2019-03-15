'use_strict';

const {src, dest, series, parallel, watch} = require("gulp");

////////////////////////////////////////////////////////////////////////
// TASKS
////////////////////////////////////////////////////////////////////////
function cleanBuild(done) {
  done();
}

function cleanVendorScripts(done) {
  done();
}

function copyVendorScripts(done) {
  done();
}

function buildVendorScripts(done) {
  done();  
}

function copyVendorStyles(done) {
  done();
}

function cleanVendorStyles(done) {
  done();
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
  done();
}

function themeSass(done) {
  done();
}

function buildThemeStyles(done) {
  done();  
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