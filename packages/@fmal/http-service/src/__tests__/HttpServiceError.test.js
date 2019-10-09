import HttpServiceError from '../HttpServiceError';

describe('errors', () => {
  it('should have base error', () => {
    const error = new HttpServiceError(
      undefined,
      200,
      { foo: 'bar' },
      'foo',
      'msg'
    );
    expect(error instanceof Error).toBeTruthy();
    expect(error.stack).toBeTruthy();

    // Workaround for https://github.com/istanbuljs/babel-plugin-istanbul/issues/143
    // (when using coverage with Jest, the toJSON method is lost)
    const json = HttpServiceError.prototype.toJSON.apply(error);

    expect(json.name).toBe('HttpServiceError');
    expect(json.type).toBe('http');
    expect(json.response.status).toBe(200);
    expect(json.response.headers).toEqual({ foo: 'bar' });
    expect(json.response.result).toBe('foo');
    expect(json.message).toBe('msg');
  });
});
