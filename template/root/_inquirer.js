/**
 * Created by jianlin.zjl on 15-4-2.
 */
var exec = require('child_process').exec;
module.exports = {
  prompts:[
    {
      type: 'input',
      name: 'group',
      message: '该项目所属 gitlab 上的组',
      default: 'cm'
    }/*,
    {
      type: 'input',
      name: 'csstype',
      message: 'choose the type of the stylesheet：css|less|sass (css default)',
      default: 'css'
    }*/
  ],
  end: function(data,cb){
    var data = data || {};
    data.author = '';
/*    if ('tb' === data.group && !/^m\-/.test(data.name)) {
      // 校验仓库名是否正确
      console.error('你的仓库名不符合命名规范，进程已终止，请联系你的主管或者释然修改 git 仓库名为 m-xxx 的形式！！');
      process.exit();
    }*/
    exec('git config --list', function (err, stdout, stderr) {
      var reg = /user\.name=([^\n]+)\nuser\.email=([^\n]+)/,
        match = stdout.match(reg);
      if (match) {
        data.author = match[1];
        data.email = match[2]
      }
      cb && cb(data);
    });
  }
}