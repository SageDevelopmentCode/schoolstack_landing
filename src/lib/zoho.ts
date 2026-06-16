interface ZohoTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

interface ZohoEmailSummary {
  messageId: string;
  subject: string;
  fromAddress: string;
  toAddress: string;
  ccAddress?: string;
  time: number;
  receivedTime?: number;
  hasAttachment: boolean;
  folderId: string;
  summary?: string;
}

export interface ZohoEmailContent {
  messageId: string;
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
const ZOHO_FROM_NAME = process.env.ZOHO_FROM_NAME ?? "Julius Cecilia";
const ACCOUNTS_BASE = "https://accounts.zoho.com";
const MAIL_BASE = "https://mail.zoho.com";

let cachedAccessToken: string | null = null;
let tokenExpiresAt: number | null = null;
let cachedAccountId: string | null = null;
let fromDisplayNameSynced = false;

function cleanEmailAddress(raw: string): string {
  if (!raw) return "";
  const cleaned = raw
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
  const match = cleaned.match(/<([^>]+)>/);
  return match ? match[1] : cleaned.replace(/"/g, "").trim();
}

export async function isZohoConfigured(): Promise<boolean> {
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

async function ensureFromDisplayName(): Promise<void> {
  if (fromDisplayNameSynced || !ZOHO_FROM_ADDRESS || !ZOHO_FROM_NAME) return;

  const accessToken = await getValidAccessToken();
  const accountId = await getZohoAccountId();

  const res = await fetch(`${MAIL_BASE}/api/accounts/${accountId}`, {
    method: "PUT",
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      mode: "displaynameemailupdate",
      emailAddress: ZOHO_FROM_ADDRESS,
      displayName: ZOHO_FROM_NAME,
    }),
  });

  if (!res.ok) {
    console.warn(
      "Failed to sync Zoho from display name:",
      await res.text(),
      "(Re-run /api/zoho/authorize if scope ZohoMail.accounts.UPDATE was missing.)"
    );
    return;
  }

  fromDisplayNameSynced = true;
}

export async function sendZohoEmail(opts: {
  toAddress: string;
  subject: string;
  content: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!ZOHO_FROM_ADDRESS) {
    return { success: false, error: "ZOHO_FROM_ADDRESS is not set" };
  }

  const MAX_ATTEMPTS = 3;
  let lastError = "";

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      await ensureFromDisplayName();
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

async function fetchMessageContent(
  accountId: string,
  accessToken: string,
  summary: ZohoEmailSummary
): Promise<ZohoEmailContent | null> {
  const url = `${MAIL_BASE}/api/accounts/${accountId}/folders/${summary.folderId}/messages/${summary.messageId}/content`;
  const res = await fetch(url, {
    headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
  });

  if (!res.ok) return null;

  const data = await res.json();
  return {
    messageId: summary.messageId,
    subject: summary.subject,
    fromAddress: cleanEmailAddress(summary.fromAddress),
    toAddress: cleanEmailAddress(summary.toAddress),
    ccAddress: summary.ccAddress
      ? cleanEmailAddress(summary.ccAddress)
      : undefined,
    time: summary.time || summary.receivedTime || Date.now(),
    hasAttachment: summary.hasAttachment,
    content: data.data?.content || "",
    summary: summary.summary || "",
  };
}

export async function fetchEmailThread(
  emailAddress: string,
  limit = 50
): Promise<ZohoEmailContent[]> {
  if (!(await isZohoConfigured())) return [];

  const accessToken = await getValidAccessToken();
  const accountId = await getZohoAccountId();
  const searches = [`to:${emailAddress}`, `from:${emailAddress}`];
  const emailMap = new Map<string, ZohoEmailSummary>();

  for (const query of searches) {
    const url = `${MAIL_BASE}/api/accounts/${accountId}/messages/search?searchKey=${encodeURIComponent(query)}&limit=${limit}`;
    const res = await fetch(url, {
      headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
    });

    if (!res.ok) continue;

    const data = await res.json();
    for (const email of data.data || []) {
      if (!emailMap.has(email.messageId)) {
        emailMap.set(email.messageId, email);
      }
    }
  }

  const summaries = Array.from(emailMap.values());
  const emails = await Promise.all(
    summaries.map((s) => fetchMessageContent(accountId, accessToken, s))
  );

  return emails
    .filter((e): e is ZohoEmailContent => e !== null)
    .sort((a, b) => b.time - a.time);
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
  const summaries: ZohoEmailSummary[] = data.data || [];
  const emails = await Promise.all(
    summaries.map((s) => fetchMessageContent(accountId, accessToken, s))
  );

  return emails.filter((e): e is ZohoEmailContent => e !== null);
}
