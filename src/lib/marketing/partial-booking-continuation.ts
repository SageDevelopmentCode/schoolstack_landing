import { createHmac, timingSafeEqual } from "node:crypto";

function continuationSecret(): string {
  const secret = process.env.MARKETING_LEAD_CONTINUATION_SECRET;
  if (!secret) {
    throw new Error("MARKETING_LEAD_CONTINUATION_SECRET is not set");
  }
  return secret;
}

function payload(leadId: string, email: string): string {
  return `${leadId}\0${email.toLowerCase()}`;
}

export function signPartialBookingContinuation(leadId: string, email: string): string {
  return createHmac("sha256", continuationSecret())
    .update(payload(leadId, email))
    .digest("base64url");
}

export function verifyPartialBookingContinuation(
  leadId: string,
  email: string,
  token: string,
): boolean {
  if (!token || !leadId) return false;
  try {
    const expected = signPartialBookingContinuation(leadId, email);
    const a = Buffer.from(expected);
    const b = Buffer.from(token);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}