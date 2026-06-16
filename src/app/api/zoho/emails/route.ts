import { NextRequest, NextResponse } from "next/server";
import { getProfile } from "@/lib/auth";
import { fetchSentEmails, isZohoConfigured } from "@/lib/zoho";

export async function GET(request: NextRequest) {
  const profile = await getProfile();
  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await isZohoConfigured())) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "50", 10);
  const data = await fetchSentEmails(limit);

  return NextResponse.json({ success: true, count: data.length, data });
}
