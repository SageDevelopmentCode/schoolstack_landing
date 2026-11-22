import { PortalRouteError } from "@/lib/api/portal-route-errors";

/**
 * Some clients send a generic or non-standard MIME type for a file whose
 * extension is clear. The Android photo picker in the mobile app, for example,
 * sends `application/octet-stream` for `1000047910.jpg`.
 */
const GENERIC_MIME_TYPES = new Set([
  "",
  "application/octet-stream",
  "binary/octet-stream",
]);

const MIME_TYPE_ALIASES: Record<string, string> = {
  "image/jpg": "image/jpeg",
  "image/pjpeg": "image/jpeg",
  "image/x-png": "image/png",
};

const MIME_TYPE_BY_EXTENSION: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  pdf: "application/pdf",
};

function mimeTypeFromFileName(fileName: string): string | null {
  const dot = fileName.lastIndexOf(".");
  if (dot < 0) return null;
  const extension = fileName.slice(dot + 1).toLowerCase();
  return MIME_TYPE_BY_EXTENSION[extension] ?? null;
}

export function resolveUploadMimeType(file: File): string | null {
  const declared = file.type.trim().toLowerCase();
  if (MIME_TYPE_ALIASES[declared]) return MIME_TYPE_ALIASES[declared];
  if (GENERIC_MIME_TYPES.has(declared)) return mimeTypeFromFileName(file.name);
  return declared;
}

export function assertUploadFileSize(file: File, maxBytes: number): void {
  if (file.size > maxBytes) {
    const limitMb = Math.round(maxBytes / (1024 * 1024));
    throw new PortalRouteError(
      `"${file.name}" exceeds the ${limitMb} MB limit.`,
      400,
      "file_too_large",
    );
  }
}

/**
 * Returns the file with an allowed MIME type, retyped from its extension when
 * the client sent a generic or aliased type. Throws a 400 `PortalRouteError`
 * when the type is not allowed.
 */
export function normalizeUploadFile(
  file: File,
  allowedMimeTypes: ReadonlySet<string>,
): File {
  if (allowedMimeTypes.has(file.type)) return file;

  const resolved = resolveUploadMimeType(file);
  if (!resolved || !allowedMimeTypes.has(resolved)) {
    throw new PortalRouteError(
      `"${file.name}" is not a supported file type.`,
      400,
      "unsupported_file_type",
    );
  }

  return new File([file], file.name, {
    type: resolved,
    lastModified: file.lastModified,
  });
}
