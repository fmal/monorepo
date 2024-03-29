# @fmal/http-service

[![npm](https://img.shields.io/npm/v/@fmal/http-service.svg?style=flat-square)](https://www.npmjs.com/package/@fmal/http-service)

A HTTP service - originally `@cerebral/http`

> Migrating from `@cerebral/http`? See the [migration guide](#migrating-from-cerebralhttp) at the bottom of this readme.

## Install

```
npm install @fmal/http-service
```

## Description

`http-service` exposes the ability to do HTTP requests. It supports **cors** and file upload, with progress handling. It defaults to **json**, but you can configure it to whatever you want.

`http-service` works great with [Cerebral](https://cerebraljs.com/) (with Cerebral-specific factories exposed) but the service itself (default export) does not depend on Cerebral, so you are free to use it in other contexts.

```js
import { set } from 'cerebral/factories';
import { httpGet } from '@fmal/http-service/factories';
import { state, props, string } from 'cerebral';

export default [
  httpGet(string`/items/${props`itemKey`}`),
  set(state`app.currentItem`, props`result`)
];
```

All factories of HTTP service supports template tags.

## Instantiate

```js
import App, { Provider } from 'cerebral';
import HttpService from '@fmal/http-service';

const http = Provider(
  HttpService({
    // Prefix all requests with this url
    baseUrl: 'https://api.github.com',

    // Any default headers to pass on requests
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      Accept: 'application/json'
    },

    // When talking to cross origin (cors), pass cookies
    // if set to true
    withCredentials: false,

    // Provide a global request timeout for all calls
    // which can be overwritten for request by providing
    // a different timeout when doing a request
    // in actions or factories
    timeout: 5000
  })
);

const app = App({
  providers: { http }
});
```

You can update these default options in an action:

```js
function updateDefaultHttpOptions({ http }) {
  http.updateOptions({
    // Updated options
  });
}
```

## abort

You can abort any running request, causing the request to resolve as status code **0** and sets the type to **abort** on the error object.

```js
function searchItems({ props, path, http }) {
  http.abort('/items*'); // regexp string
  return http
    .get(`/items?query=${props.query}`)
    .then(path.success)
    .catch(error => {
      if (error.type === 'abort') {
        return path.abort();
      }

      return path.error({ error });
    });
}

export default [
  searchItems,
  {
    success: [],
    error: [],
    abort: []
  }
];
```

## cors

Cors has been turned into a "black box" by jQuery. Cors is actually a very simple concept, but due to a lot of confusion of "Request not allowed", **cors** has been an option to help out. In HttpService we try to give you the insight to understand how cors actually works.

Cors has nothing to do with the client. The only client configuration related to cors is the **withCredentials** option, which makes sure cookies are passed to the cross origin server. The only requirement for cors to work is that you pass the correct **Content-Type**. Now, this depends on the server in question. Some servers allows any content-type, others require a specific one. These are the typical ones:

- text/plain
- application/x-www-form-urlencoded
- application/json; charset=UTF-8

Note that this is only related to the **request**. If you want to define what you want as response, you set the **Accept** header, which is _application/json_ by default.

## errors

### HttpServiceError

```js
import { HttpServiceError } from '@fmal/http-service';

// Error structure
{
  name: 'HttpServiceError',
  type: 'http | abort | timeout',
  message: 'Some error message or responseText',
  response: {
    result: {}, // Parsed responseText
    headers: {},
    status: 200
  },
  stack: '...'
}
```

This error is available in the following scenarios:

- Inside an action

```js
function someAction({ http }) {
  return http.get('/something').catch(error => ...)
}
```

- Going down an error path

```js
[
  httpGet('/something'),
  {
    success: [],
    error: [
      // {error: ...}
    ]
  }
];
```

- To module catch handlers

```js
const errorCatched = [
  // {error: ...}
  displayError
];

const module = {
  catch: [[HttpServiceError, errorCatched]]
};
```

## delete

### action

```js
function someDeleteAction({ http }) {
  const query = {};
  const options = {};

  return http
    .delete('/items/1', query, options)
    .then(response => {
      return { response };
    })
    .catch(error => {
      return { error };
    });
}
```

### factory

```js
import { httpDelete } from '@fmal/http-service/factories';
import { state, string } from 'cerebral';

export default [
  httpDelete(string`/items/${state`currentItemId`}`)
  /*
    PROPS: {
      response: {...}
    }
  */
];
```

### factory with paths

```js
import { httpDelete } from '@cerebral/http/factories';
import { state, string } from 'cerebral';

export default [
  httpDelete(string`/items/${state`currentItemId`}`),
  {
    success: [
      /* PROPS: {response: {...}} */
    ],
    error: [
      /* PROPS: {error: {...}} */
    ],
    abort: [
      /* PROPS: {error: {...}} */
    ],
    timeout: [
      /* PROPS: {error: {...}} */
    ],

    // Optionally any status code, ex. 404: []
    '${STATUS_CODE}': [
      /* PROPS: {response/error: {...}} */
    ]
  }
];
```

## get

### action

```js
function someGetAction({ http }) {
  const query = {};
  const options = {};

  return http
    .get('/items', query, options)
    .then(response => {
      return { someResponse: response };
    })
    .catch(error => {
      return { someError: error };
    });
}
```

### factory

```js
import { httpGet } from '@fmal/http-service/factories';

export default [
  httpGet('/items')
  /*
    PROPS: {
      response: {...}
    }
  */
];
```

On error this will throw to the signal or global catch handler.

### factory with paths

```js
import { httpGet } from '@fmal/http-service/factories';

export default [
  httpGet('/items'),
  {
    success: [
      /* PROPS: {response: {...}} */
    ],
    error: [
      /* PROPS: {error: {...}} */
    ],
    abort: [
      /* PROPS: {error: {...}} */
    ],
    timeout: [
      /* PROPS: {error: {...}} */
    ],

    // Optionally any status code, ex. 404: []
    '${STATUS_CODE}': [
      /* PROPS: {response/error: {...}} */
    ]
  }
];
```

## patch

### action

```js
function somePatchAction({ http }) {
  const data = {};
  const options = {};

  return http
    .patch('/items/1', data, options)
    .then(response => {
      return { response };
    })
    .catch(error => {
      return { error };
    });
}
```

### factory

```js
import { httpPatch } from '@fmal/http-service/factories';
import { state, props, string } from 'cerebral';

export default [
  httpPatch(string`/items/${props`itemId`}`, state`patchData`)
  /*
    PROPS: {
      response: {...}
    }
  */
];
```

### factory with paths

```js
import { httpPatch } from '@fmal/http-service/factories';
import { state, props, string } from 'cerebral';

export default [
  httpPatch(string`/items/${props`itemId`}`, state`patchData`),
  {
    success: [
      /* PROPS: {response: {...}} */
    ],
    error: [
      /* PROPS: {error: {...}} */
    ],
    abort: [
      /* PROPS: {error: {...}} */
    ],
    timeout: [
      /* PROPS: {error: {...}} */
    ],

    // Optionally any status code, ex. 404: []
    '${STATUS_CODE}': [
      /* PROPS: {response/error: {...}} */
    ]
  }
];
```

## post

### action

```js
function somePostAction({ http }) {
  const data = {};
  const options = {};

  return http
    .post('/items', data, options)
    .then(response => {
      return { response };
    })
    .catch(error => {
      return { error };
    });
}
```

### factory

```js
import { httpPost } from '@fmal/http-service/factories';
import { props } from 'cerebral';

export default [
  httpPost('/items', {
    title: props`itemTitle`,
    foo: 'bar'
  })
  /*
    PROPS: {
      response: {...}
    }
  */
];
```

### factory with paths

```js
import { httpPost } from '@fmal/http-service/factories';
import { props } from 'cerebral';

export default [
  httpPost('/items', {
    title: props`itemTitle`,
    foo: 'bar'
  }),
  {
    success: [
      /* PROPS: {response: {...}} */
    ],
    error: [
      /* PROPS: {error: {...}} */
    ],
    abort: [
      /* PROPS: {error: {...}} */
    ],
    timeout: [
      /* PROPS: {error: {...}} */
    ],

    // Optionally any status code, ex. 404: []
    '${STATUS_CODE}': [
      /* PROPS: {response/error: {...}} */
    ]
  }
];
```

## put

### action

```js
function somePutAction({ http }) {
  const data = {};
  const options = {};

  return http
    .put('/items/1', data, options)
    .then(response => {
      return { response };
    })
    .catch(error => {
      return { error };
    });
}
```

### factory

```js
import { httpPut } from '@fmal/http-service/factories';

export default [
  httpPut('/items', {
    // data object
  })
  /*
    PROPS: {
      response: {...}
    }
  */
];
```

### factory with paths

```js
import { httpPut } from '@fmal/http-service/factories';

export default [
  httpPut('/items', {
    // data object
  }),
  {
    success: [
      /* PROPS: {response: {...}} */
    ],
    error: [
      /* PROPS: {error: {...}} */
    ],
    abort: [
      /* PROPS: {error: {...}} */
    ],
    timeout: [
      /* PROPS: {error: {...}} */
    ],

    // Optionally any status code, ex. 404: []
    '${STATUS_CODE}': [
      /* PROPS: {response/error: {...}} */
    ]
  }
];
```

## responses

There are two types of responses from the HTTP service. A **response** and an **error** of type _HttpServiceError_. A **response** will be received on status codes 200-299. Everything else is an **error**.

### response

```js
{
  result: 'the response body',
  headers: {...},
  status: 200
}
```

### error

```js
{
  name: 'HttpServiceError',
  type: 'http | abort | timeout',
  message: 'Some potential error message',
  result: 'Message or response body',
  status: 500,
  headers: {},
  stack: '...'
}
```

## request

```js
function someGetAction ({http}) {
  return http.request({
    // Any http method
    method: 'GET',

    // Url you want to request to
    url: '/items'

    // Request body as object. Will automatically be stringified if json and
    // urlEncoded if application/x-www-form-urlencoded
    body: {},

    // Query as object, will automatically be urlEncoded
    query: {},

    // If cross origin request, pass cookies
    withCredentials: false,

    // Any additional http headers, or overwrite default
    headers: {},

    // A function or signal path (foo.bar.requestProgressed) that
    // triggers on request progress. Passes {progress: 45} etc.
    onProgress: null
  })
}
```

## uploadFile

### action

```js
function someDeleteAction({ http, props }) {
  return http
    .uploadFile('/upload', props.files, {
      name: 'filename.png', // Default to "files"
      data: {}, // Additional form data
      headers: {},
      onProgress: 'some.signal.path' // Upload progress
    })
    .then(response => {
      return { response };
    })
    .catch(error => {
      return { error };
    });
}
```

### factory

```js
import { httpUploadFile } from '@fmal/http-service/factories';
import { state, props } from 'cerebral';

export default [
  httpUploadFile('/uploads', props`file`, {
    name: state`currentFileName`
  }),
  {
    success: [
      /* PROPS: {response: {...}} */
    ],
    error: [
      /* PROPS: {error: {...}} */
    ],
    abort: [
      /* PROPS: {error: {...}} */
    ],

    // Optionally any status code, ex. 404: []
    '${STATUS_CODE}': [
      /* PROPS: {response/error: {...}} */
    ]
  }
];
```

### factory with paths

```js
import { httpUploadFile } from '@fmal/http-service/factories';
import { state, props } from 'cerebral/tags';

export default [
  httpUploadFile('/uploads', props`file`, {
    name: state`currentFileName`
  })
  /*
    PROPS: {
      response: {...}
    }
  */
];
```

## Migrating from @cerebral/http

Since `http-service` does not depend on Cerebral it does not use `Provider`, but you can wrap `http-service` in `Provider` for the same effect:

```diff
-import { Controller, Module } from 'cerebral';
-import HttpProvider from '@cerebral/http';
+import App, { Provider } from 'cerebral';
+import HttpService from '@fmal/http-service';

-export default Controller(
-  Module({
-    providers: {
-      http: HttpProvider({})
-    }
-  })
-);
+export default App({
+  providers: {
+    http: Provider(HttpService({}))
+  }
+});
```

`http-service` uses `HttpServiceError` error instead of `HttpProviderError`:

```diff
-import { HttpProviderError } from '@cerebral/http';
+import { HttpServiceError } from '@fmal/http-service';
```

“operators” are changed with “factories”, to follow the naming introduced in Cerebral 5.0.
Factories are exported under `@fmal/http-service/factories` and they are optional, meaning if you're
using `http-service` outside Cerebral app, you don't have to import (and thus bundle) them in your codebase.

```diff
-import { httpGet } from '@cerebral/http/operators';
+import { httpGet } from '@fmal/http-service/factories';
```
