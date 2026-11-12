"use client";

import { useRef } from "react";
import Image from "next/image";
import { PAIN_COPY } from "@/components/home/home-copy";
import { PAIRS } from "@/components/sections/PainSection";
import { BOOK_DEMO_HASH_HREF } from "@/lib/marketing/book-demo";
import { gsap, useGSAP, MQ_DESKTOP_MOTION } from "@/components/garden/gsap";
import { Pill, btnPop } from "@/components/garden/ui";
import { MUDKITCHEN_LOGO, TAPES } from "../../assets";

const N = PAIRS.length;
/** Final (tidy) ring positions, in % of the stage. */
const RING = PAIRS.map((_, i) => {
  const a = (-90 + (i * 360) / N) * (Math.PI / 180);
  return { left: 50 + Math.cos(a) * 39, top: 50 + Math.sin(a) * 37, a };
});
/** Scattered start offsets: pushed outward, jittered, tilted. Deterministic for SSR. */
const SCATTER = PAIRS.map((_, i) => ({
  push: 0.12 + ((i * 37) % 11) / 90,
  jx: (((i * 53) % 9) - 4) * 9,
  jy: (((i * 29) % 7) - 3) * 12,
  r: (((i * 41) % 13) - 6) * 3.2,
}));

/**
 * Pain section: the tools a school runs on today are taped all over the wall.
 * Scrolling crosses each one out and tidies it into one ring around MudKitchen.
 */
