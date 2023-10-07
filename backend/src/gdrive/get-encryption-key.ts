import envs from './envs.js';

export const getEncryptionKey = () => ({
  key: envs.attachmentsEncryptionKey,
  version: envs.encryptionKeyVersion,
});
