"use client";

import { useRef } from "react";
import Link from "next/link";
import { WORKFLOW_COPY } from "@/components/home/home-copy";
import { BOOK_DEMO_HASH_HREF } from "@/lib/marketing/book-demo";
import { gsap, useGSAP, MQ_MOTION } from "@/components/garden/gsap";
import { Draw, Squiggle, btnOutline, btnPop } from "@/components/garden/ui";
import GrowingPlant from "../../GrowingPlant";
import SectionIntro from "../../SectionIntro";

const STEP_TINTS = ["bg-[var(--sf-butter)]", "bg-[var(--sf-sky)]", "bg-[var(--sf-mint)]"];
const STEP_EMOJI = ["🔎", "🧰", "🚀"];

/** Guided setup: a seed grows into a bloom as you scroll through the three steps. */
export default function Setup() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ_MOTION, () => {
        const st = { trigger: "[data-steps]", start: "top 70%", end: "bottom 60%", scrub: 0.6 };
        const tl = gsap.timeline({ scrollTrigger: st, defaults: { ease: "none" } });
        tl.fromTo("[data-stem]", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 4 }, 0)
          .from("[data-seed]", { scale: 1.6, duration: 0.6, transformOrigin: "50% 50%" }, 0)
          .from("[data-sprout='0']", { scale: 0, transformOrigin: "50% 100%", duration: 0.6 }, 0.6)
          .from("[data-sprout='1']", { scale: 0, transformOrigin: "0% 100%", duration: 0.6 }, 1.5)
          .from("[data-sprout='2']", { scale: 0, transformOrigin: "100% 100%", duration: 0.6 }, 2.4)
          .from("[data-bloom]", { scale: 0, rotate: -90, transformOrigin: "50% 50%", duration: 0.8 }, 3.3);
        gsap.utils.toArray<HTMLElement>("[data-step]").forEach((el) => {
          gsap.from(el, { x: 60, opacity: 0, duration: 0.8, ease: "back.out(1.4)", scrollTrigger: { trigger: el, start: "top 80%", once: true } });
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <section ref={ref} id="setup" className="relative bg-[var(--sf-butter)]/35 py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <SectionIntro
          pill={`🌱 ${WORKFLOW_COPY.badge}`}
          tint="forest"
          lead={WORKFLOW_COPY.headlineLead}
          accent={WORKFLOW_COPY.headlineAccent}
          accentColor="text-[var(--sf-forest)]"
          squiggle="var(--sf-mint)"
          body={<p>{WORKFLOW_COPY.body}</p>}
        />

        <div className="mt-20 grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <div className="hidden lg:block">
            <div className="sticky top-32 mx-auto aspect-[3/4] max-w-[360px]">
              <GrowingPlant className="h-full w-full" />
              <p className="sf-hand -mt-2 text-center text-xl text-[var(--sf-forest)]" aria-hidden="true">
                scroll to grow 🌱
              </p>
            </div>
          </div>

          <div data-steps className="lg:py-[8vh]">
          <ol className="space-y-8">
            {WORKFLOW_COPY.steps.map((s, i) => (
              <li
                key={s.number}
                data-step
                className={`relative grid gap-5 rounded-[32px] border-2 border-[var(--sf-ink)] ${STEP_TINTS[i]} p-7 shadow-[0_8px_0_0_var(--sf-ink)] sm:grid-cols-[110px_1fr] sm:p-8`}
              >
                <div className="flex flex-row items-center gap-3 sm:flex-col sm:items-start">
                  <span className="sf-display text-6xl leading-none text-[var(--sf-ink)]">{s.number}</span>
                  <span className="text-3xl" aria-hidden="true">
                    {STEP_EMOJI[i]}
                  </span>
                </div>
                <div>
                  <span className="sf-hand text-lg text-[var(--sf-clay-deep)]">step {i + 1}</span>
                  <h3 className="sf-display mt-1 text-3xl leading-[1.05] text-[var(--sf-ink)]">{s.title}</h3>
                  <p className="mt-3 text-lg leading-relaxed text-[var(--sf-ink)]/75">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
            <Draw className="mx-auto mt-8 block w-40">
              <Squiggle color="var(--sf-forest)" />
            </Draw>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-2xl text-center">
          <p className="sf-hand text-2xl text-[var(--sf-forest)]">{WORKFLOW_COPY.reassurance}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a href={BOOK_DEMO_HASH_HREF} className={btnPop}>
              {WORKFLOW_COPY.primaryCta}
            </a>
            <Link href={WORKFLOW_COPY.secondaryHref} className={btnOutline}>
              {WORKFLOW_COPY.secondaryCta}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
