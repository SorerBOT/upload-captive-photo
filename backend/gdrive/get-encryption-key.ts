import envs from './envs';

export const getEncryptionKey = () => ({
  key: envs.attachmentsEncryptionKey,
  version: envs.encryptionKeyVersion,
});
