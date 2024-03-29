export default class StorageProviderError extends Error {
  constructor(error: Error) {
    super(error.message);
    this.name = 'StorageProviderError';
    this.message = error.message;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      stack: this.stack
    };
  }
}
