import { processResponse } from '../utils';

function httpPatchFactory(url, body = {}, options) {
  return function httpPatch({ http, path, resolve }) {
    return processResponse(
      http.patch(
        resolve.value(url),
        resolve.value(body),
        resolve.value(options)
      ),
      path
    );
  };
}

export default httpPatchFactory;
