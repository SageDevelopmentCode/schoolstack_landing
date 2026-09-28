"use client";

import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";

type PublicTourStoryHeaderProps = {
  headline: string;
  intro: string;
};

export default function PublicTourStoryHeader({
  headline,
  intro,
}: PublicTourStoryHeaderProps) {
  const { theme } = useParentTheme();

  return (
    <header className="mb-6 text-center sm:mb-8">
      <ParentSectionKicker theme={theme} className="text-center">
        Campus visit
      </ParentSectionKicker>
      <ParentDisplayHeading
        theme={theme}
        as="h1"
        size="display"
        className="mt-2 !text-[clamp(1.75rem,4vw,2.35rem)]"
      >
        {headline}
      </ParentDisplayHeading>
      <p
        className="mx-auto mt-3 max-w-[540px] text-[14px] leading-relaxed sm:text-[15px]"
        style={{ color: theme.muted }}
      >
        {intro}
      </p>
    </header>
  );
}
