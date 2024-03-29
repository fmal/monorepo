import { processResponse } from '../utils';

function httpPutFactory(url, body = {}, options) {
  return function httpPut({ http, path, resolve }) {
    return processResponse(
      http.put(resolve.value(url), resolve.value(body), resolve.value(options)),
      path
    );
  };
}

export default httpPutFactory;
