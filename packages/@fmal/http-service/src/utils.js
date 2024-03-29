import HttpServiceError from './HttpServiceError';

export function createResponse(options, resolve, reject) {
  return event => {
    switch (event.type) {
      case 'load':
        return options.onResponse(
          event.currentTarget,
          resolve,
          reject,
          options
        );
      case 'progress':
        if (options.onProgress && event.lengthComputable) {
          options.onProgress({
            progress: Number((event.loaded / event.total) * 100).toFixed()
          });
        }
        break;
      case 'error':
        reject(
          new HttpServiceError(
            undefined,
            event.currentTarget.status,
            getAllResponseHeaders(event.currentTarget),
            event.currentTarget.responseText,
            event.currentTarget.responseText || 'request error'
          )
        );
        break;
      case 'abort':
        reject(
          new HttpServiceError(
            event.type,
            event.currentTarget.status,
            getAllResponseHeaders(event.currentTarget),
            null,
            'request abort',
            true
          )
        );
        break;
      case 'timeout':
        reject(
          new HttpServiceError(
            event.type,
            event.currentTarget.status,
            getAllResponseHeaders(event.currentTarget),
            null,
            'request timeout'
          )
        );
        break;
    }
  };
}

export function mergeWith(optionsA, optionsB) {
  return Object.keys(optionsB).reduce((newOptions, key) => {
    if (!newOptions[key]) {
      newOptions[key] = optionsB[key];
    } else if (key === 'headers') {
      newOptions[key] = mergeWith(newOptions[key], optionsB[key] || {});
    }

    return newOptions;
  }, optionsA);
}

export function urlEncode(obj, prefix) {
  const str = [];

  for (const p in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, p)) {
      const k = prefix ? prefix + '[' + p + ']' : p;
      const v = obj[p];

      str.push(
        typeof v === 'object'
          ? urlEncode(v, k)
          : encodeURIComponent(k) + '=' + encodeURIComponent(v)
      );
    }
  }
  return str.join('&');
}

export function parseHeaders(rawHeaders) {
  if (!rawHeaders) {
    return null;
  }

  const headerPairs = rawHeaders.replace(/\r?\n$/, '').split(/\r?\n/);

  return headerPairs.reduce((parsedHeaders, headerPair) => {
    const index = headerPair.indexOf(':');
    const key = headerPair
      .substr(0, index)
      .trim()
      .toLowerCase();
    const value = headerPair.substr(index + 1).trim();
    if (key) {
      parsedHeaders[key] = parsedHeaders[key]
        ? parsedHeaders[key] + ', ' + value
        : value;
    }

    return parsedHeaders;
  }, {});
}

export function processResponse(httpAction, path) {
  return (
    httpAction
      .then(response => {
        if (path && path[response.status]) {
          return path[response.status]({ response });
        }

        return path && path.success ? path.success({ response }) : { response };
      })
      // This error will be an instance of HttpError
      .catch(error => {
        if (!path) {
          throw error;
        }

        if (error.type === 'abort' && path.abort) {
          return path.abort({ error: error.toJSON() });
        }

        if (error.type === 'timeout' && path.timeout) {
          return path.timeout({ error: error.toJSON() });
        }

        if (path[error.response.status]) {
          return path[error.response.status]({ error: error.toJSON() });
        }

        if (path.error) {
          return path.error({ error: error.toJSON() });
        }

        throw error;
      })
  );
}

export function getAllResponseHeaders(xhr) {
  return 'getAllResponseHeaders' in xhr
    ? parseHeaders(xhr.getAllResponseHeaders())
    : null;
}
