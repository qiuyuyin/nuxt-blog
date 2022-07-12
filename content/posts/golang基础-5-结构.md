---
title: golang基础-5-结构
date: 2021-10-06 21:50:52
tags: 
 - Go
categories: 
  - Go
cover: https://i.loli.net/2021/10/06/muj2EqIY5PxMsZh.jpg
---

# 结构体

**真的是好久没见过结构这个东西了，不过想想看，对象不过也就是结构的一种表达形式而已，只不过Java把结构给拟物化了而已**

```go
type People struct {
    name string
    age  int
}

func main() {
    p := People{"yili", 123}
    fmt.Println(p)
    p2 := People{}
    p2.age = 123
    p2.name = "yili"
    fmt.Println(p2)
}
```

可以通过People直接新建一个结构体的指引，不得不说真的和Java的new方式挺像的，不过Java的新建方式还是挺多的。就是不知道go如何将结构中的内容进行封装。

## 值传递OR引用传递

由于struct是值类型的，所以作为参数进行传递的时候，只能将它本身的值或者本身的地址进行传递。所以在函数中对传递进来的参数是无法改变的。

```go
func change(people People) {
    people.age = 1
    people.name = "bushi"
}

func main() {
    p2 := People{}
    p2.age = 123
    p2.name = "yili"
    fmt.Println(p2)
    change(p2)
    fmt.Println(p2)
}
{yili 123}
{yili 123}
```

如果想要改变参数，只能将地址进行传递才行。

```go
func change(people *People) {
    people.age = 1
    people.name = "bushi"
}

func main() {
    p2 := People{}
    p2.age = 123
    p2.name = "yili"
    fmt.Println(p2)
    change(&p2)
    fmt.Println(p2)
}
{yili 123}
{bushi 1}
```

## 结构体的嵌套

结构体之间是可以进行嵌套的，如果对一个结构中声明另一个结构则可以通过结构之间进行调用，如果想要将另一个结构加入进来，需要指定是指针类型，不然可能无法改变对应结构的值。

总之，这个可能不是那么容易进行理解，如果你赋值的是一个不带指针的时候，它的内部就是一个值，是无法改变外部类型的值的，因为是进行简单拷贝进来的。但是如果声明一个引用则可以对外部变量进行修改

```go
type Posion struct {
    X, Y int
}

type People struct {
    posion Posion
    name   string
    age    int
}

func main() {
    p := Posion{20, 12}
    people := People{posion: p}
    fmt.Println(p.X)
    people.posion.X = 10
    fmt.Println(p.X)
}

print:
20
20
这个是无法进行修改的，需要将包含的类型改为引用的变量
```

```go
type Posion struct {
    X, Y int
}

type People struct {
    posion *Posion
    name   string
    age    int
}

func main() {
    p := Posion{20, 12}
    people := People{posion: &p}
    fmt.Println(p.X)
    people.posion.X = 10
    fmt.Println(p.X)
}
print:
20
10
发现是可以进行改变的
```

## 导出字段

如果在一个新的包中声明一个首字母大写的结构时，这个结构是可以进行导出处理的，不需要像java那样设置一个public关键字来进行导出。

```go
awesomeProject/src/main.go
import (
    "awesomeProject/src/hei"
    "fmt"
)

func main() {
    poison := hei.Poison{X: 12}
    fmt.Println(poison)
}
```

```go
awesomeProject/src/hei/spec.go
// Poison 只有大写的类型才是可以进行导出的类型
type Poison struct {
    X, Y int
}
```

这样就可以对外部的包进行访问了。

## 方法

在go中是同时存在方法和函数的，他们之间没有本质的区别，唯一的区别就是，方法是包含一个接收者类型的函数。

不要认为方法就不是函数了，其实方法就是一个被简写的函数，将所需要的结构参数放在了前面：

下方的两个是等价的关系！

```go
func (v Vertex) Abs() float64 {
    return math.Sqrt(v.X*v.X + v.Y*v.Y)
}
======================
func AbsFunc(v Vertex) float64 {
    return math.Sqrt(v.X*v.X + v.Y*v.Y)
}
```

差异是，作为一个方法是可以同时接受结构的值和地址的，根据声明的值来进行值操作或者是引用操作：

如果设置的是指针：

即使是传递的是一个值，那么也会进行指针操作

```go
type Circle struct {
    radius float64
}

//该 method 属于 Circle 类型对象中的方法
func (c *Circle) change() {
    c.radius = 1000
}
func main() {
    c1 := Circle{10}
    fmt.Println(c1.radius)
    c1.change()
    fmt.Println(c1.radius)
}
1000
```

相反如果声明的不带指针传递，那么无论传递的是什么都会进行值操作。

```go
type Circle struct{ radius float64 }
//该 method 属于 Circle 类型对象中的方法
func (c Circle) change() {
    c.radius = 1000
}

func main() {
    c1 := &Circle{10}
    fmt.Println(c1.radius)
    c1.change()
    fmt.Println(c1.radius)
}

```

以上的操作为编译器来帮你进行转化的，（为语法糖）







岁的法国发生的

