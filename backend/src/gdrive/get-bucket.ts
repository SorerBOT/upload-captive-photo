import { Bucket, Storage, StorageOptions } from "@google-cloud/storage";
import { getGoogleCloudCredentials } from "./authentication.js";
import { throw400 } from "../utils/throw-400.js";

const PATH_EXTRACTOR = /^gs:\/\/(.*?)\/(.*)$/i;

let storage: Storage;

const getStorage = () => {
  if (!storage) {
    const credentials: StorageOptions = getGoogleCloudCredentials();
    storage = new Storage(credentials);
  }
  return storage;
};

export const getBucket = (bucketName: string): Bucket => {
  const bucket = getStorage().bucket(bucketName);
  return bucket;
};

export const parseBucketPath = (path: string) => {
  const matches = path.match(PATH_EXTRACTOR);
  if (!matches) {
    throw400(`failed to parse bucket from path ${path}`);
  }

  return {
    bucketName: matches![1],
    path: matches![2],
  };
};
