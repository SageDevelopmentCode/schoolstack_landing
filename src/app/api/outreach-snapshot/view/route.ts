import { NextResponse } from "next/server";
import { getOutreachPlan } from "@/data/outreach";
import { notifyOutreachSnapshotViewed } from "@/lib/discord";
import { PRODUCTION_SITE_URL } from "@/lib/site";

/** One alert per school per window, per server instance (views repeat as people scroll back). */
const THROTTLE_MS = 30 * 60 * 1000;
const lastAlertAt = new Map<string, number>();

/** Beacon from /snapshot/<slug>/<token>: tells Julius on Discord that the school opened it. */
export async function POST(request: Request) {
  let slug = "";
  let token = "";
  try {
    const body = (await request.json()) as { slug?: unknown; token?: unknown };
    slug = typeof body.slug === "string" ? body.slug : "";
    token = typeof body.token === "string" ? body.token : "";
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  const plan = getOutreachPlan(slug);
  if (!plan?.snapshot || plan.snapshot.token !== token) return new NextResponse(null, { status: 404 });

  const now = Date.now();
  const last = lastAlertAt.get(slug) ?? 0;
  if (now - last < THROTTLE_MS) return new NextResponse(null, { status: 204 });
  lastAlertAt.set(slug, now);

  try {
    await notifyOutreachSnapshotViewed({
      schoolName: plan.schoolName,
      slug,
      adminUrl: `${PRODUCTION_SITE_URL}/admin/research?demo=${encodeURIComponent(slug)}`,
    });
  } catch (error) {
    console.error("[outreach-snapshot/view] Discord notify failed", error);
  }
  return new NextResponse(null, { status: 204 });
}
