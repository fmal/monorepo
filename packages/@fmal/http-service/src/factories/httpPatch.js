import { processResponse } from '../utils';

function httpPatchFactory(url, body = {}, options) {
  return function httpPatch({ http, path, resolve }) {
    return processResponse(
      http.patch(resolve.value(url), resolve.value(body), options),
      path
    );
  };
}

export default httpPatchFactory;
