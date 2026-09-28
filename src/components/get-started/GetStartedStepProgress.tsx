import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type GetStartedStepProgressProps = {
  theme: ParentThemeTokens;
  step: 0 | 1;
};

export default function GetStartedStepProgress({
  theme,
  step,
}: GetStartedStepProgressProps) {
  return (
    <div className="flex flex-col items-center mb-6 md:mb-10 gap-3">
      <div
        className="text-[11px] font-bold uppercase tracking-[0.12em]"
        style={{ color: theme.muted, fontFamily: theme.fontBody }}
      >
        Step {step + 1} of 2
      </div>
      <div className="flex items-center gap-2">
        {[0, 1].map((i) => (
          <div
            key={i}
            style={{
              transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)",
              backgroundColor:
                i === step
                  ? theme.primary
                  : i < step
                    ? theme.primaryLight
                    : theme.line,
              width: i === step ? 24 : 8,
              height: 8,
              borderRadius: 9999,
            }}
          />
        ))}
      </div>
    </div>
  );
}
