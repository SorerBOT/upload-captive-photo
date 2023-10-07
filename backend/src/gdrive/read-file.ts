import { WriteStream } from 'fs';
import { getFileWithMetadata } from './get-file-with-metadata.js';

interface ReadFileOptions {
  encryptionKey?: string;
  outputStream?: WriteStream;
}

export const readFile = async (
  filePath: string,
  options: ReadFileOptions = {},
): Promise<Buffer | undefined> => {
  const { file } = await getFileWithMetadata(filePath, options);

  return file;
};
