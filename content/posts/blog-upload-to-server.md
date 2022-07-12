---
title: 前台自动运维小技巧🙃
date: 2022-03-28 18:12:41
categories: 
	- 运维
tags: 
	- 运维 
    - 编程工具
---



## 使用自动化工具部署前台文件

> 你在为每次拖拉文件进入服务器而烦恼吗？你还在使用手动输入命令行的方式来上线项目吗？
>
> 醒醒，现在已经是自动化的时代了，多看看外边的世界吧（笔者也是苦运维久矣，直到发现了自动部署的新天地）

### 一、转战Nuxt

笔者的博客平台刚刚完成从 hexo 到 nuxt.js 自定义转型，毕竟曾经接手过 Vue 项目。

为何抛弃诸如 hexo 和 hugo 这样的自动化博客平台呢？

主要的是有两个原因：

- hexo 在对博客CSS代码的编写不像 nuxt 中那样方便
- 自己开发的页面可选择的方向会更多一些，同时可以巩固一下前端的基础

### 二、自动化部署

想起来之前自己既承担前后端开发的工作，同时也承担部署运维的工作，总是会浪费一大堆的时间来安装各种部署应用。最开始基本是all in docker ，但是用着docker的时候发现，docker 中安装数据库会使得数据库的性能大打折扣，部署前台项目也会加载的异常缓慢，所以到最后基本是徒手安装数据库和静态文件服务。比如对nginx的各种配置，还有添加https的证书，在每次项目迭代的时候都需要手动将编译后的文件拉到服务器上，然后再重启应用（不得不佩服我是如何坚持下去的）

作为个人开发者，手头上有没有自动化部署的平台可以使用（其实是不舍得花钱），不过在这次部署博客的时候，我再也忍受不了手动写shell的痛了😣，所以痛定思痛开始查找自动化部署的方案，我开始了漫长的自动化的实践过程。

**方案**：WebHook + Caddy

其实像 Github 这种代码部署平台都会提供一些工具来对仓库进行维护，比如在 Go 的社区中可以通过 workflow 提供一些 issue 的模板，同时你在 Github 中提交的 issue 也会同步到 Go 的官方社区平台，这些都是可以预见的便利。

![image-20220328195315561](https://yili979.oss-cn-beijing.aliyuncs.com/img/202203281953131.png)

当然 代码平台 所能做到的事情远远不止于此，比如你还可以利用它来自动更新本地仓库，使用 Webhooks功能，在每次项目代码得到更新的时候会向你指定的网站和接口发送调用通知你的应用应该拉取项目文件啦！当然这种功能可以不使用 Github 所提供的方式来进行操作，也可以自建一个监听器来监听项目是否得到更新，如果更新则立即对代码进行pull，比如下面便是设置的 Webhooks 。

![image-20220328205238551](https://yili979.oss-cn-beijing.aliyuncs.com/img/202203282052914.png)

当然仅仅使用Webhooks 是不够的，部署前端项目文件还需要一个文件服务器，最常用的莫属Nginx了，不过在这次部署中我发现了一个宝藏项目，也是一个令我眼前一亮的项目—— Caddy 。

Caddy 是一款使用 Go 语言来构建的可拓展性的服务器平台，其中最使用的功能便是会自动生成一个 ssl 证书，也就是说再也不用经历繁琐的步骤去申请一个证书了，通过使用 Caddy ，它会自动的帮你申请一个证书，同时其配置方式也十分简略，可以使用调用网络 API 的方式来对服务器进行配置，也可以使用 Caddyfile 的形式来对服务器进行配置，同时Caddy 也是支持反向代理的，使用诸如一些单页应用也可以使用 Caddy 来进行部署。

### 三、部署

首先需要在本地建立一个仓库，然后将编译好的前台文件放置到远程的仓库中：

```shell
cd public
git init
git add .
git commit -m "feat: first commit"
git branch -M master
git remote add origin https:// ....
git push -u origin master
```

在此次部署中，由于需要使用到 Caddy 的插件功能，所以需要安装 Go 环境来对Caddy 进行重新编译，得到一个支持远程代码同步更新的应用。

Linux 中安装 Go

```shell
rm -rf /usr/local/go && tar -C /usr/local -xzf go1.~.~.linux-amd64.tar.gz
echo "export PATH=$PATH:/usr/local/go/bin" >> ~/.bashrc
source .bashrc
```

重新编译 Caddy 

```shell
go install github.com/caddyserver/xcaddy/cmd/xcaddy@latest
mkdir caddy
cd caddy
xcaddy build --with github.com/WingLim/caddy-webhook
```

接下来是创建一个 Caddyfile 配置文件，在编译后 Caddy 的同级目录中。

```apl
example.com {
    tls yourmail@example.com
    encode zstd gzip
    root blog
    file_server

    handle_errors {
        @404 {
            expression {http.error.status_code} == 404
        }
        handle @404 {
            rewrite * /404.html
            file_server
        }
    }

    route /webhook {
        webhook {
            repo https://gitee.com/user/repo.git
            branch master
            path blog
            secret yoursecret
            submodule
            type gitee
        }
    }
}
```

然后运行 caddy start 便发现在指定的域名下可以访问到我们所部署的前台项目了。

如果你相对 Caddy 进行一些定制化操作，建议参考 Caddy 所在的官方文档 [https://caddyserver.com/docs/](https://caddyserver.com/docs/)

### 末、后记

当我们去完成一件事情的时候总是需要消耗大量的时间时，就需要思考怎样将事情更加方便的进行解决，而不是继续无意义的体力劳动。

比如我最近就又在头疼多设备之间文件传递的问题，所以可以遇见的几周内，我会搭建起一个 自己部署的 **网盘项目**，敬请期待！

待续
