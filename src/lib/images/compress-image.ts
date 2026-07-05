const RASTER_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export type CompressImageOptions = {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  skipBelowBytes?: number;
};

export class ImageCompressionError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "ImageCompressionError";
    this.code = code;
  }
}

function shouldCompressRaster(file: File, options: CompressImageOptions): boolean {
  if (!RASTER_MIME_TYPES.has(file.type)) {
    return false;
  }

  if (
    options.skipBelowBytes !== undefined &&
    file.size <= options.skipBelowBytes
  ) {
    return false;
  }

  return true;
}

function scaledDimensions(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number,
): { width: number; height: number } {
  if (width <= maxWidth && height <= maxHeight) {
    return { width, height };
  }

  const scale = Math.min(maxWidth / width, maxHeight / height);
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function fileNameWithWebpExtension(fileName: string): string {
  const base = fileName.replace(/\.[^/.]+$/, "") || "image";
  return `${base}.webp`;
}

async function createBitmap(file: File): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file, {
      imageOrientation: "from-image",
    });
  } catch {
    return createImageBitmap(file);
  }
}

function canvasToWebpBlob(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new ImageCompressionError("Failed to encode image.", "encode_failed"));
      },
      "image/webp",
      quality,
    );
  });
}

export async function compressImageForUpload(
  file: File,
  options: CompressImageOptions,
): Promise<File> {
  if (file.type === "image/svg+xml" || file.type === "application/pdf") {
    return file;
  }

  if (!shouldCompressRaster(file, options)) {
    return file;
  }

  if (typeof createImageBitmap !== "function") {
    return file;
  }

  let bitmap: ImageBitmap | null = null;

  try {
    bitmap = await createBitmap(file);
    const { width, height } = scaledDimensions(
      bitmap.width,
      bitmap.height,
      options.maxWidth,
      options.maxHeight,
    );

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new ImageCompressionError(
        "Image compression is not supported in this browser.",
        "canvas_unavailable",
      );
    }

    context.drawImage(bitmap, 0, 0, width, height);
    const blob = await canvasToWebpBlob(canvas, options.quality);

    if (!blob || blob.size >= file.size) {
      return file;
    }

    return new File([blob], fileNameWithWebpExtension(file.name), {
      type: "image/webp",
      lastModified: Date.now(),
    });
  } catch (error) {
    if (error instanceof ImageCompressionError) {
      throw error;
    }

    throw new ImageCompressionError(
      "Failed to optimize image before upload.",
      "compress_failed",
    );
  } finally {
    bitmap?.close();
  }
}
