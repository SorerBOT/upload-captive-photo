export default {
  get tempAttachmentStorageBucket() {
    return process.env.GOOGLE_CLOUD_STORAGE_ATTACHMENTS_TEMP_BUCKET;
  },
  get attachmentsEncryptionKey() {
    return process.env.GOOGLE_CLOUD_STORAGE_ATTACHMENTS_ENCRYPTION_KEY;
  },

  get defaultStorageBucket() {
    return process.env.GOOGLE_CLOUD_STORAGE_DEFAULT_BUCKET;
  },
  get encryptionKeyVersion() {
    return process.env.GOOGLE_CLOUD_STORAGE_ENCRYPTION_KEY_VERSION;
  },
};
