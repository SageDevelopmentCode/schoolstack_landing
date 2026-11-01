export class MobileApiFormDataError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly responsePreview?: string;

  constructor(
    message: string,
    status: number,
    options?: { code?: string; responsePreview?: string },
  ) {
    super(message);
    this.name = 'MobileApiFormDataError';
    this.status = status;
    this.code = options?.code;
    this.responsePreview = options?.responsePreview;
  }
}

function trimResponsePreview(rawText: string, maxLength = 240): string | undefined {
  const trimmed = rawText.trim();
  if (!trimmed) {
    return undefined;
  }
  return trimmed.length <= maxLength ? trimmed : `${trimmed.slice(0, maxLength)}…`;
}

export function messageForFailedFormDataResponse(
  status: number,
  payload: { error?: string; code?: string },
  rawText: string,
): string {
  if (typeof payload.error === 'string' && payload.error.trim()) {
    return payload.error.trim();
  }

  if (status === 413) {
    return 'Too many photos at once — try fewer or upload again in smaller groups.';
  }

  if (status >= 500) {
    return 'Upload failed due to a server error. Please try again.';
  }

  return 'Request failed.';
}

export function throwMobileApiFormDataError(
  status: number,
  payload: { error?: string; code?: string },
  rawText: string,
): never {
  throw new MobileApiFormDataError(
    messageForFailedFormDataResponse(status, payload, rawText),
    status,
    {
      code: typeof payload.code === 'string' ? payload.code : undefined,
      responsePreview: trimResponsePreview(rawText),
    },
  );
}
