import { SITE_NAME, SITE_URL } from "@/lib/site";

const COLORS = {
  accent: "#2E4A3C",
  accentDark: "#C5D5B8",
  clay: "#A05C45",
} as const;

const MUTED_OPACITY = "0.65";

const FONT_BODY =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

const LOGO_URL = `${SITE_URL}/images/Logo.png`;
const SITE_HOST = SITE_URL.replace(/^https?:\/\//, "");

const EMAIL_DARK_MODE_CSS = `<style>
  @media (prefers-color-scheme: dark) {
    .email-accent { color: ${COLORS.accentDark} !important; }
    .email-link { color: ${COLORS.accentDark} !important; }
  }
</style>`;

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function emailShell(opts: { preheader: string; bodyHtml: string }): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>${escapeHtml(SITE_NAME)}</title>
  ${EMAIL_DARK_MODE_CSS}
</head>
<body style="margin:0;padding:0;font-family:${FONT_BODY};-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    ${escapeHtml(opts.preheader)}
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">
          ${opts.bodyHtml}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function emailHeader(): string {
  return `<tr>
  <td style="padding:28px 32px 8px;text-align:center;">
    <a href="${SITE_URL}" style="text-decoration:none;display:inline-block;">
      <img src="${LOGO_URL}" alt="${escapeHtml(SITE_NAME)}" width="120" height="auto" style="display:block;border:0;max-width:120px;height:auto;margin:0 auto;">
    </a>
  </td>
</tr>`;
}

export function emailContentBlock(innerHtml: string): string {
  return `<tr>
  <td style="padding:28px 32px 24px;">
    ${innerHtml}
  </td>
</tr>`;
}

export function emailBadge(text: string): string {
  return `<p style="margin:0 0 12px;font-family:${FONT_BODY};font-size:12px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;opacity:${MUTED_OPACITY};">
  ${escapeHtml(text)}
</p>`;
}

export function emailHeading(text: string, accentPhrase?: string): string {
  const headline = accentPhrase
    ? `${escapeHtml(text)} <span style="color:${COLORS.clay};font-weight:600;">${escapeHtml(accentPhrase)}</span>`
    : escapeHtml(text);

  return `<h1 class="email-accent" style="margin:0 0 16px;font-family:${FONT_BODY};font-size:22px;font-weight:600;line-height:1.3;color:${COLORS.accent};">
  ${headline}
</h1>`;
}

export function emailParagraph(text: string): string {
  return `<p style="margin:0 0 16px;font-family:${FONT_BODY};font-size:15px;line-height:1.65;">
  ${text}
</p>`;
}

export function emailMutedParagraph(text: string): string {
  return `<p style="margin:0 0 16px;font-family:${FONT_BODY};font-size:14px;line-height:1.65;opacity:${MUTED_OPACITY};">
  ${text}
</p>`;
}

/** tokenHtml is inserted raw — use `{{ .Token }}` for Supabase or a sample code for preview. */
export function emailOtpCode(tokenHtml: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 20px;">
  <tr>
    <td align="center" style="padding:8px 0 20px;">
      <p style="margin:0 0 10px;font-family:${FONT_BODY};font-size:12px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;opacity:${MUTED_OPACITY};">
        Your verification code
      </p>
      <p class="email-accent" style="margin:0;font-family:${FONT_BODY};font-size:28px;font-weight:700;letter-spacing:0.2em;line-height:1.2;color:${COLORS.accent};">
        ${tokenHtml}
      </p>
      <p style="margin:12px 0 0;font-family:${FONT_BODY};font-size:13px;line-height:1.5;opacity:${MUTED_OPACITY};">
        This code expires in one hour.
      </p>
    </td>
  </tr>
</table>`;
}

export function emailDetailCard(rows: { label: string; value: string }[]): string {
  const rowHtml = rows
    .map(
      (row, index) => `<tr>
    <td style="padding:${index === 0 ? "0" : "12px"} 0 0;font-family:${FONT_BODY};font-size:13px;font-weight:500;opacity:${MUTED_OPACITY};">
      ${escapeHtml(row.label)}
    </td>
  </tr>
  <tr>
    <td style="padding:2px 0 0;font-family:${FONT_BODY};font-size:15px;line-height:1.5;">
      ${escapeHtml(row.value)}
    </td>
  </tr>`
    )
    .join("");

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 20px;">
  <tr>
    <td style="padding:0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        ${rowHtml}
      </table>
    </td>
  </tr>
</table>`;
}

export function emailBulletList(items: string[]): string {
  const listItems = items
    .map(
      (item) =>
        `<li style="margin:0 0 6px;font-family:${FONT_BODY};font-size:15px;line-height:1.65;">${escapeHtml(item)}</li>`
    )
    .join("");

  return `<ul style="margin:0 0 16px 20px;padding:0;">${listItems}</ul>`;
}

export function emailCta(opts: { label: string; href: string }): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 20px;">
  <tr>
    <td align="left">
      <a href="${opts.href}" style="display:inline-block;background-color:${COLORS.clay};color:#FFFFFF;font-family:${FONT_BODY};font-size:14px;font-weight:600;text-decoration:none;padding:12px 20px;border-radius:8px;">
        ${escapeHtml(opts.label)}
      </a>
    </td>
  </tr>
</table>`;
}

export function emailSignOff(): string {
  return `<p style="margin:0;font-family:${FONT_BODY};font-size:14px;line-height:1.65;opacity:${MUTED_OPACITY};">
  &mdash; The ${escapeHtml(SITE_NAME)} team
</p>`;
}

export function emailFooter(): string {
  return `<tr>
  <td style="padding:24px 32px 8px;text-align:center;">
    <p style="margin:0 0 6px;font-family:${FONT_BODY};font-size:13px;line-height:1.5;">
      <a class="email-link" href="${SITE_URL}" style="color:${COLORS.accent};text-decoration:none;">${SITE_HOST}</a>
    </p>
    <p style="margin:0;font-family:${FONT_BODY};font-size:12px;line-height:1.5;opacity:${MUTED_OPACITY};">
      &copy; ${new Date().getFullYear()} ${escapeHtml(SITE_NAME)}. All rights reserved.
    </p>
  </td>
</tr>`;
}

export function composeEmail(opts: {
  preheader: string;
  contentHtml: string;
}): string {
  return emailShell({
    preheader: opts.preheader,
    bodyHtml: `${emailHeader()}${emailContentBlock(opts.contentHtml)}${emailFooter()}`,
  });
}
