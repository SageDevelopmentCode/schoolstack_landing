"use client";

import { useEffect, useState } from "react";
import type { GetStartedDemoStep } from "@/components/get-started/GetStartedDemoFlow";
import { GET_STARTED_DEMO_SECTION_ID } from "@/lib/marketing/book-demo";
import { scrollToGetStartedDemoSection } from "@/lib/marketing/book-demo-hash-context";

const COPY = {
  start: { title: "Pull up a chair!", subtitle: "Book a live walkthrough", cta: "Book a Demo" },
  inProgress: { title: "Almost there!", subtitle: "Finish booking your demo", cta: "Continue" },
} as const;

/**
 * Phone-only floating card on /get-started (replaces the "Questions?" button
 * below md). It scrolls back up to the booking flow and tucks itself away
 * while that flow is on screen, so it never covers the form.
 */
export default function GetStartedMobileBookBar({ step }: { step: GetStartedDemoStep }) {
  // The form is the first section, so the card starts tucked away.
  const [formInView, setFormInView] = useState(true);

  useEffect(() => {
    const section = document.getElementById(GET_STARTED_DEMO_SECTION_ID);
    if (!section) return;
    // Count the form as "in view" while it covers the middle half of the screen.
    const observer = new IntersectionObserver(
      ([entry]) => setFormInView(entry.isIntersecting),
      { rootMargin: "-25% 0px -25% 0px" },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const hidden = formInView;
  const copy = step > 0 ? COPY.inProgress : COPY.start;

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 bottom-0 z-[55] px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none md:hidden ${
        hidden ? "translate-y-[calc(100%+1rem)] opacity-0" : "translate-y-0 opacity-100"
      }`}
      aria-hidden={hidden || undefined}
      inert={hidden}
      data-get-started-book-bar
    >
      {/* Tighter below 360px so the copy still fits next to the button on small phones. */}
      <div className="pointer-events-auto mx-auto flex max-w-md items-center justify-between gap-2 rounded-[28px] bg-[var(--sf-forest)] py-3 pl-4 pr-2.5 shadow-[0_6px_0_0_var(--sf-forest-deep)] min-[360px]:gap-3 min-[360px]:pl-5 min-[360px]:pr-3">
        <div className="min-w-0">
          <p className="sf-display text-[16px] leading-tight text-white min-[360px]:text-[19px]">{copy.title}</p>
          <p className="text-[12px] font-semibold leading-snug text-[var(--sf-cream)]/80 min-[360px]:text-[13px]">{copy.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={scrollToGetStartedDemoSection}
          className="shrink-0 cursor-pointer whitespace-nowrap rounded-full bg-white px-3.5 py-2.5 text-[14px] font-extrabold min-[360px]:px-4 min-[360px]:text-[15px] text-[var(--sf-forest)] transition-transform duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50"
        >
          {copy.cta} <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}
