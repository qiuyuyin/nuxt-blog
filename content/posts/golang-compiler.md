---
title: golang编译原理
date: 2022-01-12 21:55:34
tags: 
  - Go
  - 编译原理
categories: 
   - Go
cover: https://yili979.oss-cn-beijing.aliyuncs.com/img/202201122205879.png
---

## Go编译原理

### 编译前端和编译后端

其实在编程语言的体系中基本都存在这样的一个过程：

由**编译前端**生成中间代码，然后使用**编译后端**对中间代码在运行时进行优化。

学习过Java的同学应该都知道，Java语言会通过javac生成为class文件，然后使用JVM虚拟机运行class文件。javac的过程是先进行词法和语法的分析，然后使用符号表收集变量、类型等定义信息，还要对注解进行解析，进行语义分析（将一些语法糖、重载、变量类型等进行转化），最后将字节码也就是class文件进行输出。

Go语言的编译过程同样是使用这一系列步骤进行操作，不过还是会略有不同。

### 编译过程

> 每一种编程语言都需要对源文件进行编译，然后将源代码编译成机器能够读懂的语言。但是这个编译过程不是一蹴而就的，是需要进行层层转化，才可以将源码编译成功。

而Go语言的编译过程可以分为四个阶段：

- 词法-语法解析
- 类型检查和AST转换
- 通用SSA生成
- 机器码生成

### 1.词法和语法解析

#### 词法分析

Go中进行词法分析，是通过源文件中的scanner.go文件中的结构体来进行实现的：

```go
type scanner struct {
   source
   mode   uint
   nlsemi bool // if set '\n' and EOF translate to ';'

   // current token, valid after calling next()
   line, col uint
   blank     bool // line is blank up to col
   tok       token
   lit       string   // valid if tok is _Name, _Literal, or _Semi ("semicolon", "newline", or "EOF"); may be malformed if bad is true
   bad       bool     // valid if tok is _Literal, true if a syntax error occurred, lit may be malformed
   kind      LitKind  // valid if tok is _Literal
   op        Operator // valid if tok is _Operator, _AssignOp, or _IncOp
   prec      int      // valid if tok is _Operator, _AssignOp, or _IncOp
}
```

可以看见这个结构体中存在，文件的源文件、行数和列数，以及扫描到的token和启用的模式

Token的类型存在很多种，包括操作符，括号，关键字，变量名等：

```go
const (
   _    token = iota
   _EOF       // EOF

   // names and literals
   _Name    // name
   _Literal // literal

   // operators and operations
   // _Operator is excluding '*' (_Star)
   _Operator // op
   _AssignOp // op=
   _IncOp    // opop
   _Assign   // =
   _Define   // :=
   _Arrow    // <-
   _Star     // *

   // delimiters
   _Lparen    // (
   _Lbrack    // [
   _Lbrace    // {
   _Rparen    // )
   _Rbrack    // ]
   _Rbrace    // }
   _Comma     // ,
   _Semi      // ;
   _Colon     // :
   _Dot       // .
   _DotDotDot // ...

   // keywords
   _Break       // break
   _Case        // case
   _Chan        // chan
   _Const       // const
   _Continue    // continue
   _Default     // default
   _Defer       // defer
   _Else        // else
   _Fallthrough // fallthrough
   _For         // for
   _Func        // func
   _Go          // go
   _Goto        // goto
   _If          // if
   _Import      // import
   _Interface   // interface
   _Map         // map
   _Package     // package
   _Range       // range
   _Return      // return
   _Select      // select
   _Struct      // struct
   _Switch      // switch
   _Type        // type
   _Var         // var

   // empty line comment to exclude it from .String
   tokenCount //
)
```

最开始的go语言可能使用的是lex来进行词法解析，但是随着go语言的发展，现在的形态是通过自己的语言来对自己进行解析。当然cmd包下的内容一定是提前就被解析过了，不然也不可能使用自己来对自己进行解析。

可能词法解析的过程有些晦涩，简而言之就是：

通过内置解析函数将源文件解析为token格式的结构体。

#### 语法解析

语法解析的过程是基于词法解析来进行的，所以进行语法解析的也就是对词法解析生成的token序列来进行解析。

由于这个的过程非常晦涩，又有特别多的专业名词，还没学习过编译原理的我觉得十分痛苦。😭特别是存在两种解析的模式，分别是文法和分析方法。

文法中定义了常量、变量、类型、函数和方法的语法结构。

