---
title: 浅析TCMalloc in golang
date: 2022-03-11 19:55:30
categories: 
- Go
tags: 	
  - 内存管理
  - Go
---

## 内存管理

### 分配方法

一般的编程语言存在两种分配方式，一种是线性分配器，另一种是空闲链表分配器。

#### 1.线性分配器

线性分配是一种高效的内存分配方式，但是存在较大的局限性。这种线性分配器来进行处理就是通过维护一个空闲指针，如果一个对象需要分配一个内存，则会通过检查剩余的空闲，然后移动指针得到一片内存空间。

但是这种方式存在较大的局限性，因为当内存进行GC的时候会出现很多的内存碎片，所以在使用线性分配器的时候需要配合具有拷贝特性的垃圾回收器，比如标记压缩、复制回收、分代回收，通过拷贝的方式来对以前的内存碎片进行收集和重新处理。

#### 2.空闲链表分配器

链表，顾名思义，在操作系统的内存管理功能中也存在这种链表的方式来管理内存，当用户程序申请内存时，空闲链表分配器会依次遍历空闲的内存块，找到最为合适的内存块，然后申请资源之后修改链表。

但是由于在分配的时候需要对链表进行遍历，所以时间复杂度为O(N)。在分配时可以选择不同的策略来进行分配：

- 首次适应算法，就是找到最为合适的内存块
- 循环首次适应，从上一次之后再找合适的内存
- 最优适应，遍历全部链表找到最为合适的内存块
- 隔离适应，将不同大小的内存块分为不同的链表，申请内存的时候先找到满足条件的链表。

而Go中使用的就是和隔离适应算法相应的操作。

### 分级分配

TCMalloc是谷歌开发使用C++实现的一种内存分配机制，是相对与C的malloc和C++的new关键字所写的一种分配内存的一套算法。

而Go的内存分配便是参考TCMalloc来对内存进行分配的，但是由于TCMalloc的细节太多，如果想要理解透彻有些难度。所以只需要理解它的大致实现的方式即可。

TCMalloc的思想是将堆中的内存分解为多个层次结构，并且将不同大小的内存块进行区别开，这样可以更好的对内存进行利用而减少内存碎片的出现。

下面来看看Go是如何实现TCMalloc的吧：

#### 1.Span

网络上很多都是先讲解Mcache的实现，才对Span进行介绍，但是我感觉这种方式有些不妥，因为在Go的存储系统中，mcache和mcentel都是依赖span结构来进行建立的，所以最开始还是先了解Span这个数据结构比较好。

首先需要注意的是Span是由多个页来进行组成的，这个页和操作系统中的页不是一个概念，是go在不同操作系统之上的一种取舍，因为可能不同操作系统中的page大小不相同，所以go对page进行了一种设计，这里不进行细说，只要直到它是操作系统中的page的整数倍即可（操作系统中的page是内存管理的一个单元，所以当go在初始化的时候会直接通过系统调用来得到一批内存也就是页，然后go使用这一块内存来进行内存分配）

同时存在这67种类型的span，这67种类型是通过不同大小的Object分割而形成的，这样可以有效的避免由于不同大小内存的存在导致内存空间的浪费。Go单独定义了一个sizeclasses来分割不同种类的span，其中class_to_size 定义的是每个span所分割出来的object大小。class_to_allocnpages定义的是每个span所包含的page大小。

```go
var class_to_size = [_NumSizeClasses]uint16{0, 8, 16, 24, 32, 48, 64, 80, 96, 112, 128, 144, 160, 176, 192, 208, 224, 240, 256, 288, 320, 352, 384, 416, 448, 480, 512, 576, 640, 704, 768, 896, 1024, 1152, 1280, 1408, 1536, 1792, 2048, 2304, 2688, 3072, 3200, 3456, 4096, 4864, 5376, 6144, 6528, 6784, 6912, 8192, 9472, 9728, 10240, 10880, 12288, 13568, 14336, 16384, 18432, 19072, 20480, 21760, 24576, 27264, 28672, 32768}
var class_to_allocnpages = [_NumSizeClasses]uint8{0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 2, 1, 3, 2, 3, 1, 3, 2, 3, 4, 5, 6, 1, 7, 6, 5, 4, 3, 5, 7, 2, 9, 7, 5, 8, 3, 10, 7, 4}
```

比如，go种的内存的最小粒度是8KB，如果将页分成1KB的块，则会分成一个具有8个大小的块。

