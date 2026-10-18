import { ChevronDown } from "lucide-react";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";
import { FREE_TOOLS_HUB_FAQS } from "@/lib/marketing/free-tools-hub-content";
import { FREE_TOOLS_HUB_THEME } from "@/components/marketing/free-tools/free-tools-hub-theme";

const theme = FREE_TOOLS_HUB_THEME;

export default function FreeToolsFaqSection() {
  return (
    <section
      className="mt-8 grid gap-6 border-t pt-7 lg:grid-cols-[280px_1fr] lg:gap-9 lg:pt-[29px]"
      style={{ borderColor: theme.line }}
      aria-labelledby="free-tools-faq-heading"
    >
      <div className="faq-intro">
        <ParentSectionKicker theme={theme}>Before you start</ParentSectionKicker>
        <h2
          id="free-tools-faq-heading"
          className="mt-2 font-heading text-[25px] font-medium tracking-[-0.035em]"
          style={{ fontFamily: theme.fontDisplay, color: theme.ink }}
        >
          A few useful details.
        </h2>
        <p
          className="mt-2.5 max-w-[230px] text-xs leading-[1.8] lg:max-w-[230px]"
          style={{ color: theme.muted, fontFamily: theme.fontBody }}
        >
          Simple tools for thinking things through—not another system to set up.
        </p>
      </div>
      <div className="border-t" style={{ borderColor: theme.line }}>
        {FREE_TOOLS_HUB_FAQS.map((faq) => (
          <details
            key={faq.question}
            className="group border-b"
            style={{ borderColor: theme.line }}
          >
            <summary
              className="flex cursor-pointer list-none items-center justify-between gap-5 py-4 [&::-webkit-details-marker]:hidden"
              style={{ fontFamily: theme.fontBody }}
            >
              <span className="text-xs font-semibold" style={{ color: theme.ink }}>
                {faq.question}
              </span>
              <ChevronDown
                className="h-3.5 w-3.5 shrink-0 transition-transform group-open:rotate-180"
                style={{ color: theme.muted }}
                aria-hidden
              />
            </summary>
            <p
              className="pb-4 pr-6 text-xs leading-[1.85]"
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
