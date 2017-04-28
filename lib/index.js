var browserifyJst = require('browserify-jst');
var fs = require('fs');
var path = require('path');
var cwdPath = process.cwd();
var isBower = fs.existsSync(path.join(cwdPath, 'bower.json'));
module.exports = {
  getPaths: function (str) {
    var arr = [];
    str && arr.push(str);
    isBower && arr.push(this.getBowerPath());
    fs.existsSync(path.join(cwdPath,'package.json')) && arr.push('node_modules');
    return arr;
  },
  getBowerPath: function () {
    var bowerPath = '';
    var bowerJson = {};
    var bowerJsonPath = path.join(cwdPath, '.bowerrc');
    fs.existsSync(bowerJsonPath) && (bowerJson = JSON.parse(fs.readFileSync(bowerJsonPath, {encoding: 'utf8'})) || {}) && (bowerPath = bowerJson['directory']);
    return path.join(cwdPath, bowerPath || 'bower_components');
  },
  getTransform: function (option) {
    var arr = [];
    isBower && arr.push(require('debowerify'));
    arr.push(browserifyJst);
    option && option.isDefine && arr.push(require('browserify-rm-define'));
    //option && option.isBabel && arr.push(require('babelify'));
    return arr;
  }
};