![img](https://yili979.oss-cn-beijing.aliyuncs.com/img/202203021320266.png)

通过查看源码可以看见这个mspan是一个双向链表节点，每一个mspan可以指向上一个和下一个mspan。同时startAddr表示的是这个内存块的起始地址，通过npages可以得到这个span的总大小。

```go
type mspan struct {
	next *mspan     // next span in list, or nil if none
	prev *mspan     // previous span in list, or nil if none
	list *mSpanList // For debugging. TODO: Remove.

	startAddr uintptr // address of first byte of span aka s.base()
	npages    uintptr // number of pages in span
}
```

mspan：Go中内存管理的基本单元，由一片连续的页来进行组成，同时每个mspan按照规定的单个空间大小进行分割，从8、16、24等一直到页的大小。

![img](https://yili979.oss-cn-beijing.aliyuncs.com/img/202203020110349.png)

#### 2.Mcache

这个Mcache我在最开始看的时候出现了一些理解方面的偏差，我一直在纠结它是如何和下层的mcentral相关联的。直到我扒了一下源码，并且思考了一下多线程情况下的内存分配发生，才算是理解了Mcache的工作方式。

在了解之前先问自己一个问题：

Mache是如何对内存文件进行读取的，当Mcache的内存不够用的时候是如何扩大/更新Mcache所存储的值的？  

这是我最开始感到疑惑的地方，在使用Mcache进行操作的时候到底是直接从mcentral中获取内存然后增加mcache中的内存数量，那如果是直接增加那么为什么要叫这个内存块为cache。

在理解Mcache之前，首先需要知道的是Mcache是为了解决什么问题才提出来的一种方案，通过下图，可以看见不同的线程是拥有不同的Mcache的，假设一种场景，多个线程同时对内存进行申请，如果多个线程同时申请到了同一个内存块了会怎么办，那么多个线程申请得到的内存块是不是就会发生重叠，这个时候就必须在申请内存的时候在内存中添加一个锁，这样才不会发生线程占用内存重复的现象。但是引入锁机制不免就需要浪费一些性能用于维护锁的存在，当系统源源不断的申请大量的小内存时，锁造成的性能损失便会十分明显。

![img](https://yili979.oss-cn-beijing.aliyuncs.com/img/202203041303442.png)

基本上在所有支持GC的语言中都会维护一个线程独占的缓冲区，比如Java同样维护了一个名为TLAB的缓冲区用于内存分配。就像我们在造CPU的时候一般都需要维护三级Cache，在编程语言的设计中，这也是同样的一个道理。

>特别需要注意一点的是，这里的mcache仅仅是解决内存分配的时候加入的一个线程独占机制，并不是这块内存仅仅只能一个线程来进行访问，所以如果这个线程需要被多个线程读写的时候，还是需要维护同步机制来保证这块内存的线程安全。

```go
type mcache struct {
	// The following members are accessed on every malloc,
	// so they are grouped here for better caching.
	nextSample uintptr // trigger heap sample after allocating this many bytes
	scanAlloc  uintptr // bytes of scannable heap allocated

	// The rest is not accessed on every malloc.
	alloc [numSpanClasses]*mspan // 这里为mcache分配了68 * 2 个mspan

	stackcache [_NumStackOrders]stackfreelist

	// flushGen indicates the sweepgen during which this mcache
	// was last flushed. If flushGen != mheap_.sweepgen, the spans
	// in this mcache are stale and need to the flushed so they
	// can be swept. This is done in acquirep.
	flushGen uint32
}
```

需要注意的是mcache在一开始并不会将其内部的所有的mspan全部分配内存，而是保存着一个&emptymspan，当mcache需要进行分配内存的时候才会从从mcentral里申请内存，这个申请的过程是需要加锁的，因为有可能存在多个mcache同时进行申请。

```go
func allocmcache() *mcache {
	var c *mcache
	systemstack(func() {
		lock(&mheap_.lock)
		c = (*mcache)(mheap_.cachealloc.alloc())
		c.flushGen = mheap_.sweepgen
		unlock(&mheap_.lock)
	})
	for i := range c.alloc {
		c.alloc[i] = &emptymspan
	}
	c.nextSample = nextSample()
	return c
}
```

接下来要考虑的一个事情就是如果这个mcache存满了数据应该怎么办，下一次申请内存应该如何进行操作，是直接在这个mspan种申请链表还是直接将现在所持有的mspan和空的mspan进行替换呢？

由于mcache名为cache，所以当其中没有剩余的空间时，我们应该想到的是将这片空间直接进行替换，因为如果是累加的话，当这个数据结构保存太多的数据的时候会出现内存无法进行管理的情况。

下面是macache的refill操作：

```go
func (c *mcache) refill(spc spanClass) {
   // Return the current cached span to the central lists.
   s := c.alloc[spc]

   if uintptr(s.allocCount) != s.nelems {
      throw("refill of span with free space remaining")
   }
   if s != &emptymspan {
      if s.sweepgen != mheap_.sweepgen+3 {
         throw("bad sweepgen in refill")
      }
      mheap_.central[spc].mcentral.uncacheSpan(s)
   }

   s = mheap_.central[spc].mcentral.cacheSpan()
   if s == nil {
      throw("out of memory")
   }

   if uintptr(s.allocCount) == s.nelems {
      throw("span has no free space")
   }

   s.sweepgen = mheap_.sweepgen + 3

   stats := memstats.heapStats.acquire()
   atomic.Xadduintptr(&stats.smallAllocCount[spc.sizeclass()], uintptr(s.nelems)-uintptr(s.allocCount))

   if spc == tinySpanClass {
      atomic.Xadduintptr(&stats.tinyAllocCount, c.tinyAllocs)
      c.tinyAllocs = 0
   }
   memstats.heapStats.release()

   usedBytes := uintptr(s.allocCount) * s.elemsize
   atomic.Xadd64(&gcController.heapLive, int64(s.npages*pageSize)-int64(usedBytes))

   atomic.Xadd64(&gcController.heapScan, int64(c.scanAlloc))
   c.scanAlloc = 0

   if trace.enabled {
      traceHeapAlloc()
   }
   if gcBlackenEnabled != 0 {
      gcController.revise()
   }

   c.alloc[spc] = s
}
```

#### 3.mcentral

和mcache是相对的，我们会注意到mspan的类型存在134种，如何规划这134种mspan呢，直接在大堆种进行规划，那么如何定义数据结构来对不同类型的mspan进行优化呢？GC的过程如果略有不同应该怎么办呢？

这个时候就该mcentral登场了，它的功能是从mheap也就是大堆中申请内存，然后将内存进行分割成不同种类的mcentral，同时这个mcentral中同时包含两个内存管理单元分别是partial和full 分别存储的是包含空闲对象和不包含空闲对象的内存管理单元。

```go
type mcentral struct {
	spanclass spanClass
	partial  [2]spanSet
	full     [2]spanSet
}
```

最经常需要进行考虑的是当mcentral中的内存不够怎么办呢？

这个时候就需要进行扩容，向heap申请更多的内存空间以供使用。

```go
// grow allocates a new empty span from the heap and initializes it for c's size class.
func (c *mcentral) grow() *mspan {
	npages := uintptr(class_to_allocnpages[c.spanclass.sizeclass()])
	size := uintptr(class_to_size[c.spanclass.sizeclass()])

	s, _ := mheap_.alloc(npages, c.spanclass, true)
	if s == nil {
		return nil
	}

	// Use division by multiplication and shifts to quickly compute:
	// n := (npages << _PageShift) / size
	n := s.divideByElemSize(npages << _PageShift)
	s.limit = s.base() + size*n
	heapBitsForAddr(s.base()).initSpan(s)
	return s
}
```

可以看见，申请内存的时候是通过spanclass来调用堆的函数来进行申请，得到一个指定的span，然后通过设定span的limit来再将span的范围来init这个mspan。

#### 4.mheap

mheap的设计可以说是一种非常经典的设计，在go 1.10之前mheap的heap设计是通过spans+bitmap+arena设计，这个时候就很像linux的文件系统的分配方式，比如通过span来标注每个span指针（相当于文件系统中的文件头）bitmap表示每个page上是否已经分配了内存，area就是各个page所占用的内存。

![heap-before-go-1-10](https://yili979.oss-cn-beijing.aliyuncs.com/img/202203051514247.png)

但是在1.10之后go使用稀疏内存的方式来对内存进行管理，由于mheap的字段比较多，所以这里就看一下比较重点的几个内容：

heapArena

```go
	// arenas is the heap arena map. It points to the metadata for
	// the heap for every arena frame of the entire usable virtual
	// address space.
	//
	// Use arenaIndex to compute indexes into this array.
	//
	// For regions of the address space that are not backed by the
	// Go heap, the arena map contains nil.
	//
	// Modifications are protected by mheap_.lock. Reads can be
	// performed without locking; however, a given entry can
	// transition from nil to non-nil at any time when the lock
	// isn't held. (Entries never transitions back to nil.)
	//
	// In general, this is a two-level mapping consisting of an L1
	// map and possibly many L2 maps. This saves space when there
	// are a huge number of arena frames. However, on many
	// platforms (even 64-bit), arenaL1Bits is 0, making this
	// effectively a single-level map. In this case, arenas[0]
	// will never be nil.
	arenas [1 << arenaL1Bits]*[1 << arenaL2Bits]*heapArena
```

arenas（室内封闭篮球场）是一个指针指向的是堆向操作系统申请的内存指针，每个arenas可以包含64MB大小的内存，而每个mheap中可以存在4M个heapArena指针，这样golang理论上可以涉及的内存范围为256TB（在64位Linux系统中）

```go
const (
	pageSize             = 8192                       // 8KB
	heapArenaBytes       = 67108864                   // 64MB
	heapArenaBitmapBytes = heapArenaBytes / 32        // 2097152
	pagesPerArena        = heapArenaBytes / pageSize  // 8192
)

//go:notinheap
type heapArena struct {
	bitmap     [heapArenaBitmapBytes]byte
	spans      [pagesPerArena]*mspan
	pageInUse  [pagesPerArena / 8]uint8
	pageMarks  [pagesPerArena / 8]uint8
	zeroedBase uintptr
}
```

### 小结

在内存分配这个方面golang的实现还是比较有意思的，所以大家在学习的过程中切记不要死记硬背，而是要参考源码来进行理解，更不要死磕概念，按照自己的方式进行理解即可。

### 参考

1. https://blog.learngoprogramming.com/a-visual-guide-to-golang-memory-allocator-from-ground-up-e132258453ed
2. https://draveness.me/golang/docs/part3-runtime/ch07-memory/golang-memory-allocator/#%E4%B8%AD%E5%BF%83%E7%BC%93%E5%AD%98
3. https://golang.design/under-the-hood/zh-cn/part2runtime/ch07alloc/basic/
