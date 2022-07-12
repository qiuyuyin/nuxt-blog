---
title: 数据库中的各种锁
date: 2022-03-30 14:53:42
categories: 
 - 基础
tags: 
 - database
 - mutex
private : true
---

## Database Concurrency Control

本篇博客所有观点总结于《 [Database System Concepts](https://cloud.yili.fit/s/wNSR)》（可点击链接下载），如果你想对数据库的并发控制有更深入的了解，推荐精读一下这本书籍。

随着多核时代的到来，并发成为应用中主要提升性能的方式，因此在数据库中通常都会开启多个线程来提升数据库效率，随着并发的使用，如何对并发进行粒度控制成为了各个数据库首要解决的难题。

同时并发控制存在两个维度，分别是在事务级别的并发，一个是系统级别的并发，CMU 的课程中将两种并发分别列为 Lock 和 Latch，可以参考来进行理解。总的来说，支持事务的数据库会在用户层级形成一个并发控制，但是这种控制是需要依赖底层数据库在 读写锁、行级锁、表级锁等更细粒度的锁。所以只要是支持并发的数据库系统均会存在 所谓的 concurrency control ，但是只有在支持事务的数据库引擎中才会对 Locks 层级进行实现。

![image-20220330172338293](https://yili979.oss-cn-beijing.aliyuncs.com/img/202203301723245.png)

如果你还认为比较难理解，那么可以简单的抽象为，Lock 维护用户 事务 级别的并发，Latch 维护底层数据块的并发（诸如 index line 等更细粒度的层级）。

待续。

