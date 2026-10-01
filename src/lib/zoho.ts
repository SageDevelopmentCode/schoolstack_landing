interface ZohoTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

import type { OutboundEmailDiscordMeta } from "@/lib/discord";
import {
  buildContactEmailSearchKey,
  mapZohoSearchSummary,
  messageInvolvesContact,
  normalizeContactEmail,
  parseZohoMessageTime,
  type ZohoSearchSummaryFields,
} from "@/lib/zoho-email-thread";

export interface ZohoEmailContent {
  messageId: string;
  folderId: string;
  fromAddress: string;
  toAddress: string;
  ccAddress?: string;
  subject: string;
  content: string;
  summary: string;
  time: number;
  hasAttachment: boolean;
}

const ZOHO_CLIENT_ID = process.env.ZOHO_CLIENT_ID;
const ZOHO_CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET;
const ZOHO_REDIRECT_URI = process.env.ZOHO_REDIRECT_URI;
const ZOHO_ACCOUNT_ID = process.env.ZOHO_ACCOUNT_ID;
const ZOHO_FROM_ADDRESS = process.env.ZOHO_FROM_ADDRESS;
const ACCOUNTS_BASE = "https://accounts.zoho.com";
const MAIL_BASE = "https://mail.zoho.com";

let cachedAccessToken: string | null = null;
let tokenExpiresAt: number | null = null;
let cachedAccountId: string | null = null;

function summaryToEmailContent(
  summary: ZohoSearchSummaryFields,
  content: string,
): ZohoEmailContent {
  return {
    messageId: summary.messageId,
    folderId: summary.folderId,
    fromAddress: summary.fromAddress,
    toAddress: summary.toAddress,
    ccAddress: summary.ccAddress,
    subject: summary.subject,
    content,
    summary: summary.summary,
    time: summary.time,
    hasAttachment: summary.hasAttachment,
  };
}

export async function isZohoConfigured(): Promise<boolean> {
  const { isOutboundEmailDisabled } = await import("@/lib/outbound-email");
  if (isOutboundEmailDisabled()) return false;

  return !!(
    ZOHO_CLIENT_ID &&
    ZOHO_CLIENT_SECRET &&
    ZOHO_REDIRECT_URI &&
    process.env.ZOHO_REFRESH_TOKEN
  );
}

async function refreshAccessToken(): Promise<string> {
  const refreshToken = process.env.ZOHO_REFRESH_TOKEN;
  if (!refreshToken) throw new Error("ZOHO_REFRESH_TOKEN is not set");

  const params = new URLSearchParams({
    refresh_token: refreshToken,
    grant_type: "refresh_token",
    client_id: ZOHO_CLIENT_ID!,
    client_secret: ZOHO_CLIENT_SECRET!,
  });

  const res = await fetch(`${ACCOUNTS_BASE}/oauth/v2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!res.ok) throw new Error(`Failed to refresh token: ${await res.text()}`);

  const data: ZohoTokenResponse = await res.json();
  cachedAccessToken = data.access_token;
  tokenExpiresAt = Date.now() + 55 * 60 * 1000;
  return data.access_token;
}

async function getValidAccessToken(): Promise<string> {
  if (cachedAccessToken && tokenExpiresAt && Date.now() < tokenExpiresAt) {
    return cachedAccessToken;
  }
  return refreshAccessToken();
}

export async function getZohoAccountId(): Promise<string> {
  if (ZOHO_ACCOUNT_ID) return ZOHO_ACCOUNT_ID;
  if (cachedAccountId) return cachedAccountId;

  const accessToken = await getValidAccessToken();
  const res = await fetch(`${MAIL_BASE}/api/accounts`, {
    headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
  });

  if (!res.ok) throw new Error(`Failed to fetch accounts: ${await res.text()}`);

  const data = await res.json();
  const accountId = data.data?.[0]?.accountId;
  if (!accountId) throw new Error("No Zoho Mail accounts found");

  cachedAccountId = accountId;
  return accountId;
}

export async function exchangeAuthCode(code: string): Promise<ZohoTokenResponse> {
  const params = new URLSearchParams({
    code,
    grant_type: "authorization_code",
    client_id: ZOHO_CLIENT_ID!,
    client_secret: ZOHO_CLIENT_SECRET!,
    redirect_uri: ZOHO_REDIRECT_URI!,
  });

  const res = await fetch(`${ACCOUNTS_BASE}/oauth/v2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!res.ok) throw new Error(`Failed to exchange auth code: ${await res.text()}`);
  return res.json();
}