分析方法分为自底向上和自顶向下两种方式：

LL(1)为自顶向上下LR(0), LR(1), SLR(1), LALR(1)为自底向上的文法（具体过程请严格参考编译原理课程所讲述的内容）

而Go语言使用的是多数编程语言所使用的LALR(1)来对语法进行解析，使用最右推导加向前查看来对语言进行解析。

### 2.类型检查

使用过Python和Js的同学应该会明白运行时语言的痛苦，每次只有在运行在一个地方才会明白这个程序是有问题的。所以微软开源了Typescript来解决js作为弱类型的一些痛点，使其更适合企业级开发，Python也有一些工具以便于在编译时就发现一些问题。

Go语言同样作为一个强类型的语言，会在编译阶段对每个变量进行类型检查，但是由于Go中存在一个接口interface可以转载任意类型的变量，在对interface进行转化的过程中十分容易出现问题，所以这个时候需要进行动态类型检查，如果无法进行转化则程序会出现崩溃。

通过词法和语法解析会生成一个抽象语法树，在类型检查的时候会遍历抽象语法树中的节点，对每个节点的类型进行检验，如果其中出现语法错误会直接抛出编译器异常，同时去除一些不会被执行的代码行，减少运行时期的工作量，同时也会修改make和new的操作。

主要对切片、哈希、关键字进行类型检查，将其转化为相应的结构，在之后更易于处理。

### 3.中间代码生成

这个中间代码就是类似Java中的class文件，是编译器或者虚拟机所使用的语言，我们将它命名为中间代码。

而Go语言的中间代码是基于SSA包中的代码进行构建的，由于没有深入了解源码，所以对这个过程不是太了解。编译器生成中间代码是我们中国程序员所十分欠缺的一个理论知识。因为我们并没有太多的研究人员投入到编程语言方面的研究，甚至我们国家唯一高可用的操作鸿蒙都是使用的C和Java进行开发，导致可能一大部分在互联网工作的职员对所使用语言的编译过程并不是太过了解，就算了解也可能只是为了准备面试，不会形成自己的观点。

Go语言的中间代码生成远远不是数十行文字就可以解释清楚的，因为这样的一个过程可能是无数大牛积年累月的优化才可能让这样的一个语言成为高可用的编程系统，让成千上万的商用软件得以稳定运行。所以我也只能对这样的一个过程进行简要的概述，具体的细节还是要参考internal包中所使用的源码。

![image-20220112204352570](https://yili979.oss-cn-beijing.aliyuncs.com/img/202201122044677.png)

如果你想查看ASS代码生成的过程，在Linux系统中或者Mac系统中输入以下命令：

```shell
 GOSSAFUNC=hello go build hello.go
```

可以得到一个关于SSA执行过程的Html过程，可以查看SSA编译器是如何通过一系列的过程将source源码转化为SSA类型的文件的。

### 4.机器码的生成

下图为C语言执行的过程：

![C_complie](https://yili979.oss-cn-beijing.aliyuncs.com/img/202201122134673.png)

相同的是，在Go语言中也是需要先将中间代码SSA转化为汇编代码，然后将汇编代码通过汇编器转换为机器码。

比较有意思的是在Go源码包中，对于不同指令集会存在不同的方式来进行编译。

可以看见对于不同的指令集存在不同的方式来进行转化，将汇编语法来使用不同的汇编器，以便于在不同的机器上跑一套源码，实现了全平台运行的性质。

![image-20220112213858768](https://yili979.oss-cn-beijing.aliyuncs.com/img/202201122138728.png)

### 总结

在学习Go语言编译原理这一部分时，由于还没有学习过编译原理这门课程，所以对有些编译过程的过程不是太了解。但是当真正深入了解这个编译过程时，才发现这部分知识根本不是一天两天就能精通的，所以对Go语言的编译过程也只是浅尝辄止，仅仅了解了一些皮毛，但还是收获满满。

从词法和语法解析将源代码转化为语法树，然后使用类型检查来精简和验证语法树，再使用SAA包来将语法树转为中间代码，最后使用OBJ包中的内容将中间代码转为可以再不同平台进行执行的机器语言。

参考：

1.  [Go语言设计与实现](https://draveness.me/golang/docs/part1-prerequisite/ch02-compile/golang-compile-intro/)
2.  [Go 编译器 SSA 中间代码探究](https://oftime.net/2021/02/14/ssa/)
