import { ActionCtx } from './types';

export default function getStorageFactory(key: string) {
  return function getStorage({ storage, resolve, path }: ActionCtx) {
    const value = storage.get(resolve.value(key));

    if (value instanceof Promise && path) {
      return value
        .then(() => path.success())
        .catch(error => path.error({ error }));
    } else if (value instanceof Promise) {
      return value.then(value => ({
        value
      }));
    }

    return {
      value
    };
  };
}
