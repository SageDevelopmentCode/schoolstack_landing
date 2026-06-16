import "dotenv/config";
import { config } from "dotenv";

config({ path: ".env.local" });

const ACCOUNTS_BASE = "https://accounts.zoho.com";
const MAIL_BASE = "https://mail.zoho.com";

async function refreshAccessToken() {
  const params = new URLSearchParams({
    refresh_token: process.env.ZOHO_REFRESH_TOKEN!,
    grant_type: "refresh_token",
    client_id: process.env.ZOHO_CLIENT_ID!,
    client_secret: process.env.ZOHO_CLIENT_SECRET!,
  });

  const res = await fetch(`${ACCOUNTS_BASE}/oauth/v2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  const text = await res.text();
  if (!res.ok) throw new Error(`Token refresh failed: ${text}`);
  return JSON.parse(text).access_token as string;
}

async function main() {
  const token = await refreshAccessToken();
  const accountId = process.env.ZOHO_ACCOUNT_ID!;
  const fromAddress = process.env.ZOHO_FROM_ADDRESS!;
  const displayName = process.env.ZOHO_FROM_NAME ?? "Julius Cecilia";

  const headers = {
    Authorization: `Zoho-oauthtoken ${token}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  console.log("Fetching account details...");
  const accountRes = await fetch(`${MAIL_BASE}/api/accounts/${accountId}`, { headers });
  console.log("GET account:", accountRes.status, await accountRes.text());

  console.log("\nTrying displaynameemailupdate...");
  const updateRes = await fetch(`${MAIL_BASE}/api/accounts/${accountId}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      mode: "displaynameemailupdate",
      emailAddress: fromAddress,
      displayName,
    }),
  });
  console.log("PUT displaynameemailupdate:", updateRes.status, await updateRes.text());

  console.log("\nTrying updateDisplayName...");
  const updateNameRes = await fetch(`${MAIL_BASE}/api/accounts/${accountId}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      mode: "updateDisplayName",
      displayName,
    }),
  });
  console.log("PUT updateDisplayName:", updateNameRes.status, await updateNameRes.text());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
