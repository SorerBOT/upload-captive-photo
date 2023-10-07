import { getBucket, parseBucketPath } from './get-bucket.js';

interface Options {
  srcFullPath: string;
  destFullPath: string;
  encryptionKey: string;
}

export const copyFile = async ({
  srcFullPath,
  destFullPath,
  encryptionKey,
}: Options): Promise<void> => {
  const { bucketName: srcBucketName, path: srcPath } = parseBucketPath(srcFullPath);
  const { bucketName: destBucketName, path: destPath } = parseBucketPath(destFullPath);

  const sourceBucket = await getBucket(srcBucketName);
  const destBucket = await getBucket(destBucketName);

  await sourceBucket
    .file(srcPath)
    .setEncryptionKey(Buffer.from(encryptionKey, 'base64'))
    .copy(destBucket.file(destPath));

  console.log(`[copyFile] ${srcFullPath} copied to ${destFullPath}`);
};
