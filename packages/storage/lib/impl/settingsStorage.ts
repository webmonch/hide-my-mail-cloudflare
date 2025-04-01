import type { BaseStorage } from '../base/index.js';
import { createStorage, StorageEnum } from '../base/index.js';

export type ExtSettings = {
  cloudflareApiKey?: string;
  destinationEmail?: string;
  zoneId?: string;
  inited?: boolean;
  accountId?: string;
  accountDomain?: string;
};

type SettingsStorage = BaseStorage<ExtSettings> & {
  update: (settings: ExtSettings) => Promise<void>;
};

const storage = createStorage<ExtSettings>(
  'cf-ext-settings',
  {},
  {
    storageEnum: StorageEnum.Local,
    liveUpdate: true,
  },
);

export const settingsStorage: SettingsStorage = {
  ...storage,
  update: async (settings: ExtSettings) => await storage.set(settings),
};
