export function normalizeContactEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function cleanEmailAddress(raw: string): string {
  if (!raw) return "";
  const cleaned = raw
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
  const match = cleaned.match(/<([^>]+)>/);
  return match ? match[1] : cleaned.replace(/"/g, "").trim();
}

export function buildContactEmailSearchKey(email: string): string {
  const trimmed = email.trim();
  return `sender:${trimmed}::or:to:${trimmed}::or:cc:${trimmed}`;
}

export function parseZohoMessageTime(raw: Record<string, unknown>): number | null {
  const candidates = [raw.receivedtime, raw.receivedTime, raw.sentDateInGMT, raw.time];
  for (const value of candidates) {
    if (typeof value === "number" && Number.isFinite(value) && value > 0) {
      return value;
    }
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed) && parsed > 0) return parsed;
    }
  }
  return null;
}

function addressesFromField(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((part) => normalizeContactEmail(cleanEmailAddress(part)))
    .filter(Boolean);
}

export function messageInvolvesContact(
  summary: {
    fromAddress?: string;
    toAddress?: string;
    ccAddress?: string;
  },
  contactEmail: string,
): boolean {
  const contact = normalizeContactEmail(contactEmail);
  const addresses = [
    ...addressesFromField(summary.fromAddress),
    ...addressesFromField(summary.toAddress),
    ...addressesFromField(summary.ccAddress),
  ];
  return addresses.includes(contact);
}

export type ZohoSearchSummaryFields = {
  messageId: string;
  folderId: string;
  subject: string;
  fromAddress: string;
  toAddress: string;
  ccAddress?: string;
  time: number;
  hasAttachment: boolean;
  summary: string;
};

export function mapZohoSearchSummary(raw: Record<string, unknown>): ZohoSearchSummaryFields {
  const timeMs = parseZohoMessageTime(raw) ?? Date.now();
  const hasAttachmentRaw = raw.hasAttachment;
  const hasAttachment =
    hasAttachmentRaw === true ||
    hasAttachmentRaw === 1 ||
    hasAttachmentRaw === "1";

  return {
    messageId: String(raw.messageId ?? ""),
    folderId: String(raw.folderId ?? ""),
    subject: String(raw.subject ?? ""),
    fromAddress: cleanEmailAddress(String(raw.fromAddress ?? "")),
    toAddress: cleanEmailAddress(String(raw.toAddress ?? "")),
    ccAddress: raw.ccAddress
      ? cleanEmailAddress(String(raw.ccAddress))
      : undefined,
    time: timeMs,
    hasAttachment,
    summary: String(raw.summary ?? ""),
  };
}
