import { AxiosError, AxiosRequestConfig, AxiosResponse, Method } from "axios";
import { Http } from ".";
export declare type SuccessHookAction = (res: unknown | AxiosResponse<unknown>, options: APIOption) => Promise<unknown>;
export declare type FailHookAction = (e: AxiosError | Error | Record<string, unknown>, options: APIOption) => Promise<unknown>;
export declare type BeforeHookAction = (options: APIOption) => APIOption;
export declare type AfterHookAction = (options: APIOption) => unknown;
export declare type BeforeTransformAction = (payload: unknown) => Record<string | number, unknown>;
export interface Hooks {
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
export declare type Modules = Record<string, HttpOptions>;
export declare type API = (p: unknown) => unknown;
export declare type APIFac = (instance: Http) => API;
export interface HttpOptions<AR = {}, MR = {}> extends APIOptionRaw {
    modules?: MR;
    APIs?: AR;
}
