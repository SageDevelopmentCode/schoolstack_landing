"use client";

import { useRef, useState } from "react";
import GetStartedDemoFlow, {
  type GetStartedDemoStep,
} from "@/components/get-started/GetStartedDemoFlow";
import { BOOK_DEMO_SECTION_ID } from "@/lib/marketing/book-demo";
import { MUDKITCHEN_MARKETING_BRIGHT_THEME } from "@/lib/marketing/mudkitchen-bright-marketing-theme";

export default function HomeBookDemoSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [step, setStep] = useState<GetStartedDemoStep>(0);

  const maxWidthClass =
    step === 1 ? "max-w-[1020px]" : step === 0 ? "max-w-[760px]" : "max-w-[600px]";

  return (
    <section
      ref={sectionRef}
      id={BOOK_DEMO_SECTION_ID}
      className="scroll-mt-28 bg-white px-3 py-16 sm:py-20 lg:px-6 lg:py-24"
    >
      <div
        className={`${maxWidthClass} mx-auto transition-[max-width] duration-300`}
      >
        <GetStartedDemoFlow
          scrollOnStepChange="section"
          sectionRef={sectionRef}
          onStepChange={setStep}
          showStepProgress={false}
          theme={MUDKITCHEN_MARKETING_BRIGHT_THEME}
        />
      </div>
    </section>
  );
}
