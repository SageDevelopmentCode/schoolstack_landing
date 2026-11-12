"use client";

import { useRef, useState } from "react";
import GetStartedDemoFlow, { type GetStartedDemoStep } from "@/components/get-started/GetStartedDemoFlow";
import { BOOK_DEMO_SECTION_ID } from "@/lib/marketing/book-demo";
import { MUDKITCHEN_MARKETING_GARDEN_THEME } from "@/lib/marketing/mudkitchen-garden-marketing-theme";
import { Arrow, Draw, Leaf, Tape } from "@/components/garden/ui";

/**
 * The real book-a-demo flow (same component as the live home page), pinned to
 * the wall on notebook paper. Keeps id="book-demo" so every CTA lands here.
 */
export default function GardenBookDemo({ className = "bg-[var(--sf-mint)]/50" }: { className?: string }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [step, setStep] = useState<GetStartedDemoStep>(0);
  const maxWidthClass = step === 1 ? "max-w-[1020px]" : step === 0 ? "max-w-[780px]" : "max-w-[620px]";

  return (
    <section ref={sectionRef} id={BOOK_DEMO_SECTION_ID} className={`relative scroll-mt-24 px-3 py-20 sm:py-24 lg:px-6 lg:py-28 ${className}`}>
      <Draw className="absolute left-[8%] top-20 hidden w-16 lg:block">
        <Leaf />
      </Draw>
      <div className="pointer-events-none absolute right-[10%] top-14 hidden -rotate-6 text-right lg:block" aria-hidden="true">
        <p className="sf-hand text-2xl text-[var(--sf-forest)]">pull up a chair!</p>
        <Draw className="ml-auto mt-1 block w-24 -scale-x-100">
          <Arrow />
        </Draw>
      </div>
      <div className={`${maxWidthClass} relative mx-auto transition-[max-width] duration-300`}>
        <div className="sf-paper relative rounded-[32px] border-2 border-[var(--sf-ink)] p-3 shadow-[0_10px_0_0_var(--sf-ink)] sm:p-6 lg:p-8">
          <Tape color="var(--sf-peach)" className="-top-3 left-10 w-24 -rotate-6" />
          <Tape color="var(--sf-butter)" className="-top-3 right-10 w-24 rotate-6" />
          <GetStartedDemoFlow
            scrollOnStepChange="section"
            sectionRef={sectionRef}
            onStepChange={setStep}
            showStepProgress={false}
            theme={MUDKITCHEN_MARKETING_GARDEN_THEME}
          />
        </div>
      </div>
    </section>
  );
}
