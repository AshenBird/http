# @mcswift/http

> WIP  
> 该模块因设计目的问题，存在破坏性变更的风险。

## 写在前面

在团队种推广使用 TS 后，我面临了一个似乎无关痛痒又不想无视的问题————接口类型安全。理想情况下，用graphql配合相应的类型生成工具就可以完美解决这个问题。

但实际上 graphql 的推广，是一种跨端推广。在我的实际业务种，在后端推广 graphql 的收益并不能覆盖成本，尤其是团队种后端同学的学习成本。这是团队本身的局限性。

个人项目中，由于项目体量小，我大可以采用类似 midway 这种前后端一体化框架，来实现接口的类型安全。如果，前后端都是采用 ts 进行开发，并采用 monorepo 的工作流。也大可以采用 tRPC 这个项目，来进行接口类型安全的保证。

最终，我编写了这个模块，给前端类型安全带来一定的保障。

事实上，这个模块作为妥协的产物，有许多问题。比如一次定义了所有接口，会导致在前端文件中暴露非必要接口路径。虽然考虑过采用动态引入结合 tree shake 的办法来规避，但这种办法极大的依赖于最终项目场景的构建工作流。

一个继续妥协的办法就是将单一接口的定义，与全局配置进行分离，并在调用时，通过依赖注入的方式，加载全局配置。

一个理想中的方案，是采用 monorepo 工作流，在目录中存储一组开发时接口定义，用以生成类型文件，进行接口约束。并且生成每个接口的单独导入。这样更有利于最终的分入口 tree shake 。至于后端，最好可以有一个自动化生成工具，来生成接口定义文件，或者逆向的由接口定义文件初始化接口实现。但听上去，这套逻辑 graphql 就可以实现。

一点延申的思考就是，在复杂项目中，是不是也可以利用这套逻辑，定义前端数据缓存层，进行一定程度上的节流。

对这些问题的研究，我觉得个人还不够深入，还是要通过研究更多项目，进行更多思考，寻找在不同复杂度，不同类型项目上，各自对应的解决方案。如果有现成的项目，可以利用是再好不过的。

## 简介

该模块的主要作用是在无法使用 Graphql 的场景提供类型内容安全的接口集约化定义。
如果，有条件的情况，强烈建议使用 Graphql 避免像这样，一次性定义所有接口。
未来，理论上，可能会提供一种简单的，松散的类型安全的接口调用模式，避免一次性进行所有接口的定义。
现在的模式，本质上讲是源自设计之初，为了服务的项目本身的一些需求，才进行了现在的过度设计。

事实上现在的模式，是一种本末倒置，并不适合大部分场景使用，

这种本末倒置，导致作者也一直被类型体操折磨————当然，也有作者本人想要尝试些过去没有尝试过的特性有关。

长期维护目标是，尝试一种通用的，松散的类型安全模块。

目前使用的实际请求发起者是 axios，未来会进一步去掉对 axios 的依赖，根据环境采用不同的请求方式。

随着装饰器特性进入 stage3 ，且 typescript 最新版本已经支持与 EcmaScript 标准兼容的装饰器特性，未来内部实现可能会进一步采用装饰器特性来进行解耦，并提供装饰器接口，便于用户定义接口等行为。

## 开始使用

### 兼容性

该项目使用了 Proxy 特性，请根据 caniuse 判断是否与你需要的环境兼容。

该项目理论上讲支持 node 环境。

因为目前还处于一个破坏性开发周期，暂时不列出具体的版本兼容性。

### 简单使用 demo

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

// createHttp 接受一个配置对象作为参数，这个配置对象是基于 axios 配置项进行扩展的，axios 的配置项都可以接受，并传递给 axios
const httpServer = createHttp({
  /**
   * hooks
   * 自定义选项
   * 可以用来自定义全局钩子，每个请求都会调用
   */
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
  /**
   * baseURL
   * axios 选项
   * @default "/"
   */
  baseURL: "/api",
  /**
   * APIs
   * 自定义选项
   * 预定义接口
   */
  APIs: {
    // 定义一个名为 test 的接口，访问路径为 /test/a 这个接口预期会返回一个 {test:"test"} 数据。 
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
  /**
   * modules
   * 自定义选项
   * 预定义模块
   */
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
        info: defineAPI<any, {foo:"bar"}>({
          method: "GET", 
        }),
      },
    },
  },
  /**
   * headers
   * axios 选项
   */
  headers: {
    "X-Requested-With": "XMLHttpRequest",
  },
});

// 可以这样直接执行接口
// result1:{ test: "test" }
const result1 = httpServer.test();

// result2: unknown
const result2 = await httpServer.user.test();

// result3: any
const result3 = httpServer.user.info({foo:"bar"});

// 你可以这样检查原始 api 配置, 理论上你应该把它当作一个只读参数，我暂时没有做固封操作（只是目前懒得弄了）
console.log(httpServer.httpServer.user.info.options) // { method: "GET" }

export default httpServer;
```
