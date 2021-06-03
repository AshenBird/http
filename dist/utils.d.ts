import { APIOption, APIOptionRaw, Hooks, HttpOptions } from "./interface";
import { AxiosRequestConfig } from "axios";
export declare function optionSplit({ hooks, baseURL, url, modules, APIs, ...axiosOptions }: HttpOptions): {
    hooks?: Hooks;
    modules?: Record<string, HttpOptions>;
    APIs?: Record<string, APIOptionRaw>;
    axiosOptions?: AxiosRequestConfig;
    baseURL?: string;
    url?: string;
};
export declare function payloadHandle(option: APIOption): APIOption;
