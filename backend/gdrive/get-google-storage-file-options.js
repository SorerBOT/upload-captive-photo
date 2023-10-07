export function getGoogleStorageFileOptions(encryptionKey) {
  if (encryptionKey !== undefined) {
    return {
      encryptionKey: Buffer.from(encryptionKey, 'base64'),
    };
  }
  return {};
}
