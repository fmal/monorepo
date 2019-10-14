import { ActionCtx } from './types';

export default function setStorageFactory(key: string, value: string) {
  return function setStorage({ storage, resolve, path }: ActionCtx) {
    const maybePromise = storage.set(resolve.value(key), resolve.value(value));

    if (maybePromise instanceof Promise && path) {
      return maybePromise
        .then(() => path.success())
        .catch(error => path.error({ error }));
    } else if (maybePromise instanceof Promise) {
      return maybePromise;
    }
  };
}
