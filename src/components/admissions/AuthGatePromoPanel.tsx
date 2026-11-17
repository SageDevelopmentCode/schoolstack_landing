"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { gardenFontVariables } from "@/components/garden/fonts";
import { AUTH_GATE_PROMO } from "@/lib/site";
import "@/components/garden/garden.css";

const slideFadeTransition = {
  duration: 0.5,
  ease: [0.25, 0.1, 0.25, 1] as const,
};

type AuthGatePromoPanelProps = {
  activeSlide: number;
  variant?: "legacy" | "bright";
};

export function AuthGatePromoPanel({
  activeSlide,
  variant = "legacy",
}: AuthGatePromoPanelProps) {
  if (variant === "bright") {
    return <GardenPromoPanel activeSlide={activeSlide} />;
  }

  const slides = AUTH_GATE_PROMO.slides;
  const slide = slides[activeSlide];

  return (
    <div className="relative hidden overflow-hidden lg:flex lg:min-h-dvh lg:flex-1">
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.image}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={slideFadeTransition}
          className="absolute inset-0"
        >
          <Image
            src={slide.image}
            alt=""
            fill
            loading="lazy"
            fetchPriority="low"
            className="object-cover"
            sizes="(max-width: 1023px) 100vw, 50vw"
          />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/10" />

      <div className="relative z-10 flex h-full w-full flex-col p-6 lg:p-10">
        <div className="inline-flex w-fit items-center gap-2 rounded-pill bg-white px-3 py-1.5 shadow-sm">
          <Image
            src="/images/Logo.webp"
            alt="MudKitchen"
            width={24}
            height={24}
            sizes="24px"
            className="h-6 w-auto object-contain"
          />
          <span className="font-display text-base font-semibold text-clay">
            MudKitchen
          </span>
        </div>

        <div className="mt-auto max-w-lg lg:max-w-md">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={slideFadeTransition}
            >
              <span className="inline-flex items-center rounded-pill bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white/85">
                {slide.badge}
              </span>

              <h2 className="mt-4 font-display text-[clamp(1.2rem,4.2vw,1.75rem)] font-medium leading-[1.12] text-white lg:text-[clamp(1.35rem,1.65vw,1.75rem)]">
                <span className="block">{slide.headlineLead}</span>
                <em
                  className="mt-0 block text-[#E8D5C8]"
                  style={{ fontStyle: "italic" }}
                >
                  {slide.headlineAccent}
                </em>
              </h2>

              <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-white/75 lg:text-[15px] lg:line-clamp-none">
                {slide.subtext}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/**
 * Calm Garden promo: the rotating photo sits in an inset toy frame on cream.
 * MudKitchen is speaking here, so it keeps MudKitchen clay even inside a
 * school's gate. Needs a `.sf-garden` ancestor (`BrightAuthPageLayout`).
 */
function GardenPromoPanel({ activeSlide }: { activeSlide: number }) {
  const reduce = useReducedMotion();
  const slide = AUTH_GATE_PROMO.slides[activeSlide];

  return (
    <div className="relative hidden lg:flex lg:min-h-dvh lg:flex-1 lg:p-5 xl:p-6">
      <div className="relative flex flex-1 overflow-hidden rounded-[34px] border-2 border-[var(--sf-ink)] bg-[var(--sf-forest)] shadow-[0_8px_0_0_var(--sf-ink)]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={slide.image}
            initial={reduce ? false : { opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={slideFadeTransition}
            className="absolute inset-0"
          >
            <Image
              src={slide.image}
              alt=""
              fill
              loading="lazy"
              fetchPriority="low"
              className="object-cover"
              sizes="50vw"
            />
          </motion.div>
        </AnimatePresence>
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#1f3329]/90 via-[#1f3329]/30 to-transparent"
          aria-hidden
        />

        <div className="relative z-10 flex h-full w-full flex-col p-7 xl:p-9">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border-2 border-[var(--sf-ink)] bg-[var(--sf-paper)] py-1.5 pl-2 pr-4 shadow-[0_3px_0_0_var(--sf-ink)]">
            <Image
              src="/images/Logo.webp"
              alt=""
              width={24}
              height={24}
              sizes="24px"
              className="h-6 w-auto object-contain"
            />
            <span className="text-base font-extrabold text-[var(--sf-clay)]">
              MudKitchen
            </span>
          </div>

          <div className="mt-auto max-w-md" aria-live="off">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeSlide}
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -8 }}
                transition={slideFadeTransition}
              >
                <span className="inline-flex items-center rounded-full bg-[var(--sf-paper)]/90 px-3.5 py-1 text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--sf-ink)]">
                  {slide.badge}
                </span>

                <h2 className="sf-display mt-4 text-[clamp(1.9rem,2.6vw,2.6rem)] leading-[0.98] text-white">
                  {slide.headlineLead}{" "}
                  <span className="text-[var(--sf-butter)]">
                    {slide.headlineAccent}
                  </span>
                </h2>

                <p className="mt-4 text-[15px] leading-relaxed text-white/85">
                  {slide.subtext}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="mt-6 flex gap-1.5" aria-hidden>
              {AUTH_GATE_PROMO.slides.map((s, index) => (
                <span
                  key={s.image}
                  className={
                    index === activeSlide
                      ? "h-1.5 w-6 rounded-full bg-[var(--sf-butter)] transition-all duration-300"
                      : "h-1.5 w-1.5 rounded-full bg-white/45 transition-all duration-300"
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuthGatePromoPlaceholder() {
  return (
    <div
      className="hidden bg-neutral-900 lg:block lg:min-h-dvh lg:flex-1"
      aria-hidden
    />
  );
}

/**
 * Floating "Need help?" pill on sign-in screens: a forest Garden toy button
 * that opens `/support`. It opts into the Garden scope itself because
 * `ApplicationAuthGate` mounts it outside `.sf-garden`.
 */
export function AuthHelpButton() {
  return (
    // `.sf-garden` paints a cream background, so the scope sits on a
    // `display: contents` wrapper instead of on the pill itself.
    <span className={`${gardenFontVariables} sf-garden contents`}>
      <Link
        href="/support"
        className={`fixed bottom-4 right-4 z-50 inline-flex items-center gap-2 rounded-full border-2 border-[var(--sf-ink)] bg-[var(--sf-forest)] py-2 pl-2.5 pr-4 text-sm font-extrabold text-white shadow-[0_5px_0_0_var(--sf-ink)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_7px_0_0_var(--sf-ink)] active:translate-y-1 active:shadow-[0_1px_0_0_var(--sf-ink)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-forest)]/35 focus-visible:ring-offset-2 sm:bottom-6 sm:right-6 sm:pr-5 sm:text-[15px]`}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--sf-paper)]">
          <Image
            src="/images/Logo.webp"
            alt=""
            width={20}
            height={20}
            sizes="20px"
            className="h-5 w-5 object-contain"
            aria-hidden
          />
        </span>
        Need help?
      </Link>
    </span>
  );
}
