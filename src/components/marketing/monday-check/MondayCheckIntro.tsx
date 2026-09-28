import { ClipboardCheck } from "lucide-react";
import ParentButton from "@/components/school-parent/ui/ParentButton";
import ParentCard from "@/components/school-parent/ui/ParentCard";
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
      <ParentSectionKicker theme={theme}>Free assessment</ParentSectionKicker>
      <ParentDisplayHeading theme={theme} as="h1" size="display" className="mb-3">
        The Microschool Monday Check
      </ParentDisplayHeading>
      <p
        className="text-[15px] leading-relaxed mb-6"
        style={{ color: theme.muted, fontFamily: theme.fontBody }}
      >
        10 questions · ~3 minutes · instant results.
      </p>

      <ParentCard
        theme={theme}
        variant="today"
        className="mb-5"
        style={{ borderColor: theme.primarySoft }}
      >
        <p
          className="text-[14px] leading-relaxed mb-4 text-center sm:text-left"
          style={{ color: theme.ink, fontFamily: theme.fontBody }}
        >
          See where admissions, tuition, and parent comms are solid—and where they
          cost you time.
        </p>
        <div className="flex justify-center">
          <ParentButton
            theme={theme}
            type="button"
            onClick={onStart}
            className="inline-flex w-fit max-w-full items-center justify-center gap-2 px-6 py-3.5 text-[15px]"
            style={{ boxShadow: theme.shadowCard }}
          >
            <ClipboardCheck className="h-4 w-4 shrink-0" aria-hidden />
            Start the check
          </ParentButton>
        </div>
        <p
          className="mt-3 text-center text-[13px]"
          style={{ color: theme.muted, fontFamily: theme.fontBody }}
        >
          No email required.
        </p>
      </ParentCard>

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
