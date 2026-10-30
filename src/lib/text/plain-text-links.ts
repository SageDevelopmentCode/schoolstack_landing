export type PlainTextLinkSegment =
  | { type: "text"; value: string }
  | { type: "link"; value: string; href: string };

const URL_PATTERN = /https?:\/\/[^\s<>"']+/gi;

const TRAILING_PUNCTUATION = /[.,;)\]"']+$/;

function normalizeHttpHref(raw: string): string | null {
  const trimmed = raw.replace(TRAILING_PUNCTUATION, "");
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return parsed.href;
  } catch {
    return null;
  }
}

/**
 * Splits plain text into text and http(s) link segments for autolink UI.
 */
export function splitPlainTextLinks(text: string): PlainTextLinkSegment[] {
  if (!text) return [];

  const segments: PlainTextLinkSegment[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(URL_PATTERN)) {
    const raw = match[0];
    const start = match.index ?? 0;
    if (start > lastIndex) {
      segments.push({ type: "text", value: text.slice(lastIndex, start) });
    }

    const displayValue = raw.replace(TRAILING_PUNCTUATION, "");
    const trailing = raw.slice(displayValue.length);
    const href = normalizeHttpHref(raw);

    if (href) {
      segments.push({ type: "link", value: displayValue, href });
      if (trailing) {
        segments.push({ type: "text", value: trailing });
      }
    } else {
      segments.push({ type: "text", value: raw });
    }

    lastIndex = start + raw.length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: "text", value: text.slice(lastIndex) });
  }

  return segments.length > 0 ? segments : [{ type: "text", value: text }];
}
