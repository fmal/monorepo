export default class HttpServiceError extends Error {
  constructor(type, status, headers, result, message = null) {
    super(message);
    this.name = 'HttpServiceError';
    this.type = type || 'http';
    this.response = {
      status,
      headers,
      result
    };
  }

  toJSON() {
    return {
      type: this.type,
      name: this.name,
      message: this.message,
      response: this.response,
      stack: this.stack
    };
  }
}
