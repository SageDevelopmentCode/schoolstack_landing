import { SITE_NAME, SITE_URL } from "@/lib/site";

const COLORS = {
  bg: "#F7F1E7",
  surface: "#FFFAF4",
  text: "#2B241D",
  textMuted: "#6D6257",
  textFaint: "#B8A898",
  accent: "#2E4A3C",
  clay: "#A05C45",
  claySoft: "#E8D5C8",
  badgeBg: "#E2EDD9",
  badgeText: "#4A6B52",
  detailBg: "#F4F7F2",
  border: "#DDD0BE",
  footerBg: "#1a3327",
} as const;

const FONT_DISPLAY = "Georgia, 'Times New Roman', serif";
const FONT_BODY =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

const LOGO_URL = `${SITE_URL}/images/Logo.png`;
const SITE_HOST = SITE_URL.replace(/^https?:\/\//, "");

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
  <title>${escapeHtml(SITE_NAME)}</title>
</head>
<body style="margin:0;padding:0;background-color:${COLORS.bg};font-family:${FONT_BODY};color:${COLORS.text};-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    ${escapeHtml(opts.preheader)}
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${COLORS.bg};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:${COLORS.surface};border:1px solid ${COLORS.border};border-radius:20px;overflow:hidden;box-shadow:0 14px 40px rgba(43,36,29,0.08);">
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
  <td style="background-color:${COLORS.accent};padding:28px 32px;text-align:center;">
    <a href="${SITE_URL}" style="text-decoration:none;display:inline-block;">
      <img src="${LOGO_URL}" alt="${escapeHtml(SITE_NAME)}" width="140" height="auto" style="display:block;border:0;max-width:140px;height:auto;margin:0 auto 12px;">
    </a>
    <p style="margin:0;font-family:${FONT_BODY};font-size:13px;line-height:1.5;color:rgba(247,241,231,0.72);">
      Software built to run a real microschool.
    </p>
  </td>
</tr>`;
}

export function emailContentBlock(innerHtml: string): string {
  return `<tr>
  <td style="padding:32px 32px 28px;">
    ${innerHtml}
  </td>
</tr>`;
}

export function emailBadge(text: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;">
  <tr>
    <td style="background-color:${COLORS.badgeBg};color:${COLORS.badgeText};font-family:${FONT_BODY};font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:8px 14px;border-radius:9999px;">
      ${escapeHtml(text)}
    </td>
  </tr>
</table>`;
}

export function emailHeading(text: string, accentPhrase?: string): string {
  const headline = accentPhrase
    ? `${escapeHtml(text)} <em style="color:${COLORS.clay};font-style:italic;">${escapeHtml(accentPhrase)}</em>`
    : escapeHtml(text);

  return `<h1 style="margin:0 0 20px;font-family:${FONT_DISPLAY};font-size:26px;font-weight:500;line-height:1.15;letter-spacing:-0.02em;color:${COLORS.accent};">
  ${headline}
</h1>`;
}

export function emailParagraph(text: string): string {
  return `<p style="margin:0 0 16px;font-family:${FONT_BODY};font-size:16px;line-height:1.6;color:${COLORS.text};">
  ${text}
</p>`;
}

export function emailMutedParagraph(text: string): string {
  return `<p style="margin:0 0 16px;font-family:${FONT_BODY};font-size:14px;line-height:1.6;color:${COLORS.textMuted};">
  ${text}
</p>`;
}

/** tokenHtml is inserted raw — use `{{ .Token }}` for Supabase or a sample code for preview. */
export function emailOtpCode(tokenHtml: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px;">
  <tr>
    <td align="center" style="background-color:${COLORS.detailBg};border:1px solid ${COLORS.border};border-radius:12px;padding:28px 24px;">
      <p style="margin:0 0 12px;font-family:${FONT_BODY};font-size:12px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:${COLORS.textMuted};">
        Your verification code
      </p>
      <p style="margin:0;font-family:${FONT_BODY};font-size:32px;font-weight:700;letter-spacing:0.25em;line-height:1.2;color:${COLORS.accent};">
        ${tokenHtml}
      </p>
      <p style="margin:14px 0 0;font-family:${FONT_BODY};font-size:13px;line-height:1.5;color:${COLORS.textMuted};">
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
    <td style="padding:${index === 0 ? "0" : "12px"} 0 0;font-family:${FONT_BODY};font-size:12px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;color:${COLORS.textMuted};">
      ${escapeHtml(row.label)}
    </td>
  </tr>
  <tr>
    <td style="padding:4px 0 ${index === rows.length - 1 ? "0" : "0"};font-family:${FONT_BODY};font-size:16px;line-height:1.5;color:${COLORS.text};">
      ${escapeHtml(row.value)}
    </td>
  </tr>`
    )
    .join("");

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px;background-color:${COLORS.detailBg};border-left:4px solid ${COLORS.accent};border-radius:12px;">
  <tr>
    <td style="padding:20px 20px 20px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        ${rowHtml}
      </table>
    </td>
  </tr>
</table>`;
}

export function emailCta(opts: { label: string; href: string }): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px;">
  <tr>
    <td align="left">
      <a href="${opts.href}" style="display:inline-block;background-color:${COLORS.clay};color:#FFFFFF;font-family:${FONT_BODY};font-size:14px;font-weight:600;text-decoration:none;padding:14px 28px;border-radius:9999px;">
        ${escapeHtml(opts.label)} &rarr;
      </a>
    </td>
  </tr>
</table>`;
}

export function emailSignOff(): string {
  return `<p style="margin:0;font-family:${FONT_BODY};font-size:15px;line-height:1.6;color:${COLORS.textMuted};">
  &mdash; The ${escapeHtml(SITE_NAME)} team
</p>`;
}

export function emailFooter(): string {
  return `<tr>
  <td style="background-color:${COLORS.footerBg};padding:24px 32px;text-align:center;">
    <p style="margin:0 0 8px;font-family:${FONT_BODY};font-size:13px;line-height:1.5;">
      <a href="${SITE_URL}" style="color:rgba(255,255,255,0.75);text-decoration:none;">${SITE_HOST}</a>
    </p>
    <p style="margin:0;font-family:${FONT_BODY};font-size:11px;line-height:1.5;color:rgba(255,255,255,0.35);">
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
