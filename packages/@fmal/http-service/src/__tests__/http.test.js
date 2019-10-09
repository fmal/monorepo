import { string, props, resolveObject } from 'cerebral';
import { CerebralTest } from 'cerebral/test';
import mock from 'xhr-mock';

import HttpService from '../';
import {
  httpGet,
  httpPost,
  httpPut,
  httpPatch,
  httpDelete,
  httpAbort
} from '../factories';

mock.setup();

let urlIndex = 0;

function createUrl(additional = '') {
  return '/items' + urlIndex++ + additional;
}

describe('Http Provider', () => {
  it('should create requests', done => {
    const url = createUrl();
    mock.get(url, (req, res) => {
      return res
        .status(200)
        .header('Content-Type', 'application/json')
        .body(JSON.stringify({ foo: 'bar' }));
    });
    const test = CerebralTest({
      providers: { http: HttpService() },
      sequences: {
        test: [
          ({ http, path }) => {
            return http.request({ method: 'GET', url }).then(path.success);
          },
          {
            success: [
              ({ props }) => {
                expect(props).toEqual({
                  result: { foo: 'bar' },
                  status: 200,
                  headers: { 'content-type': 'application/json' }
                });
                done();
              }
            ]
          }
        ]
      }
    });
    test.runSequence('test');
  });

  it('should create GET requests with queries', done => {
    expect.assertions(1);
    const url = createUrl();
    const query = '?foo=bar';
    mock.get(url + query, (req, res) => {
      expect(req.url().toString()).toBe(url + query);
      return res.header('Content-Type', 'application/json').status(200);
    });
    const test = CerebralTest({
      providers: { http: HttpService() },
      sequences: {
        test: [
          ({ http, path }) => {
            return http.get(url, { foo: 'bar' }).then(path.success);
          },
          {
            success: [() => done()]
          }
        ]
      }
    });
    test.runSequence('test');
  });

  it('should create POST requests with body', done => {
    expect.assertions(1);
    const url = createUrl();
    mock.post(url, (req, res) => {
      expect(req.body()).toBe(JSON.stringify({ foo: 'bar' }));
      return res.status(200).header('Content-Type', 'application/json');
    });
    const test = CerebralTest({
      providers: { http: HttpService() },
      sequences: {
        test: [
          ({ http, path }) => {
            return http.post(url, { foo: 'bar' }).then(path.success);
          },
          {
            success: [() => done()]
          }
        ]
      }
    });
    test.runSequence('test');
  });

  it('should create PUT requests with body', done => {
    expect.assertions(1);
    const url = createUrl();
    mock.put(url, (req, res) => {
      expect(req.body()).toBe(JSON.stringify({ foo: 'bar' }));
      return res.status(200).header('Content-Type', 'application/json');
    });
    const test = CerebralTest({
      providers: { http: HttpService() },
      sequences: {
        test: [
          ({ http, path }) => {
            return http.put(url, { foo: 'bar' }).then(path.success);
          },
          {
            success: [() => done()]
          }
        ]
      }
    });
    test.runSequence('test');
  });

  it('should create PATCH requests with body', done => {
    expect.assertions(1);
    const url = createUrl();
    mock.patch(url, (req, res) => {
      expect(req.body()).toBe(JSON.stringify({ foo: 'bar' }));
      return res.status(200).header('Content-Type', 'application/json');
    });
    const test = CerebralTest({
      providers: { http: HttpService() },
      sequences: {
        test: [
          ({ http, path }) => {
            return http.patch(url, { foo: 'bar' }).then(path.success);
          },
          {
            success: [() => done()]
          }
        ]
      }
    });
    test.runSequence('test');
  });

  it('should create DELETE requests', done => {
    expect.assertions(1);
    const url = createUrl();
    mock.delete(url, (req, res) => {
      expect(true).toBeTruthy();
      return res.status(200).header('Content-Type', 'application/json');
    });
    const test = CerebralTest({
      providers: { http: HttpService() },
      sequences: {
        test: [
          ({ http, path }) => {
            return http.delete(url).then(path.success);
          },
          {
            success: [() => done()]
          }
        ]
      }
    });
    test.runSequence('test');
  });

  it('should handle error requests', done => {
    expect.assertions(1);
    const url = createUrl();
    mock.get(url, (req, res) => {
      return res.status(500).header('Content-Type', 'application/json');
    });
    const test = CerebralTest({
      providers: { http: HttpService() },
      sequences: {
        test: [
          ({ http, path }) => {
            return http
              .get(url)
              .then(path.success)
              .catch(error => path.error({ error }));
          },
          {
            success: [],
            error: [
              ({ props }) => {
                expect(props.error.response.status).toBe(500);
                done();
              }
            ]
          }
        ]
      }
    });
    test.runSequence('test');
  });

  it('should handle timeout as an option', done => {
    expect.assertions(1);
    const url = createUrl();
    mock.get(url, (req, res) => {
      return new Promise(() => {});
    });
    const test = CerebralTest({
      providers: { http: HttpService() },
      sequences: {
        test: [
          ({ http, path }) => {
            return http
              .get(url, null, { timeout: 10 })
              .then(path.success)
              .catch(error => path.error({ error }));
          },
          {
            success: [],
            error: [
              ({ props }) => {
                expect(props.error.message).toBe('request timeout');
                done();
              }
            ]
          }
        ]
      }
    });
    test.runSequence('test');
  });

  it('should abort request', done => {
    expect.assertions(1);
    const url = createUrl();
    mock.get(url, (req, res) => {
      return res.timeout(500);
    });
    const test = CerebralTest({
      providers: { http: HttpService() },
      sequences: {
        test: [
          ({ http, path }) => {
            return http.get(url).catch(error => {
              expect(error.type).toBe('abort');
              return path.aborted();
            });
          },
          {
            aborted: [() => done()]
          }
        ],
        test2: [
          ({ http }) => {
            http.abort('/items');
          }
        ]
      }
    });
    test.runSequence('test');
    test.runSequence('test2');
  });

  it('should expose factories to do requests', done => {
    expect.assertions(1);
    const baseUrl = createUrl();
    mock.get(`${baseUrl}/1`, (req, res) => {
      return res.status(200).header('Content-Type', 'application/json');
    });
    mock.post(`${baseUrl}/1`, (req, res) => {
      return res.status(200).header('Content-Type', 'application/json');
    });
    mock.put(`${baseUrl}/1`, (req, res) => {
      return res.status(200).header('Content-Type', 'application/json');
    });
    mock.patch(`${baseUrl}/1`, (req, res) => {
      return res.status(200).header('Content-Type', 'application/json');
    });
    mock.delete(`${baseUrl}/1`, (req, res) => {
      return res.status(200).header('Content-Type', 'application/json');
    });

    let responseCount = 0;
    const test = CerebralTest({
      providers: { http: HttpService() },
      sequences: {
        test: [
          httpGet(string`${baseUrl}/${props`itemId`}`),
          {
            success: [
              () => {
                responseCount++;
              }
            ]
          },
          httpPost(string`${baseUrl}/${props`itemId`}`),
          {
            success: [
              () => {
                responseCount++;
              }
            ]
          },
          httpPut(string`${baseUrl}/${props`itemId`}`),
          {
            success: [
              () => {
                responseCount++;
              }
            ]
          },
          httpPatch(string`${baseUrl}/${props`itemId`}`),
          {
            success: [
              () => {
                responseCount++;
              }
            ]
          },
          httpDelete(string`${baseUrl}/${props`itemId`}`),
          {
            success: [
              () => {
                responseCount++;
              }
            ]
          },
          () => {
            expect(responseCount).toBe(5);
            done();
          }
        ]
      }
    });
    test.runSequence('test', {
      itemId: 1
    });
  });

  it('should allow factories to accept tags in props data', done => {
    expect.assertions(3);
    const mockResponse = (req, res) => {
      expect(req.body()).toBe(JSON.stringify({ data: 1 }));
      return res.status(200).header('Content-Type', 'application/json');
    };

    const urlA = createUrl();
    const urlB = createUrl();
    const urlC = createUrl();
    mock.post(urlA, mockResponse);
    mock.put(urlB, mockResponse);
    mock.patch(urlC, mockResponse);

    const test = CerebralTest({
      providers: { http: HttpService() },
      sequences: {
        test: [
          httpPost(urlA, resolveObject({ data: props`data` })),
          {
            success: []
          },
          httpPut(urlB, resolveObject({ data: props`data` })),
          {
            success: []
          },
          httpPatch(urlC, resolveObject({ data: props`data` })),
          {
            success: []
          },
          () => {
            done();
          }
        ]
      }
    });
    test.runSequence('test', {
      data: 1
    });
  });

  it('should call status code paths', done => {
    expect.assertions(1);
    const url = createUrl();
    mock.get(url, (req, res) => {
      return res.status(201).header('Content-Type', 'application/json');
    });

    let responseCount = 0;
    const test = CerebralTest({
      providers: { http: HttpService() },
      sequences: {
        test: [
          httpGet(url),
          {
            '201': [
              () => {
                responseCount++;
              }
            ]
          },
          () => {
            expect(responseCount).toBe(1);
            done();
          }
        ]
      }
    });
    test.runSequence('test');
  });

  it('should abort request with operator', done => {
    expect.assertions(1);
    mock.get('/items', (req, res) => {
      return res.timeout(500);
    });
    const test = CerebralTest({
      providers: { http: HttpService() },
      sequences: {
        test: [
          ({ http, path }) => {
            return http.get('/items').catch(error => {
              expect(error.type).toBe('abort');
              return path.aborted();
            });
          },
          {
            aborted: [() => done()]
          }
        ],
        test2: [httpAbort('/items')]
      }
    });
    test.runSequence('test');
    test.runSequence('test2');
  });
});
