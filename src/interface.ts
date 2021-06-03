import { AxiosError, AxiosRequestConfig, AxiosResponse, Method } from "axios";
import { Http } from ".";

export type SuccessHookAction = (
  res: unknown | AxiosResponse<unknown>,
  options: APIOption
) => Promise<unknown>;

export type FailHookAction = (
  e: AxiosError | Error | Record<string, unknown>,
  options: APIOption
) => Promise<unknown>;

export type BeforeHookAction = (options: APIOption) => APIOption;

export type AfterHookAction = (options: APIOption) => unknown;

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

export interface RequestConfig extends AxiosRequestConfig {
  url?: string;
  method?: Method;
  payload?: unknown;
}

export interface APIOptionRaw extends RequestConfig {
  hooks?: Hooks;
  meta?: Record<string, unknown>;
}

export interface APIOption extends RequestConfig {
  hooks: HooksQuery;
  meta?: Record<string, unknown>;
}

export type Modules = Record<string, HttpOptions>;

export type API = (p: unknown) => unknown;

export type APIFac = (instance: Http) => API;
export interface HttpOptions<AR = {}, MR = {}> extends APIOptionRaw {
  modules?: MR;
  APIs?: AR;
}
