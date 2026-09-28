import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type MondayCheckProgressProps = {
  theme: ParentThemeTokens;
  currentIndex: number;
  total: number;
};

export default function MondayCheckProgress({
  theme,
  currentIndex,
  total,
}: MondayCheckProgressProps) {
  return (
    <div className="flex flex-col items-center mb-6 md:mb-10 gap-3">
      <ParentSectionKicker theme={theme} className="mb-0">
        Question {currentIndex + 1} of {total}
      </ParentSectionKicker>
      <div
        className="flex items-center gap-1.5 flex-wrap justify-center max-w-full"
        role="progressbar"
        aria-valuenow={currentIndex + 1}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={`Question ${currentIndex + 1} of ${total}`}
      >
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            aria-current={i === currentIndex ? "step" : undefined}
            style={{
              transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)",
              backgroundColor:
                i === currentIndex
                  ? theme.primary
                  : i < currentIndex
                    ? theme.sage
                    : theme.line,
              width: i === currentIndex ? 20 : 8,
              height: 8,
              borderRadius: 9999,
            }}
          />
        ))}
      </div>
    </div>
  );
}
