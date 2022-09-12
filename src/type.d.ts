import { AxiosError, AxiosRequestConfig, AxiosResponse, Method } from "axios";
import { Http } from ".";

// declare namespace HttpApi {
export declare type SuccessHookAction = (
  res: unknown | AxiosResponse<unknown>,
  options: APIOption
) => Promise<unknown>;

export declare type FailHookAction = (
  e: AxiosError | Error | Record<string, unknown>,
  options: APIOption
) => Promise<unknown>;

export declare type BeforeHookAction = (options: APIOption) => APIOption;

export declare type AfterHookAction = (options: APIOption) => unknown;

export declare type BeforeTransformAction = (
  payload: unknown
) => Record<string | number, unknown>;

export declare interface Hooks {
  success?: SuccessHookAction;
  fail?: FailHookAction;
  before?: BeforeHookAction;
  after?: AfterHookAction;
  beforeTransform?: BeforeTransformAction;
}

export declare type HooksQuery = {
  [K in keyof Required<Hooks>]: Required<Hooks>[K][];
};

export declare type HooksOption = Partial<Hooks | HooksQuery>;

export declare type HookNames = keyof Hooks;

export declare type Hook = Hooks[HookNames];

export declare interface RequestConfig extends AxiosRequestConfig {
  url?: string;
  method?: Method;
  payload?: unknown;
}

export declare interface APIOptionRaw extends RequestConfig {
  hooks?: Hooks;
  meta?: Record<string, unknown>;
}

export declare interface APIOption extends RequestConfig {
  hooks: HooksQuery;
  meta?: Record<string, unknown>;
}

export declare type Modules = Record<string, HttpOptions>;

export declare type API = (p: unknown) => unknown;

export declare type APIFac = (instance: Http) => API;
export declare interface HttpOptions<
  ApiRaw extends { [name: string]: F<any, any> } = {},
  ModuleRaw extends Modules = {}
> extends APIOptionRaw {
  modules?: ModuleRaw;
  APIs?: ApiRaw;
}

export declare type F<P = unknown, R = unknown> = ReturnType<DefineAPI<P, R>>;

// 定义API
export declare type DefineAPI<P, R> = (
  option: APIOptionRaw
) => <ApiRaw extends _ApiRaw, ModuleRaw>(
  $http: Http<ApiRaw, ModuleRaw>,
  name: string
) => (payload?: P | undefined) => R;

export declare type CreateHttp<ApiRaw, ModuleRaw> = {
  [OPTION_RAW]: HttpOptions<ApiRaw, ModuleRaw>;
  [AXIOS_INSTANCE]: AxiosInstance;
} & ApiRaw;

export declare interface _ApiRaw {
  [name: string]: F<any, any>;
}

export declare type AxiosRequestMethod<T = any, R = AxiosResponse<T>> = (
  config: AxiosRequestConfig
) => Promise<R>;

export declare type ApiLitsItem =
  | {
      [name: string]: F<any, any>;
    }
  | boolean;

export declare type APIList<
  _API extends ApiLitsItem,
  ModuleList extends Modules
> = {
  [K in keyof _API & string]: _API[K] extends F
    ? ReturnType<_API[K]>
    : (payload?: unknown) => unknown;
} & {
  // 模块类型签名
  [ModuleKey in keyof ModuleList & string]: APIList<
    ModuleList[ModuleKey]["APIs"] extends ApiLitsItem
      ? ModuleList[ModuleKey]["APIs"]
      : ApiLitsItem,
    ModuleList[ModuleKey]["modules"] extends Modules
      ? ModuleList[ModuleKey]["modules"]
      : Modules
  >;
} & AxiosRequestMethod;
