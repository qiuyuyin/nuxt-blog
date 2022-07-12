---
title: golang基础-3-数组
date: 2021-10-06 21:50:11
tags: 
 - Go
categories: 
  - Go
cover: https://i.loli.net/2021/10/06/muj2EqIY5PxMsZh.jpg
---

# 数组

> 又是老生常谈的数组

之前说的还是有些问题，这个语言不只是变量方面奇怪，各个方面都很奇怪。开发这个语言的人一定是一个特立独行的人吧 bushi）

## 声明和初始化

下面是三种基础新建数组的方式：

```go
var balance [10]float64
var balance = make([]int,10)
var balance = [5]float32{1.0, 1.1, 1.2, 1.3, 1.4}
//可以根据输入的数目来进行创建
var balance = []int{1, 2, 3, 4}
//可以使用对应的索引来进行创建
var balance = []int {4:100}
```

基于以上，可以不指定数组的长度，但是一定要在后面一个大括号说明要加入进来的东西。

## 数组的遍历

数组的遍历可以使用正常的for语句来进行遍历，同时也可以使用range语句来进行遍历。

```go
a := [...]int{12, 78, 50} // ... makes the compiler determine the length
for i,v := range a {
    fmt.Printf(" 第 %d 个是 %d\n", i, v)
}
 第 0 个是 12
 第 1 个是 78
 第 2 个是 50
```

使用range来进行遍历，会给两个值，一个是索引一个是值，可以使用 '_' 来省略 i 或者 v 

## 数组类型

更奇怪了：：：**go的数组是值类型**！！！！

当一个数组指向另一个数组的时候，是直接将数组中的值拷贝进行进去了，而不是将引用进行指向！对另一个数组进行修改是相互不影响的。

## 切片

更奇妙的东西来了。。

上面不是刚说数组是值传递吗，现在就发现了这个切片。

切片是将一个数组的片段提取出来，最终要的是，如果对切片进行修改的话，是和源数组同根的，修改是会相互影响的。

切片的语法：

```go
a := []int{12, 78, 50 ,123,44,123,11}
s1 := a[2:5]
fmt.Println(s1)
s2 := a[:5]
fmt.Println(s2)
s3 := a[2:]
fmt.Println(s3)
print；
[50 123 44]
[12 78 50 123 44]
[50 123 44 123 11]
```

切片的长度是其包含元素的数量，切片的容量是从创建切片开始的底层数组中的元素的数量。

### `append()`

```go
func main() {
    var numbers =  []int{1,2,3}
    printSlice(numbers)

    /* 允许追加空切片 */
    numbers = append(numbers, 0)
    printSlice(numbers)

    /* 向切片添加一个元素 */
    numbers = append(numbers, 1)
    printSlice(numbers)

    /* 同时添加多个元素 */
    numbers = append(numbers, 2,3,4)
    printSlice(numbers)

    /* 创建切片 numbers1 是之前切片的两倍容量*/
    numbers1 := make([]int, len(numbers), (cap(numbers))*2)
    
    /* 拷贝 numbers 的内容到 numbers1 */
    copy(numbers1,numbers)
    printSlice(numbers1)
}

func printSlice(x []int){
    fmt.Printf("len=%d cap=%d slice=%v\n",len(x),cap(x),x)
}
print:
len=3 cap=3 slice=[1 2 3]
len=4 cap=6 slice=[1 2 3 0]
len=5 cap=6 slice=[1 2 3 0 1]
len=8 cap=12 slice=[1 2 3 0 1 2 3 4]
len=8 cap=24 slice=[1 2 3 0 1 2 3 4]


```

可以看出，切片是数组的一个引用，可以对切片进行扩容和复制操作。在扩容的时候，如果原先的数组不满足长度，会进行扩容得到一个新的数组，扩容的机制是：当长度小于1024的时候，进行2倍扩容，但是大于1024的时候进行1.25倍的扩容。

可以看出，这个切片和java中的List相似，不过ArrayList是可以自定义扩容倍数的。在新建的时候将原先的 数组进行复制，然后新建一个更大容量的数组，在复制的时候的是会对性能进行影响的，所以最好确定所需要的容量。