export async function getAuthorizationUrl(): Promise<string> {
  if (!ZOHO_CLIENT_ID || !ZOHO_REDIRECT_URI) {
    throw new Error("ZOHO_CLIENT_ID and ZOHO_REDIRECT_URI must be set");
  }

  const params = new URLSearchParams({
    client_id: ZOHO_CLIENT_ID,
    response_type: "code",
    redirect_uri: ZOHO_REDIRECT_URI,
    scope:
      "ZohoMail.messages.READ,ZohoMail.messages.CREATE,ZohoMail.accounts.READ,ZohoMail.accounts.UPDATE,ZohoMail.folders.READ",
    access_type: "offline",
    prompt: "consent",
  });

  return `${ACCOUNTS_BASE}/oauth/v2/auth?${params.toString()}`;
}

async function sendViaRestApi(opts: {
  toAddress: string;
  subject: string;
  content: string;
}): Promise<{ success: boolean; error?: string }> {
  const MAX_ATTEMPTS = 3;
  let lastError = "";

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const accessToken = await getValidAccessToken();
      const accountId = await getZohoAccountId();

      const res = await fetch(`${MAIL_BASE}/api/accounts/${accountId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fromAddress: ZOHO_FROM_ADDRESS,
          toAddress: opts.toAddress,
          subject: opts.subject,
          content: opts.content,
          mailFormat: "html",
        }),
      });

      if (!res.ok) {
        lastError = await res.text();
        if (res.status === 401 || res.status === 403) {
          cachedAccessToken = null;
          break;
        }
        if (attempt < MAX_ATTEMPTS) {
          await new Promise((r) => setTimeout(r, attempt * 1000));
        }
        continue;
      }

      return { success: true };
    } catch (err) {
      lastError = String(err);
      if (attempt < MAX_ATTEMPTS) {
        await new Promise((r) => setTimeout(r, attempt * 1000));
      }
    }
  }

  return { success: false, error: lastError };
}

export type SendZohoEmailResult =
  | { success: true; skipped?: undefined }
  | { success: true; skipped: "unsubscribed" }
  | { success: false; error?: string };

export async function sendZohoEmail(opts: {
  toAddress: string;
  subject: string;
  content: string;
  discord?: OutboundEmailDiscordMeta;
  sendClass?: import("@/lib/outbound-email-unsubscribe").OutboundEmailSendClass;
}): Promise<SendZohoEmailResult> {
  const { isOutboundEmailDisabled } = await import("@/lib/outbound-email");
  if (isOutboundEmailDisabled()) {
    return { success: true };
  }

  if (!ZOHO_FROM_ADDRESS) {
    return { success: false, error: "ZOHO_FROM_ADDRESS is not set" };
  }

  const {
    normalizeOutboundEmail,
    appendUnsubscribeFooter,
    isTransactionalOutboundEmail,
    isOutboundEmailSuppressedForMarketing,
  } = await import("@/lib/outbound-email-unsubscribe");

  const toAddress = normalizeOutboundEmail(opts.toAddress);
  const isTransactional = isTransactionalOutboundEmail({
    sendClass: opts.sendClass,
    discord: opts.discord,
  });

  if (!isTransactional) {
    try {
      const suppressed = await isOutboundEmailSuppressedForMarketing(toAddress);
      if (suppressed) {
        return { success: true, skipped: "unsubscribed" };
      }
    } catch (err) {
      const { reportOperationalError } = await import("@/lib/operational-errors");
      await reportOperationalError({
        supabase: (await import("@/utils/supabase/admin")).createAdminClient(),
        surface: "system",
        operation: "outbound_email_suppression_check",
        error: "Failed to check outbound email suppression list",
        cause: err,
        actor: { type: "system" },
      });
      return {
        success: false,
        error: "Failed to verify email suppression status",
      };
    }
  }

  const content = appendUnsubscribeFooter(opts.content, toAddress);
  const sendOpts = { ...opts, toAddress, content };

  const { isSmtpConfigured, sendViaSmtp } = await import("@/lib/zoho-smtp");

  let result: { success: boolean; error?: string };
  if (isSmtpConfigured()) {
    result = await sendViaSmtp({
      toAddress: sendOpts.toAddress,
      subject: sendOpts.subject,
      html: sendOpts.content,
    });
  } else {
    result = await sendViaRestApi(sendOpts);
  }

  if (result.success) {
    if (opts.discord) {
      const { notifyOutboundEmailSent } = await import("@/lib/discord");
      void notifyOutboundEmailSent({
        ...opts.discord,
        toAddress: toAddress,
        subject: opts.subject,
      });
    } else {
      console.warn(
        `sendZohoEmail: missing discord meta for email to ${opts.toAddress} (${opts.subject})`,
      );
    }
  }

  if (!result.success) {
    return { success: false, error: result.error };
  }
  return { success: true };
}

async function fetchMessageContentForSummary(
  accountId: string,
  accessToken: string,
  summary: ZohoSearchSummaryFields,
): Promise<ZohoEmailContent | null> {
  const content = await fetchZohoMessageContentWithAuth(
    accountId,
    accessToken,
    summary.folderId,
    summary.messageId,
  );
  if (content === null) return null;
  return summaryToEmailContent(summary, content);
}

export async function fetchZohoMessageContent(
  folderId: string,
  messageId: string,
): Promise<string> {
  if (!(await isZohoConfigured())) {
    throw new Error("Zoho Mail API is not configured");
  }
  const accessToken = await getValidAccessToken();
  const accountId = await getZohoAccountId();
  const content = await fetchZohoMessageContentWithAuth(
    accountId,
    accessToken,
    folderId,
    messageId,
  );
  if (content === null) {
    throw new Error("Failed to load message content from Zoho Mail");
  }
  return content;
}

async function fetchZohoMessageContentWithAuth(
  accountId: string,
  accessToken: string,
  folderId: string,
  messageId: string,
): Promise<string | null> {
  const url = `${MAIL_BASE}/api/accounts/${accountId}/folders/${folderId}/messages/${messageId}/content`;
  const res = await fetch(url, {
    headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
  });

  if (!res.ok) return null;

  const data = await res.json();
  return data.data?.content || "";
}

export type FetchEmailThreadPageOptions = {
  start?: number;
  limit?: number;
  includeContent?: boolean;
};

export type FetchEmailThreadPageResult = {
  messages: ZohoEmailContent[];
  hasMore: boolean;
};

export async function fetchEmailThreadPage(
  emailAddress: string,
  options: FetchEmailThreadPageOptions = {},
): Promise<FetchEmailThreadPageResult> {
  const start = options.start ?? 1;
  const limit = options.limit ?? 20;
  const includeContent = options.includeContent ?? false;

  if (!(await isZohoConfigured())) {
    return { messages: [], hasMore: false };
  }

  const normalizedContact = normalizeContactEmail(emailAddress);
  const searchKey = buildContactEmailSearchKey(emailAddress);
  const accessToken = await getValidAccessToken();
  const accountId = await getZohoAccountId();

  const url = `${MAIL_BASE}/api/accounts/${accountId}/messages/search?searchKey=${encodeURIComponent(searchKey)}&start=${start}&limit=${limit}`;
  const res = await fetch(url, {
    headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(`Zoho Mail search failed: ${await res.text()}`);
  }

  const data = await res.json();
  const rawResults: Record<string, unknown>[] = data.data || [];
  const hasMore = rawResults.length === limit;

  const summaries = rawResults
    .map((raw) => mapZohoSearchSummary(raw))
    .filter((summary) => messageInvolvesContact(summary, normalizedContact));

  let messages: ZohoEmailContent[];
  if (includeContent) {
    const withContent = await Promise.all(
      summaries.map((summary) =>
        fetchMessageContentForSummary(accountId, accessToken, summary),
      ),
    );
    messages = withContent.filter((item): item is ZohoEmailContent => item !== null);
  } else {
    messages = summaries.map((summary) => summaryToEmailContent(summary, ""));
  }

  messages.sort((a, b) => b.time - a.time);
  return { messages, hasMore };
}

/** @deprecated Prefer fetchEmailThreadPage for pagination and lazy content. */
export async function fetchEmailThread(
  emailAddress: string,
  limit = 50,
): Promise<ZohoEmailContent[]> {
  const { messages } = await fetchEmailThreadPage(emailAddress, {
    start: 1,
    limit,
    includeContent: true,
  });
  return messages;
}

export async function fetchSentEmails(limit = 50): Promise<ZohoEmailContent[]> {
  if (!(await isZohoConfigured())) return [];

  const accessToken = await getValidAccessToken();
  const accountId = await getZohoAccountId();
  const url = `${MAIL_BASE}/api/accounts/${accountId}/messages/search?searchKey=in:sent&limit=${limit}`;
  const res = await fetch(url, {
    headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
  });

  if (!res.ok) return [];

  const data = await res.json();
  const rawResults: Record<string, unknown>[] = data.data || [];
  const summaries = rawResults.map((raw) => {
    const mapped = mapZohoSearchSummary(raw);
    const timeMs = parseZohoMessageTime(raw);
    if (timeMs !== null) mapped.time = timeMs;
    return mapped;
  });
  const emails = await Promise.all(
    summaries.map((s) => fetchMessageContentForSummary(accountId, accessToken, s)),
  );

  return emails.filter((e): e is ZohoEmailContent => e !== null);
}
