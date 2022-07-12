---
title: MIT数据库实验
date: 2022-04-03 00:52:53
categories: 
 - 基础
tags: 
 - database
private: true

---

## MIT-Database-lab-0

学习完 CMU 15-455 课程后，对数据库的一些知识点有了更多的了解，同时也看了丁奇老师的 Mysql 45讲，笔者发现自己在数据库上的经验仅限于 后台的 CRUD 以及一些基础概念上的理解，并没有对数据库有更深层次的理解，所以笔者打算花两个星期来完成 MIT 的数据库实验（CMU 实验使用C++来完成，由于笔者没有对C++有过深层次的理解，所以选择了 MIT lab），并在这里做一些经验分享。

这是 MIT 实验的源码地址 [https://github.com/MIT-DB-Class/simple-db-hw-2021](https://github.com/MIT-DB-Class/simple-db-hw-2021)，由于MIT 并没有公开其数据库课程，所以如果想要对数据库课程进行学习可以配合CMU和MIT lab来学习。

lab1: Simple Database

这个lab1是比较简单的，都是一些对数据结构的填空题，就是熟悉一遍 Java 开发的规范（构造器、string()、hashcode()、equal()、迭代器等等) 都是一些机器化工程（体力活），同时也是了解整个数据库体系架构的一个很好的例子。

lab2:SimpleDB Operators

实验的lab2 在lab1所实现数据结构的基础上，增加对数据库上层操作的使用，如果你对数据库存在一些了解，那么这些 关键词 也不会很陌生。诸如 insert delete join filter aggregator（聚合），同时需要完善 HeapFile 中所使用的 insert 和 delete 操作。较lab1 会更偏向设计一些，但基本上还是填空题。

lab3: Query Optimization

了解数据库执行语句过程的同学应该明白，数据库在编译 sql 语句之后会对语句中的操作进行优化，最常见的优化莫过于 join 操作的优化了，因为使用 join 时 会产生大量的笛卡尔积导致在进行 join 时不得不考虑执行的顺序来优化计算量。lab3较前两个实验会存在更多的操作性，同时需要对数学和算法存在一定情况的考量，所以会更难一些，不过实验中所提出的仅仅只是最简单的优化方式，你也可以实现自己的优化方式来更好的预测。

lab4:SimpleDB Transactions

其实lab4中不仅仅存在事务操作，而且需要考虑不同事务之间的并发操作的，同时使用了2PC 以及读写锁，如果你对这方面存在一些知识欠缺，推荐观看 CMU的数据视频，同时观看配套课程的书籍（一个很好的数据库理论书籍） [https://cloud.yili.fit/s/wNSR](https://cloud.yili.fit/s/wNSR) 我保存在了自己的网盘系统中了，可以直接进行下载。
