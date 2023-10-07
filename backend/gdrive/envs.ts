import env from '../../env';

export default {
  get tempAttachmentStorageBucket() {
    return process.env.GOOGLE_CLOUD_STORAGE_ATTACHMENTS_TEMP_BUCKET;
  },
  get attachmentsEncryptionKey() {
    if (env.test || env.e2e) {
      return 'GOOGLE_CLOUD_STORAGE_ATTACHMENTS_ENCRYPTION_KEY';
    }

    return process.env.GOOGLE_CLOUD_STORAGE_ATTACHMENTS_ENCRYPTION_KEY;
  },

  get defaultStorageBucket() {
    if (env.test || env.e2e) {
      return 'GOOGLE_CLOUD_STORAGE_DEFAULT_BUCKET';
    }

    return process.env.GOOGLE_CLOUD_STORAGE_DEFAULT_BUCKET;
  },
  get encryptionKeyVersion() {
    if (env.test || env.e2e) {
      return 'encryptionKeyVersion';
    }

    return process.env.GOOGLE_CLOUD_STORAGE_ENCRYPTION_KEY_VERSION;
  },
};
