import { getAllResponseHeaders } from './utils';
import HttpServiceError from './HttpServiceError';

function parseResponse(xhr) {
  try {
    return {
      status: xhr.status,
      result: JSON.parse(xhr.responseText)
    };
  } catch (e) {
    throw new HttpServiceError(
      xhr.status,
      getAllResponseHeaders(xhr),
      xhr.responseText,
      e.message
    );
  }
}

export default function(options) {
  if (!options.url) {
    console.warn('upload-controller: you must provide a url');
    return;
  }
  this.isAborted = false;
  this.xhr = new XMLHttpRequest();
  this.abort = function() {
    this.isAborted = true;
    this.xhr && this.xhr.abort();
  };

  this.send = function(files) {
    const fileUpload = this;
    const xhr = this.xhr;

    fileUpload.isAborted = false;

    return new Promise(function(resolve, reject) {
      if (
        files &&
        (files instanceof FileList || files.length || files instanceof File)
      ) {
        const formData = new FormData();

        if (files instanceof FileList || files.length) {
          for (let i = 0; i < files.length; i++) {
            formData.append(options.name || 'files', files[i]);
          }
        } else {
          formData.append(options.name || 'files', files);
        }

        if (options.data) {
          Object.keys(options.data).forEach(function(paramKey) {
            formData.append(paramKey, options.data[paramKey]);
          });
        }

        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4 && xhr.status >= 200 && xhr.status < 300) {
            resolve(parseResponse(xhr));
          } else if (xhr.readyState === 4) {
            const response = parseResponse(xhr);

            response.isAborted = fileUpload.isAborted;
            reject(
              new HttpServiceError(
                xhr.status,
                getAllResponseHeaders(xhr),
                xhr.responseText,
                null
              )
            );
          }
        };

        xhr.open('POST', options.url, true);

        if (options.headers) {
          Object.keys(options.headers).forEach(function(key) {
            xhr.setRequestHeader(key, options.headers[key]);
          });
        }

        xhr.upload.onprogress = function(e) {
          if (options.onProgress) {
            const percentComplete = (e.loaded / e.total) * 100;
            options.onProgress({
              progress: +percentComplete.toFixed(0)
            });
          }
        };

        xhr.send(formData);
      } else {
        /* eslint-disable-next-line prefer-promise-reject-errors */
        reject('Not an instance of a File, File[] or FileList');
      }
    });
  };
}
