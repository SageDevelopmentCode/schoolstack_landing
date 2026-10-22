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

/**
 * Expo Winter `fetch` cannot serialize React Native `{ uri, name, type }` FormData parts.
 * Read the local file into a Blob before append.
 */
export async function appendLocalFileToFormData(
  formData: FormData,
  fieldName: string,
  file: LocalUploadFile,
): Promise<void> {
  const response = await fetch(file.uri);
  if (!response.ok) {
    throw new LocalFileReadError();
  }

  const blob = await response.blob();
  formData.append(fieldName, blob, file.name);
}
