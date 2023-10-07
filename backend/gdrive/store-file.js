import { getBucket } from './get-bucket';
import { PassThrough } from 'stream';
import { getGoogleStorageFileOptions } from './get-google-storage-file-options';

const TIMEOUT = 20 * 1000; // 20 seconds

export const storeFile = async ({
  bucketName,
  path,
  data,
  contentType,
  encryptionKey,
}) => {
  const dataStream = new PassThrough();
  const bucket = await getBucket(bucketName);

  const fileOptions = getGoogleStorageFileOptions(encryptionKey);
  return new Promise((resolve, reject) => {
    dataStream
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
        reject(error);
      })
      .on('finish', () => {
        resolve(true);
      });

    dataStream.end(data);
    // dataStream.write(data);
    // dataStream.end();
    // dataStream.destroy();
  });
};
