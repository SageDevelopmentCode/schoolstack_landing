/** Fail fast before a real Zoho send if HTML still contains dev-only hosts. */
export function assertNoLocalhostInOutboundHtml(html: string): void {
  if (/localhost/i.test(html) || /127\.0\.0\.1/.test(html)) {
    throw new Error(
      "Outbound email HTML contains localhost — fix site URL before sending",
    );
  }
}
