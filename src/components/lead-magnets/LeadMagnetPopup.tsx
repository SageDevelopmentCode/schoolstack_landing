"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Pill, Tape, btnPop } from "@/components/garden/ui";
import { useHasCookieConsent } from "@/hooks/useCookieConsent";
import { isMarketingRoute } from "@/lib/cookie-consent";
import { BOOK_DEMO_HASH_HREF } from "@/lib/marketing/book-demo";
import { GIFT_CARD_OFFER, GIFT_CARD_PAGE_COPY, GIFT_CARD_PAGE_PATH } from "@/lib/marketing/gift-card-offer";
import { BOOKING_STEP_EVENT, hasCapturedLead } from "@/lib/marketing/submit-lead";
import CustomDemoRequestForm from "./CustomDemoRequestForm";
import { LEAD_POPUP_COPY } from "./lead-magnet-copy";
import { LEAD_POPUP_SHOWN_KEY, LEAD_POPUP_TRIGGERS as T } from "./lead-popup-config";

type Trigger = "engaged" | "exit-intent";

const SESSION_SHOWN_KEY = `${LEAD_POPUP_SHOWN_KEY}-session`;

function shownRecently(): boolean {
  try {
    if (window.sessionStorage.getItem(SESSION_SHOWN_KEY)) return true;
    const raw = window.localStorage.getItem(LEAD_POPUP_SHOWN_KEY);
    if (!raw) return false;
    const at = Date.parse(raw);
    return Number.isFinite(at) && Date.now() - at < T.cooldownDays * 86_400_000;
  } catch {
    return false;
  }
}

function rememberShown() {
  const now = new Date().toISOString();
  try {
    window.sessionStorage.setItem(SESSION_SHOWN_KEY, now);
  } catch {}
  try {
    window.localStorage.setItem(LEAD_POPUP_SHOWN_KEY, now);
  } catch {}
}

function isTyping(): boolean {
  const el = document.activeElement;
  return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || (el as HTMLElement).isContentEditable);
}

/**
 * Lead popup for the Garden marketing pages. It offers the custom preview on most pages
 * and restates the gift card offer on /gift-card. Triggers and caps are in
 * lead-popup-config.ts. On phones it is a bottom sheet, never a full-screen interstitial.
 */
