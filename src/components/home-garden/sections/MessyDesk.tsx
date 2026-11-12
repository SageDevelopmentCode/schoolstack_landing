"use client";

import { useRef } from "react";
import Image from "next/image";
import { PAIN_COPY } from "@/components/home/home-copy";
import { PAIRS } from "@/components/sections/PainSection";
import { BOOK_DEMO_HASH_HREF } from "@/lib/marketing/book-demo";
import { gsap, useGSAP, MQ_DESKTOP_MOTION } from "@/components/garden/gsap";
import { ScrubWords } from "@/components/garden/motion";
import { MARK, Pill, btnPop } from "@/components/garden/ui";
import type { Run } from "@/components/garden/types";
import { ILLUSTRATIONS, MUDKITCHEN_LOGO, NOTE_TINTS } from "../assets";

const HL = "one shared system";
const [BEFORE, AFTER] = PAIN_COPY.body.split(HL);
const BODY_RUNS: Run[] = [{ text: BEFORE }, { text: HL, highlight: true }, { text: AFTER }];

const N = PAIRS.length;
/** Final, tidy spots: a fanned stack resting on the folder (% of stage). */
const STACK = PAIRS.map((_, i) => ({ left: 27 + (i % 5) * 11.5, top: 30 + Math.floor(i / 5) * 10, r: ((i * 7) % 9) - 4 }));
/** Messy desk spots, as offsets from the stack spot (% of stage). Deterministic for SSR. */
const MESS = [
  { x: -14, y: -34, r: -16 },
  { x: -6, y: -40, r: 11 },
  { x: 14, y: -26, r: -8 },
  { x: 22, y: -42, r: 19 },
  { x: 16, y: -12, r: -13 },
  { x: -12, y: 8, r: 14 },
  { x: -16, y: -18, r: -5 },
  { x: 2, y: 18, r: 22 },
  { x: 24, y: 16, r: -18 },
  { x: 30, y: -4, r: 7 },
];

/** Pain section: a messy desk of tools gets filed into one MudKitchen folder as you read. */
export default function MessyDesk() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ_DESKTOP_MOTION, () => {
        const stage = ref.current!.querySelector<HTMLElement>("[data-desk]")!;
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: ref.current, start: "top top", end: "bottom bottom", scrub: 0.7, invalidateOnRefresh: true },
        });
        gsap.utils.toArray<HTMLElement>("[data-paper]").forEach((el, i) => {
          const m = MESS[i];
          const at = 0.1 + (i / N) * 0.5;
          tl.fromTo(
            el,
            { x: () => (m.x / 100) * stage.clientWidth, y: () => (m.y / 100) * stage.clientHeight, rotate: m.r, scale: 1.15 },
            { x: 0, y: 0, rotate: 0, scale: 1, duration: 0.3, ease: "power1.inOut" },
            at,
          );
        });
        tl.fromTo("[data-folder]", { y: 30, rotate: -4 }, { y: 0, rotate: 0, duration: 0.4 }, 0.3)
          .fromTo("[data-folder-label]", { scale: 0, rotate: -30 }, { scale: 1, rotate: 0, duration: 0.15, ease: "back.out(2)" }, 0.78)
          .fromTo("[data-label-before]", { opacity: 1 }, { opacity: 0, duration: 0.06 }, 0.62)
          .fromTo("[data-label-after]", { opacity: 0 }, { opacity: 1, duration: 0.06 }, 0.66)
          .to({}, { duration: 0.12 }, 0.9);
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <section ref={ref} className="relative bg-[var(--sf-butter)]/40 lg:h-[250vh]">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-24 sm:px-10 lg:sticky lg:top-0 lg:h-screen lg:grid-cols-[0.95fr_1.05fr] lg:gap-12 lg:px-16 lg:py-0 lg:pt-16">
        <div>
          <Pill tint="butter">🗂️ {PAIN_COPY.eyebrow}</Pill>
          <h2 className="sf-display mt-5 text-5xl leading-[0.95] text-[var(--sf-ink)] md:text-6xl lg:text-[3.2rem] xl:text-[3.5rem]">
            {PAIN_COPY.headlineLead} <span className="text-[var(--sf-clay)]">{PAIN_COPY.headlineAccent}</span>
          </h2>
          <ScrubWords
            runs={BODY_RUNS}
            className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--sf-ink)] xl:text-xl"
            highlightClassName={MARK.mint}
            dimOpacity={0.22}
            start="top 75%"
            end="top 25%"
          />
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a href={BOOK_DEMO_HASH_HREF} className={btnPop}>
              {PAIN_COPY.cta}
            </a>
            <span className="relative hidden h-10 w-64 lg:block" aria-hidden="true">
              <span data-label-before className="sf-hand absolute inset-0 flex items-center text-xl text-[var(--sf-clay-deep)] opacity-0">
                ✗ {PAIN_COPY.scatteredLabel.toLowerCase()}
              </span>
              <span data-label-after className="sf-hand absolute inset-0 flex items-center text-xl text-[var(--sf-forest)]">
                ✓ {PAIN_COPY.unifiedLabel.toLowerCase()}
              </span>
            </span>
          </div>
        </div>

        <div data-desk className="relative mx-auto aspect-[5/4] w-full max-w-[600px]" aria-hidden="true">
          <div data-folder className="absolute bottom-0 left-[8%] w-[84%]">
            <Image src={ILLUSTRATIONS.folder} alt="" width={1024} height={1024} className="h-auto w-full drop-shadow-[0_30px_30px_rgba(43,36,29,0.25)]" sizes="560px" />
            <div data-folder-label className="absolute left-[30%] top-[52%] flex items-center gap-2 rounded-xl border-2 border-[var(--sf-ink)] bg-white px-4 py-2 shadow-[0_4px_0_0_var(--sf-ink)]" style={{ rotate: "-6deg" }}>
              <Image src={MUDKITCHEN_LOGO} alt="" width={28} height={28} className="h-7 w-7" />
              <span className="sf-display text-xl text-[var(--sf-ink)]">MudKitchen</span>
            </div>
          </div>
          {PAIRS.map((p, i) => (
            <div key={p.tool} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${STACK[i].left}%`, top: `${STACK[i].top}%` }}>
              <div data-paper className="will-change-transform" style={{ rotate: `${STACK[i].r}deg` }}>
                <div className={`flex w-[104px] flex-col items-center gap-1.5 rounded-md ${NOTE_TINTS[i % NOTE_TINTS.length]} px-2 pb-3 pt-3 shadow-[0_10px_20px_-12px_rgba(43,36,29,0.6)]`}>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white">
                    <Image src={p.logo} alt="" width={22} height={22} className="h-[22px] w-[22px] object-contain" />
                  </span>
                  <span className="text-center text-[12px] font-extrabold leading-tight text-[var(--sf-ink)]">{p.tool}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
