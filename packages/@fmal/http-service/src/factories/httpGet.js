import { processResponse } from '../utils';

function httpGetFactory(url, query = {}, options) {
  return function httpGet({ http, path, resolve }) {
    return processResponse(
      http.get(resolve.value(url), resolve.value(query), options),
      path
    );
  };
}

export default httpGetFactory;
