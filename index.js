var util = require('util');
var path = require('path');
var fs = require('fs');
var ginit = require('ginit').init;
var template = require('ginit').template;
//var ctoolServer = require('ctool-server');
var Ctool = module.exports;
var cwdPath = process.cwd();
var templatePath = path.join(__dirname,'./template');
var builder = require('./lib/builder');
var start = require('./lib/start');
var spawn = require('child_process').spawn;
var abc = {};
var abcPath = path.join(cwdPath,'abc.json');
fs.existsSync(abcPath) && (abc = JSON.parse(fs.readFileSync(abcPath, {encoding: 'utf8'})) || {});
var options = util._extend({
  srcBase: 'src',
},abc.options || {});
//项目初始化
Ctool.init = function(str){
  if(fs.existsSync(abcPath)){
    console.log('该目录下项目已存在初始失败');
    return;
  }
  var self = this;
  var dir = path.join(templatePath,'/root');
  var isRouter = false;
  var isPage = false;
  if(str === 'router'){
    isRouter = true;
  }else if(!str){
    isPage = true;
  }else{
    dir = str;
  }
  ginit({
    dir: dir,
  },function(){
    isRouter && self.routerInit();
    isPage && self.addPage('index');
    console.log('项目初始成功');
    //bower
    if(fs.existsSync(path.join(cwdPath,'bower.json'))){
      console.log('正在执行 bower install  您可以退出手动执行bower install');
      var bower = spawn('bower',['install'],{
        cwd: cwdPath,
        env: process.env,
        stdio: 'inherit' //输出log
      });
      bower.on('close',function(status){
        if (status == 0) {
          console.log('bower install 成功')
        } else {
          console.error(status,'请手动执行 bower install');
        }
      });
    }
    //npm
    if(fs.existsSync(path.join(cwdPath,'package.json'))){
      console.log('正在执行npm install 您可以退出手动执行npm install');
      var npm = spawn('npm',['install'],{
        cwd: cwdPath,
        env: process.env,
        stdio: 'inherit' //输出log
      });
      npm.on('close',function(status){
        if (status == 0) {
          console.log('npm install 成功')
        } else {
          console.error(status,'请手动执行 npm install');
        }
      });
    }
  })
};
Ctool.routerInit = function(){
 var self = this;
  ginit({
    dir:  path.join(templatePath,'/router'),
    data: getData('index'),
    dist: path.join(cwdPath,'/'+options.srcBase+'/p/'+'index')
  },function(){
    self.addRouter('index');
  })
};
//添加模块
Ctool.addCommon = function(name){
  if(!name) {
    console.log('请输入模块名称');
    return
  }
  if(fs.existsSync(path.join(cwdPath,'/'+options.srcBase+'/c/'+name))){
    console.log('文件已经存在创建失败');
    process.exit(1);
    return;
  }
  var dir = path.join(templatePath,'/c');
  ginit({
    dir: dir,
    data: getData(name),
    dist: path.join(cwdPath,'/'+options.srcBase+'/c/'+name)
  },function(){

  })
};
//添加路由
Ctool.addRouter = function(name,cname){
   if(!name) {
    console.log('请输入模块名称');
    return
  }
  if(fs.existsSync(path.join(cwdPath,'/'+options.srcBase+'/r/'+name))){
    console.log('文件已经存在创建失败');
    process.exit(1);
    return;
  }
  var data = util._extend(getData(name),{rname: name});
  var dir = path.join(templatePath,'/r');
  ginit({
    dir: dir,
    data: data,
    dist: path.join(cwdPath,'/'+options.srcBase+'/r/'+name)
  },function(){

  });
  if(cname && fs.existsSync(path.join(cwdPath,'/'+options.srcBase+'/p/'+cname))){

  }else{
    cname = 'index';
  }
  injectRoute(data,cname);
  injectCss('@import "../../r/' +name+'/index";',cname)
};

Ctool.addData = function(name,type){
/*  var objType = {
    'form': 'form',
    'f': 'form',
    'list': 'list',
    'l': 'list',
    'submit': 'submit',
    's': 'submit',
    'index': ''
  };*/
  type = 'index';
  var data = getData(name);
  var key = data.cameledName;
  var dist = path.join(cwdPath, 'data/' + key + '.json');
  if (fs.existsSync(dist)) {
    console.log('文件已经存在创建失败' + dist);
    process.exit(1);
    return;
  }
  //data
  template({
    file: path.join(templatePath, 'data/' + (type || 'submit') + '.json'),
    dist: dist,
    data: data
  });
  injectData(data);
};

//添加页面
Ctool.addPage = function(name,type){
  if(!name) {
    console.log('请输入页面名称');
    return
  }
  var obj = {
    '-c': 'create',
    'create': 'create',
    '-l': 'list',
    'list': 'list',
    '-e': 'edit',
    'edit': 'edit',
    'index': 'index'
  };
  var ptype = obj[type] || obj['index'];
  var dir = path.join(templatePath,'/p');
  if(fs.existsSync(path.join(dir,ptype))){
    dir = path.join(dir,ptype);
  }else if(fs.existsSync(path.join(dir,'index'))){
    dir = path.join(dir,'index');
  }
  if(fs.existsSync(path.join(cwdPath,'/'+options.srcBase+'/p/'+name))){
    console.log('文件已经存在创建失败');
    process.exit(1);
    return;
  }
  ginit({
    dir: dir,
    data: util._extend(getData(name),{pname: name}),
    dist: path.join(cwdPath,'/'+options.srcBase+'/p/'+name)
  },function(){
    /*if(fs.existsSync(path.join(dir,'/index.html'))){
      template({
        file: path.join(dir,'/index.html'),
        dist: path.join(cwdPath,'/demo/'+name+'.html'),
        data: util._extend(getAbcData(),{
          pname: name
        })
      })
    }else{

    }*/
  })

};

