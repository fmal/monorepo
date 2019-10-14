import { CerebralTest } from 'cerebral/test';

import StorageModule, { StorageProviderError } from '../';
import { StorageType, AsyncStorage } from '../StorageProvider';
import { setStorage, removeStorage, getStorage } from '../factories';

function StorageMock(async?: boolean, errorMessage?: string): StorageType {
  const storage: { [key: string]: string } = {};

  if (async) {
    return {
      setItem(key, value) {
        storage[key] = value;

        return errorMessage
          ? Promise.reject(new Error(errorMessage))
          : Promise.resolve();
      },
      getItem(key) {
        return errorMessage
          ? Promise.reject(new Error(errorMessage))
          : Promise.resolve(key in storage ? storage[key] : null);
      },
      removeItem(key) {
        delete storage[key];

        return errorMessage
          ? Promise.reject(new Error(errorMessage))
          : Promise.resolve();
      }
    };
  }

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return {
    setItem(key: string, value: string) {
      storage[key] = value;
    },
    getItem(key: string) {
      return key in storage ? storage[key] : null;
    },
    removeItem(key: string) {
      delete storage[key];
    }
  } as Storage;
}

describe('Storage Provider', () => {
  describe('sync', () => {
    it('should set value in storage', () => {
      const target = StorageMock();
      const test = CerebralTest({
        modules: {
          storage: StorageModule({
            target
          })
        },
        sequences: {
          test: setStorage('foo', 'bar')
        }
      });

      return test.runSequence('test').then(() => {
        expect(target.getItem('foo')).toBe(JSON.stringify('bar'));
      });
    });
    it('should get value in storage', () => {
      const target = StorageMock();
      const test = CerebralTest(
        {
          modules: {
            storage: StorageModule({
              target
            })
          },
          sequences: {
            test: [setStorage('foo', 'bar'), getStorage('foo')]
          }
        },
        {
          recordActions: 'byName'
        }
      );
      return test.runSequence('test').then(({ getStorage }) => {
        expect(getStorage.output.value).toBe('bar');
      });
    });
    it('should remove value in storage', () => {
      const target = StorageMock();
      const test = CerebralTest({
        modules: {
          storage: StorageModule({
            target
          })
        },
        sequences: {
          test: [
            setStorage('foo', 'bar'),
            getStorage('foo'),
            ({ props }: any) => {
              expect(props.value).toBe('bar');
            },
            removeStorage('foo'),
            () => expect(target.getItem('foo')).toBeNull()
          ]
        }
      });

      return test.runSequence('test');
    });
  });
  describe('async', () => {
    it('should set value in storage', () => {
      const target = StorageMock(true) as AsyncStorage;
      const test = CerebralTest({
        modules: {
          storage: StorageModule({
            target
          })
        },
        sequences: {
          test: setStorage('foo', 'bar')
        }
      });
      return test.runSequence('test').then(() => {
        return target.getItem('foo').then(value => {
          expect(value).toBe(JSON.stringify('bar'));
        });
      });
    });
    it('should get value in storage', () => {
      const target = StorageMock(true);
      const test = CerebralTest(
        {
          modules: {
            storage: StorageModule({
              target
            })
          },
          sequences: {
            test: [setStorage('foo', 'bar'), getStorage('foo')]
          }
        },
        {
          recordActions: 'byName'
        }
      );

      return test.runSequence('test').then(({ getStorage }) => {
        expect(getStorage.output.value).toBe('bar');
      });
    });
    it('should remove value in storage', () => {
      const target = StorageMock(true);
      const test = CerebralTest(
        {
          modules: {
            storage: StorageModule({
              target
            })
          },
          sequences: {
            test: [
              setStorage('foo', 'bar'),
              getStorage('foo'),
              ({ props }: any) => {
                expect(props.value).toBe('bar');
              },
              removeStorage('foo'),
              getStorage('foo'),
              ({ props }: any) => {
                expect(props.value).toBeNull();
              }
            ]
          }
        },
        {
          recordActions: true
        }
      );

      return test.runSequence('test');
    });
    it('should throw StorageProviderError', () => {
      const target = StorageMock(true, 'error');
      const test = CerebralTest({
        modules: {
          storage: StorageModule({
            target
          })
        },
        sequences: {
          test: [
            setStorage('foo', 'bar'),
            {
              success: [],
              error: [
                ({ props }: any) => {
                  expect(props.error).toBeInstanceOf(StorageProviderError);
                }
              ]
            }
          ]
        }
      });
      return test.runSequence('test');
    });
  });
  it('should use prefix if defined', () => {
    const target = StorageMock();
    const test = CerebralTest({
      modules: {
        storage: StorageModule({
          target,
          prefix: 'bah'
        })
      },
      sequences: {
        test: setStorage('foo', 'bar')
      }
    });

    return test.runSequence('test').then(() => {
      expect(target.getItem('bah.foo')).toBe(JSON.stringify('bar'));
    });
  });
  it('should sync defined state changes with storage', () => {
    const target = StorageMock();
    const test = CerebralTest({
      state: {
        foo: 'bar'
      },
      modules: {
        storage: StorageModule({
          target,
          sync: {
            foo: 'foo'
          }
        })
      },
      sequences: {
        test: ({ store }: any) => store.set('foo', 'bar2')
      }
    });
    return test.runSequence('test').then(() => {
      expect(target.getItem('foo')).toBe(JSON.stringify('bar2'));
    });
  });
  it('should sync defined state changes with storage on initialization', () => {
    const target = StorageMock();
    target.setItem('foo', JSON.stringify('bar2'));
    const test = CerebralTest({
      state: {
        foo: 'bar'
      },
      modules: {
        storage: StorageModule({
          target,
          sync: {
            foo: 'foo'
          }
        })
      }
    });

    expect(test.getState('foo')).toBe('bar2');
  });
});
