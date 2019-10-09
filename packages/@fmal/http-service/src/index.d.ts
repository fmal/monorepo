export enum HttpServiceErrorTypes {
  Http = 'http',
  Abort = 'abort',
  Timeout = 'timeout'
}

export class HttpServiceError extends Error {
  constructor(
    type: HttpServiceErrorTypes,
    status: number,
    headers: any,
    body: any,
    message?: string,
    isAborted?: boolean
  );

  type: HttpServiceErrorTypes;
  response: {
    status: number;
    headers: any;
    result: any;
    isAborted: boolean;
  };

  toJSON(): any;
}

export default function HttpService(
  moduleOptions: HttpModuleOptions
): HttpService;

export interface HttpModuleOptions {
  method?: string;
  baseUrl?: string;
  headers?: { [id: string]: string };
  onRequest?: (xhr: XMLHttpRequest, options: HttpResponseOptions) => void;
  onResponse?: (
    response: XMLHttpRequest,
    resolve: Function,
    reject: Function,
    options?: HttpResponseOptions
  ) => void;
  onRequestCallback?: (xhr: XMLHttpRequest) => void;
  onResponseCallback?: (response: XMLHttpRequest) => void;
}

export interface HttpRequestOptions {
  query?: { [id: string]: any };
  headers?: { [id: string]: string };
}

export interface HttpResponseOptions
  extends HttpRequestOptions,
    HttpModuleOptions {
  body: string;
}

export interface HttpRequestResponse<T> {
  result: T;
  status: string;
}

export interface HttpService {
  request: any;
  get<T>(
    url: string,
    passedQuery?: { [id: string]: any },
    options?: HttpRequestOptions
  ): Promise<HttpRequestResponse<T>>;
  post<T>(
    url: string,
    body: any,
    options?: HttpRequestOptions
  ): Promise<HttpRequestResponse<T>>;
  put<T>(
    url: string,
    body: any,
    options?: HttpRequestOptions
  ): Promise<HttpRequestReponse<T>>;
  patch<T>(
    url: string,
    body: any,
    options?: HttpRequestOptions
  ): Promise<HttpRequestResponse<T>>;
  delete<T>(
    url: string,
    passedQuery: { [id: string]: any },
    options?: HttpRequestOptions
  ): Promise<HttpRequestResponse<T>>;
  uploadFile<T>(
    url: string,
    files: FileList | File,
    options?: FileUploadOptions
  ): FileUpload<T>;
  updateOptions(newOptions: HttpModuleOptions): void;
  abort(regexp: string): boolean;
}

export interface FileUploadProgress {
  progress: number;
}

export interface FileUploadOptions {
  name?: string;
  data?: { [id: string]: any };
  headers?: { [id: string]: string };
  onProgress?: (progress: FileUploadProgress) => void | string;
}

export interface FileUploadResult<T> {
  result?: T;
  status: string;
}

export class FileUpload<TResponse> {
  constructor(options: FileUploadOptions);
  xhr: XMLHttpRequest;
  isAborted: boolean;
  send: (files: FileList | File[]) => Promise<FileUploadResult<TResponse>>;
  abort: () => void;
}
