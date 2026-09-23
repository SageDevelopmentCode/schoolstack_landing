"use client";

import { Analytics } from "@vercel/analytics/next";
import { usePathname } from "next/navigation";
import { useAllowsAnalyticsCookies } from "@/hooks/useCookieConsent";
import { isMarketingRoute } from "@/lib/cookie-consent";

export default function ConditionalAnalytics() {
  const pathname = usePathname();
  const allowsAnalytics = useAllowsAnalyticsCookies();
  const enabled = isMarketingRoute(pathname) && allowsAnalytics;

  if (!enabled) return null;

  return <Analytics />;
}
