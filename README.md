# @mcswift/http

> WIP  
> 该模块因设计目的问题，存在破坏性变更的风险。

## 简介

这是一个用于基于 typescript 的客户端 http 接口调用的模式化封装。主要用于在各类项目中预定义接口，并利用 typescript 的能力提供了接口函数的提示功能。

## 开始使用

```typescript
import { createHttp, defineAPI } from "@mcswift/http";

interface HttpBody<
  T = Record<string | number, unknown> | unknown[],
  S = Record<string | number, unknown> | unknown[]
> {
  code: number;
  message: string;
  data: T;
  meta?: S;
}

const httpServer = createHttp({
  hooks: {
    // 全局前置钩子
    before(option) {
      return option;
    },
    // 全局后置钩子
    after(option) {},
    // 全局成功钩子
    async success({ data: body }, options) {
      const { code, message, data, meta = {} } = body as HttpBody;
      if (code >= 400) return Promise.reject(body);
      if (message && !options.meta?.noMessage) {
        alert(message);
      }
      return { data, meta };
    },
    // 全局失败钩子
    async fail(e) {
      let msg = e?.message + "";
      alert(message);
      return Promise.reject(e);
    },
  },
  // 基础路径，默认为 "/"
  baseURL: "/api",
  APIs: {
    // 定义一个名为 test 的接口，访问路径为 /test/a
    test: defineAPI<{ test: "test" }>({
      baseURL: "/test", // 局部重写 baseurl
      url: "/a", // url
      method: "GET", // 声明方法
      meta: {
        noMessage: true,
      }, // 自定义元信息，用于自定义的相关行为
      hooks: {
        fail: async (e) => {
          throw e;
        },
      }, // 接口私有的钩子，跟全局钩子的字段一样
    }),
  },
  modules: {
    user: {
      baseURL: "/user",
      hooks: {
        //...
      },
      APIs: {
        // url: /api/user/test
        test: defineAPI({
          url: "/test", // url
          method: "GET", 
        }),
        
        // 如果没有申明url，则默认直接用模块url请求 url: /api/user
        info: defineAPI({
          method: "GET", 
        }),
      },
    },
  },
  // axios 的所有选项都默认可以使用
  headers: {
    "X-Requested-With": "XMLHttpRequest",
  },
});

// 可以这样直接执行接口
httpServer.test({ test: "test" });
httpServer.user.test();
httpServer.user.info();

export default httpServer;
```

## API
