---
title: golang基础-6-接口
date: 2021-10-06 21:51:03
tags: 
 - Go
categories: 
  - Go
cover: https://i.loli.net/2021/10/06/muj2EqIY5PxMsZh.jpg
---

# 接口

## 形式

哎，在这里看来，接口怕是Go中最难进行操作的，千万不要和Java的接口联系在一起，他们根本就不是一个东西！！！

```go
type Book interface {
    read()
    write()
    getName() string
}

type Novel struct {
    Page int
    Name string
}

func (n Novel) getName() string {
    return n.Name
}

func (n Novel) read() {
    fmt.Println("正在读")
}

func (n Novel) write() {
    fmt.Println("正在写")
}
```

首先在一个文件中对数据进行表示，写了一个接口和一个结构体。

在main中接口可以使用结构中的变量

```go
var b hei.Book
b = hei.Novel{Page: 12, Name: "libai"}
fmt.Println(b)
```

特别需要注意的是，go是通过变量是否大小写，方法是否大小写来判断是否外部的函数是否有权限来进行访问。

## 隐式

如果一个结构实现了所有的接口方法，则不需要显式的将结构赋值给这个接口，直接通过隐式的就可以进行转换，就像java中的多态一样向上转型。

```go
var novel hei.Book = hei.Novel{Page: 123,Name: "yili"}
fmt.Println(novel)
novel.Read()
novel.Write()
fmt.Println(novel.GetName())
```

可以直接进行转化，不需要显示声明（Java就需要声明这个类implement这个接口）这个是不需要的。

## nil

在go中的nil就相当于其他语言的null值，代表这个引用指向为空



-----

## 作为方法和返回值

像结构体一样，接口也可以作为参数和返回值来进行处理。



## 空接口

可以将值赋值进入空接口中，也就是说一个接口可以承载各种类型的值

以下操作是可以进行的，具体内部是如何实现的，还真的不好说。。。。

```go
var in interface{} = nil
in = 1.0
in = new(Circle)
in = "string"
```

同时空接口也是可以作为实参来进行传递的，可以通过判断这个接口是不是nil来进行特定的处理效果。

## 断言

断言是一个特定于接口中使用的一个操作，用来检查这个接口中包含的类型以及是否实现了对应的参数。

- 实现了会返回value和true
- 没有实现则会返回nil和false

如果只接受一个参数的时候，失败是会报错的，所以最好使用两个值来进行接受断言的返回值。

注意如果仅仅使用一个参数的话，会出现以下的错误：

![image-20211006210330344](https://i.loli.net/2021/10/06/3sYSIKvWGocg7my.png)

断言的返回值：

```go
func main() {
    var in interface{} = nil
    in = 1.0
    in = new(Circle)
    in = "string"
    a,b := in.(string)
    fmt.Println(a,":",b)
}
print：
string : true
```

还有一个断言的增强版，也就是go语言中的switch，它可以使用对类型的获取，然后根据类型的不同返回不同的结果。

使用：

```go
func do(i interface{}) {
    switch v := i.(type) {
    case int:
        fmt.Printf("Twice %v is %v\n", v, v*2)
    case string:
        fmt.Printf("%q is %v bytes long\n", v, len(v))
    default:
        fmt.Printf("I don't know about type %T!\n", v)
    }
}

func main() {
    do(21)
    do("hello")
    do(true)
}
```

## 一个特殊的接口

**Stringer**

这个接口相当于Java的Object类中的toString方法，一个结构实现这个方法，在进行print的时候便会通过自己定义的方式来输出这个结构的信息：

```go
type Person struct {
     Name string
     Age  int
}

func (p Person) String() string {
     return fmt.Sprint(p.Name ," : ",p.Age)
}

func main() {
     fmt.Println(Person{Name: "yili",Age: 123})
}
```

这样是默认实现了String方法的。。

如果不使用String，就是直接是原生的结构打印。



