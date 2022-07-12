---
title: 新手Gopher导包必看
date: 2021-10-10 00:32:52
tags:  
- Go
categories: 
- Go
---

# 新手Go玩家导包必看

简直了简直了，go的导包机制快要把我搞分裂了，如果你是一个go的初学者，一定也会经历下面的阶段。

如果你使用的编辑器是VSCode或则和Goland，则会更便于操作，如果是其他的编译器，步骤和vscode也是差不多的！

那么看好了我将重头开始进行教学：

本教程如果有错误的地方请联系文我的gmail，会进行勘误：qiansongyin@gmail.com

## 1.基于VScode

下面是我们将要执行的程序：

```go
package main

import (
    "fmt"

    sample "github.com/elliotforbes/test-package"
)

func main() {
    fmt.Println("Hello World")
    sample.MySampleFunc()
}
```

这是国外的一个课程实验包，如果你想将它通过go get 进行导入，很快你会发现

```
go get  github.com/elliotforbes/test-package
```

![image-20211009235031083](https://i.loli.net/2021/10/09/SvoMYXQTW1PVAj5.png)

这个时候你最需要做的事就是赶紧百度×

不对是在你的环境中添加一个代理

```shell
go env -w GO111MODULE=on
go env -w GOPROXY=https://goproxy.io,direct
```

https://goproxy.io/zh/ 第三方代理

这是一个为全球的go语言文件提供代理的服务，你可以通过这个代理来对第三方依赖进行下载

> 就好比你在maven中添加一个阿里云镜像可以更快的将依赖进行导入，当你注册镜像之后会发现下载的速度会非常之快。。

get完之后你下载下来的源码总会存在一个地方吧，没错，代理服务为你专门提供了一个地方去保存源码，这个路径在你的{GOPATH/pkg/mod}下：

![image-20211009235727622](https://i.loli.net/2021/10/09/3vlSQ5H8As4J6Kq.png)

如果你想在一个新建的main.go文件中使用这个包，不要急躁，还需要一步操作：

在你的main.go的路径下使用

一定要记牢这个命令！！！！，并且在新建文件之后就立马进行声明

```go
go mod init
```

![image-20211010000641223](https://i.loli.net/2021/10/10/bmotAp5W2CDkqzZ.png)



```powershell
PS E:\go\src\main> go mod init
go: creating new go.mod: module main
go: to add module requirements and sums:
		go mod tidy
```

![image-20211010000226378](https://i.loli.net/2021/10/10/3eRDc6SIwOLhgEb.png)

然后如果你想使用这个包，就直接执行

```shell
go get +你需要的包的地址
```

这里我去执行

```
go get  github.com/elliotforbes/test-package
```

这个虽然之前是执行过的，它是已经下载到你的文件夹中了。

但是现在这个项目是完全访问不到你刚才下载的包的，所以这个时候你要再一次执行这个命令才可以将你这个main.go与之前下载的包相关联起来。

执行完毕之后你的go.mod文件会发生变化，也就是会出现一行

![image-20211010000922797](https://i.loli.net/2021/10/10/T8ALeFqQE2Xym7P.png)

这个就代表你这个包已经对包进行引用了

除此之外还会出现一个go.sum文件

![image-20211010001157873](https://i.loli.net/2021/10/10/m8fo6wykBlh3pxg.png)

这个文件表示你所以依赖的包是否引入go module，

如果项目打了 tag，但是没有用到 go module，为了跟用了 go module 的项目相区别，需要加个 `+incompatible` 的标志。

我们这次导入的包是使用了 go module 的，所以不存在这个标志

```
github.com/elliotforbes/test-package v1.0.0 h1:5YuuDaum0tX2G5EOHzsFm4ZXrsn8K341jgMFcD711WQ=
github.com/elliotforbes/test-package v1.0.0/go.mod h1:FYNdacMBLThsqEOQ5/aiClalhO71JB7kjWdzgNhpbNE=
```

如果没有使用module，则是

```
github.com/elliotforbes/test-package v1.0.0+incompatible h1:5YuuDaum0tX2G5EOHzsFm4ZXrsn8K341jgMFcD711WQ=
github.com/elliotforbes/test-package v1.0.0/go.mod+incompatible h1:FYNdacMBLThsqEOQ5/aiClalhO71JB7kjWdzgNhpbNE=
```

如果我们项目使用了module功能，在生成源文件进行运行的时候，module会根据我们所提供的信息找到对应的文件，然后将文件依赖进行导入。

这个时候写入我们的main.go程序，就可以愉快地使用 go run 来进行解析处理咯！！！！

可以看见我们导入的包被正确导入并使用

```powershell
PS E:\go\src\main> go run "e:\go\src\main\main.go"
Hello World
Version 1.0 of this Function
Hello World
```

## 2、Goland

由于goland是收费的，所以很多事情它已经帮我们做好了。

但是还是有一件事是我们需要做的：**加代理**

下面是我们将要执行的程序：

### 代理

```shell
go env -w GO111MODULE=on
go env -w GOPROXY=https://goproxy.io,direct
```

https://goproxy.io/zh/ 第三方代理

这是一个为全球的go语言文件提供代理的服务，你可以通过这个代理来对第三方依赖进行下载

> 就好比你在maven中添加一个阿里云镜像可以更快的将依赖进行导入，当你注册镜像之后会发现下载的速度会非常之快。。

### 新建文件

在你的goland中新建一个项目

项目会自动生成一个go.mod

然后在项目中添加一个main.go程序，将下面的源码放进去：

```go
package main

import (
    "fmt"

    sample "github.com/elliotforbes/test-package"
)

func main() {
    fmt.Println("Hello World")
    sample.MySampleFunc()
}
```

然后你的导入部分会爆红：

![image-20211010002726752](https://i.loli.net/2021/10/10/WL1SNj2EPqbaoMs.png)

这个时候点击sync导入依赖，在点击后，就可以直接正常的进行使用了。

```shell
go: finding module for package github.com/elliotforbes/test-package
go: found github.com/elliotforbes/test-package in github.com/elliotforbes/test-package v1.0.0
```

你的项目会出现一个sum.go文件，他是链接着module的，所以可以直接导入并进行使用。

![image-20211010002914758](https://i.loli.net/2021/10/10/PAvewbTgoajmqyS.png)

下面是执行出来的结果：

![image-20211010003017264](https://i.loli.net/2021/10/10/ZDiC9TEB4UreyJa.png)
