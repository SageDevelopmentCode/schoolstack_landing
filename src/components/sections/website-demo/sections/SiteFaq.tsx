import { ArrowRight, Plus } from "lucide-react";
import type { SchoolWebsiteDemoConfig } from "@/data/school-demos/types";
import DemoWebsiteButton from "../DemoWebsiteButton";
import { DEMO_BODY, DEMO_CONTAINER } from "../bright-demo-theme";
import SiteSectionHeader from "./SiteSectionHeader";

type Props = {
  faq: SchoolWebsiteDemoConfig["faq"];
  ctaLabel: string;
  onCtaClick: () => void;
};

/** Two columns: sticky heading on the left, native `details` accordion on the right. */
export default function SiteFaq({ faq, ctaLabel, onCtaClick }: Props) {
  return (
    <section id="faq" className="scroll-mt-[88px] bg-white py-20 @3xl/site:py-28">
      <div className={`${DEMO_CONTAINER} grid gap-12 @5xl/site:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] @5xl/site:gap-16`}>
        <div className="@5xl/site:sticky @5xl/site:top-28 @5xl/site:self-start">
          <SiteSectionHeader eyebrow={faq.eyebrow} heading={faq.heading} subtitle={faq.subtitle} />
          <div className="mt-8 rounded-[28px] bg-[var(--demo-tint-3)] p-6">
            <p className="font-secondary text-[16px] font-bold text-[var(--demo-ink)]">Still have questions?</p>
            <p className={`${DEMO_BODY} mt-1 text-[14px]`}>We are happy to talk it through with your family.</p>
            <DemoWebsiteButton variant="primary" className="mt-5 h-11!" onClick={onCtaClick}>
              {ctaLabel}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </DemoWebsiteButton>
          </div>
        </div>

        <div className="space-y-3">
          {faq.items.map((item, i) => (
            <details
              key={item.q}
              open={i === 0}
              className="group rounded-[24px] bg-[var(--demo-tint-3)] px-6 transition-colors duration-200 open:bg-white open:shadow-[var(--demo-shadow-card)] open:ring-1 open:ring-black/[0.06]"
            >
              <summary className="font-secondary flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-[16px] font-semibold text-[var(--demo-ink)] @3xl/site:text-[17px] [&::-webkit-details-marker]:hidden">
                {item.q}
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[var(--demo-ink)] ring-1 ring-black/[0.08] transition-transform duration-300 group-open:rotate-45 group-open:bg-[var(--demo-ink)] group-open:text-white"
                  aria-hidden
                >
                  <Plus className="h-4 w-4" />
                </span>
              </summary>
              <p className={`${DEMO_BODY} pb-6 pr-12`}>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
