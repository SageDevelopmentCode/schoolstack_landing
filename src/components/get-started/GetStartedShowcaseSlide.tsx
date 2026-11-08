"use client";

import GetStartedShowcaseDemoViewport from "@/components/get-started/GetStartedShowcaseDemoViewport";
import GetStartedShowcaseSlideDemo from "@/components/get-started/GetStartedShowcaseSlideDemo";
import {
  getShowcaseSlideGroup,
  type GetStartedShowcaseSlideConfig,
} from "@/lib/marketing/get-started-showcase-slides";
import { PRODUCT_PREVIEW_GROUP_META } from "@/lib/marketing/product-preview-tabs";
import { GROUP_TINTS } from "@/components/home/bright-styles";

type GetStartedShowcaseSlideProps = {
  slide: GetStartedShowcaseSlideConfig;
  ariaHidden?: boolean;
  mountDemo?: boolean;
};

function showcaseBadgeLabel(caption: string): string {
  const lower = caption.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

export default function GetStartedShowcaseSlide({
  slide,
  ariaHidden = false,
  mountDemo = false,
}: GetStartedShowcaseSlideProps) {
  const Icon = slide.icon;
  const group = getShowcaseSlideGroup(slide);
  const wellColor = GROUP_TINTS[group];
  const groupLabel =
    PRODUCT_PREVIEW_GROUP_META.find((g) => g.id === group)?.label ?? "Product";

  return (
    <article
      aria-hidden={ariaHidden}
      className="flex h-auto min-w-[340px] max-w-[340px] shrink-0 flex-col overflow-hidden rounded-[24px] border border-black/8 bg-white shadow-[0_12px_40px_rgba(30,60,30,0.06)] sm:min-w-[400px] sm:max-w-[400px]"
    >
      <div
        className="h-[3px] w-full shrink-0"
        style={{ backgroundColor: slide.accent }}
        aria-hidden
      />
      <div className="flex min-h-[96px] shrink-0 flex-col justify-center gap-2 p-4 pb-2">
        <span className="flex items-center gap-1.5 font-secondary text-[10px] font-semibold uppercase tracking-wider text-[#1d1a16]/50">
          <span
            className="flex h-5 w-5 items-center justify-center rounded-md text-white"
            style={{ backgroundColor: slide.accent }}
            aria-hidden
          >
            <Icon size={11} strokeWidth={2.5} />
          </span>
          {groupLabel}
        </span>
        <h3 className="line-clamp-2 font-secondary text-lg font-bold leading-tight text-[#1d1a16]">
          {slide.label}
        </h3>
        <p className="line-clamp-3 font-secondary text-[13px] leading-snug text-[#1d1a16]/65">
          {slide.description}
        </p>
      </div>
      <div className="relative shrink-0 overflow-hidden border-t border-black/8 p-2 pt-0">
        <div className="overflow-hidden rounded-[16px] border border-black/6">
          <GetStartedShowcaseDemoViewport
            contentHeight={slide.demo.contentHeight}
            crop={slide.demo.crop}
            wellColor={wellColor}
          >
            <GetStartedShowcaseSlideDemo demo={slide.demo} mountDemo={mountDemo} />
          </GetStartedShowcaseDemoViewport>
        </div>
        {!ariaHidden ? (
          <span
            className="pointer-events-none absolute bottom-5 right-5 z-20 flex max-w-[90%] translate-z-0 items-center gap-1.5 rounded-pill px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm [backface-visibility:hidden]"
            style={{ backgroundColor: "#1d1a16" }}
            aria-hidden
          >
            <Icon size={12} strokeWidth={2.5} className="shrink-0 text-white" />
            <span className="truncate font-secondary">
              {showcaseBadgeLabel(slide.caption)}
            </span>
          </span>
        ) : null}
      </div>
    </article>
  );
}
