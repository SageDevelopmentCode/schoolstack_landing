import { ClipboardCheck } from "lucide-react";
import OpsCheckBreadcrumbs from "@/components/marketing/monday-check/OpsCheckBreadcrumbs";
import MondayCheckFaqAccordion from "@/components/marketing/monday-check/MondayCheckFaqAccordion";
import MarketingToolHero from "@/components/marketing/shared/MarketingToolHero";
import { toolBtnPrimary } from "@/components/marketing/shared/marketing-tool-garden";
import ParentTextLink from "@/components/school-parent/ui/ParentTextLink";
import { MONDAY_CHECK_INTRO_FAQS } from "@/lib/marketing/microschool-monday-check";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type MondayCheckIntroProps = {
  theme: ParentThemeTokens;
  onStart: () => void;
};

export default function MondayCheckIntro({ theme, onStart }: MondayCheckIntroProps) {
  return (
    <div>
      <OpsCheckBreadcrumbs theme={theme} />
      <MarketingToolHero
        lead="Microschool Ops Check — know where your"
        accent="ops stand."
        description="A quick operations snapshot for founders—admissions, enrollment, tuition, and parent communication. Ten questions, about three minutes, instant results."
        className="mb-10 mt-2"
      />

      <div className="mb-8 overflow-hidden rounded-[28px] border-2 border-[var(--sf-ink)] bg-white shadow-[0_8px_0_0_var(--sf-ink)]">
        <div className="border-b-2 border-dashed border-[var(--sf-ink)]/20 bg-[var(--sf-butter)]/45 px-6 py-6 sm:px-8">
          <p className="text-center text-[16px] font-semibold leading-relaxed text-[var(--sf-ink)] sm:text-left">
            See where admissions, tuition, and parent comms are solid—and where they still cost you
            time.
          </p>
        </div>
        <div className="flex flex-col items-center px-6 py-6 sm:items-start sm:px-8">
          <button type="button" onClick={onStart} className={toolBtnPrimary}>
            <ClipboardCheck className="h-4 w-4 shrink-0" aria-hidden />
            Start the check
          </button>
          <p className="mt-3 text-center text-sm font-semibold text-[var(--sf-soft)] sm:text-left">
            No email required.
          </p>
        </div>
      </div>

      <MondayCheckFaqAccordion theme={theme} faqs={MONDAY_CHECK_INTRO_FAQS} />

      <p className="mt-8">
        <ParentTextLink
          theme={theme}
          href="/get-started"
          className="!text-[12px] !font-semibold opacity-80"
        >
          Book a demo
        </ParentTextLink>
      </p>
    </div>
  );
}
