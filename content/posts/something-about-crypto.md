---
title: 对加密算法的一些思考
date: 2022-03-01 20:01:13
tags: 
    - 系统设计
categories:
    - Go
---

## 密码加密

>   你还在使用MD5来对数据进行加密吗，或者直接将用户密码原封不动放在数据库中吗？那么你的系统可能会成为下一个Facebook，使得成千上万的用户信息泄漏。

最近重构项目使得我重新审视了一下之前对应用的加密方式，就是直接使用MD5将数据进行一次Hash，然而现在的MD5早就不是一个安全的加密方式了。

![image-20220124001009699](https://yili979.oss-cn-beijing.aliyuncs.com/img/image-20220124001009699.png)

所以在对项目重构中，我打算使用更为安全的SHA-256的加密方式：

![image-20220124000951544](https://yili979.oss-cn-beijing.aliyuncs.com/img/image-20220124000951544.png)

那么就来看一看如何使用golang来对一段密码字符串进行加密操作吧！

首先golang标准库中提供了一系列的算法来进行加密操作，首先是基础的加密库

比如如果想要使用sha256，直接调用标准库就可以直接得到结果：

```go
package main

import (
    "crypto/sha256"
    "fmt"
)

func main() {
    h := sha256.New()
    h.Write([]byte("hello world\n"))
    fmt.Printf("%x", h.Sum(nil))
}
```

但是由于SHA-256仍然无法避免通过🌈彩虹表的形式来反推得到Hash之前的值，所以Golang又提供了一些现成的方式（密码大牛研究出来的一些更高层次的算法）：

>   golang官方将一些新特性的功能放在了golang.org/x的包下（原因是可能无法向前兼容过多版本，同时可能存在一定的BUG）

![image-20220124145946001](https://yili979.oss-cn-beijing.aliyuncs.com/img/image-20220124145946001.png)

这些算法是基于基础的Hash来针对性的优化，以得到更好的结果。

这里我打算采用Bcrypt算法来对密码进行加密操作：

标准库中存在着Bcrypt所提供的两个方法，可以直接使用进行调用操作。

```go
// GenerateFromPassword returns the bcrypt hash of the password at the given
// cost. If the cost given is less than MinCost, the cost will be set to
// DefaultCost, instead. Use CompareHashAndPassword, as defined in this package,
// to compare the returned hashed password with its cleartext version.
func GenerateFromPassword(password []byte, cost int) ([]byte, error) {
   p, err := newFromPassword(password, cost)
   if err != nil {
      return nil, err
   }
   return p.Hash(), nil
}

// CompareHashAndPassword compares a bcrypt hashed password with its possible
// plaintext equivalent. Returns nil on success, or an error on failure.
func CompareHashAndPassword(hashedPassword, password []byte) error {
   p, err := newFromHash(hashedPassword)
   if err != nil {
      return err
   }

   otherHash, err := bcrypt(password, p.cost, p.salt)
   if err != nil {
      return err
   }

   otherP := &hashed{otherHash, p.salt, p.cost, p.major, p.minor}
   if subtle.ConstantTimeCompare(p.Hash(), otherP.Hash()) == 1 {
      return nil
   }

   return ErrMismatchedHashAndPassword
}
```

然后编写一个测试类来进行测试：

```go
package test

import (
    "fmt"
    "golang.org/x/crypto/bcrypt"
    "log"
    "testing"
)

func TestHash(t *testing.T) {
    // 输入密码 获取 hash 值
    pwd := []byte("123456")
    hash := hashAndSalt(pwd)
    // 再次输入密码验证
    pwd2 := []byte("123456")
    pwdMatch := comparePasswords(hash, pwd2)
    fmt.Println("Passwords Match?", pwdMatch)
}


func hashAndSalt(pwd []byte) string {
    hash, err := bcrypt.GenerateFromPassword(pwd, bcrypt.MinCost)
    log.Println("hash:",string(hash))
    if err != nil {
        log.Println(err)
    }
    return string(hash)
}

func comparePasswords(hashedPwd string, plainPwd []byte) bool {
    byteHash := []byte(hashedPwd)

    err := bcrypt.CompareHashAndPassword(byteHash, plainPwd)
    if err != nil {
        log.Println(err)
        return false
    }
    return true
}
```

这样就仅仅花费数行代码就实现了一个巨大的痛点！
