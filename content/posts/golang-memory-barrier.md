---
title: GC内的屏障技术
date: 2022-04-01 13:52:48
categories: 
 - Go
tags: 
 - GC
 - Go
---



##  GC屏障

> 本篇文章仅对屏障技术做些总结，如果你对屏障技术感兴趣，建议多 Google 几篇文章巩固一下知识，深入了解GC的各种特性

在现代编程语言中，一般都会进行垃圾回收，但是垃圾回收过程中需要将需要回收的对象进行标记，在标记的过程中会出现一定时间的 STW ，会导致整个程序陷入停顿，十分影响性能，所以在 GC 中一般都会使用多线程技术来同步 GC 和 用户程序，但是由于在用户程序进行的过程中会修改内存中对象的引用关系，所以就需要在修改的过程中保障垃圾回收线程的正确运行，这也是屏障技术出现的原因。

### 三色标记

三色标记的过程很简单：

最开始将根节点标记为黑色。

1. 从灰色对象的集合中选择一个灰色对象并将其标记成黑色；
2. 将黑色对象指向的所有对象都标记成灰色，保证该对象和被该对象引用的对象都不会被回收；
3. 重复上述两个步骤直到对象图中不存在灰色对象；

![img](https://yili979.oss-cn-beijing.aliyuncs.com/img/202204011401349.jpeg)

### 屏障

**GC过程中需要保证三色不变性**

- 强三色不变性 — 黑色对象不会指向白色对象，只会指向灰色对象或者黑色对象；
- 弱三色不变性 — 黑色对象指向的白色对象必须包含一条从灰色对象经由多个白色对象的可达路径；

这里想要介绍的是 Go 语言中使用的两种写屏障技术，分别是 Dijkstra 提出的插入写屏障和 Yuasa 提出的删除写屏障。

- 插入写屏障，是在增加一个对象的引用时增加屏障，如果引用增加的对象为白色，将其标记为灰色
- 删除写屏障，是在删除一个对象的引用时增加屏障，如果引用删除的对象为白色，则将其标记为灰色

这两个屏障都保证了在修改内存时保证三色不变性，来使 **标记过程** 正确运行。在旧版本的 Go 中选择使用插入写屏障来保证 并发 执行 的准确性。

那为何在 Go 中还需要启用混合写屏障呢？

在 Go 1.8 之前，Go 采用插入写屏障来解决并发标记，但是由于栈中的变量插入屏障会使得程序的效率大幅降低，所以Go并没有在栈对象的标记过程中插入屏障，这就导致在标记之后，还需要花费大量的时间STW来处理栈中可能增加的引用，在goroutine数量过多的程序中，这个时间可能会在10 ~ 100 ms。

### 混合写

因此在 Go 1.8 版本时提出了使用混合写屏障，就是两种屏障同时使用。

> Go uses a hybrid barrier that combines a Yuasa-style deletion barrier—which shades the object whose reference is being overwritten—with Dijkstra insertion barrier—which shades the object whose reference is being written.

其实现的方式为（详情可见源码 runtime\mbarrier.go）

```go
writePointer(slot, ptr):
    shade(*slot)
    if current stack is grey:
        shade(ptr)
    *slot = ptr
```

其中 slot 为之前这个引用所指向的 object ，ptr 为之后需要指向的对象。shade函数 即将白色的对象转化为 灰色。

在 Go 的官方 design 中提起了 `shade(*slot)` 和 `shade(ptr)` 的作用，希望下面两句话能够帮助你深入了解屏障的真正用处。

注意，我们仅考虑 栈 和 堆 内存交换的特殊性，如果仅在堆内交换，使用 插入写 或 删除写任一屏障即可保证 三色不变性，但是由于 栈 不存在hook ，所以需要特殊关照 栈。

-  `shade(*slot)`prevents a mutator from hiding an object by moving the sole pointer to it from the heap to its stack. If it attempts to unlink an object from the heap, this will shade it.

  也就是说这个方法可以有效的防止 黑色的栈节点引用一个 白色节点

- `shade(ptr)` prevents a mutator from hiding an object by moving the sole pointer to it from its stack into a black object in the heap. If it attempts to install the pointer into a black object, this will shade it.

  同理，可以有效防止堆节点引用一个栈中的白色节点，当然因为 Go 在扫描栈时是 STW 的，所以如果栈节点为黑色，其引用值一定已经上色过，因此不需要保护。

**混合写总结：**

- 消除了 插入写 所导致的重新扫描栈所导致的STW
- 同时可以逐个 stack 进行扫描，不需要STW 来对所有的stack同步扫描
- 针对一个 goroutine 栈来说，是暂停扫的，要么全灰，要么全黑，原子状态切换
- 在并发对象新建的过程中，新产生的对象均标记为黑色

特别注意：

对象引用改变仅发生于 栈和堆 或者 堆和堆 之间，不可能发生在栈和栈之间，因为栈和栈之间不可能出现引用交换。

### **后记**：

由于垃圾回收是一个现代语言课题，所以需要了解掌握的知识很多，建议阅读一些 GC 相关书籍，更加深入了解 垃圾回收的发展以及在不同语言之间的区别，切莫盲目背概念，要将程序和功能进行联想。在参考他人观点尽量选择英文书籍和官方文档，切莫听信一家之言，多多思考。

### 推荐阅读

1. 垃圾收集器 [https://draveness.me/golang/docs/part3-runtime/ch07-memory/golang-garbage-collector](https://draveness.me/golang/docs/part3-runtime/ch07-memory/golang-garbage-collector)
2. Proposal: Eliminate STW stack re-scanning [https://github.com/golang/proposal/blob/master/design/17503-eliminate-rescan.md](https://github.com/golang/proposal/blob/master/design/17503-eliminate-rescan.md)
3. The Garbage Collection Handbook: the Art of Automatic Memory Management[https://book.douban.com/subject/26740958/](https://book.douban.com/subject/26740958/)
4. [https://liqingqiya.github.io/golang/gc/%E5%9E%83%E5%9C%BE%E5%9B%9E%E6%94%B6/%E5%86%99%E5%B1%8F%E9%9A%9C/2020/07/24/gc5.html](https://liqingqiya.github.io/golang/gc/%E5%9E%83%E5%9C%BE%E5%9B%9E%E6%94%B6/%E5%86%99%E5%B1%8F%E9%9A%9C/2020/07/24/gc5.html)