//更新template
Ctool.updateTemplate = function(str){
  if(!str) {
    console.log('请输入需要替换模板地址');
    return
  }
  ginit({
    dir: str,
    copyReplace: true,
    dist: path.join(templatePath)
  },function(){
    console.log('模板更新成功')
  });
};

Ctool.start = start;

Ctool.tasks = builder;


//获取数据
function getData(str) {
  var cameledName, classedName, classname;
  cameledName = changeCameled(str);
  classedName = changeClassed(str);
  classname = classedName.toLowerCase();
  return util._extend(abc, {
    classname: classname, //全小写
    classedName: classedName, //大驼峰
    cameledName: cameledName   //小驼峰
  });


  function changeClassed(str) {
    if (!str) return str || '';
    var arr = str.split(/(_|-|\/|\\)/g);
    arr = arr.filter(function (url) {
      return !/(_|-|\/|\\)/g.test(url)
    });
    var newArr = [];
    arr.forEach(function (item) {
      if (item) {
        newArr.push(item.substr(0, 1).toUpperCase() + item.slice(1));
      }
    });
    return newArr.join('');
  }

  function changeCameled(str) {
    if (!str) return str || '';
    str = changeClassed(str);
    return str.substr(0, 1).toLowerCase() + str.slice(1);
  }
}

function injectCss(str,cname) {
  var file = path.join(cwdPath, options.srcBase+'/p/'+cname+'/index.less');
  if(!fs.existsSync(file)) return;
  var content = fs.readFileSync(file, {encoding: 'utf8'});
  if (content.indexOf(str) === -1) {
    content = content + '\n' + str;
    console.log('file ' + file + ' inject success');
    fs.writeFile(file, content)
  }
}



function injectRoute(data,cname) {
  var file = path.join(cwdPath, options.srcBase+'/p/'+cname+'/index.js');
  if(!fs.existsSync(file)) return;
  var content = fs.readFileSync(file, {encoding: 'utf8'});
  if(content.indexOf('var Route') === -1) return;
  content = rewrite({
    needle: 'var Route',
    splicable: [
      "var "+data.cameledName+"Ctrl"+ " = require('../../r/"+data.rname+"/index');"
    ],
    haystack: content,
    spliceWithinLine: false
  });
  content = rewrite({
    needle: 'router.init',
    splicable: [
      "router.addRoute({",
        "  routeName: '"+data.classname+"',",
        "  title: '"+data.classname+"',",
        "  ctr: "+data.cameledName+"Ctrl",
      "});"
    ],
    haystack: content,
    spliceWithinLine: false
  });
  console.log('file ' + file + ' inject success');
  fs.writeFileSync(file, content)
}

//

function injectData(data) {
  var file = path.join(cwdPath, '/'+options.srcBase+'/c/util/apimap.js');
  if (fs.existsSync(file)) {
    var content = fs.readFileSync(file, {encoding: 'utf8'});
    var arr = [
      data.cameledName + ": {",
        "api: 'mtop.xxx',",
        "v: '1.0'",
      "},"
    ];
    content = rewrite({
      needle: '/*invoke*/',
      splicable: arr,
      haystack: content,
      spliceWithinLine: false
    });
    console.log('file ' + file + ' inject success');
    fs.writeFileSync(file, content)
  }
}

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}

function rewrite(args) {
  // check if splicable is already in the body text
  var re = new RegExp(args.splicable.map(function (line) {
    return '\s*' + escapeRegExp(line);
  }).join('\n'));

  if (re.test(args.haystack)) {
    return args.haystack;
  }

  var lines = args.haystack.split('\n');

  var otherwiseLineIndex = -1;
  lines.forEach(function (line, i) {
    if (line.indexOf(args.needle) !== -1) {
      otherwiseLineIndex = i;
    }
  });

  if ((otherwiseLineIndex >= 0) && (args.spliceWithinLine)) {
    var line = lines[otherwiseLineIndex];
    var indexToSpliceAt = line.indexOf(args.needle);

    lines[otherwiseLineIndex] = line.substr(0, indexToSpliceAt) + args.splicable[0] + line.substr(indexToSpliceAt);

    return lines.join('\n');
  }
  otherwiseLineIndex === -1 && (otherwiseLineIndex = 0);
  var spaces = 0;
  while (lines[otherwiseLineIndex].charAt(spaces) === ' ') {
    spaces += 1;
  }

  var spaceStr = '';
  while ((spaces -= 1) >= 0) {
    spaceStr += ' ';
  }

  lines.splice(otherwiseLineIndex, 0, args.splicable.map(function (line) {
    return spaceStr + line;
  }).join('\n'));

  return lines.join('\n');
}



