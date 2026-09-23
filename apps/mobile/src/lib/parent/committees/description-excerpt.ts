const SENTENCE_SPLIT = /(?<=[.!?])(?:\s+|$)/;
const INLINE_BULLET_SPLIT = /\s•\s/;
const MAX_CHAR_FALLBACK = 140;

function splitSentences(text: string): string[] {
  return text
    .split(SENTENCE_SPLIT)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function splitLineIntoSegments(line: string): string[] {
  const trimmed = line.trim();
  if (!trimmed) return [];

  if (trimmed.startsWith('•')) {
    const parts = trimmed.split(INLINE_BULLET_SPLIT).map((part) => part.trim()).filter(Boolean);
    return parts.map((part, index) =>
      index === 0 && part.startsWith('•') ? part : `• ${part.replace(/^•\s*/, '')}`,
    );
  }

  if (INLINE_BULLET_SPLIT.test(trimmed)) {
    const parts = trimmed.split(INLINE_BULLET_SPLIT).map((part) => part.trim()).filter(Boolean);
    const segments: string[] = [];

    if (parts[0]) {
      segments.push(...splitSentences(parts[0]));
    }

    for (let index = 1; index < parts.length; index += 1) {
      segments.push(`• ${parts[index]}`);
    }

    return segments;
  }

  return splitSentences(trimmed);
}

function splitIntoSegments(description: string): string[] {
  const normalized = description.trim().replace(/\r\n/g, '\n');
  if (!normalized) return [];

  const lines = normalized.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  return lines.flatMap(splitLineIntoSegments);
}

function truncateByChars(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;

  const slice = text.slice(0, maxChars);
  const lastSpace = slice.lastIndexOf(' ');
  const cut = lastSpace > maxChars * 0.6 ? slice.slice(0, lastSpace) : slice;
  return `${cut}…`;
}

export function getCommitteeDescriptionExcerpt(
  description: string,
  maxSegments = 2,
): { excerpt: string; isTruncated: boolean } {
  const trimmed = description.trim();
  if (!trimmed) {
    return { excerpt: '', isTruncated: false };
  }

  const segments = splitIntoSegments(trimmed);
  const combined = segments.length > 0 ? segments.join(' ') : trimmed;

  if (segments.length > maxSegments) {
    return {
      excerpt: segments.slice(0, maxSegments).join(' '),
      isTruncated: true,
    };
  }

  if (segments.length <= 1 && combined.length > MAX_CHAR_FALLBACK) {
    return {
      excerpt: truncateByChars(combined, MAX_CHAR_FALLBACK),
      isTruncated: true,
    };
  }

  return { excerpt: combined, isTruncated: false };
}
