"use client";

import { useRef } from "react";
import Image from "next/image";
import { PAIN_COPY } from "@/components/home/home-copy";
import { PAIRS } from "@/components/sections/PainSection";
import DemoStage from "@/components/home/DemoStage";
import { BOOK_DEMO_HASH_HREF } from "@/lib/marketing/book-demo";
import { gsap, useGSAP, MQ_DESKTOP_MOTION } from "@/components/garden/gsap";
import { ScrubWords } from "@/components/garden/motion";
import { MARK, Pill, btnPop } from "@/components/garden/ui";
import type { Run } from "@/components/garden/types";
import { MUDKITCHEN_LOGO, NOTE_TINTS } from "../assets";

const HL = "one shared system";
const [BEFORE, AFTER] = PAIN_COPY.body.split(HL);
const BODY_RUNS: Run[] = [{ text: BEFORE }, { text: HL, highlight: true }, { text: AFTER }];

/** Paper size in px; papers are centred on their desk spot. */
const PAPER_W = 116;
const PAPER_H = 100;

/** Where each tool lies on the messy desk (% of stage) and its tilt. Deterministic for SSR. */
const DESK = [
  { l: 13, t: 15, r: -12 },
  { l: 37, t: 9, r: 8 },
  { l: 63, t: 14, r: -6 },
  { l: 87, t: 20, r: 14 },
  { l: 21, t: 46, r: 10 },
  { l: 50, t: 40, r: -14 },
  { l: 79, t: 50, r: 6 },
  { l: 11, t: 79, r: -8 },
  { l: 41, t: 74, r: 16 },
  { l: 70, t: 84, r: -10 },
];

/** Offset of `el` inside `stage`, ignoring transforms (so it's safe mid-animation). */
function offsetWithin(el: HTMLElement, stage: HTMLElement) {
  let x = 0;
  let y = 0;
  let n: HTMLElement | null = el;
  while (n && n !== stage) {
    x += n.offsetLeft;
    y += n.offsetTop;
    n = n.offsetParent as HTMLElement | null;
  }
  return { x: x + el.offsetWidth / 2, y: y + el.offsetHeight / 2 };
}

/**
 * Pain section: the tools a school runs on are scattered across the desk.
 * Scrolling crosses each one out, flips it over to the MudKitchen feature that
 * replaces it, then files every feature into one MudKitchen window.
 */
