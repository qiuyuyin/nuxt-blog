---
title: golang基础-2-流程语句
date: 2021-10-06 21:49:50
tags: 
 - Go
categories: 
  - Go
cover: https://i.loli.net/2021/10/06/muj2EqIY5PxMsZh.jpg
---

# 流程语句

## if语句

在Go中，if语句和其他语言的使用方式大致相同，

> 不同点：
>
> - 不需要加括号
> - 可以在if语句中加一个分号，前面的表达式当作常规表达式，后面的表达式作为判断语句

## switch语句

switch语句中，没有break这个说法。

如果哪个语句符合就直接执行那个语句即可。

如果需要继续执行下去，则需要在语句中添加一个fallthrough继续向下执行。

```go
package main

import "fmt"

func main() {
    var grade string
    var marks = 90
    switch marks {
    case 90:
        grade = "A"
    case 80:
        grade = "B"
    case 50, 60, 70:
        grade = "C"
    default:
        grade = "D"
    }
    switch {
    case grade == "A":
        fmt.Printf("优秀!\n")
    case grade == "B", grade == "C":
        fmt.Printf("良好\n")
    case grade == "D":
        fmt.Printf("及格\n")
    case grade == "F":
        fmt.Printf("不及格\n")
    default:
        fmt.Printf("差\n")
    }
    fmt.Printf("你的等级是 %s\n", grade)
}
```

## for语句

> 在go中的判断语句中，并不需要像其他语句那样添加一个括号。

所以在go中的for语句为：

```go
package main

import (  
     "fmt"
)

func main() {  
    for i := 1; i <= 10; i++ {
        fmt.Printf(" %d",i)
    }
}

```

在go中不存在while语句，将for语句的中间拿出来就是一个完整的for语句：

```go
package main

import "fmt"

func main() {
    var i = 0
    for i < 10 {
        i++
        fmt.Println(i)
    }
}
```

## goto语句

由于go是继承C语言的操作，所以在go中保留了goto语句。

使用方式和在C中相同。
