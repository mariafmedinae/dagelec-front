import { fromBlob } from 'image-resize-compress';

// ----------------------------------------------------------------------

export async function compressFile(file: File, customWidth?: any) {
  const quality = 80;
  const width = customWidth ? customWidth : 500;
  const height = 'auto';
  const format = 'jpeg';

  const resizedFile = await fromBlob(file, quality, width, height, format);

  const name = `${file.name.split('.').shift()}.jpeg`;
  const type = resizedFile.type;
  const lastModified = new Date().getTime();

  const newFile = new File([resizedFile], name, {
    type: type,
    lastModified: lastModified,
  });

  return newFile;
}