export default function ToolsToOne() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ_DESKTOP_MOTION, () => {
        const stage = ref.current!.querySelector<HTMLElement>("[data-stage]")!;
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: ref.current, start: "top top", end: "bottom bottom", scrub: 0.7, invalidateOnRefresh: true },
        });
        gsap.utils.toArray<HTMLElement>("[data-move]").forEach((el, i) => {
          const { a } = RING[i];
          const s = SCATTER[i];
          const at = 0.08 + (i / N) * 0.45;
          tl.fromTo(
            el,
            {
              // Left-side notes stay out of the copy column.
              x: () => Math.cos(a) * stage.clientWidth * s.push * (Math.cos(a) < 0 ? 0.35 : 1) + s.jx,
              y: () => Math.sin(a) * stage.clientHeight * s.push + s.jy,
              rotate: s.r,
              scale: 1.12,
            },
            { x: 0, y: 0, rotate: 0, scale: 1, duration: 0.35 },
            at,
          )
            .fromTo(el.querySelector("[data-strike]"), { scaleX: 0 }, { scaleX: 1, duration: 0.12 }, at + 0.08)
            .fromTo(el.querySelector("[data-tool]"), { opacity: 1 }, { opacity: 0.55, duration: 0.12 }, at + 0.12)
            .fromTo(el.querySelector("[data-feature]"), { opacity: 0, y: -8, scale: 0.7 }, { opacity: 1, y: 0, scale: 1, duration: 0.14 }, at + 0.22);
        });
        tl.fromTo("[data-hub]", { scale: 0.55, rotate: -12 }, { scale: 1, rotate: 0, duration: 0.4, ease: "back.out(1.6)" }, 0.45)
          .fromTo("[data-hub-ring]", { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.3 }, 0.6)
          .fromTo("[data-label-before]", { opacity: 1, y: 0 }, { opacity: 0, y: -16, duration: 0.08 }, 0.55)
          .fromTo("[data-label-after]", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.08 }, 0.6)
          .to({}, { duration: 0.15 }, 0.9);
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <section ref={ref} className="relative bg-[var(--sf-peach)]/45 lg:h-[260vh]">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-24 sm:px-10 lg:sticky lg:top-0 lg:h-screen lg:grid-cols-[0.9fr_1.1fr] lg:gap-10 lg:px-16 lg:py-0 lg:pt-16">
        {/* Copy */}
        <div>
          <Pill tint="clay">🧶 {PAIN_COPY.eyebrow}</Pill>
          <h2 className="sf-display mt-5 text-5xl leading-[0.95] text-[var(--sf-ink)] md:text-6xl lg:text-[3.5rem] xl:text-[3.9rem]">
            {PAIN_COPY.headlineLead} <span className="text-[var(--sf-clay)]">{PAIN_COPY.headlineAccent}</span>
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--sf-soft)]">{PAIN_COPY.body}</p>
          <div className="relative mt-7 hidden h-11 lg:block" aria-hidden="true">
            <span data-label-before className="absolute left-0 top-0 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 font-extrabold text-[var(--sf-clay-deep)] ring-2 ring-[var(--sf-clay)]/40 opacity-0">
              😵‍💫 {PAIN_COPY.scatteredLabel}
            </span>
            <span data-label-after className="absolute left-0 top-0 inline-flex items-center gap-2 rounded-full bg-[var(--sf-forest)] px-5 py-2.5 font-extrabold text-white">
              🌱 {PAIN_COPY.unifiedLabel}
            </span>
          </div>
          <div className="mt-8">
            <a href={BOOK_DEMO_HASH_HREF} className={btnPop}>
              {PAIN_COPY.cta}
            </a>
          </div>
        </div>

        {/* Stage (desktop) */}
        <div data-stage className="relative mx-auto hidden aspect-square w-full max-w-[min(600px,78vh)] lg:block" aria-hidden="true">
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" fill="none">
            <ellipse data-hub-ring cx="50" cy="50" rx="39" ry="37" stroke="var(--sf-forest)" strokeOpacity="0.35" strokeWidth="0.5" strokeDasharray="1.6 1.6" />
          </svg>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div data-hub className="flex h-40 w-40 flex-col items-center justify-center rounded-full border-2 border-[var(--sf-ink)] bg-[var(--sf-forest)] shadow-[0_8px_0_0_var(--sf-ink)] xl:h-44 xl:w-44">
              <div className="relative h-16 w-16 rounded-full bg-[var(--sf-cream)] p-2">
                <Image src={MUDKITCHEN_LOGO} alt="" fill className="object-contain p-1.5" sizes="64px" />
              </div>
              <span className="sf-display mt-2 text-lg text-white">MudKitchen</span>
            </div>
          </div>
          {PAIRS.map((p, i) => {
            const Icon = p.icon;
            return (
              <div key={p.tool} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${RING[i].left}%`, top: `${RING[i].top}%` }}>
                <div data-move className="will-change-transform">
                  <div className="relative w-[118px] rounded-xl bg-white px-2.5 pb-2.5 pt-3 text-center shadow-[0_14px_28px_-16px_rgba(43,36,29,0.55)] ring-1 ring-[var(--sf-ink)]/10">
                    <span className="absolute -top-2 left-1/2 h-4 w-12 -translate-x-1/2 -rotate-3 rounded-sm opacity-90" style={{ background: TAPES[i % TAPES.length] }} />
                    <div data-tool className="relative flex items-center justify-center gap-1.5">
                      <Image src={p.logo} alt="" width={18} height={18} className="h-[18px] w-[18px] object-contain" />
                      <span className="truncate text-[12px] font-extrabold text-[var(--sf-ink)]">{p.tool}</span>
                      <span data-strike className="absolute left-0 right-0 top-1/2 h-[2.5px] origin-left -rotate-3 rounded-full bg-[var(--sf-clay)]" />
                    </div>
                    <div data-feature className="mt-2 inline-flex items-center gap-1 rounded-full bg-[var(--sf-mint)] px-2.5 py-1 text-[12px] font-extrabold text-[var(--sf-forest)]">
                      <Icon size={13} strokeWidth={2.6} />
                      {p.feature}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Phones / tablets: before → after list */}
        <ul className="grid gap-3 sm:grid-cols-2 lg:hidden">
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
                <span aria-hidden="true" className="text-[var(--sf-soft)]">→</span>
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
