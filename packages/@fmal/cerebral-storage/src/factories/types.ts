import { IContext } from 'cerebral';

import { StorageProviderInstance } from '../StorageProvider';

export type ActionCtx = IContext & {
  storage: StorageProviderInstance;
};
