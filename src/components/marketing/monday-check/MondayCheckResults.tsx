import MondayCheckMudKitchenCallout, {
  mudkitchenBody,
} from "@/components/marketing/monday-check/MondayCheckMudKitchenCallout";
import ParentButtonLink from "@/components/school-parent/ui/ParentButtonLink";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import ParentChip from "@/components/school-parent/ui/ParentChip";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";
import ParentTextLink from "@/components/school-parent/ui/ParentTextLink";
import { type computeMondayCheckResults } from "@/lib/marketing/microschool-monday-check";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type MondayCheckResultsProps = {
  theme: ParentThemeTokens;
  results: ReturnType<typeof computeMondayCheckResults>;
  onRetake: () => void;
};

export default function MondayCheckResults({
  theme,
  results,
  onRetake,
}: MondayCheckResultsProps) {
  const { tier, topPillars, personalizedInsights, growthSpotlight, totalScore, maxScore } =
    results;

  return (
    <div className="flex flex-col gap-7 pb-8">
      <header>
        <ParentSectionKicker theme={theme}>Your Monday Check</ParentSectionKicker>
        <ParentDisplayHeading theme={theme} as="h1" size="display" className="mb-3">
          {tier.title}
        </ParentDisplayHeading>
        <p
          className="text-[15px] leading-relaxed"
          style={{ color: theme.muted, fontFamily: theme.fontBody }}
        >
          {tier.summary}
        </p>
        <div className="mt-4">
          <ParentChip theme={theme} tone="info">
            Score {totalScore}/{maxScore}
          </ParentChip>
        </div>
      </header>

      <ParentCard theme={theme}>
        <MondayCheckMudKitchenCallout theme={theme}>
          {mudkitchenBody(tier.mudkitchenPitch)}
        </MondayCheckMudKitchenCallout>
        <div className="mt-5 flex flex-col sm:flex-row gap-3 sm:items-center">
          <ParentButtonLink theme={theme} href="/get-started">
            Book a demo
          </ParentButtonLink>
          <button
            type="button"
            onClick={onRetake}
            className="text-[14px] font-semibold transition-colors px-2 py-2 text-left"
            style={{ color: theme.muted, fontFamily: theme.fontBody }}
          >
            Retake
          </button>
        </div>
      </ParentCard>

      {topPillars.length > 0 && (
        <section aria-labelledby="top-priorities-heading">
          <ParentDisplayHeading theme={theme} as="h2" size="section" className="mb-4">
            Top priorities
          </ParentDisplayHeading>
          <ul className="flex flex-col gap-2">
            {topPillars.map((entry, index) => (
              <li key={entry.pillar}>
                <ParentCard theme={theme} className="!py-4 flex items-center gap-3">
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] font-bold"
                    style={{
                      backgroundColor: theme.primaryLight,
                      color: theme.primaryDark,
                      fontFamily: theme.fontBody,
                    }}
                  >
                    {index + 1}
                  </span>
                  <span
                    className="text-[14px] font-semibold"
                    style={{ color: theme.ink, fontFamily: theme.fontBody }}
                  >
                    {entry.label}
                  </span>
                </ParentCard>
              </li>
            ))}
          </ul>
        </section>
      )}

      {growthSpotlight && (
        <ParentCard theme={theme} variant="announcement">
          <ParentSectionKicker theme={theme}>If you grew by 10 students</ParentSectionKicker>
          <p
            className="text-[15px] font-semibold -mt-1"
            style={{ color: theme.ink, fontFamily: theme.fontBody }}
          >
            {growthSpotlight.label} would feel the strain first.
          </p>
        </ParentCard>
      )}

      <section aria-labelledby="your-answers-heading">
        <ParentDisplayHeading
          theme={theme}
          as="h2"
          size="section"
          id="your-answers-heading"
          className="mb-4"
        >
          Your answers
        </ParentDisplayHeading>
        <div className="flex flex-col gap-3">
          {personalizedInsights.map((item) => (
            <ParentCard key={item.questionId} theme={theme}>
              <ParentSectionKicker theme={theme}>{item.pillarLabel}</ParentSectionKicker>
              <p
                className="text-[14px] font-semibold -mt-1 mb-2"
                style={{ color: theme.ink, fontFamily: theme.fontBody }}
              >
                {item.prompt}
              </p>
              <p
                className="text-[13px] italic mb-3"
                style={{ color: theme.muted, fontFamily: theme.fontBody }}
              >
                {item.option.label}
              </p>
              <p
                className="text-[14px] leading-relaxed mb-3"
                style={{ color: theme.ink, fontFamily: theme.fontBody }}
              >
                {item.option.insight}
              </p>
              <div
                className="rounded-xl px-4 py-3 mb-3"
                style={{ backgroundColor: theme.cream }}
              >
                <p
                  className="text-[11px] font-bold uppercase tracking-[0.08em] mb-1"
                  style={{ color: theme.primaryDark, fontFamily: theme.fontBody }}
                >
                  Try this week
                </p>
                <p
                  className="text-[14px] leading-relaxed"
                  style={{ color: theme.ink, fontFamily: theme.fontBody }}
                >
                  {item.option.action}
                </p>
              </div>
              <MondayCheckMudKitchenCallout theme={theme}>
                {mudkitchenBody(item.option.mudkitchen)}
              </MondayCheckMudKitchenCallout>
              <p className="mt-3">
                <ParentTextLink theme={theme} href={item.option.featureHref}>
                  Learn more
                </ParentTextLink>
              </p>
            </ParentCard>
          ))}
        </div>
      </section>

      <ParentCard theme={theme} className="sticky bottom-4 z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 !py-4">
        <p
          className="text-[14px] font-semibold"
          style={{ color: theme.ink, fontFamily: theme.fontBody }}
        >
          Simplify your school week
        </p>
        <ParentButtonLink theme={theme} href="/get-started" className="shrink-0">
          Book a demo
        </ParentButtonLink>
      </ParentCard>
    </div>
  );
}
