"use client";

import { useRef } from "react";
import Link from "next/link";
import { WORKFLOW_COPY } from "@/components/home/home-copy";
import { BOOK_DEMO_HASH_HREF } from "@/lib/marketing/book-demo";
import { gsap, useGSAP, MQ_MOTION } from "@/components/garden/gsap";
import { btnOutline, btnPop } from "@/components/garden/ui";
import SectionIntro from "../../SectionIntro";

/** Guided setup: big numerals on a line that draws itself as you read down. */
export default function SetupEditorial() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ_MOTION, () => {
        gsap.fromTo("[data-line]", { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: "[data-steps]", start: "top 65%", end: "bottom 65%", scrub: true } });
        gsap.utils.toArray<HTMLElement>("[data-step]").forEach((el) => {
          const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 70%", once: true } });
          tl.from(el.querySelector("[data-num]"), { yPercent: 60, opacity: 0, duration: 0.9, ease: "power4.out" })
            .from(el.querySelector("[data-dot]"), { scale: 0, duration: 0.5, ease: "back.out(3)" }, 0.1)
            .from(el.querySelectorAll("[data-copy] > :not([data-num])"), { y: 24, opacity: 0, stagger: 0.08, duration: 0.7, ease: "power3.out" }, 0.15);
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <section ref={ref} id="setup" className="relative bg-[var(--sf-mint)]/45 py-24 lg:py-36">
      <div className="mx-auto grid max-w-[1320px] gap-16 px-6 sm:px-10 lg:grid-cols-[0.8fr_1.2fr] lg:px-12">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionIntro
            pill={`🌱 ${WORKFLOW_COPY.badge}`}
            tint="forest"
            lead={WORKFLOW_COPY.headlineLead}
            accent={WORKFLOW_COPY.headlineAccent}
            accentColor="text-[var(--sf-forest)]"
            squiggle="var(--sf-butter)"
            align="left"
            headingClassName="text-5xl md:text-6xl"
            body={<p>{WORKFLOW_COPY.body}</p>}
          />
          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <a href={BOOK_DEMO_HASH_HREF} className={btnPop}>
              {WORKFLOW_COPY.primaryCta}
            </a>
            <Link href={WORKFLOW_COPY.secondaryHref} className={btnOutline}>
              {WORKFLOW_COPY.secondaryCta}
            </Link>
          </div>
        </div>

        <div data-steps className="relative">
          <span className="absolute bottom-6 left-[27px] top-6 w-[3px] rounded-full bg-[var(--sf-ink)]/10 md:left-[35px]" aria-hidden="true" />
          <span data-line className="absolute bottom-6 left-[27px] top-6 w-[3px] origin-top rounded-full bg-[var(--sf-forest)] md:left-[35px]" aria-hidden="true" />
          <ol className="space-y-16">
            {WORKFLOW_COPY.steps.map((s) => (
              <li key={s.number} data-step className="relative grid grid-cols-[58px_1fr] gap-6 md:grid-cols-[74px_1fr] md:gap-10">
                <span
                  data-dot
                  className="relative z-10 flex h-[58px] w-[58px] items-center justify-center rounded-full border-2 border-[var(--sf-ink)] bg-[var(--sf-butter)] shadow-[0_4px_0_0_var(--sf-ink)] md:h-[74px] md:w-[74px]"
                >
                  <span className="sf-display text-xl text-[var(--sf-ink)] md:text-2xl">{s.number}</span>
                </span>
                <div data-copy className="pt-1">
                  <span data-num className="sf-display block text-[5.5rem] leading-[0.8] text-[var(--sf-forest)]/15 md:text-[8rem]" aria-hidden="true">
                    {s.number}
                  </span>
                  <h3 className="sf-display -mt-10 text-3xl leading-[1.02] text-[var(--sf-ink)] md:-mt-14 md:text-[2.6rem]">{s.title}</h3>
                  <p className="mt-4 max-w-xl text-lg leading-relaxed text-[var(--sf-soft)]">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="sf-hand mt-16 pl-[82px] text-2xl text-[var(--sf-forest)] md:pl-[114px]">{WORKFLOW_COPY.reassurance}</p>
        </div>
      </div>
    </section>
  );
}
