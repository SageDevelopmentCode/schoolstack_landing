import { NextResponse } from "next/server";
import { logNotificationFailure } from "@/lib/admissions/notification-logging";
import { getOutreachPlan } from "@/data/outreach";
import { getSchoolDemoConfig } from "@/data/school-demos";
import { notifyDemoOpened } from "@/lib/discord";
import { PRODUCTION_SITE_URL } from "@/lib/site";
import { createAdminClient } from "@/utils/supabase/admin";

/** One alert per school per window, per server instance (people reopen the demo while comparing). */
const THROTTLE_MS = 30 * 60 * 1000;
const lastAlertAt = new Map<string, number>();

/** Beacon from /demo/<slug>: tells Julius on Discord that the school opened its demo. */
export async function POST(request: Request) {
  let slug = "";
  let via: "snapshot" | "letter" | "direct" = "direct";
  try {
    const body = (await request.json()) as { slug?: unknown; via?: unknown };
    slug = typeof body.slug === "string" ? body.slug : "";
    if (body.via === "snapshot" || body.via === "letter") via = body.via;
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  // Only real demos, so nobody can post made-up school names to Discord.
  const config = slug ? getSchoolDemoConfig(slug) : undefined;
  if (!config) return new NextResponse(null, { status: 404 });

  const now = Date.now();
  const last = lastAlertAt.get(slug) ?? 0;
  if (now - last < THROTTLE_MS) return new NextResponse(null, { status: 204 });
  lastAlertAt.set(slug, now);

  const plan = getOutreachPlan(slug);
  try {
    await notifyDemoOpened({
      schoolName: plan?.schoolName ?? config.schoolName,
      slug,
      via,
      adminUrl: plan ? `${PRODUCTION_SITE_URL}/admin/research?demo=${encodeURIComponent(slug)}` : undefined,
    });
  } catch (error) {
    lastAlertAt.delete(slug);
    void logNotificationFailure(createAdminClient(), {
      operation: "demo_view_discord",
      error,
      metadata: { slug, via },
    });
  }
  return new NextResponse(null, { status: 204 });
}
