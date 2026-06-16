# Zoho Mail Integration Guide

Send transactional HTML emails and fetch per-contact email history via the Zoho Mail API. This doc is self-contained — no prior context from the original repo required.

---

## Overview

| Feature | How it works |
|---------|--------------|
| **Send email** | Server-side function calls `POST /api/accounts/{accountId}/messages` |
| **Email history** | Search Zoho for `to:contact@email.com` and `from:contact@email.com`, then fetch full message content |
| **Auth** | OAuth 2.0 with a long-lived refresh token stored in env vars |

All Zoho credentials stay **server-side only**. The browser never sees tokens.

---

## Prerequisites

- A **Zoho Mail** account (Business or similar) with a mailbox you can send from (e.g. `hello@yourdomain.com`)
- That mailbox must be on a **custom domain** configured in Zoho Mail
- A Next.js app (App Router) or any Node server that can hold env vars and run server actions/API routes

---

## Step 1: Register OAuth client in Zoho

1. Go to [Zoho API Console](https://api-console.zoho.com/)
2. Sign in with your Zoho account
3. Click **Add Client** → choose **Server-based Applications**
4. Fill in:
   - **Client Name**: anything (e.g. `My App Mail`)
   - **Homepage URL**: `http://localhost:3000` (or your production domain)
   - **Authorized Redirect URIs**:
     - Local: `http://localhost:3000/api/zoho/callback`
     - Production: `https://yourdomain.com/api/zoho/callback`
5. Click **CREATE**
6. Copy **Client ID** and **Client Secret** (secret is shown once)

### Required OAuth scopes

ZohoMail.messages.READ,ZohoMail.messages.CREATE,ZohoMail.accounts.READ,ZohoMail.folders.READ

- `messages.READ` — search and read email history
- `messages.CREATE` — send emails
- `accounts.READ` — resolve your Zoho account ID
- `folders.READ` — locate Sent folder (optional but useful)
---
## Step 2: Environment variables
Add to `.env.local` (never commit this file):
```bash
# OAuth app credentials
ZOHO_CLIENT_ID=your_client_id
ZOHO_CLIENT_SECRET=your_client_secret
ZOHO_REDIRECT_URI=http://localhost:3000/api/zoho/callback
# Your sending mailbox (must exist in your Zoho org)
ZOHO_FROM_ADDRESS=hello@yourdomain.com
# Filled in after Step 3 (OAuth flow)
ZOHO_REFRESH_TOKEN=
# Optional — auto-fetched on first API call if omitted
ZOHO_ACCOUNT_ID=
For production, set the same variables in your host (Vercel, etc.) with production URLs.

Regional data centers
This guide uses the US endpoints:

OAuth: https://accounts.zoho.com/oauth/v2/...
Mail API: https://mail.zoho.com/api/...
If your account is in the EU, use:

https://accounts.zoho.eu/oauth/v2/...
https://mail.zoho.eu/api/...
Set a ZOHO_DC=us|eu env var and branch URLs accordingly if you support both.

Step 3: OAuth flow (get refresh token)
You need three small API routes (see File structure below). Once they exist:

Start your dev server
Visit: http://localhost:3000/api/zoho/authorize
Sign in to Zoho and click Accept
You’ll land on a success page showing ZOHO_REFRESH_TOKEN (and optionally ZOHO_ACCOUNT_ID)
Paste those into .env.local
Restart the dev server
The refresh token is long-lived. Re-run the authorize flow only if it’s revoked or invalid.

Step 4: Core library (lib/zoho.ts)
Create a server-only module with auth helpers, send, and thread fetch.

"use server";
// --- Types ---
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
// --- Config ---
const ZOHO_CLIENT_ID = process.env.ZOHO_CLIENT_ID;
const ZOHO_CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET;
const ZOHO_REDIRECT_URI = process.env.ZOHO_REDIRECT_URI;
const ZOHO_ACCOUNT_ID = process.env.ZOHO_ACCOUNT_ID;
const ZOHO_FROM_ADDRESS = process.env.ZOHO_FROM_ADDRESS;
const ACCOUNTS_BASE = "https://accounts.zoho.com";
const MAIL_BASE = "https://mail.zoho.com";
// In-memory cache (per server instance)
let cachedAccessToken: string | null = null;
let tokenExpiresAt: number | null = null;
let cachedAccountId: string | null = null;
// --- Helpers ---
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
  tokenExpiresAt = Date.now() + 55 * 60 * 1000; // cache 55 min (tokens last ~60)
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
      "ZohoMail.messages.READ,ZohoMail.messages.CREATE,ZohoMail.accounts.READ,ZohoMail.folders.READ",
    access_type: "offline",
    prompt: "consent",
  });
  return `${ACCOUNTS_BASE}/oauth/v2/auth?${params.toString()}`;
}
// --- Send email ---
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
// --- Fetch email history for one contact ---
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
  // Zoho search does not support OR — run two queries
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
// --- Optional: fetch all sent mail ---
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
Step 5: API routes
app/api/zoho/authorize/route.ts
Redirects the browser to Zoho’s consent screen.

import { NextResponse } from "next/server";
import { getAuthorizationUrl } from "@/lib/zoho";
export async function GET() {
  const authUrl = await getAuthorizationUrl();
  return NextResponse.redirect(authUrl);
}
app/api/zoho/callback/route.ts
Exchanges the auth code for tokens. Show the refresh token on a simple HTML page so you can copy it into .env.local.

import { NextRequest, NextResponse } from "next/server";
import { exchangeAuthCode, getZohoAccountId } from "@/lib/zoho";
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }
  if (!code) {
    return NextResponse.json({ error: "No authorization code" }, { status: 400 });
  }
  const tokenData = await exchangeAuthCode(code);
  let accountId = "";
  try {
    process.env.ZOHO_REFRESH_TOKEN = tokenData.refresh_token;
    accountId = await getZohoAccountId();
  } catch {
    // account ID is optional
  }
  return new NextResponse(
    `<pre>
Add to .env.local:
ZOHO_REFRESH_TOKEN=${tokenData.refresh_token}
${accountId ? `ZOHO_ACCOUNT_ID=${accountId}` : "# ZOHO_ACCOUNT_ID will be fetched automatically"}
Then restart your dev server.
</pre>`,
    { headers: { "Content-Type": "text/html" } }
  );
}
app/api/zoho/thread/route.ts
Returns email history for one contact. Protect this route with your admin auth.

import { NextRequest, NextResponse } from "next/server";
import { fetchEmailThread, isZohoConfigured } from "@/lib/zoho";
export async function GET(request: NextRequest) {
  // TODO: verify admin session (Supabase, Clerk, etc.)
  // if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await isZohoConfigured())) {
    return NextResponse.json(
      { error: "Zoho Mail API is not configured" },
      { status: 503 }
    );
  }
  const email = request.nextUrl.searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "email query param required" }, { status: 400 });
  }
  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "50", 10);
  const data = await fetchEmailThread(email, limit);
  return NextResponse.json({ success: true, email, count: data.length, data });
}
app/api/zoho/emails/route.ts (optional)
Returns recent sent mail (in:sent).

import { NextRequest, NextResponse } from "next/server";
import { fetchSentEmails, isZohoConfigured } from "@/lib/zoho";
export async function GET(request: NextRequest) {
  // TODO: admin auth
  if (!(await isZohoConfigured())) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }
  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "50", 10);
  const data = await fetchSentEmails(limit);
  return NextResponse.json({ success: true, count: data.length, data });
}
Step 6: Sending from a server action
Pattern: build HTML → call sendZohoEmail.

"use server";
import { sendZohoEmail } from "@/lib/zoho";
export async function sendWelcomeEmail(opts: {
  email: string;
  firstName: string;
}): Promise<{ success: boolean; error?: string }> {
  const subject = "Welcome!";
  const content = `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
  <p>Hi ${opts.firstName},</p>
  <p>Thanks for signing up.</p>
</body>
</html>`;
  return sendZohoEmail({
    toAddress: opts.email,
    subject,
    content,
  });
}
Call from a client component:

const result = await sendWelcomeEmail({ email: "user@example.com", firstName: "Jane" });
if (result.success) {
  // refresh email history UI if shown
}
Step 7: Email history UI component
Minimal client component that loads thread for one address:

"use client";
import { useEffect, useState } from "react";
interface EmailMessage {
  messageId: string;
  fromAddress: string;
  toAddress: string;
  subject: string;
  content: string;
  summary: string;
  time: number;
  hasAttachment: boolean;
}
export function EmailThread({
  emailAddress,
  sentFromDomain = "yourdomain.com", // used to label Sent vs Received
}: {
  emailAddress: string;
  sentFromDomain?: string;
}) {
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/zoho/thread?email=${encodeURIComponent(emailAddress)}`
        );
        if (!res.ok) throw new Error("Failed to fetch email thread");
        const json = await res.json();
        setEmails(json.data || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [emailAddress]);
  if (loading) return <p>Loading email thread...</p>;
  if (error) return <p>Error: {error}</p>;
  if (emails.length === 0) return <p>No email history with this contact.</p>;
  return (
    <div>
      {emails.map((email) => {
        const isSent = email.fromAddress.toLowerCase().includes(sentFromDomain);
        return (
          <div key={email.messageId} style={{ marginBottom: 16, padding: 12, border: "1px solid #ddd" }}>
            <div>
              <strong>{isSent ? "Sent" : "Received"}</strong>
              {" · "}
              {new Date(email.time).toLocaleString()}
            </div>
            <div><strong>{email.subject || "(No subject)"}</strong></div>
            <div style={{ fontSize: 12, color: "#666" }}>
              {isSent ? `To: ${email.toAddress}` : `From: ${email.fromAddress}`}
            </div>
            <div
              style={{ marginTop: 8, fontSize: 14 }}
              dangerouslySetInnerHTML={{ __html: email.content || email.summary }}
            />
          </div>
        );
      })}
    </div>
  );
}
Usage in a detail view:

