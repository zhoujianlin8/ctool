/**
 * Created by jianlin.zjl on 15-4-30.
 */
var util = require('util');
var fs = require('fs');
var koa = require('koa');
var logger = require('koa-morgan').middleware;
var http = require('http');
var path = require('path');
var combo = require('combo-url-parser').middleware;
var serverIndex = require('koa-serve-index');
var rimraf = require('ginit').rimraf;
var os = require('os');
var open = require('open');
var serve = require('koa-static');
var less = require('koa-less-middleware');
var url = require('url');
var browserify = require('browserify-koa-middleware');
var ctoolHtmlMiddleware = require('ctool-html-compile').middleware;
var pacMiddleware = require('koa-pac-middleware');
var htmlList = require('html-list-middleware');
var spawn = require('child_process').spawn;
var argv = require('minimist')(process.argv.slice(2));
var lib = require('../lib/index');
var cwdPath = process.cwd();
var abcPath = path.join(cwdPath,'abc.json');
var preludeStr = fs.readFileSync(path.join(__dirname,'/_prelude.js'),{encoding: 'utf8'});

var abc = {};
if(fs.existsSync(abcPath)){
  abc = JSON.parse(fs.readFileSync(abcPath, {encoding: 'utf8'})) || {};
  if(!abc.options){
    console.log('abc.json 内容格式不对请调整');
    process.exit(1);
  }
}else{
  console.log('未找到abc.json cwd目录可能有问题');
  process.exit(1);
}

var options = util._extend({
  base: cwdPath,
  port: 9000,
  open: true,
  notStart: false,
  disableCombo: false,
  tmpDir: os.tmpdir(),
  srcBase: 'src',
  debug: false,
  isWeinre: false,
  isProxy: false,
  demoPath: 'demo'
}, abc.options || {});
options = util._extend(options,argv);


var baseSrc = path.join(cwdPath, options.srcBase);
var tmpPath = options.tmpDir;
var app = koa();

//清除临时文件
process.nextTick(function () {
  rimraf.sync(tmpPath);
});

//favicon
//app.use(favicon(path.join(__dirname ,'../favicon.ico')));


//资源文件列表
app.use(serverIndex(
  options.base, {'icons': true}
));

//index.html显示 html list
app.use(htmlList(
 
));

//请求资源log
app.use(logger('dev'));

var proxyObj = {
  proxyName: '/ctool_pac',
  port: options.port,
  host: getIPAddress(),
  rules: abc.proxyRules || []
};
//pac 代理
options.isProxy && app.use(pacMiddleware(proxyObj));

//combo
app.use(middleCombo({
  port: options.port
}));

//less
app.use(less(cwdPath, {
    debug: false,
    compress: false,
    sourceMap: false,
    paths : lib.getPaths(baseSrc)
  }
));
//new RegExp(options.srcBase+'\\\/((p\\\/.*)|index|app)\\.js','g')
///src\/((p\/.*)|index|app)\.js$/g
var browserifyOpt = util._extend(options.browserify || {},{
  debug: true,
  grep: new RegExp(options.srcBase+'\\\/((p\\\/.*)|index|app)\\.js','g'), //src/p/ src/index src/app
  basedir: cwdPath,
  transform: lib.getTransform(options),
  paths:  lib.getPaths(baseSrc),
  prelude: preludeStr
});

//处理js
app.use(browserify(cwdPath, browserifyOpt));


var weinreObj = util._extend({
    boundHost: 'localhost',
    httpPort: 8080,
    id: 'anonymous'
  },options.weinreOptions || {});

//处理 html
app.use(ctoolHtmlMiddleware(cwdPath, {
  name: abc.name || '',
  group: abc.group || '',
  version: abc.version || '',
  transform:  function(content){
    if(options.isWeinre){
      var scriptSrc = 'http://' + weinreObj.boundHost + ':' + weinreObj.httpPort + '/target/target-script-min.js#' + weinreObj.id;
      content = content.toString().replace('</body>', '<script src="' + scriptSrc + '"></script></body>'); 
    }
    var reg = '([\'"]+)\\s?\\/'+options.srcBase+'\\/';
    return content.replace(new RegExp(reg,'g'),function(world,$1){
      return $1 + '//'+getIPAddress()+':'+options.port+'/'+options.srcBase+'/';
    }).replace(/(['"])([^'"]*)\/bower_components\//g,function(word,$1,$2){
      return $1+'//'+getIPAddress()+':'+options.port+($2 ||'')+'/bower_component/';
    })
  } 
}));


//代理
app.use(serve(tmpPath));
app.use(serve(cwdPath));

//开启weinre调试
if(options.isWeinre){
  var weinreServer = spawn('weinre',{
    cwd: cwdPath,
    env:  process.env,
    stdio: 'inherit' //输出log
  });
  var weinreError = false;
  weinreServer.on('error', function(code){
    weinreError = true;
    if (code) {
      new Error('start exit with code '+ code);
    }
  });
  setTimeout(function(){
    if(weinreError) return;
    var weinrePath = 'http://' + weinreObj.boundHost + ':' + weinreObj.httpPort + '/client/#' + weinreObj.id;
    open(weinrePath);
    console.log('已打开调试窗口' + weinrePath);
  },200)
}
  

var server = app.listen(options.port, function () {
  if (options.open === true) {
    open('http://127.0.0.1:' + options.port + '/index.html');
  } else if (typeof options.open === 'object') {
    options.open.target = options.open.target || target;
    options.open.appName = options.open.appName || null;
    options.open.callback = options.open.callback || function () {
    };
    open(options.open.target, options.open.appName, options.open.callback);
  } else if (typeof options.open === 'string') {
    open(options.open);
  }
  console.log('start listening on port ' + server.address().port);
  if(options.isProxy){
    console.log('start proxy 请手动设置开启pac代理');
    console.log('pac 地址'+ 'http://'+proxyObj.host+':'+proxyObj.port+proxyObj.proxyName);
    console.log('具体设置操作手册参考')
  }
});


//捕获异常
process.on('uncaughtException', function(err) {
  console.log('uncaughtException: ' + err.message);
  server.on('request', function (req, res) {
    // Let http server set `Connection: close` header, and close the current request socket.
    req.shouldKeepAlive = false;
    res.shouldKeepAlive = false;
    if (!res._header) {
      res.setHeader('Connection', 'close');
    }
  });
});



function middleCombo() {
  var options = arguments;
  return function * (next) {
    yield middleFn(this.req, this.res, options, combo);
    yield next;
  }
}


function middleFn(req, res, options, mod) {
  return function (next) {
    mod.apply(this, options)(req, res, next);
  };
}


function getIPAddress () {
    var ifaces = os.networkInterfaces();
    var ip = '';
    for (var dev in ifaces) {
        ifaces[dev].forEach(function (details) {
            if (ip === '' && details.family === 'IPv4' && !details.internal) {
                ip = details.address;
                return;
            }
        });
    }
    return ip || "127.0.0.1";
};
