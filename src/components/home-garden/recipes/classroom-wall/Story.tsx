"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { STORY_COPY } from "@/components/home/home-copy";
import { gsap, useGSAP, MQ_DESKTOP_MOTION } from "@/components/garden/gsap";
import { Marquee, Reveal } from "@/components/garden/motion";
import { Pill, Tape, Tick, btnForest } from "@/components/garden/ui";
import { SAGEFIELD_LIST, SAGEFIELD_LOGO, TAPES } from "../../assets";
import Polaroid from "../../Polaroid";

const LEFT = [SAGEFIELD_LIST[4], SAGEFIELD_LIST[0], SAGEFIELD_LIST[3]];
const RIGHT = [SAGEFIELD_LIST[5], SAGEFIELD_LIST[2], SAGEFIELD_LIST[1]];
const STAT_TINTS = ["bg-[var(--sf-butter)]", "bg-[var(--sf-mint)]", "bg-[var(--sf-lav)]"];

/** Sage Field: split scroll of real school photos, with the case study checked off as you go. */
export default function Story() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ_DESKTOP_MOTION, () => {
        const st = { trigger: ref.current, start: "top top", end: "bottom bottom", scrub: 0.6 };
        gsap.fromTo("[data-col-up]", { yPercent: 0 }, { yPercent: -48, ease: "none", scrollTrigger: st });
        gsap.fromTo("[data-col-down]", { yPercent: -48 }, { yPercent: 0, ease: "none", scrollTrigger: st });

        const tl = gsap.timeline({ scrollTrigger: st, defaults: { ease: "none" } });
        gsap.utils.toArray<HTMLElement>("[data-why]").forEach((row, i) => {
          const at = 0.08 + i * 0.16;
          tl.fromTo(row, { opacity: 0.35 }, { opacity: 1, duration: 0.08 }, at)
            .fromTo(row.querySelector("[data-tick]"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.08 }, at)
            .fromTo(row.querySelector("[data-mark]"), { backgroundSize: "0% 40%" }, { backgroundSize: "100% 40%", duration: 0.1 }, at + 0.03);
        });
        tl.fromTo("[data-stat]", { scale: 0, rotate: -30 }, { scale: 1, rotate: 0, stagger: 0.05, duration: 0.12, ease: "back.out(2)" }, 0.02);
        tl.to({}, { duration: 0.1 }, 1);
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  const column = (imgs: typeof LEFT, attr: Record<string, string>, offset: number) => (
    <div className="hidden h-screen overflow-hidden px-3 lg:block" aria-hidden="true">
      <div {...attr} className="flex flex-col gap-10 py-8">
        {[...imgs, ...imgs].map((p, i) => (
          <Polaroid key={`${p.src}-${i}`} src={p.src} alt="" tilt={[-3, 2.5, -1.5, 3, -2.5, 1.5][(i + offset) % 6]} tape={TAPES[(i + offset) % TAPES.length]} sizes="24vw" />
        ))}
      </div>
    </div>
  );

  return (
    <>
      <section ref={ref} id="founder-story" className="relative bg-[var(--sf-mint)]/45 lg:h-[280vh]">
        <div className="grid gap-6 lg:sticky lg:top-0 lg:h-screen lg:grid-cols-[1fr_1.75fr_1fr] lg:px-6">
          {column(LEFT, { "data-col-up": "" }, 0)}
          <div className="flex flex-col justify-center px-6 py-24 text-center sm:px-10 lg:px-4 lg:pb-6 lg:pt-24">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Pill tint="forest">🌳 {STORY_COPY.badge}</Pill>
              <span className="sf-hand text-xl text-[var(--sf-forest)]">{STORY_COPY.location}</span>
            </div>
            <h2 className="sf-display mt-4 text-5xl leading-[0.95] md:text-6xl lg:text-[3.4rem] xl:text-[3.9rem]">
              {STORY_COPY.headlineLead} <span className="text-[var(--sf-forest)]">{STORY_COPY.headlineAccent}</span>
            </h2>

            {/* Stats as round stickers */}
            <div className="mt-6 flex justify-center gap-4">
              {STORY_COPY.stats.map((s, i) => (
                <div
                  key={s.label}
                  data-stat
                  className={`flex h-[104px] w-[104px] flex-col items-center justify-center rounded-full border-2 border-[var(--sf-ink)] ${STAT_TINTS[i]} shadow-[0_4px_0_0_var(--sf-ink)] xl:h-28 xl:w-28`}
                  style={{ rotate: `${[-6, 4, -3][i]}deg` }}
                >
                  <span className="sf-display text-[1.7rem] leading-none text-[var(--sf-ink)]">{s.number}</span>
                  <span className="mt-1 px-2 text-[11px] font-extrabold leading-tight text-[var(--sf-ink)]/75">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Inside the case study — sticky note */}
            <div className="relative mx-auto mt-7 w-full max-w-md -rotate-1 rounded-md bg-[var(--sf-butter)] p-5 pt-6 text-left shadow-[0_14px_30px_-16px_rgba(43,36,29,0.5)]">
              <Tape color="rgba(255,255,255,0.7)" className="-top-2.5 left-1/2 h-5 w-16 -translate-x-1/2 rotate-2" />
              <p className="sf-hand text-2xl leading-none">{STORY_COPY.insideLabel}</p>
              <ul className="mt-3 space-y-1.5">
                {STORY_COPY.sections.map((s) => (
                  <li key={s} data-why className="flex items-center gap-3">
                    <Tick tick className="h-6 w-6" />
                    <strong
                      data-mark
                      className="font-extrabold"
                      style={{
                        backgroundImage: "linear-gradient(rgba(160,92,69,0.28), rgba(160,92,69,0.28))",
                        backgroundRepeat: "no-repeat",
                        backgroundSize: "100% 40%",
                        backgroundPosition: "0 88%",
                      }}
                    >
                      {s}
                    </strong>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-7">
              <Link href={STORY_COPY.href} className={btnForest}>
                {STORY_COPY.cta} →
              </Link>
            </div>
          </div>
          {column(RIGHT, { "data-col-down": "" }, 3)}
        </div>
        <div className="pb-16 lg:hidden" aria-hidden="true">
          <Marquee duration={36} trackClassName="py-6">
            {SAGEFIELD_LIST.map((p, i) => (
              <Polaroid key={p.src} src={p.src} alt="" tilt={i % 2 ? 2 : -2} tape={TAPES[i % TAPES.length]} className="mx-4 w-48" sizes="192px" />
            ))}
          </Marquee>
        </div>
      </section>

      {/* The founder's words */}
      <section className="relative overflow-hidden bg-[var(--sf-cream)] py-24 lg:py-32">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 sm:px-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:px-16">
          <Reveal className="relative mx-auto w-full max-w-sm" y={60}>
            <div>
              <Polaroid src={STORY_COPY.author.image} alt={STORY_COPY.author.name} caption={STORY_COPY.author.name.toLowerCase()} tilt={-4} tape="var(--sf-peach)" aspect="aspect-square" sizes="384px" />
              <div className="absolute -bottom-6 -right-6 flex h-24 w-24 rotate-12 items-center justify-center rounded-full border-2 border-[var(--sf-ink)] bg-white p-3 shadow-[0_4px_0_0_var(--sf-ink)]">
                <Image src={SAGEFIELD_LOGO} alt={STORY_COPY.school.name} width={80} height={80} className="h-full w-full object-contain" />
              </div>
            </div>
          </Reveal>
          <Reveal y={40} stagger={0.12}>
            <span className="sf-display block text-[7rem] leading-[0.6] text-[var(--sf-clay)]" aria-hidden="true">
              &ldquo;
            </span>
            <blockquote className="sf-display mt-2 text-3xl leading-[1.15] text-[var(--sf-ink)] md:text-[2.6rem]">{STORY_COPY.quote}</blockquote>
            <p className="mt-6 font-extrabold text-[var(--sf-ink)]">
              {STORY_COPY.author.name} <span className="font-semibold text-[var(--sf-soft)]">· {STORY_COPY.author.title}</span>
            </p>
            <p className="mt-8 max-w-xl border-t-2 border-dashed border-[var(--sf-ink)]/15 pt-6 leading-relaxed text-[var(--sf-soft)]">{STORY_COPY.body}</p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
