"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { HERO_COPY } from "@/components/home/home-copy";
import { STICKERS_BY_DEMO } from "@/components/home/FloatingStickers";
import { prefetchDemoStage, type DemoStageKey } from "@/components/home/DemoStage";
import { BOOK_DEMO_HASH_HREF } from "@/lib/marketing/book-demo";
import { gsap, useGSAP, MQ_MOTION } from "@/components/garden/gsap";
import { Magnetic, WordsReveal } from "@/components/garden/motion";
import { Arrow, Draw, Leaf, Squiggle, Sun, btnOutline, btnPop } from "@/components/garden/ui";
import GardenDemoFrame from "../GardenDemoFrame";
import StickerNote from "../StickerNote";

const VIEWS: { key: DemoStageKey; label: string; emoji: string; tint: string }[] = [
  { key: "parent", label: "Parent View", emoji: "🏡", tint: "bg-[var(--sf-sky)]" },
  { key: "teacher", label: "Teacher View", emoji: "🍎", tint: "bg-[var(--sf-mint)]" },
  { key: "admin", label: "Admin View", emoji: "🗂️", tint: "bg-[var(--sf-peach)]" },
];

/** Split hero: the promise on the left, the live product (switchable by role) on the right. */
export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const [view, setView] = useState<DemoStageKey>("parent");
  const reduce = useReducedMotion();
  const [s1, s2] = STICKERS_BY_DEMO[view];

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ_MOTION, () => {
        const copy = ref.current!.querySelectorAll("[data-hero-in]");
        const frame = ref.current!.querySelector("[data-hero-frame]");
        gsap.fromTo(
          copy,
          { autoAlpha: 0, y: 40 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            stagger: 0.1,
            delay: 0.35,
            immediateRender: false,
            onComplete() {
              gsap.set(copy, { clearProps: "opacity,visibility,transform" });
            },
          },
        );
        if (frame) {
          gsap.fromTo(
            frame,
            { autoAlpha: 0, y: 120, rotate: 8 },
            {
              autoAlpha: 1,
              y: 0,
              rotate: 0,
              duration: 1.3,
              ease: "back.out(1.2)",
              delay: 0.2,
              immediateRender: false,
              onComplete() {
                gsap.set(frame, { clearProps: "opacity,visibility,transform" });
              },
            },
          );
        }
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <section ref={ref} aria-label="Welcome" className="relative overflow-hidden pb-20 pt-32 lg:pb-28 lg:pt-36">
      <Draw className="absolute left-[44%] top-24 hidden w-16 lg:block" delay={0.8}>
        <Sun />
      </Draw>
      <div className="mx-auto grid max-w-[1320px] items-center gap-14 px-6 sm:px-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-10 lg:px-12">
        {/* Copy */}
        <div className="relative z-10">
          <p data-hero-in className="sf-hand text-2xl text-[var(--sf-forest)]">
            hello, founders! 👋
          </p>
          <h1 className="sf-display mt-3 text-[11vw] leading-[0.9] text-[var(--sf-ink)] sm:text-6xl lg:text-[3.5rem] xl:text-[4.1rem]">
            <WordsReveal as="span" text={HERO_COPY.headlineLead} immediate />{" "}
            <span className="relative isolate inline-block text-[var(--sf-clay)]">
              <Draw className="pointer-events-none absolute -bottom-2 left-0 -z-10 w-full" delay={0.6}>
                <Squiggle className="h-5 w-full" color="var(--sf-butter)" />
              </Draw>
              <WordsReveal as="span" text={HERO_COPY.headlineAccent} immediate delay={0.25} />
            </span>
          </h1>
          <p data-hero-in className="mt-7 max-w-lg text-lg font-semibold leading-relaxed text-[var(--sf-soft)]">
            {HERO_COPY.body}
          </p>
          <div data-hero-in className="mt-9 flex flex-col gap-4 sm:flex-row">
            <Magnetic>
              <a href={BOOK_DEMO_HASH_HREF} className={btnPop}>
                {HERO_COPY.primaryCta}
              </a>
            </Magnetic>
            <a href="#product" className={btnOutline}>
              {HERO_COPY.secondaryCta}
            </a>
          </div>
          <div data-hero-in className="mt-8 hidden items-center gap-2 lg:flex" aria-hidden="true">
            <span className="text-xl">🌿</span>
            <span className="sf-hand text-xl text-[var(--sf-soft)]">{HERO_COPY.badge.toLowerCase()}</span>
          </div>
        </div>

        {/* Live product */}
        <div className="relative">
          <Draw className="absolute -left-4 bottom-[-3.5rem] hidden w-14 lg:block" delay={1.2}>
            <Leaf />
          </Draw>

          <div className="relative mb-6 flex flex-wrap items-center gap-3">
            <div role="tablist" aria-label="Choose a view" className="inline-flex rounded-full border-2 border-[var(--sf-ink)] bg-white p-1.5 shadow-[0_4px_0_0_var(--sf-ink)]">
              {VIEWS.map((v) => {
                const active = v.key === view;
                return (
                  <button
                    key={v.key}
                    role="tab"
                    type="button"
                    aria-selected={active}
                    aria-controls="home2-hero-demo"
                    onClick={() => setView(v.key)}
                    onPointerEnter={() => prefetchDemoStage(v.key)}
                    className="relative cursor-pointer rounded-full px-3.5 py-2 text-sm font-extrabold text-[var(--sf-ink)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30 sm:px-5"
                  >
                    {active ? (
                      <motion.span layoutId="home2-view-pill" className={`absolute inset-0 rounded-full ${v.tint}`} transition={{ type: "spring", stiffness: 420, damping: 32 }} />
                    ) : null}
                    <span className="relative">
                      <span aria-hidden="true">{v.emoji}</span> {v.label}
                    </span>
                  </button>
                );
              })}
            </div>
            <span className="sf-hand hidden text-lg text-[var(--sf-soft)] xl:inline" aria-hidden="true">
              ← try each one
            </span>
          </div>

          <div data-hero-frame id="home2-hero-demo" role="tabpanel">
            <GardenDemoFrame active={view} tilt={1.2} tape="var(--sf-mint)" tapeSide="left" designHeight={640} deferUntilIdle>
              <div className="pointer-events-none absolute -bottom-8 -left-4 z-20 hidden sm:block lg:-left-12" aria-hidden="true">
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={s1.id}
                    initial={reduce ? false : { scale: 0, rotate: -20, y: 20 }}
                    animate={{ scale: 1, rotate: 0, y: 0 }}
                    exit={reduce ? undefined : { scale: 0, rotate: 10, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 380, damping: 18 }}
                  >
                    <StickerNote sticker={s1} tint="bg-[var(--sf-butter)]" tilt={-5} />
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="pointer-events-none absolute -right-3 top-1/3 z-20 hidden sm:block lg:-right-10" aria-hidden="true">
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={s2.id}
                    initial={reduce ? false : { scale: 0, rotate: 20, y: 20 }}
                    animate={{ scale: 1, rotate: 0, y: 0 }}
                    exit={reduce ? undefined : { scale: 0, rotate: -10, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 380, damping: 18, delay: 0.12 }}
                  >
                    <StickerNote sticker={s2} tint="bg-[var(--sf-lav)]" tilt={4} />
                  </motion.div>
                </AnimatePresence>
              </div>
            </GardenDemoFrame>
          </div>
          <div className="mt-14 hidden items-start justify-end gap-2 pr-8 lg:flex" aria-hidden="true">
            <span className="sf-hand mt-6 text-lg text-[var(--sf-soft)]">it&rsquo;s interactive — click around!</span>
            <Draw className="block w-14 -rotate-90">
              <Arrow color="var(--sf-soft)" />
            </Draw>
          </div>
        </div>
      </div>
    </section>
  );
}
