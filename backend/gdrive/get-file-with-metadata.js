import { getBucket, parseBucketPath } from './get-bucket';
import { getGoogleStorageFileOptions } from './get-google-storage-file-options';

export const getFileWithMetadata = async (
  filePath,
  options = {},
) => {
  const { bucketName, path } = parseBucketPath(filePath);
  const bucket = await getBucket(bucketName);

  const getMetadata = async () => {
    const metadata = await getBucket(bucketName).file(path).getMetadata();
    return metadata[0];
  };

  const isEncrypted = (metadata) => metadata.customerEncryption !== undefined;

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

const getFileWithMetadataBuffered = ({
  bucket,
  path,
  metadata,
  encryptionKey,
}) =>
  new Promise((resolve, reject) => {
    const fileOptions = getGoogleStorageFileOptions(encryptionKey);
    const contentBuffers = [];

    bucket
      .file(path, fileOptions)
      .createReadStream()
      .on('data', (buf) => {
        contentBuffers.push(Buffer.from(buf));
      })
      .on('error', (error) => {
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
}) =>
  new Promise((resolve, reject) => {
    const fileOptions = getGoogleStorageFileOptions(encryptionKey);

    bucket
      .file(path, fileOptions)
      .createReadStream()
      .pipe(outputStream)
      .on('error', (error) => {
        reject(error);
      })
      .on('finish', () => {
        resolve({ metadata });
      });
  });
