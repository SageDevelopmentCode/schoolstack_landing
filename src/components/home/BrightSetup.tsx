"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { FadeInView } from "@/components/ui/FadeInView";
import { BOOK_DEMO_HASH_HREF } from "@/lib/marketing/book-demo";
import {
  Step1TransitionVisual,
  Step2SetupProgress,
  Step3GoLivePreview,
} from "@/components/sections/WorkflowSection";
import RotateProgressBar from "./RotateProgressBar";
import { useAutoRotate } from "./useAutoRotate";
import { WORKFLOW_COPY } from "./home-copy";
import { ACCENT_HIGHLIGHT, BOLD_HEADING, DARK_PILL } from "./bright-styles";

const VISUALS = [Step1TransitionVisual, Step2SetupProgress, Step3GoLivePreview];

export default function BrightSetup() {
  const steps = WORKFLOW_COPY.steps;
  const { index, select, running, intervalMs } = useAutoRotate(steps.length, 8000);
  const Visual = VISUALS[index];

  return (
    <section id="setup" className="scroll-mt-20 bg-[#F7F5F2] py-24 lg:py-32">
      <div className="mx-auto max-w-[1240px] px-5 lg:px-10">
        <FadeInView>
          <div className="grid gap-6 lg:grid-cols-[1fr_420px] lg:items-end">
            <div>
              <p className="font-secondary text-[13px] font-semibold uppercase tracking-widest text-clay">{WORKFLOW_COPY.badge}</p>
              <h2 className={`mt-4 text-[clamp(2rem,4.4vw,3.5rem)] ${BOLD_HEADING}`}>
                {WORKFLOW_COPY.headlineLead} <span className={ACCENT_HIGHLIGHT}>{WORKFLOW_COPY.headlineAccent}</span>
              </h2>
            </div>
            <p className="text-[17px] leading-relaxed text-[#1d1a16]/70">{WORKFLOW_COPY.body}</p>
          </div>
        </FadeInView>

        <FadeInView delay={0.1}>
          <div className="mt-12 grid gap-3 md:grid-cols-3" role="tablist" aria-label="Setup steps">
            {steps.map((step, i) => {
              const isActive = i === index;
              return (
                <button
                  key={step.number}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => select(i)}
                  className={`flex flex-col gap-4 rounded-[24px] p-6 text-left transition-all duration-300 ${
                    isActive ? "bg-white shadow-[0_18px_44px_rgba(0,0,0,0.08)]" : "bg-transparent ring-1 ring-black/10 hover:bg-white/60"
                  }`}
                >
                  <span
                    className={`font-secondary flex h-10 w-10 items-center justify-center rounded-full text-[14px] font-bold ${
                      isActive ? "bg-clay text-white" : "bg-black/5 text-[#1d1a16]/60"
                    }`}
                  >
                    {step.number}
                  </span>
                  <span className="font-secondary text-[18px] font-bold leading-snug tracking-[-0.02em] text-[#1d1a16]">
                    {step.title}
                  </span>
                  <span className="font-secondary text-[14px] leading-relaxed text-[#1d1a16]/65">{step.body}</span>
                  <span className="mt-auto block text-clay">
                    {isActive ? (
                      <RotateProgressBar cycleKey={index} running={running} durationMs={intervalMs} color="var(--color-clay)" />
                    ) : (
                      <span className="block h-[3px] w-full rounded-full bg-black/[0.06]" />
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 overflow-hidden rounded-[32px] bg-dark-panel">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.99 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="flex min-h-[320px] items-center justify-center lg:min-h-[420px]"
              >
                <Visual />
              </motion.div>
            </AnimatePresence>
          </div>
        </FadeInView>

        <div className="mt-10 flex flex-col items-center justify-between gap-5 sm:flex-row">
          <p className="font-secondary max-w-[480px] text-center text-[15px] text-[#1d1a16]/65 sm:text-left">
            {WORKFLOW_COPY.reassurance}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-5 whitespace-nowrap">
            <a href={BOOK_DEMO_HASH_HREF} className={DARK_PILL}>
              {WORKFLOW_COPY.primaryCta}
              <ArrowRight size={16} aria-hidden />
            </a>
            <a
              href={WORKFLOW_COPY.secondaryHref}
              className="font-secondary inline-flex items-center gap-1.5 text-[15px] font-semibold text-[#1d1a16]/70 hover:text-[#1d1a16]"
            >
              {WORKFLOW_COPY.secondaryCta}
              <ArrowRight size={14} aria-hidden />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