{contact.email && (
  <section>
    <h3>Email History</h3>
    <EmailThread key={refreshKey} emailAddress={contact.email} sentFromDomain="yourdomain.com" />
  </section>
)}
After sending an email, increment refreshKey to reload the thread.

File structure (minimum)
lib/
  zoho.ts                          # auth, send, fetchEmailThread
app/api/zoho/
  authorize/route.ts               # start OAuth
  callback/route.ts                # finish OAuth, show refresh token
  thread/route.ts                  # GET ?email=... → contact history
  emails/route.ts                  # optional: all sent mail
app/actions/
  sendWelcomeEmail.ts              # example server action
components/
  EmailThread.tsx                  # optional UI
API reference (Zoho Mail)
Action	Method	URL
Refresh token
POST
{ACCOUNTS_BASE}/oauth/v2/token
List accounts
GET
{MAIL_BASE}/api/accounts
Search messages
GET
{MAIL_BASE}/api/accounts/{accountId}/messages/search?searchKey=...&limit=50
Message content
GET
{MAIL_BASE}/api/accounts/{accountId}/folders/{folderId}/messages/{messageId}/content
Send message
POST
{MAIL_BASE}/api/accounts/{accountId}/messages
Useful search keys
Query	Meaning
to:user@example.com
Emails sent to that address
from:user@example.com
Emails received from that address
in:sent
All sent mail
Zoho does not support OR in search — use two queries and merge (as in fetchEmailThread).

