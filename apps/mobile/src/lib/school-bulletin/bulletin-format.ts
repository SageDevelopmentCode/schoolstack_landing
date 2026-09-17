export function formatBulletinListDate(publishedAt?: string, createdAt?: string): string {
  const value = publishedAt ?? createdAt;
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function formatBulletinDetailDate(publishedAt?: string, createdAt?: string): string {
  const value = publishedAt ?? createdAt;
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function bulletinBodyExcerpt(body: string, maxLength = 80): string {
  const trimmed = body.trim();
  if (!trimmed) return '';
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength).trim()}…`;
}

export function buildEmbeddedPdfViewerUrl(signedUrl: string): string {
  const fragment = 'navpanes=0&view=FitH';
  if (signedUrl.includes('#')) {
    return `${signedUrl}&${fragment}`;
  }
  return `${signedUrl}#${fragment}`;
}
