import axios, { AxiosError, AxiosInstance, Method } from "axios";

import {
  methods,
  AXIOS_INSTANCE,
  OPTION_RAW,
  API_STORE,
  MODULE_STORE,
  HOOKS,
  ADDON_URL,
} from "./constants";

import {
  APIList,
  APIOption,
  APIOptionRaw,
  F,
  HookNames,
  HooksOption,
  HooksQuery,
  HttpOptions,
  Modules,
  _ApiRaw,
} from "./type";

import { optionSplit, payloadHandle } from "./utils";

// 请求类
export class Http<ApiRaw extends _ApiRaw = {}, ModuleRaw extends Modules = {}> {
  [OPTION_RAW]: HttpOptions<ApiRaw, ModuleRaw>; // 原始配置
  [AXIOS_INSTANCE]: AxiosInstance; // axios 实例
  [API_STORE] = new Map(); // api 记录
  [MODULE_STORE] = new Map(); // 模块 记录
  [HOOKS]: HooksQuery = {
    success: [],
    fail: [],
    before: [],
    after: [],
    beforeTransform: [],
  }; // 全局钩子
  [ADDON_URL] = ""; // 前缀 url 主要用于父子模块

  constructor(options: HttpOptions<ApiRaw, ModuleRaw>, fModule?: Http) {
    const { hooks, modules, APIs, axiosOptions, baseURL, url } =
      optionSplit(options); // 划分配置项

    this[OPTION_RAW] = options; // 保存原始配置

    this[AXIOS_INSTANCE] = (() => {
      if (fModule) {
        return fModule[AXIOS_INSTANCE];
      }
      return axios.create(
        Object.assign(axiosOptions || {}, { baseURL: baseURL || url })
      );
    })(); // 绑定 axios 实例

    this[ADDON_URL] = (() => {
      if (!fModule) return "";
      return fModule[ADDON_URL] + baseURL || url || "";
    })(); // 初始化前缀url

    // 生成当前实例 钩子 队列
    if (fModule && fModule[HOOKS]) {
      for (const p of Object.entries(fModule[HOOKS])) {
        const name = p[0] as HookNames;
        const hookStack = p[1] as HooksQuery[typeof name];
        // @ts-ignore suppress ts:2488
        this[HOOKS][name]?.push(...hookStack);
      }
    }

    // 挂载当前实例自身的钩子队列
    if (hooks) {
      for (const p of Object.entries(hooks)) {
        const name = p[0] as HookNames;
        const hook = Array.isArray(p[1])
          ? p[1]
          : ([p[1]] as HooksOption[typeof name]);
        // @ts-ignore suppress ts:2488
        this[HOOKS][name]?.push(...hook);
      }
    }

    // 挂载 API
    if (APIs) {
      for (const [name, api] of Object.entries(APIs)) {
        const _api = (() => {
          if (typeof api === "function") return api;
          if (typeof api === "boolean" && api) return Http.defineAPI({});
          return Http.defineAPI(api);
        })();
        this[API_STORE].set(name, (_api as F)(this, name));
      }
    }

    // 挂载模块
    if (modules) {
      for (const [name, mod] of Object.entries<HttpOptions<ApiRaw, ModuleRaw>>(
        // @ts-ignore
        modules
      )) {
        this[MODULE_STORE].set(name, createHttp<ApiRaw, ModuleRaw>(mod, this));
      }
    }
  }

