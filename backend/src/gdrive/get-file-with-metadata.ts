import { WriteStream } from 'fs';
import { Bucket } from '@google-cloud/storage';
import { Metadata } from '@google-cloud/common';

import { getBucket, parseBucketPath } from './get-bucket.js';
import { getGoogleStorageFileOptions } from './get-google-storage-file-options.js';

interface ReadFileOptions {
  encryptionKey?: string;
  outputStream?: WriteStream;
}

interface Result {
  file?: Buffer;
  metadata: any;
}

export const getFileWithMetadata = async (
  filePath: string,
  options: ReadFileOptions = {},
): Promise<Result> => {
  const { bucketName, path } = parseBucketPath(filePath);
  const bucket = await getBucket(bucketName);

  const getMetadata = async () => {
    const metadata = await getBucket(bucketName).file(path).getMetadata();
    return metadata[0];
  };

  const isEncrypted = (metadata: any) => metadata.customerEncryption !== undefined;

  const metadata = await getMetadata();
  const isFileEncrypted = isEncrypted(metadata);
  const encryptionKey = isFileEncrypted ? options.encryptionKey : undefined;

  if (isFileEncrypted && encryptionKey === undefined) {
    // happens if the secret is missing
    console.error(
      '[ALERT][getFileWithMetadata] received encrypted file for request without encryption key',
      filePath,
      options,
    );
    throw new Error('Missing encryption key');
  }

  if (options.outputStream) {
    return getFileWithMetadataStreamed({ bucket, path, metadata, ...options });
  }
  return getFileWithMetadataBuffered({ bucket, path, metadata, ...options });
};

interface GetFileContentOptions extends ReadFileOptions {
  bucket: Bucket;
  path: string;
  metadata: Metadata;
}

const getFileWithMetadataBuffered = ({
  bucket,
  path,
  metadata,
  encryptionKey,
}: GetFileContentOptions): Promise<Result> =>
  new Promise((resolve, reject) => {
    const fileOptions = getGoogleStorageFileOptions(encryptionKey);
    const contentBuffers: Buffer[] = [];

    bucket
      .file(path, fileOptions)
      .createReadStream()
      .on('data', (buf: Buffer) => {
        contentBuffers.push(Buffer.from(buf));
      })
      .on('error', (error: Error) => {
        reject(error);
      })
      .on('finish', () => {
        const totalLength = contentBuffers.reduce((acc, buf1) => acc + buf1.length, 0);

        resolve({ metadata, file: Buffer.concat(contentBuffers, totalLength) });
      });
  });

const getFileWithMetadataStreamed = ({
  bucket,
  path,
  metadata,
  encryptionKey,
  outputStream,
}: GetFileContentOptions): Promise<Result> =>
  new Promise((resolve, reject) => {
    const fileOptions = getGoogleStorageFileOptions(encryptionKey);

    bucket
      .file(path, fileOptions)
      .createReadStream()
      .pipe(outputStream!)
      .on('error', (error: Error) => {
        reject(error);
      })
      .on('finish', () => {
        resolve({ metadata });
      });
  });
