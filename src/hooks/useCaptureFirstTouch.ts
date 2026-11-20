"use client";

import { useEffect } from "react";
import { useAllowsAnalyticsCookies } from "@/hooks/useCookieConsent";
import { captureFirstTouch } from "@/lib/marketing/attribution";

/** Record first-touch attribution on mount and promote session → localStorage when analytics consent is granted. */
export function useCaptureFirstTouch() {
  const allowsAnalytics = useAllowsAnalyticsCookies();

  useEffect(() => {
    captureFirstTouch();
  }, [allowsAnalytics]);
}