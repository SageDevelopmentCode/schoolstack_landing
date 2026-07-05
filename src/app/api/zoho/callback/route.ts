import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { exchangeAuthCode, getZohoAccountId } from "@/lib/zoho";

const ROUTE = "/api/zoho/callback";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");

  if (error) {
    return apiError(ROUTE, { request, status: 400, error });
  }

  if (!code) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "No authorization code",
    });
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
