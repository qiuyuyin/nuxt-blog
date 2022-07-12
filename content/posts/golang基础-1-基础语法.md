---
title: golang基础-1-基础语法
date: 2021-10-06 21:49:21
tags: 
 - Go
categories: 
  - Go
cover: https://i.loli.net/2021/10/06/muj2EqIY5PxMsZh.jpg
---

# 题外话

如果你想对GO进行安装并使用，直接在go的中文官网下载对应的版本，然后配置以下环境变量，如果需要使用编译器，推荐两个：VScode和Goland

如果使用Goland，可以做到开箱即用，如果使用vscode，则需要在你的GoPath文件夹打开，随意新建一个go文件，然后vscode会提示你安装插件，在国内是无法正常安装的，需要你输入以下的命令：

```shell
go env -w GO111MODULE=on
go env -w GOPROXY=https://goproxy.io,direct
```

输入命令后，直接点击import all即可。之后你便可以愉快的在vscode上使用go进行开发了。

# 基础语法

## 变量

### 单变量声明

我觉得在golang中最反人类的一点就是它对变量的使用，使用JS的形式在最前面加一个var，然后将数据的类型放在最后面。导致这个语言十分的“耐人寻味”。当然了，喜欢的人会特别喜欢，仁者见仁智者见智，不对这个语法做过多的评价，功能强大才是硬道理。

第一种对变量声明的方式：

```go
//var name type
//name = value

var name string
name = "yili"
```

第二种对变量声明的方式：

可以直接对变量进行赋值，编译器会自动判断你输入的类型

```go
var name = "yili"
```

第三种

> 注意：第三种方式只能在函数体中使用，不能作为全局变量进行使用！

基于第二种对变量的类型识别，

可以将var简化掉

```go
name := "yili"
```

### 多变量声明

第一种，以逗号分隔，声明与赋值分开，若不赋值，存在默认值

```go
var name1, name2, name3 type
name1, name2, name3 = v1, v2, v3
```

第二种，直接赋值，下面的变量类型可以是不同的类型

```go
var name1, name2, name3 = v1, v2, v3
```

第三种，集合类型

```go
var (
    name1 type1
    name2 type2
)
```

### 注意事项

> 变量如果声明了没有使用，编译器是会报错的！
>
> （对于这一点，我觉得十分不智能，如果没有使用，在编译阶段直接扔掉不就行了，还要徒增程序员的任务量！）

## 常量

和C、java、ES6 一样，Go中同样存在常量。

### 常量声明

对常量进行声明的时候，是可以将type的值进行省略的。

```go
const a string = "yili"

const a = "yili"

```

同时，常量可以作为枚举出现的，如果一个常量没有被赋值，则它的类型与值和上一行相同

```go
const (    Unknown = 0    Female    Male = 2)
```

### iota

这个东西估计是go工程师闲着没事弄出来的东西。

iota 可以被用作枚举值：

```go
const (
    a = iota
    b = iota
    c = iota
)
```

第一个 iota 等于 0，每当 iota 在新的一行被使用时，它的值都会自动加 1；所以 a=0, b=1, c=2 可以简写为如下形式：

```go
const (
    a = iota
    b
    s
)
```

iota 用法

```go
func main() {
   const (
      a = iota //0
      b        //1
      c        //2
      d = "ha" //独立值，iota += 1
      e        //"ha"   iota += 1
      f = 100  //iota +=1
      g        //100  iota +=1
      h = iota //7,恢复计数
      i        //8
   )
   fmt.Println(a, b, c, d, e, f, g, h, i)
}
```

运行结果：

```go
0 1 2 ha ha 100 100 7 8
```

按照常理来看，iota可以作为这个const枚举的一个索引，对元素赋值就是将它的索引给赋值进去，这样就是否好理解了。

## 基础数据类型

每个语言都要弄一些奇奇怪怪的数据类型，难道我们业界就不能统一以下吗？？？？

- bool
- 数字类型
  - int8,int16,int32,int64,int
  - uint8,uint16,uint32,uint64,uint
  - float32,float64
  - complex64,complex128
  - byte
  - rune
- string

和其他语言简短的数据类型不同，GO的数据类型竟然有如此之多！！！实在令人惊叹不已。

### 1、整数型

- int8 有符号 8 位整型 (-128 到 127) 长度：8bit
- int16 有符号 16 位整型 (-32768 到 32767)
- int32 有符号 32 位整型 (-2147483648 到 2147483647)
- int64 有符号 64 位整型 (-9223372036854775808 到 9223372036854775807)
- uint8 无符号 8 位整型 (0 到 255) 8位都用于表示数值：
- uint16 无符号 16 位整型 (0 到 65535)
- uint32 无符号 32 位整型 (0 到 4294967295)
- uint64 无符号 64 位整型 (0 到 18446744073709551615)

而int和uint会根据平台来赋值类型，在多少位的平台就是多少位的数据类型。

### 2、浮点型

- float32

  IEEE-754 32位浮点型数

- float64

  IEEE-754 64位浮点型数

- complex64

  32 位实数和虚数

- complex128

  64 位实数和虚数

### 3、string

> 在Go中的字符串是通过UTF-8类型的字符文本串

```go
type Person struct {
    Name string
    Age  int
}

func (p Person) String() string {
    return fmt.Sprint(p.Name, " : ", p.Age)
}

func main() {
    fmt.Println(Person{Name: "yili", Age: 123})
}
```

