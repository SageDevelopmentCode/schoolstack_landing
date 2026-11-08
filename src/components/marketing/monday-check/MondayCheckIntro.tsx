import { ClipboardCheck } from "lucide-react";
import OpsCheckBreadcrumbs from "@/components/marketing/monday-check/OpsCheckBreadcrumbs";
import MondayCheckFaqAccordion from "@/components/marketing/monday-check/MondayCheckFaqAccordion";
import MarketingToolHero from "@/components/marketing/shared/MarketingToolHero";
import { ACCENT_HIGHLIGHT, DARK_PILL } from "@/components/home/bright-styles";
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
        eyebrow="Free assessment"
        title={
          <>
            Microschool Ops Check — know where your{" "}
            <span className={ACCENT_HIGHLIGHT}>ops stand.</span>
          </>
        }
        description="A quick operations snapshot for founders—admissions, enrollment, tuition, and parent communication. Ten questions, about three minutes, instant results."
        className="mt-2"
      />

      <div className="mb-5 overflow-hidden rounded-[24px] border border-black/8 bg-white shadow-[0_12px_40px_rgba(30,60,30,0.06)]">
        <div className="border-b border-black/8 bg-[#F4F1EC] px-6 py-6 sm:px-8">
          <p className="text-center font-secondary text-[14px] leading-relaxed text-[#1d1a16] sm:text-left">
            See where admissions, tuition, and parent comms are solid—and where they still cost you
            time.
          </p>
        </div>
        <div className="flex flex-col items-center px-6 py-6 sm:items-start sm:px-8">
          <button type="button" onClick={onStart} className={DARK_PILL}>
            <ClipboardCheck className="h-4 w-4 shrink-0" aria-hidden />
            Start the check
          </button>
          <p className="mt-3 text-center font-secondary text-[13px] text-[#1d1a16]/60 sm:text-left">
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
