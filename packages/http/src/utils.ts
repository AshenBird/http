import {
  InnerAPIOption,
  APIOption,
  Hooks,
  HttpOptions,
  ModuleRecord,
} from "./type";
import { Key as Param, pathToRegexp } from "path-to-regexp";
import { AxiosRequestConfig } from "axios";
export function optionSplit({
  hooks,
  baseURL,
  url,
  modules,
  APIs,
  ...axiosOptions
}: HttpOptions): {
  hooks?: Hooks;
  modules?: ModuleRecord;
  APIs?: Record<string, APIOption>;
  axiosOptions?: AxiosRequestConfig;
  baseURL?: string;
  url?: string;
} {
  return { hooks, modules, APIs, axiosOptions, baseURL, url };
}

export function payloadHandle(option: InnerAPIOption): InnerAPIOption {
  const { url: urlRaw, payload: payloadRaw = {}, ...rest } = option;
  // 初始化 路径参数数组
  const keys = [] as Param[];
  // 初始化返回的路径和 载荷
  let url = urlRaw;
  let payload = JSON.parse(JSON.stringify(payloadRaw));

  // 当载荷是记录或数组时
  if (payload && typeof payload === "object") {
    // 获取路径参数的 key
    if (url?.includes(":")) {
      pathToRegexp(url, keys);
    }
    // 有路径参数的时候
    if (keys.length > 0) {
      // 逐个替换参数
      for (const item of keys) {
        // 获得对应的值，没找到时使用空字符串
        let value =
          (payload as Record<number | string, unknown>)[item.name] ?? "";
        if (!["string", "number", "boolean"].includes(typeof value)) {
          // 不是简单值的时候构建成 JSON 数据
          value = JSON.stringify(value);
        } else if (["number", "boolean"].includes(typeof value)) {
          // 非字符串的简单值调用 toString
          value = (value as boolean | number).toString();
        }
        // 路径替换
        url = (urlRaw as string).replace(`:${item.name}`, value as string);
      }
    }
    // 因为已经注入路径而排除的 key
    const excludeKeys = keys.map((item) => item.name);

    // 排除已注入数据，生成载荷
    payload = Object.entries(payload).reduce((acc, [key, value]) => {
      if (!excludeKeys.includes(key)) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, unknown>);
  }
  return {
    payload,
    url,
    ...rest,
  };
}

// export function syncFuncQueueExecute<T, S extends boolean>(
//   queue: Array<
//     S extends true ? (arg: T) => T : (...arg: T extends [] ? T : []) => T
//   >,
//   args: T,
//   singleArg: S = false as S
// ) {
//   let result = args;
//   if (singleArg) {
//     for (const func of queue) {
//       // @ts-ignore suppress ts:2488
//       result = func(result);
//     }
//   } else if (Array.isArray(args)) {
//     for (const func of queue) {
//       // @ts-ignore suppress ts:2488
//       result = func(...result);
//     }
//   } else {
//   }
//   return result;
// }

// export async function funcQueueExecute<T, S extends boolean>(
//   queue: Array<
//     S extends true ? (arg: T) => T : (...arg: T extends [] ? T : []) => T
//   >,
//   args: T,
//   singleArg: S = false as S
// ) {
//   let result = args;
//   if (singleArg) {
//     for (const func of queue) {
//       // @ts-ignore suppress ts:2488
//       result = await func(result);
//     }
//   } else if (Array.isArray(args)) {
//     for (const func of queue) {
//       // @ts-ignore suppress ts:2488
//       result = await func(...result);
//     }
//   } else {
//     throw new Error()
//   }
//   return result;
// }
