export type MarkdownFormat =
  | "bold"
  | "italic"
  | "heading2"
  | "heading3"
  | "bulletList"
  | "numberedList"
  | "horizontalRule";

export type MarkdownFormatResult = {
  nextValue: string;
  nextSelectionStart: number;
  nextSelectionEnd: number;
};

function getLineBounds(value: string, index: number): { start: number; end: number } {
  const start = value.lastIndexOf("\n", index - 1) + 1;
  const nextNewline = value.indexOf("\n", index);
  const end = nextNewline === -1 ? value.length : nextNewline;
  return { start, end };
}

function wrapSelection(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  before: string,
  after: string,
  placeholder: string,
): MarkdownFormatResult {
  const selected = value.slice(selectionStart, selectionEnd);
  const text = selected || placeholder;
  const nextValue =
    value.slice(0, selectionStart) + before + text + after + value.slice(selectionEnd);
  const nextSelectionStart = selectionStart + before.length;
  const nextSelectionEnd = nextSelectionStart + text.length;
  return { nextValue, nextSelectionStart, nextSelectionEnd };
}

function prefixCurrentLine(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  prefix: string,
  placeholder: string,
): MarkdownFormatResult {
  const anchor = selectionStart === selectionEnd ? selectionStart : selectionStart;
  const { start, end } = getLineBounds(value, anchor);
  const line = value.slice(start, end);
  const trimmed = line.trim();

  let nextLine = line;
  if (!trimmed) {
    nextLine = prefix + placeholder;
  } else if (/^#{1,6}\s/.test(trimmed) || /^[-*+]\s/.test(trimmed) || /^\d+\.\s/.test(trimmed)) {
    nextLine = prefix + trimmed.replace(/^(#{1,6}\s+|[-*+]\s+|\d+\.\s+)/, "");
  } else {
    nextLine = prefix + line;
  }

  const nextValue = value.slice(0, start) + nextLine + value.slice(end);
  const nextSelectionStart = start + prefix.length;
  const nextSelectionEnd = nextSelectionStart + (trimmed ? trimmed.length : placeholder.length);
  return { nextValue, nextSelectionStart, nextSelectionEnd };
}

function insertHorizontalRule(
  value: string,
  selectionStart: number,
  selectionEnd: number,
): MarkdownFormatResult {
  let start = selectionStart;
  let end = selectionEnd;

  while (start > 0 && value[start - 1] === "\n") start -= 1;
  while (end < value.length && value[end] === "\n") end += 1;

  const rule = start === 0 ? "---\n\n" : "\n\n---\n\n";
  const nextValue = value.slice(0, start) + rule + value.slice(end);
  const nextSelectionStart = start + rule.length;
  return { nextValue, nextSelectionStart, nextSelectionEnd: nextSelectionStart };
}

export function applyMarkdownFormat(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  format: MarkdownFormat,
): MarkdownFormatResult {
  switch (format) {
    case "bold":
      return wrapSelection(value, selectionStart, selectionEnd, "**", "**", "bold text");
    case "italic":
      return wrapSelection(value, selectionStart, selectionEnd, "*", "*", "italic text");
    case "heading2":
      return prefixCurrentLine(value, selectionStart, selectionEnd, "## ", "Heading");
    case "heading3":
      return prefixCurrentLine(value, selectionStart, selectionEnd, "### ", "Subheading");
    case "bulletList":
      return prefixCurrentLine(value, selectionStart, selectionEnd, "- ", "List item");
    case "numberedList":
      return prefixCurrentLine(value, selectionStart, selectionEnd, "1. ", "List item");
    case "horizontalRule":
      return insertHorizontalRule(value, selectionStart, selectionEnd);
  }
}

function hasHorizontalRuleBeforeHeading(body: string, headingOffset: number): boolean {
  const before = body.slice(0, headingOffset);
  return /\n\n---(?:\n\n|\n?$)/.test(before.slice(-12));
}

export function addMarkdownSubsectionBreaks(body: string): string {
  return body
    .replace(/\n\n(## )/g, (match, heading, offset, full) =>
      hasHorizontalRuleBeforeHeading(full, offset) ? match : `\n\n---\n\n${heading}`,
    )
    .replace(/(?<!\n)\n\n(### )/g, "\n\n\n$1")
    .replace(/(?<!\n)\n(\d+\. )/g, "\n\n$1")
    .replace(/(?<!\n)\n\n(\*\*[^*\n]+\*\*\n)/g, "\n\n\n$1")
    .trimEnd();
}
