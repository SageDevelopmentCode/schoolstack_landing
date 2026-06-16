import { NextResponse } from "next/server";
import { getAuthorizationUrl } from "@/lib/zoho";

export async function GET() {
  const authUrl = await getAuthorizationUrl();
  return NextResponse.redirect(authUrl);
}
