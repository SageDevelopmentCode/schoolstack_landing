import { Info } from "lucide-react";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type GetStartedInfoCalloutProps = {
  theme: ParentThemeTokens;
  children: React.ReactNode;
};

export default function GetStartedInfoCallout({
  theme,
  children,
}: GetStartedInfoCalloutProps) {
  return (
    <ParentCard theme={theme} variant="announcement" className="!p-4 mb-6">
      <div className="flex items-start gap-3">
        <Info
          className="h-4 w-4 shrink-0 mt-0.5"
          style={{ color: theme.info }}
          aria-hidden
        />
        <p
          className="text-[13px] leading-snug"
          style={{ color: theme.info, fontFamily: theme.fontBody }}
        >
          {children}
        </p>
      </div>
    </ParentCard>
  );
}
