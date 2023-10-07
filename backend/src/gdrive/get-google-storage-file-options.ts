export function getGoogleStorageFileOptions(encryptionKey?: string) {
  if (encryptionKey !== undefined) {
    return {
      encryptionKey: Buffer.from(encryptionKey, 'base64'),
    };
  }
  return {};
}
