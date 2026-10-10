"use client";

import GetStartedShowcaseDemoViewport from "@/components/get-started/GetStartedShowcaseDemoViewport";
import GetStartedShowcaseSlideDemo from "@/components/get-started/GetStartedShowcaseSlideDemo";
import type { GetStartedShowcaseSlideConfig } from "@/lib/marketing/get-started-showcase-slides";
import { MUDKITCHEN_MARKETING_STORY_THEME } from "@/lib/marketing/mudkitchen-story-theme";

const showcaseStoryTheme = MUDKITCHEN_MARKETING_STORY_THEME;

type GetStartedShowcaseSlideProps = {
  slide: GetStartedShowcaseSlideConfig;
  ariaHidden?: boolean;
};

function showcaseBadgeLabel(caption: string): string {
  const lower = caption.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function showcaseBadgeStyle(accent: string): {
  backgroundColor: string;
  color: string;
} {
  return {
    backgroundColor: accent,
    color: "#ffffff",
  };
}

export default function GetStartedShowcaseSlide({
  slide,
  ariaHidden = false,
}: GetStartedShowcaseSlideProps) {
  const Icon = slide.icon;
  const badgeStyle = showcaseBadgeStyle(slide.accent);

  return (
    <article
      aria-hidden={ariaHidden}
      className="flex h-[500px] min-w-[340px] max-w-[340px] shrink-0 flex-col overflow-hidden rounded-md border border-border bg-surface shadow-sm sm:h-[520px] sm:min-w-[400px] sm:max-w-[400px]"
    >
      <div
        className="h-1 w-full shrink-0"
        style={{ backgroundColor: slide.accent }}
        aria-hidden
      />
      <div className="flex min-h-[88px] shrink-0 flex-col justify-center gap-2 p-4 pb-2 sm:min-h-[92px]">
        <h3
          className="text-lg leading-tight text-text line-clamp-2"
          style={{ fontFamily: showcaseStoryTheme.fontDisplay }}
        >
          {slide.label}
        </h3>
        <p
          className="text-[13px] leading-snug text-text-muted line-clamp-3"
          style={{ fontFamily: showcaseStoryTheme.fontBody }}
        >
          {slide.description}
        </p>
      </div>
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden border-t border-border">
        <GetStartedShowcaseDemoViewport
          fillHeight
          contentHeight={slide.demo.contentHeight}
          crop={slide.demo.crop}
        >
          <GetStartedShowcaseSlideDemo demo={slide.demo} />
        </GetStartedShowcaseDemoViewport>
        <span
          className="pointer-events-none absolute bottom-3 right-3 z-20 flex max-w-[90%] items-center gap-1.5 rounded-pill px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm"
          style={badgeStyle}
          aria-hidden
        >
          <Icon
            size={12}
            strokeWidth={2.5}
            className="shrink-0"
            style={{ color: badgeStyle.color }}
            aria-hidden
          />
          <span
            className="truncate"
            style={{ fontFamily: showcaseStoryTheme.fontBody }}
          >
            {showcaseBadgeLabel(slide.caption)}
          </span>
        </span>
      </div>
    </article>
  );
}
