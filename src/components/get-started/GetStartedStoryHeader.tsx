import type { ReactNode } from "react";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type GetStartedStoryHeaderProps = {
  theme: ParentThemeTokens;
  kicker?: string;
  title: ReactNode;
  subtitle: string;
  className?: string;
  headingAs?: "h1" | "h2";
  titleId?: string;
};

export default function GetStartedStoryHeader({
  theme,
  kicker = "Book a demo",
  title,
  subtitle,
  className = "mb-8",
  headingAs = "h1",
  titleId,
}: GetStartedStoryHeaderProps) {
  return (
    <div className={className}>
      <p
        className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-text-faint"
        style={{ fontFamily: theme.fontBody }}
      >
        {kicker}
      </p>
      <ParentDisplayHeading
        theme={theme}
        as={headingAs}
        id={titleId}
        className="font-display"
      >
        {title}
      </ParentDisplayHeading>
      <p
        className="mt-3 text-[15px] leading-relaxed text-text-muted"
        style={{ fontFamily: theme.fontBody }}
      >
        {subtitle}
      </p>
    </div>
  );
}
