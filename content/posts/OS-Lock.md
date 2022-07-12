---
title: 操作系统|Lock

date: 2022/3/23 20:57:00

updated: 2022/3/23 20:57:00

categories: 
 - 基础

tags: 
 - os 
 - 系统设计
---
## Lock

最近开始学习MIT的操作系统课程，发现很多东西以前理解的都不算太深刻，基本只是了解了一些皮毛然后会调一些API而已。

了解Java中对锁的实现的同学一般都知道一个概念，就是 `锁升级` 

![image-20220310204702651](https://yili979.oss-cn-beijing.aliyuncs.com/img/202203102047915.png)

  之所以会出现锁升级的概念是因为Java直接在语言级别增加了几个关键字来对一个代码块进行加锁处理，同时在每个对象头中都维护一个MarkWord（不同位数的操作系统大小不同），通过标记这个MarkWord来对锁进行升级操作，比如在轻量级锁的状态也就是自旋的状态下，当自旋的次数超过一定的次数时会转换对象头的状态机，转为重量级锁的状态，具体将mentor的锁的地址加入到这个MarkWord上，这样就完成了一次锁的升级。

![ed00955bbfbeac172f0095d5c21eee20](https://yili979.oss-cn-beijing.aliyuncs.com/img/202203102308670.png)

Java中的锁机制基本只会是这一种编程语言的特例，因为这种锁实现真的太怪了，同时Java中的锁基本都是可重入锁，一般来说锁的功能越多意味着这个锁的性能越差（虽然不能唯性能论，但是Java并没有在易用性和性能方面进行取舍）同时在Jdk1.5之后又实现了一个Lock接口来对资源进行管理，也就是我们在其他语言中常常使用的TryLcok和UnLock机制，导致在多线程这方面的语言实现真的是云里雾里，可能许多同学在网上看见所谓的面试圣经，问你Java的锁机制什么还有Java的MarkWord实现之类云云。但是这个设计真的是仅仅针对JVM虚拟机中的处理方式，在别的场景下并没有任何通用性，到最后不过是背一些别人的设计理念而没有自己的一套思想，这真的不是一件好事，与其花时间背这个MarkWord的每个比特是怎样实现的不如多了解一些锁的设计理念，比如如果实现一个乐观锁，自旋锁在长时间自旋的情况下会造成怎样的性能瓶颈，而不是死磕这些所谓的八股。

### Simple-Lock

> 在MIT的OS课程所使用的XV6系统中，存在两种锁形态，分别是spin-lock(自旋锁) 和 sleep-lock(线程执行sleep等待内核唤醒)

让我们看一下XV6的spinlock设计：

从spinlock的结构体中可以看见这个lock只维护3个成员，locked、name、cpu，在这个设计中cpu和name只是一个记录锁的状态和实际操作无关。

```c
struct spinlock {
  uint locked;       // Is the lock held?

  // For debugging:
  char *name;        // Name of lock.
  struct cpu *cpu;   // The cpu holding the lock.
};
```

下面来看一下锁的acquire操作，其实这个acquire操作就是一个循环进行原子操作来将这个locked置为1，如果这个locked是1的话这个原子操作是无法执行的通的，直到这个locked为0才可以得到一个正确的结果。而自旋锁，可以看出来就是在一个while循环中不断的执行这个原子操作直到得到0也就是获得这个锁。

```c
void
acquire(struct spinlock *lk)
{
  push_off(); // disable interrupts to avoid deadlock.
  if(holding(lk))
    panic("acquire");

  // On RISC-V, sync_lock_test_and_set turns into an atomic swap:
  //   a5 = 1
  //   s1 = &lk->locked
  //   amoswap.w.aq a5, a5, (s1)
  while(__sync_lock_test_and_set(&lk->locked, 1) != 0)
    ;

  // Tell the C compiler and the processor to not move loads or stores
  // past this point, to ensure that the critical section's memory
  // references happen strictly after the lock is acquired.
  // On RISC-V, this emits a fence instruction.
  __sync_synchronize();

  // Record info about lock acquisition for holding() and debugging.
  lk->cpu = mycpu();
}
```

如果想要了解sleep-locks，可能需要了解一下线程调度方面的知识，因为sleep-locks的需要依赖线程调度来进行实现，下面是sleeplock在XV6中的结构：

可以看见实现sleeplock还需要一个spinlock来协助，因为我们在对

```c
// Long-term locks for processes
struct sleeplock {
  uint locked;       // Is the lock held?
  struct spinlock lk; // spinlock protecting this sleep lock
  
  // For debugging:
  char *name;        // Name of lock.
  int pid;           // Process holding lock
};
```

下面来看一下在申请sleeplock后会发生什么：

主义sleeplock中的spinlock的作用为防止在同一时间多个线程对sleep-lock中的数据进行修改，导致错误。

```c
void
acquiresleep(struct sleeplock *lk)
{
  acquire(&lk->lk);
  while (lk->locked) {
    sleep(lk, &lk->lk);
  }
  lk->locked = 1;
  lk->pid = myproc()->pid;
  release(&lk->lk);
}
```

所以在sleep-lock的代码段操作中都会想acquire然后再release，在这个区域中实现所需要的功能，可以看见只要这个lock是被锁着的，就会进入sleep函数中，sleep函数位于proc.c代码中，是用户进程中的函数体。

```c
void
sleep(void *chan, struct spinlock *lk)
{
  struct proc *p = myproc();
  
  acquire(&p->lock);
  release(lk);

  // Go to sleep.
  p->chan = chan;
  p->state = SLEEPING;

  sched();

  // Tidy up.
  p->chan = 0;

  // Reacquire original lock.
  release(&p->lock);
  acquire(lk);
}
```

在这里可以看见一个线程方面的锁，因为我们在修改线程的信息时需要保证同步操作，然后可以看见这个进程的state也就是状态机进入了sleep状态，之后调用sched函数，sched函数的核心就是一个线程切换函数，使用这个线程切换函数就直接将用户内核线程的一系列寄存器保存在内存中然后启动CPU的线程调度，这个线程调度便会寻找一个新的Runable状态的线程进行运行，再执行一次线程切换函数将新的线程寄存器加载到CPU中，这样就完成了此线程的sleep并再CPU中实现了一次线程调度。（由于我的语言表达能力较差，可能讲述的不是很清楚，具体可以参考XV6的教程第7章 https://pdos.csail.mit.edu/6.828/2020/xv6/book-riscv-rev1.pdf 关于线程调度方面的知识）

下面的线程切换过程可能会比较清晰明了。

![image-20220311163320943](https://yili979.oss-cn-beijing.aliyuncs.com/img/202203111633101.png)

我们在之前看了一下sleep的实现方式，现在我们来看一下如何将一个正在sleep的线程进行唤醒。由于XV6中对sleeplock设计的比较简略，我们在sleep的时候会将这个lock作为参数加入到sleep中，注意这个lock由于是所有的线程所共享的，所以在多个线程进行sleep的时候，他们加入到sleep中的参数是完全相同的，所以在线程调度器在对lock进行唤醒的时候会按照线性来选择一个sleep状态的线程来进行唤醒。正常情况下可以在这个步骤进行一下优化，比如当等待的线程多的时候使用FIFO的方式来进行线程的等待机制（也就是我们常说的公平），当等待线程比较多的情况下使用饥饿式（非公平），来保证线程的执行速度。

