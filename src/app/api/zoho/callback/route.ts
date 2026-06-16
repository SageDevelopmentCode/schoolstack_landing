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
