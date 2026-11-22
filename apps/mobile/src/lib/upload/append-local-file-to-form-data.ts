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

const GENERIC_BLOB_TYPES = new Set(['', 'application/octet-stream', 'binary/octet-stream']);

/**
 * Expo Winter `fetch` cannot serialize React Native `{ uri, name, type }` FormData parts.
 * Read the local file into a Blob before append.
 *
 * The Blob's type comes from the local fetch, which on Android is often
 * `application/octet-stream`. The multipart part uses the Blob's type, so fall
 * back to the type the picker reported, or the server rejects the file.
 */
export async function appendLocalFileToFormData(
  formData: FormData,
  fieldName: string,
  file: LocalUploadFile,
): Promise<void> {
  const blob = await readLocalFileBlob(file.uri);
  const declaredType = file.type.trim();
  const part =
    GENERIC_BLOB_TYPES.has(blob.type) && !GENERIC_BLOB_TYPES.has(declaredType)
      ? new Blob([blob], { type: declaredType })
      : blob;
  formData.append(fieldName, part, file.name);
}
