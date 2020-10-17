import { processResponse } from '../utils';

function httpPostFactory(url, body = {}, options) {
  return function httpPost({ http, path, resolve }) {
    return processResponse(
      http.post(
        resolve.value(url),
        resolve.value(body),
        resolve.value(options)
      ),
      path
    );
  };
}

export default httpPostFactory;
