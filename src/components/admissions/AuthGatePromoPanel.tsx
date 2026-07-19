"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { AUTH_GATE_PROMO } from "@/lib/site";

const slideFadeTransition = { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const };

export function AuthGatePromoPanel({ activeSlide }: { activeSlide: number }) {
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

export function AuthGatePromoPlaceholder() {
  return (
    <div
      className="hidden bg-neutral-900 lg:block lg:min-h-dvh lg:flex-1"
      aria-hidden
    />
  );
}

export function AuthHelpButton() {
  return (
    <Link
      href="/get-started"
      className="fixed bottom-4 right-4 z-50 inline-flex items-center gap-2 rounded-pill bg-clay px-4 py-2.5 text-xs font-medium text-white shadow-lg transition hover:opacity-90 sm:bottom-6 sm:right-6 sm:px-5 sm:py-3 sm:text-sm"
    >
      <Image
        src="/images/Logo.webp"
        alt=""
        width={20}
        height={20}
        sizes="20px"
        className="h-5 w-5 w-auto object-contain"
        aria-hidden
      />
      Need help?
    </Link>
  );
}
