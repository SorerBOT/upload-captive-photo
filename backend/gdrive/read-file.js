import { WriteStream } from 'fs';
import { getFileWithMetadata } from './get-file-with-metadata';


export const readFile = async (
  filePath,
  options = {},
) => {
  const { file } = await getFileWithMetadata(filePath, options);

  return file;
};
