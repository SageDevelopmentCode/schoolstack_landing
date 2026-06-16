import { NextRequest, NextResponse } from "next/server";
import { getProfile } from "@/lib/auth";
import { fetchEmailThread, isZohoConfigured } from "@/lib/zoho";

export async function GET(request: NextRequest) {
  const profile = await getProfile();
  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
