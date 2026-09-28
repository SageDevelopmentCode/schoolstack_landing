import ParentCard from "@/components/school-parent/ui/ParentCard";
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
    <section aria-labelledby="monday-check-faq-heading" className="mt-10">
      <ParentSectionKicker theme={theme}>Common questions</ParentSectionKicker>
      <h2
        id="monday-check-faq-heading"
        className="sr-only"
      >
        Common questions
      </h2>
      <div className="mt-4 flex flex-col gap-3">
        {faqs.map((faq) => (
          <ParentCard key={faq.question} theme={theme} className="!p-0">
            <details className="group">
              <summary
                className="cursor-pointer list-none px-5 py-4 [&::-webkit-details-marker]:hidden"
                style={{ fontFamily: theme.fontBody }}
              >
                <span className="flex items-start justify-between gap-4">
                  <span
                    className="text-[15px] font-semibold leading-snug"
                    style={{ color: theme.ink }}
                  >
                    {faq.question}
                  </span>
                  <span
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-lg leading-none transition-transform duration-200 group-open:rotate-45"
                    style={{ color: theme.muted }}
                  >
                    +
                  </span>
                </span>
              </summary>
              <p
                className="px-5 pb-5 pt-0 text-[14px] leading-relaxed pr-10"
                style={{ color: theme.muted, fontFamily: theme.fontBody }}
              >
                {faq.answer}
              </p>
            </details>
          </ParentCard>
        ))}
      </div>
    </section>
  );
}
