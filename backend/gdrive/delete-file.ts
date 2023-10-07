import { getBucket, parseBucketPath } from './get-bucket';

interface Options {
  filePath: string;
}

export const deleteFile = async ({ filePath }: Options): Promise<void> => {
  const { bucketName: srcBucketName, path: srcPath } = parseBucketPath(filePath);
  const sourceBucket = await getBucket(srcBucketName);
  await sourceBucket.file(srcPath).delete();

  console.log(`[deleteFile] ${filePath} deleted`);
};
