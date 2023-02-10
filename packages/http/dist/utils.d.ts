import { InnerAPIOption, APIOption, Hooks, HttpOptions, ModuleRecord } from "./type";
import { AxiosRequestConfig } from "axios";
export declare function optionSplit({ hooks, baseURL, url, modules, APIs, ...axiosOptions }: HttpOptions): {
    hooks?: Hooks;
    modules?: ModuleRecord;
    APIs?: Record<string, APIOption>;
    axiosOptions?: AxiosRequestConfig;
    baseURL?: string;
    url?: string;
};
export declare function payloadHandle(option: InnerAPIOption): InnerAPIOption;
