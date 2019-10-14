import { ModuleFunction } from 'cerebral';

import StorageProvider, { Options, StorageItem } from './StorageProvider';

export { default as StorageProviderError } from './StorageProviderError';

type Change = {
  path: string[];
};

export default (options: Options = {}): ModuleFunction => {
  return ({ app, name }) => {
    const {
      target: targetStorage = localStorage,
      json = true,
      sync,
      prefix
    } = options;
    const finalPrefix = prefix ? prefix + '.' : '';

    app.once('initialized:model', () => {
      Object.keys(sync || {}).forEach(syncKey => {
        const value = targetStorage.getItem(
          finalPrefix + syncKey
        ) as StorageItem;

        if (!value) {
          return;
        }

        const path = sync![syncKey].split('.');
        app.model.set(path, json ? JSON.parse(value) : value);
      });
    });

    if (sync) {
      app.on('flush', (changes: Change[]) => {
        changes.forEach(change => {
          Object.keys(sync).forEach(syncKey => {
            if (change.path.join('.').indexOf(sync[syncKey]) === 0) {
              const value = app.getState(sync[syncKey]);

              value === undefined
                ? targetStorage.removeItem(finalPrefix + syncKey)
                : targetStorage.setItem(
                    finalPrefix + syncKey,
                    json ? JSON.stringify(value) : value
                  );
            }
          });
        });
      });
    }

    return {
      providers: {
        [name]: StorageProvider(options)
      }
    };
  };
};
