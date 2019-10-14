import StorageProviderError from './StorageProviderError';

export type StorageItem = string | null;

export type AsyncStorage = {
  setItem: (key: string, item: string) => Promise<void>;
  getItem: (key: string) => Promise<StorageItem>;
  removeItem: (key: string) => Promise<void>;
};

export type StorageType = Storage | AsyncStorage;

export type Options = {
  prefix?: string;
  target?: StorageType;
  json?: boolean;
  sync?: { [key: string]: string };
};

export type StorageProviderInstance = {
  get(key: string): Promise<StorageItem> | StorageItem;
  set(key: string, value: string): Promise<void> | undefined;
  remove(key: string): Promise<void> | undefined;
};

export default function StorageProvider({
  target = localStorage,
  json = true,
  prefix
}: Options = {}): StorageProviderInstance {
  const finalPrefix = prefix ? prefix + '.' : '';

  return {
    get(key) {
      const value = target.getItem(finalPrefix + key);

      function resolveValue(value: string | null) {
        if (json && value) {
          return JSON.parse(value);
        }

        return value;
      }

      if (value instanceof Promise) {
        return value.then(resolveValue).catch(error => {
          throw new StorageProviderError(error);
        });
      }

      return resolveValue(value);
    },
    set(key, value) {
      const maybePromise =
        value === undefined
          ? target.removeItem(finalPrefix + key)
          : target.setItem(
              finalPrefix + key,
              json ? JSON.stringify(value) : value
            );

      if (maybePromise instanceof Promise) {
        return maybePromise.catch(error => {
          throw new StorageProviderError(error);
        });
      }
    },
    remove(key) {
      const maybePromise = target.removeItem(finalPrefix + key);

      if (maybePromise instanceof Promise) {
        return maybePromise.catch(error => {
          throw new StorageProviderError(error);
        });
      }
    }
  };
}
