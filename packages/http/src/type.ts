import { AxiosError, AxiosRequestConfig, AxiosResponse, Method } from "axios";
import { Http } from "./index";

// namespace HttpApi {

/**
 * about hooks
 */
export type SuccessHookAction = (
  res: unknown | AxiosResponse<unknown>,
  options: InnerAPIOption
) => Promise<unknown>;

export type FailHookAction = (
  e: AxiosError | Error | Record<string, unknown>,
  options: InnerAPIOption
) => Promise<unknown>;

export type BeforeHookAction = (options: InnerAPIOption) => InnerAPIOption;

export type AfterHookAction = (options: InnerAPIOption) => unknown;

export type BeforeTransformAction = (
  payload: unknown
) => Record<string | number, unknown>;

export interface Hooks {
  success?: SuccessHookAction;
  fail?: FailHookAction;
  before?: BeforeHookAction;
  after?: AfterHookAction;
  beforeTransform?: BeforeTransformAction;
}

export type HooksQuery = {
  [K in keyof Required<Hooks>]: Required<Hooks>[K][];
};

export type HooksOption = Partial<Hooks | HooksQuery>;

export type HookNames = keyof Hooks;

export type Hook = Hooks[HookNames];

/**
 * about HTTP option
 */
export interface HttpOptions<
  APIs extends APIRecord = {},
  Modules extends ModuleRecord = {}
> extends APIOption {
  modules?: Modules;
  APIs?: APIs;
}

export interface RequestConfig extends AxiosRequestConfig {
  url?: string;
  method?: Method;
  payload?: unknown;
}

export interface APIOption extends RequestConfig {
  hooks?: Hooks;
  meta?: Record<string, unknown>;
}

export interface InnerAPIOption extends RequestConfig {
  hooks: HooksQuery;
  meta?: Record<string, unknown>;
}

export type ModuleRecord = Record<string, HttpOptions>;

export type APIRecord = Record<string, API | NoPayloadAPI>;

/**
 * about api option
 */
export type RequestResult<R> = AxiosError | Error | unknown | R;

export interface UserAPI<
  R = unknown,
  P = undefined,
  O extends APIOption = APIOption
> {
  (payload: P): Promise<R>;
  options: O;
}
export interface UserAPIWithoutPayload<R, O> {
  (): Promise<R>;
  options: O;
}

export interface API<R = any, P = undefined, O extends APIOption = APIOption> {
  ($http: Http, name: string): UserAPI<R, P, O>;
  options: O;
}
export interface NoPayloadAPI<R = any, O = APIOption> {
  ($http: Http, name: string): UserAPIWithoutPayload<R, O>;
  options: O;
}

export type AxiosRequestMethod<T = any, R = AxiosResponse<T>> = (
  config: AxiosRequestConfig
) => Promise<R>;

export type APIList<APIs extends APIRecord, Modules extends ModuleRecord> = {
  // 接口列表类型前面个
  [K in keyof APIs & string]: ReturnType<APIs[K]>;
} & {
  // 模块类型签名
  [ModuleKey in keyof Modules & string]: APIList<
    Modules[ModuleKey]["APIs"] extends APIRecord
      ? Modules[ModuleKey]["APIs"]
      : APIRecord,
    Modules[ModuleKey]["modules"] extends ModuleRecord
      ? Modules[ModuleKey]["modules"]
      : ModuleRecord
  >;
};
