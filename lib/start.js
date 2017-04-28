/**
 * Created by jianlin.zjl on 15-4-16.
 */
var util = require('util');
var cwdPath = process.cwd();
var path = require('path');
var spawn = require('child_process').spawn;
var fs= require('fs');
module.exports = function(options,cb){
  options = util._extend({

  },options||{});
  cb = cb || function(){};
  var args = [];
  args.push(getServerFile());
  options.port && args.push('--port',options.port);
  options.isProxy && args.push('--isProxy',options.isProxy);
  options.isWeinre && args.push('--isWeinre',options.isWeinre);
  args.unshift('--harmony'); //node --harmony 必须相邻
  var server;

  start();

  //改变abc自动重启
  fs.watchFile(path.join(cwdPath,'abc.json'), function (event, filename) {
      server.kill();
      console.log('Server stopped');
      start(['--open',false]);
      console.log('Server started');
  });

  function start(arr){
    var arr = args.concat(arr || []);
    server = spawn('node', arr , {
      cwd: cwdPath,
      env:  process.env,
      stdio: 'inherit' //输出log
    });
    server.on('error', cb);
    server.on('exit', function(code){
      if (code) {
        cb(new Error('start exit with code '+ code));
      } else {
        cb();
      }
    });
  }
};

function getServerFile(){
  var file;
  if(fs.existsSync(path.join(cwdPath,'server.js'))){
    file = path.join(cwdPath,'server.js');
  }else{
    file = path.join(__dirname,'../template/server.js');
  }
  return file;
}
