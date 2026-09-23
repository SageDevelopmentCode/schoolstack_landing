"use client";

import { Analytics } from "@vercel/analytics/next";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { allowsAnalyticsCookies, isMarketingRoute } from "@/lib/cookie-consent";

export default function ConditionalAnalytics() {
  const pathname = usePathname();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    function syncConsent() {
      if (!isMarketingRoute(pathname)) {
        setEnabled(false);
        return;
      }

      setEnabled(allowsAnalyticsCookies());
    }

    syncConsent();

    function handleConsentChange() {
      syncConsent();
    }

    window.addEventListener("mudkitchen-cookie-consent-change", handleConsentChange);
    window.addEventListener("storage", handleConsentChange);

    return () => {
      window.removeEventListener("mudkitchen-cookie-consent-change", handleConsentChange);
      window.removeEventListener("storage", handleConsentChange);
    };
  }, [pathname]);

  if (!enabled) return null;

  return <Analytics />;
}
