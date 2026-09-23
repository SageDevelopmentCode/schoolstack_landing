"use client";

import { useSyncExternalStore } from "react";
import {
  allowsAnalyticsCookies,
  getCookieConsent,
  hasCookieConsent,
} from "@/lib/cookie-consent";

function subscribeToCookieConsent(callback: () => void) {
  window.addEventListener("mudkitchen-cookie-consent-change", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("mudkitchen-cookie-consent-change", callback);
    window.removeEventListener("storage", callback);
  };
}

export function useHasCookieConsent(): boolean {
  return useSyncExternalStore(
    subscribeToCookieConsent,
    hasCookieConsent,
    () => true,
  );
}

export function useAllowsAnalyticsCookies(): boolean {
  return useSyncExternalStore(
    subscribeToCookieConsent,
    allowsAnalyticsCookies,
    () => false,
  );
}

export function useCookieConsent() {
  return useSyncExternalStore(
    subscribeToCookieConsent,
    getCookieConsent,
    () => null,
  );
}
