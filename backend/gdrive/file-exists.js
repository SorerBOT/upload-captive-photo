import { getBucket, parseBucketPath } from './get-bucket';

export const fileExists = async (filePath)  => {
  const { bucketName, path } = parseBucketPath(filePath);
  const bucket = await getBucket(bucketName);

  const exists = await bucket.file(path).exists();
  return exists[0];
};
