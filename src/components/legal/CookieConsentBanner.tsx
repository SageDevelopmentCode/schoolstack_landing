"use client";

import Link from "next/link";
import { useCallback } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Cookie } from "lucide-react";
import { useHasCookieConsent } from "@/hooks/useCookieConsent";
import { isMarketingRoute, setCookieConsent } from "@/lib/cookie-consent";

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
    <div className="fixed bottom-4 left-1/2 z-50 w-full max-w-[640px] -translate-x-1/2 px-4 pointer-events-none">
      <AnimatePresence>
        {visible ? (
          <motion.div
            key="cookie-banner"
            role="dialog"
            aria-live="polite"
            aria-label="Cookie consent"
            initial={reducedMotion ? false : { opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: 8, scale: 0.98 }}
            transition={transition}
            className="pointer-events-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 rounded-2xl border border-white/10 bg-sage-900/85 backdrop-blur-lg px-4 py-2.5 shadow-sm"
          >
            <p className="flex items-start gap-2 text-xs text-white/70 leading-relaxed sm:max-w-[360px]">
              <span className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
                <span className="absolute inset-0 rounded-full bg-clay/25" aria-hidden="true" />
                <Cookie size={13} className="relative text-white/90" aria-hidden="true" />
              </span>
              <span>
                We use cookies for security and optional analytics.{" "}
                <Link
                  href="/privacy#cookies"
                  className="text-white/90 underline underline-offset-2 hover:text-white"
                >
                  Privacy Policy
                </Link>
              </span>
            </p>

            <div className="flex items-center gap-2 shrink-0 sm:ml-auto">
              <button
                type="button"
                onClick={() => dismiss("essential")}
                className="inline-flex items-center justify-center rounded-pill border border-white/15 px-3 h-8 text-xs font-medium text-white/85 hover:bg-white/10 transition-colors"
              >
                Essential
              </button>
              <motion.button
                type="button"
                onClick={() => dismiss("all")}
                whileHover={reducedMotion ? undefined : { scale: 1.02, y: -1 }}
                whileTap={reducedMotion ? undefined : { scale: 0.98 }}
                className="inline-flex items-center justify-center rounded-pill bg-white text-sage-900 px-3 h-8 text-xs font-medium hover:bg-white/90 transition-colors"
              >
                Accept all
              </motion.button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
