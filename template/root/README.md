## 环境安装


```
tnpm install @ali/ctool -g
tnpm install bower -g
tnpm install weinre -g
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
* ctool task [name]  执行glupfile 中自定义的其他对应

	

## 发布`awp平台`

第一步：安装 `ctool-awp`，如下：

```
sudo tnpm install -g  @ali/ctool-awp
```

第二步：对awp平台进行初始化配置，执行以下命令：

```
ctool-awp c 配置 
ctool-awp d //日常环境
ctool-awp r //预发环境
ctool-awp p //线上环境，需要将git上的代码发布到publish分支，不然ctool将无法获取线上cdn的js 和 css文件地址而导致失败
```


### [tools 文档 地址](http://groups.alidemo.cn/cm/doctoolspublish/index.html)
### tools服务与技术交流  1455030646





# 业务介绍

## 首页业务逻辑图
## list业务逻辑介绍

# 重点和技术点介绍


# 项目成员
* PD： 马云
* 设计：马云
* 交互：马云

* 测试：马云
* 开发：马云

# 作者
<%=author%> <%=email%>

