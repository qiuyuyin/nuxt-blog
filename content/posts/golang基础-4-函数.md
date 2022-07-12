---
title: golang基础-4-函数
date: 2021-10-06 21:50:22
tags: 
 - Go
categories: 
  - Go
cover: https://i.loli.net/2021/10/06/muj2EqIY5PxMsZh.jpg
---

# 函数

又是学golang的一天。。

阅读完对函数的介绍，发现GO真的是离天下之大谱。

记下来你会看见

- 不只一个返回值
- 函数的参数倒置
- 无数个参数值

# 😒😒😒😒😒😒

------

## 函数的参数

Go的参数比较反人类（不管什么都比较反人类）

参数的类型在参数的后面，可以省略前面参数的类型，其类型和后面的参数类型相同

```go
func add(x , y int) int {
    return x + y
}
```

### 变参函数

一个函数可以使用多个参数进行调用（这个功能在很多语言中都有，比如JS）

这个变参得到的就是一个特定类型的slice，所以如果你已经有一个slice，可以当作变参进行处理，不过需要在调用的时候加`...`

```go
func sum(nums ...int)  {
    fmt.Println(nums)
    total := 0
    for _, num := range nums {
        total += num
    }
    fmt.Println(total)
}
func main() {
    a := []int{12, 78, 50 ,123,44,123,11}
    sum(a...)

}

[12 78 50 123 44 123 11]
441
```

### 闭包

终于，发现了一个未知的概念。。（其实在JS中也有看见啦）

就是声明一个函数，这个函数本身也可以返回一个函数，这个函数是作为匿名进行传递的。

闭包最关键的就是作用域的问题，返回的子函数是会对调用函数的局部变量之间存在依赖的。可以理解为，在栈中新开辟了另一个栈，这个栈可以调用上一栈中的值（广义上这样理解）。

闭包可以返回一个匿名函数供给其他函数进行使用，父函数中的局部变量会进入到堆中，每次匿名函数对变量的使用是直接在堆中进行调用。由于是在堆中，并且这个匿名函数对i存在引用，所以在堆中的i是不会被清除的。直到这个函数所在作用域终结后，引用消失后才会对i进行清理。

```go
func intSeq() func() int{
    i := 0//由于编译器无法确定i的周期，所以直接将i放到堆上。
    var fun =  func() int { //我估计生成的匿名函数会新建一个动态代码段，当堆匿名函数进行调用的时候会新开辟一个栈，这个栈中保存的有对原有i的引用，就当这样进行
        i += 1//这个i是在堆中进行使用的。
        return i
    }
    return fun
}
```

## 函数的返回值

Go语言的函数返回值可以存在多个，也就是说对函数获取值的时候也是可以获取多个的。

也就是说go的交换函数十分的好写。。。

```go
func swap(x,y int) (int,int) {
    return y,x
}

func main() {
    x := 10
    y := 20
    x,y = swap(x,y)
    println(x,y)
}


```

命名返回值：

可以在函数的返回值声明地方添加一个命名的返回值，直接对这个命名值进行赋值，便可以直接进行返回。

```go
func split(sum int) (x, y int) {
    x = sum * 4 / 9
    y = sum - x
    return
}
```



## 延迟函数

可以使用defe来对函数进行延迟处理》》

也就是说这是异步的一种？？不对，这只是对函数处理顺序的一种改变罢了。我猜测它的内部实现机制是将一个函数的地址放到栈中，当这个函数执行完之后再从栈中拿出地址继续访问。

```go
func main() {
    defer println(1)
    defer println(2)
    defer println(3)
    defer println(4)
    println("我在这")
}

我在这
4
3
2
1
```

## 回调函数

可以将一个函数作为参数传递进入函数中，在这个函数中可以对函数进行调用？？

```go
type FuncType func(int,int) int

func Add(a, b int) int {
    return a + b
}

func Minus(a, b int) int {
    return a - b
}

func Calc(a, b int, fTest FuncType) (result int) {
    println("calc")
    result = fTest(a, b)
    return
}

func main() {
    calc := Calc(2, 2, Add)
    println(calc)
}
```

答案是可以的，通过声明一种类型的函数，通过改变函数中运行的方式可以对函数进行该改变，这是一个典型的函数式编程的思想。

