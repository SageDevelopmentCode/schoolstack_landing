import { ChevronDown } from "lucide-react";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

export type MondayCheckFaqItem = {
  question: string;
  answer: string;
};

type MondayCheckFaqAccordionProps = {
  theme: ParentThemeTokens;
  faqs: MondayCheckFaqItem[];
};

export default function MondayCheckFaqAccordion({
  theme,
  faqs,
}: MondayCheckFaqAccordionProps) {
  return (
    <section aria-labelledby="ops-check-faq-heading" className="mt-10">
      <ParentSectionKicker theme={theme}>Common questions</ParentSectionKicker>
      <h2 id="ops-check-faq-heading" className="sr-only">Common questions</h2>
      <div
        className="mt-4 overflow-hidden rounded-[20px] border shadow-sm"
        style={{
          borderColor: "#E0E7E0",
          backgroundColor: theme.white,
          boxShadow: theme.shadowCard,
        }}
      >
        {faqs.map((faq) => (
          <details
            key={faq.question}
            className="group border-b last:border-b-0"
            style={{ borderColor: "#E9EFEA" }}
          >
            <summary
              className="flex cursor-pointer list-none items-center gap-3.5 px-5 py-4 [&::-webkit-details-marker]:hidden"
              style={{ fontFamily: theme.fontBody }}
            >
              <div className="min-w-0 flex-1">
                <strong className="text-[12px] font-semibold leading-snug" style={{ color: theme.ink }}>
                  {faq.question}
                </strong>
              </div>
              <ChevronDown
                className="h-3.5 w-3.5 shrink-0 transition-transform group-open:rotate-180"
                style={{ color: theme.muted }}
                aria-hidden
              />
            </summary>
            <p
              className="px-5 pb-5 text-[12px] leading-[1.8]"
              style={{ color: theme.muted, fontFamily: theme.fontBody }}
            >
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
