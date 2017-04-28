## ctool 工具 

####主要特点

*  browserify commonjs规范 打包js sourceMap调试，另实现兼容define包装与return返回的cmd 规范，从此进入无loader加载器新时代  
*  koa 服务器实现线上线下一致的开发环境，请求资源动态实时打包，响应及时流畅，提前预知问题
*  bower 组件管理 ，另实现了css js 资源引用相对于bower_components目录直接使用  js直接引用组件名称等
*  gulp 打包
*  weinre 手机调试集成
*  ginit  支持自定义模板资源
*  less 
*  html  支持inculde tms区块 ===
*  jst template 
*  代理 pac 

### 安装

```
$ sudo npm install -g ctool

sudo npm  install bower -g  

sudo npm  install weinre -g 

```



### 命令使用
* ctool start weinre 手机调试打开项目（weinre 需要全局安装）
* ctool start proxy 打开代理 （需要将pac设置系统的网络代理）
* ctool start wp 打开代理 + 手机调试（weinre（需要将pac设置系统的网络代理）
* ctool start 开启项目
* ctool build 打包项目
* ctool p [name] [type?] 添加页面
* ctool r [name] [cname?] 添加路由模块
* ctool data [name]  添加模拟数据文件
* ctool c [name] 添加模块
* ctool ut [url]  替换ctool中template文件中自定义内容
* ctool init [url?] 项目初始化 后面参数实现自定义初始化
* ctool init router 项目初始化 项目是index主页面是单页面应用
* ctool task [name]  执行glupfile 中自定义的其他对应命令


### template开发

可以直接fork template 目录代码修改


### 注意node版本要求在0.11.x以上, 请更新到最新稳定版本

#### 如果您目录结构不同或需要更深入自定义比如angluar 您可以fork 该项目进行修改


### bug反馈 zhoujianlin8@gmail.com
### [tools 文档 地址](http://groups.alidemo.cn/cm/doctoolspublish/index.html)
### tools服务与技术交流  1455030646