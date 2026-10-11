"use client";

import { useRef, useState } from "react";
import GetStartedDemoFlow, {
  type GetStartedDemoStep,
} from "@/components/get-started/GetStartedDemoFlow";
import { BOOK_DEMO_SECTION_ID } from "@/lib/marketing/book-demo";

export default function HomeBookDemoSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [step, setStep] = useState<GetStartedDemoStep>(0);

  const wide = step === 1;

  return (
    <section
      ref={sectionRef}
      id={BOOK_DEMO_SECTION_ID}
      className="scroll-mt-28 border-t border-border bg-bg py-20 sm:py-28 px-4 sm:px-6 font-secondary text-text"
    >
      <div
        className={`${wide ? "max-w-[760px]" : "max-w-[600px]"} mx-auto transition-[max-width] duration-300`}
      >
        <GetStartedDemoFlow
          scrollOnStepChange="section"
          sectionRef={sectionRef}
          onStepChange={setStep}
          showStepProgress={false}
        />
      </div>
    </section>
  );
}
