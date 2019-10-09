import { Tag } from 'cerebral';

export function httpAbort(regexp: string | Tag): Function;
export function httpDelete(
  url: string | Tag,
  query?: any,
  options?: any
): Function;
export function httpGet(
  url: string | Tag,
  query?: any,
  options?: any
): Function;
export function httpPatch(
  url: string | Tag,
  body?: any,
  options?: any
): Function;
export function httpPost(
  url: string | Tag,
  body?: any,
  options?: any
): Function;
export function httpPut(url: string | Tag, body?: any, options?: any): Function;
export function httpUploadFile(
  urlValue: string | Tag,
  filesValue: string[],
  optionsValue: any[]
): Function;
