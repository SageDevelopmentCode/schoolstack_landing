function hasHorizontalRuleBeforeHeading(body: string, headingOffset: number): boolean {
  const before = body.slice(0, headingOffset);
  return /\n\n---(?:\n\n|\n?$)/.test(before.slice(-12));
}

export function addMarkdownSubsectionBreaks(body: string): string {
  return body
    .replace(/\n\n(## )/g, (match, heading, offset, full) =>
      hasHorizontalRuleBeforeHeading(full, offset) ? match : `\n\n---\n\n${heading}`,
    )
    .replace(/(?<!\n)\n\n(### )/g, '\n\n\n$1')
    .replace(/(?<!\n)\n(\d+\. )/g, '\n\n$1')
    .replace(/(?<!\n)\n\n(\*\*[^*\n]+\*\*\n)/g, '\n\n\n$1')
    .trimEnd();
}
