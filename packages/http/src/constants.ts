import { Method } from "axios";

export const methods: Method[] = [
  "get",
  "GET",
  "delete",
  "DELETE",
  "head",
  "HEAD",
  "options",
  "OPTIONS",
  "post",
  "POST",
  "put",
  "PUT",
  "patch",
  "PATCH",
  "purge",
  "PURGE",
  "link",
  "LINK",
  "unlink",
  "UNLINK",
];
export const AXIOS_INSTANCE = Symbol();
export const OPTION_RAW = Symbol();
export const API_STORE = Symbol();
export const MODULE_STORE = Symbol();
export const HOOKS = Symbol();
export const ADDON_URL = Symbol();
