export type LocalUploadFile = {
  uri: string;
  name: string;
  type: string;
};

export class LocalFileReadError extends Error {
  constructor(message = 'Could not read file for upload.') {
    super(message);
    this.name = 'LocalFileReadError';
  }
}

export async function readLocalFileBlob(uri: string): Promise<Blob> {
  const response = await fetch(uri);
  if (!response.ok) {
    throw new LocalFileReadError();
  }

  return response.blob();
}

/**
 * Expo Winter `fetch` cannot serialize React Native `{ uri, name, type }` FormData parts.
 * Read the local file into a Blob before append.
 */
export async function appendLocalFileToFormData(
  formData: FormData,
  fieldName: string,
  file: LocalUploadFile,
): Promise<void> {
  const blob = await readLocalFileBlob(file.uri);
  formData.append(fieldName, blob, file.name);
}
