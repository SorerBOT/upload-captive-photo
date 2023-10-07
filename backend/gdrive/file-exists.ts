import { getBucket, parseBucketPath } from './get-bucket';

export const fileExists = async (filePath: string): Promise<boolean> => {
  const { bucketName, path } = parseBucketPath(filePath);
  const bucket = await getBucket(bucketName);

  const exists = await bucket.file(path).exists();
  return exists[0];
};
