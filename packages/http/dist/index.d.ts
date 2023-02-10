import { AxiosInstance } from "axios";
import { AXIOS_INSTANCE, OPTION_RAW, API_STORE, MODULE_STORE, HOOKS, ADDON_URL } from "./constants";
import { API, APIList, APIOption, HooksQuery, HttpOptions, ModuleRecord, APIRecord, NoPayloadAPI } from "./type";
export declare class Http<APIs extends Record<string, API> = {}, Modules extends ModuleRecord = {}> {
    [OPTION_RAW]: HttpOptions<APIs, Modules>;
    [AXIOS_INSTANCE]: AxiosInstance;
    [API_STORE]: Map<any, any>;
    [MODULE_STORE]: Map<any, any>;
    [HOOKS]: HooksQuery;
    [ADDON_URL]: string;
    constructor(options: HttpOptions<APIs, Modules>, fModule?: Http);
    static defineAPI<R, P>(options: APIOption): API<R, P>;
    static defineAPI<R>(options: APIOption): NoPayloadAPI<R>;
    static createHttp<APIs extends APIRecord, Modules extends ModuleRecord = {}>(options: HttpOptions<APIs, Modules>, fModule?: Http<APIs, Modules>): APIList<APIs, Modules> & unknown;
}
export declare const defineAPI: typeof Http.defineAPI;
export declare const createHttp: typeof Http.createHttp;
