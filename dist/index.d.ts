import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { APIOptionRaw, HooksQuery, HttpOptions, Modules } from "./interface";
declare const AXIOS_INSTANCE: unique symbol;
declare const OPTION_RAW: unique symbol;
declare const API_STORE: unique symbol;
declare const MODULE_STORE: unique symbol;
declare const HOOKS: unique symbol;
declare const ADDON_URL: unique symbol;
declare type F<P = unknown, R = unknown> = ReturnType<DefineAPI<P, R>>;
declare type AxiosRequestMethod<T = any, R = AxiosResponse<T>> = (config: AxiosRequestConfig) => Promise<R>;
declare type ApiLitsItem = {
    [name: string]: F<any, any>;
} | boolean;
declare type APIList<AL extends ApiLitsItem, ML extends Modules> = {
    [K in keyof AL & string]: AL[K] extends F ? ReturnType<AL[K]> : (payload?: unknown) => unknown;
} & {
    [ＭK in keyof ML & string]: APIList<ML[ＭK]["APIs"] extends ApiLitsItem ? ML[ＭK]["APIs"] : ApiLitsItem, ML[ＭK]["modules"] extends Modules ? ML[ＭK]["modules"] : Modules>;
} & AxiosRequestMethod;
export declare type DefineAPI<P, R> = (option: APIOptionRaw) => <AR, MR>($http: Http<AR, MR>, name: string) => (payload?: P | undefined) => R;
export declare type CreateHttp<AR, MR> = {
    [OPTION_RAW]: HttpOptions<AR, MR>;
    [AXIOS_INSTANCE]: AxiosInstance;
} & AR;
export declare class Http<AR = {}, MR = {}> {
    [OPTION_RAW]: HttpOptions<AR, MR>;
    [AXIOS_INSTANCE]: AxiosInstance;
    [API_STORE]: Map<any, any>;
    [MODULE_STORE]: Map<any, any>;
    [HOOKS]: HooksQuery;
    [ADDON_URL]: string;
    constructor(options: HttpOptions<AR, MR>, fModule?: Http);
    static defineAPI<P, R>(localOption?: APIOptionRaw): <AR, MR>($http: Http<AR, MR>, name: string) => (payload?: P | undefined) => Promise<R>;
    static createHttp<AR extends {
        [name: string]: F<any, any>;
    }, MR extends Modules>(options: HttpOptions<AR, MR>, fModule?: Http): APIList<AR, MR> & unknown;
}
export declare const defineAPI: typeof Http.defineAPI;
export declare const createHttp: typeof Http.createHttp;
export {};