  // 定义api函数
  static defineAPI<P, R>(localOption: APIOptionRaw = {}) {
    return <
      ApiRaw extends { [name: string]: F<any, any> },
      ModuleRaw extends Modules
    >(
      $http: Http<ApiRaw, ModuleRaw>,
      name: string
    ): ((payload?: P) => Promise<R>) => {
      const result = new Proxy(
        async (payload?: P) => {
          let result = null;
          const hooks: HooksQuery = {
            success: [],
            fail: [],
            before: [],
            after: [],
            beforeTransform: [],
          };
          const { hooks: localeHooks, ...rest } = localOption;

          // 路径预处理——模块模块api嵌套的实际功能提供者
          hooks.before.push(function urlPreHandle(options: APIOption) {
            const { url, ...rest } = options;
            const _url = (() => {
              if (url && ["http", "https"].some((p) => url.startsWith(p))) {
                return url;
              }
              return `${$http[ADDON_URL]}${url ?? ""}`;
            })();
            return { url: _url, ...rest };
          });

          // HTTP方法预处理
          hooks.before.push(function methodPreHandle(options: APIOption) {
            const { method, ...rest } = options;
            const _method = (() => {
              if (!method && methods.includes(name as Method)) {
                return name as Method;
              }
              if (method && !methods.includes(method)) {
                throw new TypeError(
                  `${name} 接口 method 字段的值，不能作为 method 使用，请使用正确的 Method 字段`
                );
              }
              return method;
            })();
            return { method: _method, ...rest };
          });

          // 从宿主对象中提取钩子队列
          if ($http[HOOKS]) {
            for (const p of Object.entries($http[HOOKS])) {
              const name = p[0] as HookNames;
              const hook = p[1] as HooksOption[typeof name];
              // @ts-ignore suppress ts:2488
              hooks[name]?.push(...hook);
            }
          }
          // 从接口配置种提取钩子队列
          if (localeHooks) {
            for (const p of Object.entries(localeHooks)) {
              const name = p[0] as HookNames;
              const hook = Array.isArray(p[1])
                ? p[1]
                : ([p[1]] as HooksOption[typeof name]);
              // @ts-ignore suppress ts:2488
              hooks[name]?.push(...hook);
            }
          }
          // 将载荷预处理函数推到队尾
          hooks.before.push(payloadHandle);

          // 调用前置钩子队列
          const _option = hooks.before.reduce(
            // @ts-ignore suppress ts:2769
            (a, c) => {
              return c(a);
            },
            { payload, hooks, ...rest }
          ) as unknown as APIOption;

          const { payload: _payload, hooks: _hooks, ...axiosConfig } = _option;

          // 安装载荷
          if (["get"].includes((axiosConfig.method as string).toLowerCase())) {
            axiosConfig.params = _payload;
          } else {
            axiosConfig.data = _payload;
          }

          // 发起请求并收集错误
          try {
            const response = await $http[AXIOS_INSTANCE].request(axiosConfig);
            // 调用 成功钩子队列
            result = _hooks.success.reduce(
              // @ts-ignore suppress ts:2769
              async (a, c) => {
                const r = await c(...(a as [unknown, APIOption]));
                return [r, _option];
              },
              [response, _option]
            ) as unknown as R;
          } catch (e) {
            // 调用 失败钩子队列
            result = _hooks.fail.reduce(
              // @ts-ignore suppress ts:2769
              async (a, c) => {
                const r = await c(
                  ...(a as [
                    AxiosError | Error | Record<string, unknown>,
                    APIOption
                  ])
                );
                return [r, _option];
              },
              [e, _option]
            ) as AxiosError | Error | unknown;
          }
          _hooks.after.forEach((func) => {
            func(_option);
          });

          return result;
        },
        {
          apply(target, thisArg, argumentsList) {
            return target(...argumentsList);
          },
          get(target, property) {
            if (typeof property === "string")
              return localOption[property as keyof APIOption];
            return undefined;
          },
        }
      );
      return result as unknown as (payload?: P) => Promise<R>;
    };
  }

  // HTTP 对象工厂函数
  static createHttp<
    ApiRaw extends { [name: string]: F<any, any> },
    ModuleRaw extends Modules
  >(
    options: HttpOptions<ApiRaw, ModuleRaw>,
    fModule?: Http<ApiRaw, ModuleRaw>
  ): APIList<ApiRaw, ModuleRaw> & unknown {
    const httpInstance = new Http(options, fModule);
    const shadowFunc = () => {};
    const result = new Proxy(shadowFunc, {
      get: (target, property) => {
        // 通过已注册的接口请求，例如：`$http.getList()`
        const apiStore = Reflect.get(httpInstance, API_STORE);
        const moduleStore = Reflect.get(httpInstance, MODULE_STORE);
        if (apiStore.has(property)) {
          return apiStore.get(property);
        }
        if (moduleStore.has(property)) {
          return moduleStore.get(property);
        }
        return Reflect.get(httpInstance, property);
      },
      deleteProperty: function (target, name) {
        // 可以这样删接口 `delete $http.GetList` 或 Reflect.deleteProperty($http, getList)
        const apiStore = Reflect.get(httpInstance, API_STORE);
        const moduleStore = Reflect.get(httpInstance, MODULE_STORE);
        if (apiStore.has(name)) {
          apiStore.delete(name);
        }
        if (moduleStore.has(name)) {
          moduleStore.delete(name);
        }
        return true;
      },
      apply: function (target, thisArg, argumentsList) {
        return axios.request(argumentsList[0]);
      },
    });

    return result as unknown as APIList<ApiRaw, ModuleRaw> & unknown;
  }

  // static mountModule() {}
}

export const defineAPI = Http.defineAPI;

export const createHttp = Http.createHttp;
