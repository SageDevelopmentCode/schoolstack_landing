"use client";

import Link from "next/link";
import { useCallback } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Cookie } from "lucide-react";
import { useHasCookieConsent } from "@/hooks/useCookieConsent";
import { isMarketingRoute, setCookieConsent } from "@/lib/cookie-consent";
import { gardenFontVariables } from "@/components/garden/fonts";
import "@/components/garden/garden.css";

export default function CookieConsentBanner() {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const hasConsent = useHasCookieConsent();
  const visible = isMarketingRoute(pathname) && !hasConsent;

  const dismiss = useCallback((level: "essential" | "all") => {
    setCookieConsent(level);
  }, []);

  const transition = reducedMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 420, damping: 32 };

  return (
    <div
      className={`${gardenFontVariables} sf-garden pointer-events-none fixed bottom-4 left-1/2 z-[60] w-full max-w-[640px] -translate-x-1/2 px-4`}
      // `.sf-garden` paints a cream background; keep this positioning wrapper clear.
      style={{ background: "transparent" }}
    >
      <AnimatePresence>
        {visible ? (
          <motion.div
            key="cookie-banner"
            role="dialog"
            aria-live="polite"
            aria-label="Cookie consent"
            initial={reducedMotion ? false : { opacity: 0, y: 16, rotate: -1 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: 10 }}
            transition={transition}
            className="pointer-events-auto flex flex-col justify-between gap-3 rounded-[22px] border-2 border-[var(--sf-ink)] bg-[var(--sf-forest)] px-4 py-3 shadow-[0_6px_0_0_var(--sf-ink)] sm:flex-row sm:items-center sm:gap-4 sm:py-2.5 sm:pl-3"
          >
            <p className="flex items-center gap-2.5 text-[13px] leading-snug text-[var(--sf-cream)] sm:max-w-[360px]">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--sf-butter)] ring-2 ring-[var(--sf-ink)]">
                <Cookie size={16} strokeWidth={2.4} className="text-[var(--sf-ink)]" aria-hidden="true" />
              </span>
              <span>
                We use cookies for security and optional analytics.{" "}
                <Link
                  href="/privacy#cookies"
                  className="rounded-sm font-bold text-white underline decoration-[var(--sf-butter)] decoration-2 underline-offset-4 hover:text-[var(--sf-butter)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-butter)]/50"
                >
                  Privacy Policy
                </Link>
              </span>
            </p>

            <div className="flex shrink-0 items-center gap-2 sm:ml-auto">
              <button
                type="button"
                onClick={() => dismiss("essential")}
                className="inline-flex h-9 items-center justify-center rounded-full border-2 border-[var(--sf-cream)]/35 px-4 text-[13px] font-extrabold text-[var(--sf-cream)] transition-colors hover:border-[var(--sf-cream)] hover:bg-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-butter)]/50"
              >
                Essential
              </button>
              <button
                type="button"
                onClick={() => dismiss("all")}
                className="inline-flex h-9 items-center justify-center rounded-full bg-[var(--sf-butter)] px-4 text-[13px] font-extrabold text-[var(--sf-ink)] shadow-[0_3px_0_0_#d9b94a] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_5px_0_0_#d9b94a] active:translate-y-0.5 active:shadow-[0_1px_0_0_#d9b94a] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-butter)]/50"
              >
                Accept all
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