Send payload
{
  "fromAddress": "hello@yourdomain.com",
  "toAddress": "user@example.com",
  "subject": "Subject line",
  "content": "<html>...</html>",
  "mailFormat": "html"
}
Email object shape (after fetch)
{
  messageId: string
  fromAddress: string
  toAddress: string
  ccAddress?: string
  subject: string
  content: string        // full HTML
  summary: string      // plain-text preview
  time: number         // Unix ms timestamp
  hasAttachment: boolean
}
Security checklist

 Never commit .env.local or refresh tokens

 Protect /api/zoho/thread and /api/zoho/emails with admin auth

 Keep sendZohoEmail server-only (server actions / API routes)

 Use ZOHO_FROM_ADDRESS from env — do not hardcode in source

 Re-authorize if refresh token is revoked
Troubleshooting
Problem	Fix
Zoho Mail API is not configured
Set all env vars; restart server
Redirect URI mismatch
ZOHO_REDIRECT_URI must exactly match Zoho Console (no trailing slash)
Invalid refresh token
Re-run /api/zoho/authorize
Send fails with 401/403
Re-run OAuth; check scopes include ZohoMail.messages.CREATE
No history for a contact
Confirm mail exists in Zoho; try /api/zoho/test or manual search in Zoho web UI
Wrong region
Switch to .zoho.eu endpoints if account is EU
fromAddress rejected
Address must be a real mailbox in your Zoho org
Testing
OAuth: visit /api/zoho/authorize → get refresh token → restart
Send: call a server action or temporarily POST from a test script
History: GET /api/zoho/thread?email=contact@example.com
Sent folder: GET /api/zoho/emails?limit=10
Official Zoho docs
OAuth 2.0
Email API
API Console