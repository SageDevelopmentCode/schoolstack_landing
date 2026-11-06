"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useMotionValue, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { FadeInView } from "@/components/ui/FadeInView";
import { BOOK_DEMO_HASH_HREF } from "@/lib/marketing/book-demo";
import ToolHub from "./ToolHub";
import { PAIN_COPY } from "./home-copy";
import { ACCENT_HIGHLIGHT, BOLD_HEADING, DARK_PILL } from "./bright-styles";

type HubState = "scattered" | "unified";

export default function BrightPain() {
  const reduceMotion = useReducedMotion();
  const progress = useMotionValue(0);
  const [state, setState] = useState<HubState>("scattered");
  const touchedRef = useRef(false);
  const hubRef = useRef<HTMLDivElement>(null);
  const inView = useInView(hubRef, { once: true, amount: 0.5 });

  useEffect(() => {
    const controls = animate(progress, state === "unified" ? 1 : 0, {
      duration: reduceMotion ? 0 : 1.3,
      ease: [0.16, 1, 0.3, 1],
    });
    return () => controls.stop();
  }, [state, progress, reduceMotion]);

  useEffect(() => {
    if (!inView) return;
    const id = window.setTimeout(() => {
      if (!touchedRef.current) setState("unified");
    }, 1200);
    return () => window.clearTimeout(id);
  }, [inView]);

  const choose = (next: HubState) => {
    touchedRef.current = true;
    setState(next);
  };

  return (
    <section className="bg-white px-3 py-6 lg:px-6">
      <div className="mx-auto max-w-[1400px] overflow-hidden rounded-[40px] bg-[#FFF4EC] px-5 py-20 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-[760px] text-center">
          <FadeInView>
            <p className="font-secondary text-[13px] font-semibold uppercase tracking-widest text-clay">{PAIN_COPY.eyebrow}</p>
            <h2 className={`mt-4 text-[clamp(2rem,4.4vw,3.5rem)] ${BOLD_HEADING}`}>
              {PAIN_COPY.headlineLead} <span className={ACCENT_HIGHLIGHT}>{PAIN_COPY.headlineAccent}</span>
            </h2>
          </FadeInView>
          <FadeInView delay={0.1}>
            <p className="mx-auto mt-5 max-w-[60ch] text-[17px] leading-relaxed text-[#1d1a16]/70">{PAIN_COPY.body}</p>
          </FadeInView>
        </div>

        <FadeInView delay={0.15}>
          <div className="mt-10 flex justify-center">
            <div className="relative hidden rounded-pill bg-white p-1 shadow-[0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-black/5 md:flex" role="radiogroup" aria-label="Tool view">
              {(
                [
                  { id: "scattered", label: PAIN_COPY.scatteredLabel },
                  { id: "unified", label: PAIN_COPY.unifiedLabel },
                ] as const
              ).map((option) => {
                const selected = state === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => choose(option.id)}
                    className={`font-secondary h-11 rounded-pill px-6 text-[14px] font-semibold transition-colors duration-200 ${
                      selected ? "bg-[#1d1a16] text-white" : "text-[#1d1a16]/60 hover:text-[#1d1a16]"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </FadeInView>

        <div ref={hubRef} className="mx-auto mt-8 max-w-[1100px]">
          <ToolHub
            progress={progress}
            tone="light"
            scatteredLabel={PAIN_COPY.scatteredLabel}
            unifiedLabel={PAIN_COPY.unifiedLabel}
          />
        </div>

        <div className="mt-8 flex justify-center">
          <a href={BOOK_DEMO_HASH_HREF} className={DARK_PILL}>
            {PAIN_COPY.cta}
            <ArrowRight size={16} aria-hidden />
          </a>
        </div>
      </div>
    </section>
  );
}
