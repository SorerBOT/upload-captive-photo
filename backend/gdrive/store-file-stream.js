import { PassThrough, Writable } from 'stream';
import { getBucket } from './get-bucket';
import { getEncryptionKey } from './get-encryption-key';
import { getGoogleStorageFileOptions } from './get-google-storage-file-options';
import { envs } from './envs';

const TIMEOUT = 20 * 1000; // 20 seconds


export const storeFileStream = ({ file, filename, contentType, cb }) => {
  const bucketName = envs.tempAttachmentStorageBucket;
  const bucket = getBucket(bucketName);
  const { key: encryptionKey } = getEncryptionKey();
  const path = `${Date.now()}_${Math.floor(Math.random() * 10000)}_${filename}`;

  const fileOptions = getGoogleStorageFileOptions(encryptionKey);
  file
    .pipe(
      bucket.file(path, fileOptions).createWriteStream({
        resumable: false,
        validation: false,
        timeout: TIMEOUT,
        metadata: {
          'Cache-Control': 'public, max-age=31536000',
          'Content-Type': contentType,
        },
      }),
    )
    .on('error', (error) => {
      console.error('[StoreFileStream] Failed to upload file', path, error);
      cb(undefined, error);
    })
    .on('finish', () => {
      console.info('[StoreFileStream] Finish to upload file', path);
      cb(`gs://${bucketName}/${path}`);
    });
};
