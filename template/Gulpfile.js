var gulp = require('gulp');
var fs = require('fs');
var clean = require('gulp-clean');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var less = require('gulp-less');
var minifyCSS = require('gulp-minify-css');
var rename = require('gulp-rename');
var util = require('util');
var gUtil = require('gulp-util');
var path = require('path');
var browserify = require('gulp-ctool-browserify');
var preludeStr = fs.readFileSync(path.join(__dirname,'/_prelude.js'),{encoding: 'utf8'});
var ctoolHtmlCompile = require('ctool-html-compile').gulp;
var usemin = require('gulp-usemin');
var argv = require('minimist')(process.argv.slice(2));
var lib = require('../lib/index');
//============ Options ==========//
try {
  var abc = fs.existsSync('abc.json') ? JSON.parse(fs.readFileSync('abc.json', 'utf8')) : {};
  abc.options = abc.options || {};
} catch(e) {
  gUtil.log('Error parse "abc.json"');
  process.exit(1);
}

var options = {
  minify: true,
  buildTo: 'build',
  srcBase: 'src'
};
 options = util._extend(options,abc.options);
 options = util._extend(options,argv || {});
var BUILD_BASE = options.buildTo;
var SRC_BASE = options.srcBase;
var PKG_NAME = options.packageName;
var cwdPath = process.cwd();
var baseSrc = path.join(cwdPath,SRC_BASE);



gUtil.log('src:', gUtil.colors.magenta(SRC_BASE));
gUtil.log('buildTo:', gUtil.colors.magenta(BUILD_BASE));
gUtil.log('minify:', gUtil.colors.magenta(options.minify));


var uglifyOptions = {
  outSourceMap: false,
  output: {
    ascii_only: true
  }
};

var minifyCSSOptions = util._extend({
  keepBreaks: true,
  compatibility: true,
  noAdvanced: true
},options.minifyCSS || {});


var lessOptions = util._extend({
  paths: lib.getPaths(baseSrc)
},options.less || {});



var htmlOptions = util._extend({
  inlineSource: true,
  replacePath: '',
  name: abc.name || '',
  group: abc.group || '',
  version: abc.version || '',
  transform:  function(content,self){
    var appReg = '([\'"]+)\\s?\\/'+options.srcBase+'\\/';
    var stylesReg = /href\s?=\s?(['"]{1})\s?styles\//g;
    var jsReg = /src\s?=\s?(['"]{1})\s?scripts\//g;
    var replacePath = htmlOptions.replacePath || '//g.assets.daily.taobao.net/'+abc.group+'/'+abc.name+'/'+self.getVersion(abc.version)+'/';
    return content.replace(new RegExp(appReg,'g'),function(world,$1){
      return $1 + replacePath
    }).replace(stylesReg,function(w,$1){
      return 'href='+$1+replacePath+'styles/';
    }).replace(jsReg,function(w,$1){
      return 'src='+$1+replacePath+'scripts/';
    })
  } 
});

var browserifyOptions = util._extend(options.browserify || {},{
  debug: false,
  basedir: cwdPath,
  paths: lib.getPaths(baseSrc),
  transform: lib.getTransform(options),
  prelude: preludeStr
});

var globOptions = {
  cwd: SRC_BASE,
  base: SRC_BASE
};

var fatalLevel = options.fatal;

//============ ErrorHandle ==========//

var ERROR_LEVELS = ['error', 'warning'];

// Return true if the given level is equal to or more severe than
// the configured fatality error level.
// If the fatalLevel is 'off', then this will always return false.
// Defaults the fatalLevel to 'error'.
function isFatal(level) {
  return ERROR_LEVELS.indexOf(level) <= ERROR_LEVELS.indexOf(fatalLevel || 'error');
}

// Handle an error based on its severity level.
// Log all levels, and exit the process for fatal levels.
function handleError(level, error) {
  if (error.stack) {
    gUtil.log(level.toUpperCase(), error.stack);
  }

  if (error.plugin) {
    gUtil.log(error.plugin, level.toUpperCase(), gUtil.colors.red(error.message));
  } else {
    gUtil.log(level.toUpperCase(), gUtil.colors.red(error.message));
  }

  if (isFatal(level)) {
    process.exit(1);
  }
}


// Convenience handler for error-level errors.
function onError(error) { handleError.call(this, 'error', error);}
// Convenience handler for warning-level errors.
//function onWarning(error) { handleError.call(this, 'warning', error);}


//============ Tasks ==========//

gulp.task('clean', function () {
  return gulp.
    src(BUILD_BASE, {read: false}).
    pipe(clean());
});


gulp.task('copy', ['clean'], function () {
  return gulp.src(['**/*.eot', '**/*.svg', '**/*.ttf', '**/*.woff','images/{,*/}'], globOptions)
    .pipe(gulp.dest(BUILD_BASE));
});

gulp.task('css', ['clean'], function () {
  // copy css
  return gulp
    .src(['p/**/*.css', 'c/**/*.css','index.css','main.css'], { cwd: SRC_BASE, base: SRC_BASE })
    .pipe(minifyCSS(minifyCSSOptions))
    .pipe(gulp.dest(BUILD_BASE));
});

gulp.task('less', ['css'], function(){
  // compile less
  return gulp
    .src(['p/*/*.less', 'main.less','index.less'], globOptions)
    .pipe(less(lessOptions))
    .pipe(options.minify?minifyCSS(minifyCSSOptions):gUtil.noop())
    .pipe(gulp.dest(BUILD_BASE));
});


gulp.task('jshint', ['clean'], function (){
  if (!options.jshint) {
    gUtil.log('jshint was skiped, you can enable it in abc.json');
    return;
  }
  return gulp.src(['p/**/*.js', 'c/**/*.js'], globOptions)
    .pipe(jshint())
    .pipe(jshint.reporter());
});

gulp.task('script', ['clean', 'jshint'], function () {
  return gulp.src(['p/*/*.js', 'app.js','index.js'], globOptions)
    .pipe(browserify(browserifyOptions))
    .on('error', onError)
    .pipe(options.minify ? uglify(uglifyOptions) : gUtil.noop())
    .pipe(gulp.dest(BUILD_BASE))
});

gulp.task('html', ['clean'], function () {
  return gulp.src(['p/*/*.html','!p/*/*.jst.html','!p/*/*.xtpl.html','index.html','main.html'], globOptions)
    //去除index后缀;
    .pipe(rename(function(path){
      var dirname  = path.dirname;
      if(dirname && path.basename === 'index'){
        var arr = dirname.split('/');
        var i = arr.length -1;
        path.basename = arr[i];
        path.dirname = arr.splice(0,i).join('/');
      }
    }))
  /*  .pipe(usemin({
      css: [options.minify?minifyCSS(minifyCSSOptions):gUtil.noop()],
      js: [options.minify ? uglify(uglifyOptions) : gUtil.noop()]
    }))*/
    .pipe(ctoolHtmlCompile(htmlOptions))
    .on('error', onError)
    .pipe(gulp.dest(BUILD_BASE))
});

gulp.task('build', ['clean','script','html', 'less','jshint', 'css', 'copy']);