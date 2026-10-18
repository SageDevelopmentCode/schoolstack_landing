import { ClipboardCheck } from "lucide-react";
import OpsCheckBreadcrumbs from "@/components/marketing/monday-check/OpsCheckBreadcrumbs";
import ParentButton from "@/components/school-parent/ui/ParentButton";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";
import ParentTextLink from "@/components/school-parent/ui/ParentTextLink";
import MondayCheckFaqAccordion from "@/components/marketing/monday-check/MondayCheckFaqAccordion";
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
      <ParentSectionKicker theme={theme}>Free assessment</ParentSectionKicker>
      <ParentDisplayHeading theme={theme} as="h1" size="display" className="mb-3 mt-2">
        Microschool Ops Check
      </ParentDisplayHeading>
      <p
        className="mb-6 max-w-[560px] text-[14px] leading-[1.8]"
        style={{ color: theme.muted, fontFamily: theme.fontBody }}
      >
        A quick operations snapshot for founders—admissions, enrollment, tuition, and parent
        communication. Ten questions, about three minutes, instant results.
      </p>

      <div
        className="mb-5 overflow-hidden rounded-[22px] border shadow-sm"
        style={{
          borderColor: "#E0E7E0",
          backgroundColor: theme.white,
          boxShadow: theme.shadowCard,
        }}
      >
        <div
          className="border-b px-6 py-6 sm:px-8"
          style={{ borderColor: theme.line, backgroundColor: theme.cream }}
        >
          <p
            className="text-center text-[14px] leading-[1.8] sm:text-left"
            style={{ color: theme.ink, fontFamily: theme.fontBody }}
          >
            See where admissions, tuition, and parent comms are solid—and where they still cost you
            time.
          </p>
        </div>
        <div className="flex flex-col items-center px-6 py-6 sm:items-start sm:px-8">
          <ParentButton
            theme={theme}
            type="button"
            onClick={onStart}
            className="inline-flex w-full max-w-full items-center justify-center gap-2 px-6 py-3.5 text-[15px] sm:w-auto"
            style={{ boxShadow: theme.shadowCard }}
          >
            <ClipboardCheck className="h-4 w-4 shrink-0" aria-hidden />
            Start the check
          </ParentButton>
          <p
            className="mt-3 text-center text-[13px] sm:text-left"
            style={{ color: theme.muted, fontFamily: theme.fontBody }}
          >
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