export default function LeadMagnetPopup() {
  const pathname = usePathname() ?? "/";
  const reduceMotion = useReducedMotion();
  const hasConsent = useHasCookieConsent();
  const bannerVisible = !hasConsent && isMarketingRoute(pathname);
  const excluded = T.excludedPrefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const isGiftCard = pathname === GIFT_CARD_PAGE_PATH;

  const [open, setOpen] = useState(false);
  const [trigger, setTrigger] = useState<Trigger | null>(null);
  const [pending, setPending] = useState<Trigger | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const blockedRef = useRef(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  const requestOpen = useCallback((why: Trigger) => {
    if (blockedRef.current) return;
    if (hasCapturedLead() || shownRecently()) {
      blockedRef.current = true;
      return;
    }
    setPending((prev) => prev ?? why);
  }, []);

  // Open a pending trigger once the cookie banner is out of the way and nobody is typing.
  useEffect(() => {
    if (!pending || open || bannerVisible || blockedRef.current) return;
    const tryOpen = () => {
      if (blockedRef.current || isTyping()) return false;
      restoreFocusRef.current = document.activeElement as HTMLElement | null;
      rememberShown();
      blockedRef.current = true;
      setTrigger(pending);
      setOpen(true);
      return true;
    };
    if (tryOpen()) return;
    const id = window.setInterval(() => {
      if (tryOpen()) window.clearInterval(id);
    }, 1500);
    return () => window.clearInterval(id);
  }, [pending, open, bannerVisible]);

  // Booking in progress (any booking form on the page past step 0): never interrupt.
  useEffect(() => {
    const onStep = (e: Event) => {
      if ((e as CustomEvent<number>).detail > 0) {
        blockedRef.current = true;
        setPending(null);
      }
    };
    window.addEventListener(BOOKING_STEP_EVENT, onStep);
    return () => window.removeEventListener(BOOKING_STEP_EVENT, onStep);
  }, []);

  // Triggers.
  useEffect(() => {
    if (excluded) return;
    blockedRef.current = false;
    if (hasCapturedLead() || shownRecently()) {
      blockedRef.current = true;
      return;
    }
    const startedAt = Date.now();
    const cleanups: Array<() => void> = [];

    if (pathname === "/") {
      const target = document.querySelector(T.homeTargetSelector);
      if (target) {
        const io = new IntersectionObserver(
          (entries) => {
            if (entries.some((e) => e.isIntersecting)) {
              requestOpen("engaged");
              io.disconnect();
            }
          },
          { threshold: T.homeTargetVisibleRatio },
        );
        io.observe(target);
        cleanups.push(() => io.disconnect());
      }
    } else {
      let maxRatio = 0;
      const measure = () => {
        const doc = document.documentElement;
        const scrollable = doc.scrollHeight - window.innerHeight;
        const ratio = scrollable > 0 ? window.scrollY / scrollable : 1;
        if (ratio > maxRatio) maxRatio = ratio;
      };
      measure();
      window.addEventListener("scroll", measure, { passive: true });
      const id = window.setInterval(() => {
        if (Date.now() - startedAt >= T.minSeconds * 1000 && maxRatio >= T.minScrollRatio) {
          requestOpen("engaged");
          window.clearInterval(id);
        }
      }, 1000);
      cleanups.push(() => {
        window.removeEventListener("scroll", measure);
        window.clearInterval(id);
      });
    }

    if (window.matchMedia("(pointer: fine)").matches) {
      const onOut = (e: MouseEvent) => {
        if (e.relatedTarget || e.clientY > 0) return;
        if (Date.now() - startedAt < T.exitIntentMinSeconds * 1000) return;
        requestOpen("exit-intent");
      };
      document.documentElement.addEventListener("mouseout", onOut);
      cleanups.push(() => document.documentElement.removeEventListener("mouseout", onOut));
    }

    return () => cleanups.forEach((fn) => fn());
  }, [pathname, excluded, requestOpen]);

  const close = useCallback(() => {
    setOpen(false);
    setPending(null);
    restoreFocusRef.current?.focus?.();
  }, []);

  // Focus, Escape and a simple focus trap while open.
  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    dialog?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab" || !dialog) return;
      const focusables = dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([tabindex="-1"]), textarea, select, [tabindex="0"]',
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  if (excluded) return null;

  const goToBooking = () => {
    close();
    document.getElementById(BOOK_DEMO_HASH_HREF.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <AnimatePresence>
      {open ? (
        <div key="lead-popup" className="fixed inset-0 z-[1000] flex items-end justify-center sm:items-center sm:p-6" data-lead-popup={trigger ?? ""}>
          <motion.div
            className="absolute inset-0 bg-[var(--sf-ink)]/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            onClick={close}
            aria-hidden="true"
          />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            data-lenis-prevent
            initial={reduceMotion ? false : { opacity: 0, y: 60, rotate: -1 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 40 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="sf-paper relative max-h-[85vh] w-full overflow-y-auto overscroll-contain rounded-t-[28px] border-2 border-b-0 border-[var(--sf-ink)] px-5 pb-5 pt-4 shadow-[0_-6px_0_0_var(--sf-ink)] outline-none sm:max-h-[90vh] sm:max-w-[520px] sm:rounded-[32px] sm:border-b-2 sm:px-8 sm:pb-8 sm:pt-9 sm:shadow-[0_10px_0_0_var(--sf-ink)]"
          >
            <Tape color="var(--sf-butter)" className="-top-3 left-1/2 hidden w-24 -translate-x-1/2 -rotate-3 sm:block" />
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-[var(--sf-ink)]/20 sm:hidden" aria-hidden="true" />
            <button
              type="button"
              onClick={close}
              aria-label={LEAD_POPUP_COPY.closeLabel}
              className="absolute right-3 top-3 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-[var(--sf-soft)] transition-colors hover:bg-[var(--sf-ink)]/5 hover:text-[var(--sf-ink)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30"
            >
              <X size={20} strokeWidth={2.4} aria-hidden />
            </button>

            {isGiftCard ? (
              <>
                <Pill tint="butter" className="!text-xs">{LEAD_POPUP_COPY.giftCard.pill}</Pill>
                <h2 id={titleId} className="sf-display mt-4 pr-8 text-[2.1rem] leading-[0.98] text-[var(--sf-ink)] sm:text-[2.4rem]">
                  {GIFT_CARD_PAGE_COPY.heroLead} <span className="text-[var(--sf-clay)]">{GIFT_CARD_PAGE_COPY.heroAccent}</span>
                </h2>
                <p className="mt-4 text-[15px] leading-relaxed text-[var(--sf-soft)]">{GIFT_CARD_PAGE_COPY.heroBody}</p>
                <button type="button" onClick={goToBooking} className={`${btnPop} mt-6 w-full`}>
                  {LEAD_POPUP_COPY.giftCard.cta}
                </button>
                <p className="mt-3 text-center text-xs leading-relaxed text-[var(--sf-soft)]">{GIFT_CARD_OFFER.fine}</p>
              </>
            ) : (
              <>
                {!submitted ? (
                  <>
                    <h2 id={titleId} className="sf-display pr-10 text-[1.75rem] leading-[0.98] text-[var(--sf-ink)] sm:pt-1 sm:text-[2.2rem]">
                      {LEAD_POPUP_COPY.titleLead} <span className="text-[var(--sf-clay)]">{LEAD_POPUP_COPY.titleAccent}</span>
                    </h2>
                    <p className="mb-4 mt-2 text-sm leading-relaxed text-[var(--sf-soft)] sm:mb-6 sm:mt-3 sm:text-[15px]">{LEAD_POPUP_COPY.body}</p>
                  </>
                ) : (
                  <h2 id={titleId} className="sr-only">
                    {LEAD_POPUP_COPY.titleLead} {LEAD_POPUP_COPY.titleAccent}
                  </h2>
                )}
                <CustomDemoRequestForm
                  compact
                  placement={`popup:${trigger ?? "engaged"}`}
                  onSuccess={() => setSubmitted(true)}
                />
                {!submitted ? (
                  <button
                    type="button"
                    onClick={close}
                    className="mx-auto mt-2 block cursor-pointer rounded-full px-3 py-1.5 text-sm font-extrabold text-[var(--sf-soft)] hover:text-[var(--sf-ink)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30"
                  >
                    {LEAD_POPUP_COPY.dismiss}
                  </button>
                ) : null}
              </>
            )}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
