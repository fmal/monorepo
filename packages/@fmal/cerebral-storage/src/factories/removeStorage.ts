import { ActionCtx } from './types';

export default function removeStorageFactory(key: string) {
  return function removeStorage({ storage, resolve, path }: ActionCtx) {
    const maybePromise = storage.remove(resolve.value(key));

    if (maybePromise instanceof Promise && path) {
      return maybePromise
        .then(() => path.success())
        .catch(error => path.error({ error }));
    } else if (maybePromise instanceof Promise) {
      return maybePromise;
    }
  };
}
