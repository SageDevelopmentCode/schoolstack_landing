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
    <div className="mb-6 md:mb-8">
      <div
        className="flex gap-1"
        role="progressbar"
        aria-valuenow={currentIndex + 1}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={`Question ${currentIndex + 1} of ${total}`}
      >
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className="h-[5px] flex-1 rounded-[4px] transition-colors duration-300"
            style={{
              backgroundColor: i <= currentIndex ? theme.primary : "#E4E8E1",
            }}
            aria-current={i === currentIndex ? "step" : undefined}
          />
        ))}
      </div>
      <ParentSectionKicker theme={theme} className="mt-5 mb-0 text-center sm:text-left">
        Question {currentIndex + 1} of {total}
      </ParentSectionKicker>
    </div>
  );
}
