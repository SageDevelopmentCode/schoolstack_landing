import { compressImageForUpload } from "@/lib/images/compress-image";

const IMAGE_COMPRESS_OPTIONS = {
  maxWidth: 2048,
  maxHeight: 2048,
  quality: 0.85,
  skipBelowBytes: 300 * 1024,
};

export async function preparePostSubmitStepAttachmentFiles(
  files: File[],
): Promise<File[]> {
  const prepared: File[] = [];
  for (const file of files) {
    if (file.type === "image/jpeg" || file.type === "image/png") {
      prepared.push(await compressImageForUpload(file, IMAGE_COMPRESS_OPTIONS));
    } else {
      prepared.push(file);
    }
  }
  return prepared;
}
