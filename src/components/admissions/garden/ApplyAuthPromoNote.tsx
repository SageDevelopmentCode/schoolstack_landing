"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { GKicker } from "@/components/school-parent/garden/ui";
import { AUTH_GATE_PROMO } from "@/lib/site";

const PORTAL_EASE = [0.16, 1, 0.3, 1] as const;
const fade = { duration: 0.32, ease: PORTAL_EASE };

/** Shared shell so the placeholder and the note have the same footprint. */
export const APPLY_AUTH_PROMO_SHELL =
  "hidden min-w-0 rounded-[24px] border-[1.5px] border-[var(--sf-ink)]/12 bg-[var(--sf-paper)] p-5 shadow-[0_3px_0_0_rgba(43,36,29,0.08)] lg:block xl:p-6";

/**
 * Calm paper note with the rotating MudKitchen promo (desktop only).
 * Lives inside the school's Garden frame, so accent words use the school
 * accent (`--sf-clay*`), never MudKitchen clay. Lazy-loaded by
 * `AuthGatePromoColumn`.
 */
export default function ApplyAuthPromoNote({ activeSlide }: { activeSlide: number }) {
  const reduce = useReducedMotion();
  const slides = AUTH_GATE_PROMO.slides;
  const slide = slides[activeSlide] ?? slides[0];

  return (
    <aside className={APPLY_AUTH_PROMO_SHELL} aria-label="About MudKitchen">
      <div className="relative aspect-[16/10] overflow-hidden rounded-[16px] border-[1.5px] border-[var(--sf-ink)]/12 bg-[var(--sf-ink)]/[0.06]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={slide.image}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={fade}
            className="absolute inset-0"
          >
            <Image
              src={slide.image}
              alt=""
              fill
              loading="lazy"
              fetchPriority="low"
              className="object-cover"
              sizes="(min-width: 1024px) 560px, 0px"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-5 min-h-[168px]" aria-live="off">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeSlide}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -4 }}
            transition={fade}
          >
            <GKicker>{slide.badge}</GKicker>
            <h2 className="sf-display m-0 mt-2 text-[1.5rem] leading-[1.08] text-[var(--sf-ink)]">
              {slide.headlineLead}{" "}
              <span className="text-[var(--sf-clay-deep)]">{slide.headlineAccent}</span>
            </h2>
            <p className="m-0 mt-3 line-clamp-3 text-sm font-semibold leading-relaxed text-[var(--sf-soft)]">
              {slide.subtext}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t-[1.5px] border-dashed border-[var(--sf-ink)]/12 pt-4">
        <span className="inline-flex items-center gap-1.5 text-[13px] font-extrabold text-[var(--sf-ink)]">
          <Image
            src="/images/Logo.webp"
            alt=""
            width={20}
            height={20}
            sizes="20px"
            className="h-5 w-5 object-contain"
          />
          MudKitchen
        </span>
        <span className="flex gap-1.5" aria-hidden>
          {slides.map((s, index) => (
            <span
              key={s.image}
              className={
                index === activeSlide
                  ? "h-1.5 w-5 rounded-full bg-[var(--sf-clay)] transition-all duration-300"
                  : "h-1.5 w-1.5 rounded-full bg-[var(--sf-ink)]/20 transition-all duration-300"
              }
            />
          ))}
        </span>
      </div>
    </aside>
  );
}
