function httpAbortFactory(regexp) {
  return function httpAbort({ http, resolve }) {
    http.abort(resolve.value(regexp));
  };
}

export default httpAbortFactory;
