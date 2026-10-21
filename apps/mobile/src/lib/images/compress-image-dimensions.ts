export function computeScaledDimensions(
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

export function shouldSkipImageCompression(
  fileSize: number | null | undefined,
  skipBelowBytes?: number,
): boolean {
  if (skipBelowBytes === undefined || fileSize == null) {
    return false;
  }
  return fileSize <= skipBelowBytes;
}