export default function MessyDesk() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ_DESKTOP_MOTION, () => {
        const stage = ref.current!.querySelector<HTMLElement>("[data-stage]")!;
        const slots = gsap.utils.toArray<HTMLElement>("[data-slot]", stage);
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: ref.current, start: "top top", end: "bottom bottom", scrub: 0.7, invalidateOnRefresh: true },
        });

        tl.fromTo("[data-window]", { opacity: 0, y: 50, scale: 0.92 }, { opacity: 1, y: 0, scale: 1, duration: 0.1, ease: "power2.out" }, 0.42);

        gsap.utils.toArray<HTMLElement>("[data-paper]", stage).forEach((el, i) => {
          const spot = DESK[i];
          const slot = slots[i];
          const at = 0.06 + i * 0.033;
          const fly = 0.52 + i * 0.024;
          const dx = () => offsetWithin(slot, stage).x - (spot.l / 100) * stage.clientWidth;
          const dy = () => offsetWithin(slot, stage).y - (spot.t / 100) * stage.clientHeight;

          tl.fromTo(el, { opacity: 1, x: 0, y: 0, rotate: spot.r, scale: 1 }, { opacity: 1, duration: 0.001 }, 0)
            .fromTo(el.querySelector("[data-strike]"), { scaleX: 0 }, { scaleX: 1, duration: 0.05 }, at)
            .fromTo(el.querySelector("[data-flip]"), { rotateY: 0 }, { rotateY: 180, duration: 0.08, ease: "power2.inOut" }, at + 0.05)
            .to(el, { x: dx, y: dy, rotate: 0, scale: 0.55, duration: 0.12, ease: "power2.inOut" }, fly)
            .to(el, { opacity: 0, duration: 0.03 }, fly + 0.1)
            .fromTo(slot, { opacity: 0, x: -14 }, { opacity: 1, x: 0, duration: 0.04, ease: "back.out(2)" }, fly + 0.09);
        });

        tl.fromTo("[data-label-before]", { opacity: 1 }, { opacity: 0, duration: 0.06 }, 0.6)
          .fromTo("[data-label-after]", { opacity: 0 }, { opacity: 1, duration: 0.06 }, 0.64)
          .to({}, { duration: 0.1 }, 0.9);
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <section ref={ref} className="relative bg-[var(--sf-butter)]/40 lg:h-[280vh]">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-24 sm:px-10 lg:sticky lg:top-0 lg:h-screen lg:grid-cols-[0.9fr_1.1fr] lg:gap-12 lg:px-16 lg:py-0 lg:pt-16">
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

        {/* Desk stage (desktop): tools → flipped features → one MudKitchen window */}
        <div data-stage className="relative mx-auto hidden aspect-[6/5] w-full max-w-[min(620px,82vh)] lg:block" aria-hidden="true">
          <div className="absolute inset-0 flex items-center">
            <div data-window className="w-full overflow-hidden rounded-[26px] border-2 border-[var(--sf-ink)] bg-white shadow-[0_10px_0_0_var(--sf-ink),0_40px_80px_-40px_rgba(43,36,29,0.6)]">
              <div className="flex items-center gap-3 border-b-2 border-[var(--sf-ink)] bg-[var(--sf-paper)] px-4 py-2.5">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full border-[1.5px] border-[var(--sf-ink)] bg-[var(--sf-peach)]" />
                  <span className="h-3 w-3 rounded-full border-[1.5px] border-[var(--sf-ink)] bg-[var(--sf-butter)]" />
                  <span className="h-3 w-3 rounded-full border-[1.5px] border-[var(--sf-ink)] bg-[var(--sf-mint)]" />
                </div>
                <span className="mx-auto flex items-center gap-1.5 rounded-full bg-white px-3 py-1 ring-1 ring-[var(--sf-ink)]/10">
                  <Image src={MUDKITCHEN_LOGO} alt="" width={18} height={18} className="h-[18px] w-[18px] object-contain" />
                  <span className="sf-display text-sm text-[var(--sf-ink)]">MudKitchen</span>
                </span>
                <span className="w-[54px]" />
              </div>
              <div className="grid grid-cols-[34%_1fr]">
                <ul className="flex flex-col gap-1 border-r-2 border-[var(--sf-ink)] bg-[var(--sf-mint)]/45 p-2">
                  {PAIRS.map((p) => {
                    const Icon = p.icon;
                    return (
                      <li key={p.tool} data-slot className="flex items-center gap-2 rounded-lg bg-white px-2 py-1 ring-1 ring-[var(--sf-ink)]/10">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[var(--sf-mint)] text-[var(--sf-forest)]">
                          <Icon size={13} strokeWidth={2.6} />
                        </span>
                        <span className="min-w-0 leading-tight">
                          <span className="block truncate text-[12px] font-extrabold text-[var(--sf-ink)]">{p.feature}</span>
                          <s className="block truncate text-[9.5px] font-bold text-[var(--sf-soft)] decoration-[var(--sf-clay)] decoration-[1.5px]">{p.tool}</s>
                        </span>
                      </li>
                    );
                  })}
                </ul>
                <div className="sf-demo min-w-0">
                  <DemoStage active="admin" interactive={false} designHeight={980} minScale={0.25} />
                </div>
              </div>
            </div>
          </div>

          {PAIRS.map((p, i) => {
            const Icon = p.icon;
            return (
              <div key={p.tool} className="absolute h-0 w-0" style={{ left: `${DESK[i].l}%`, top: `${DESK[i].t}%` }}>
                <div
                  data-paper
                  className="absolute opacity-0 [perspective:700px] will-change-transform"
                  style={{ width: PAPER_W, height: PAPER_H, left: -PAPER_W / 2, top: -PAPER_H / 2 }}
                >
                  <div data-flip className="relative h-full w-full [transform-style:preserve-3d]">
                    {/* Front: the tool it used to live in */}
                    <div
                      className={`absolute inset-0 flex flex-col items-center justify-center gap-1.5 rounded-md ${NOTE_TINTS[i % NOTE_TINTS.length]} px-2 shadow-[0_10px_20px_-12px_rgba(43,36,29,0.6)] [backface-visibility:hidden]`}
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white">
                        <Image src={p.logo} alt="" width={22} height={22} className="h-[22px] w-[22px] object-contain" />
                      </span>
                      <span className="relative text-center text-[12px] font-extrabold leading-tight text-[var(--sf-ink)]">
                        {p.tool}
                        <span data-strike className="absolute -left-1.5 -right-1.5 top-1/2 h-[3px] origin-left rounded-full bg-[var(--sf-clay)]" />
                      </span>
                    </div>
                    {/* Back: what replaces it */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-[var(--sf-forest)] bg-white px-2 shadow-[0_4px_0_0_var(--sf-forest)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--sf-mint)] text-[var(--sf-forest)]">
                        <Icon size={18} strokeWidth={2.5} />
                      </span>
                      <span className="text-center text-[13px] font-extrabold leading-tight text-[var(--sf-ink)]">{p.feature}</span>
                      <span className="flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-[0.14em] text-[var(--sf-forest)]">
                        <Image src={MUDKITCHEN_LOGO} alt="" width={12} height={12} className="h-3 w-3 object-contain" />
                        MudKitchen
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Phones / tablets: tool → feature list. Desktop: the same list for screen readers. */}
        <ul className="grid gap-3 sm:grid-cols-2 lg:sr-only">
          {PAIRS.map((p, i) => {
            const Icon = p.icon;
            return (
              <li
                key={p.tool}
                className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 shadow-[0_10px_24px_-18px_rgba(43,36,29,0.5)]"
                style={{ rotate: `${i % 2 ? 0.8 : -0.8}deg` }}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <Image src={p.logo} alt="" width={20} height={20} className="h-5 w-5 object-contain" />
                  <s className="truncate font-bold text-[var(--sf-soft)] decoration-[var(--sf-clay)] decoration-2">{p.tool}</s>
                </span>
                <span aria-hidden="true" className="text-[var(--sf-soft)]">
                  →
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--sf-mint)] px-3 py-1 text-sm font-extrabold text-[var(--sf-forest)]">
                  <Icon size={14} strokeWidth={2.6} aria-hidden />
                  {p.feature}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
