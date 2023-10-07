import { PassThrough } from "stream";
import { getBucket } from "./get-bucket.js";
import { getGoogleStorageFileOptions } from "./get-google-storage-file-options.js";

const TIMEOUT = 20 * 1000; // 20 seconds

export interface Options {
  bucketName: string;
  path: string;
  data: Buffer;
  contentType: string;
  encryptionKey?: string;
  customMetadata?: Record<string, unknown>;
}

export const storeFile = async ({
  bucketName,
  path,
  data,
  contentType,
  encryptionKey,
  customMetadata = {},
}: Options) => {
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
            "Cache-Control": "public, max-age=31536000",
            "Content-Type": contentType,
            ...customMetadata,
          },
        })
      )
      .on("error", (error: Error) => {
        reject(error);
      })
      .on("finish", () => {
        resolve(true);
      });

    dataStream.end(data);
    // dataStream.write(data);
    // dataStream.end();
    // dataStream.destroy();
  });
};
