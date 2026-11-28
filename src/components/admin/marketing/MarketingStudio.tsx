"use client";

import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { gBtnOutlineSm, gBtnPopSm } from "@/components/school-parent/garden/ui";
import {
  BusyLabel,
  GardenEmptyState,
  GardenNotice,
  GardenSwitch,
  gIconBtn,
} from "@/components/school-admin/garden/kit";
import type { MarketingSlide } from "@/components/admin/marketing/carousels/types";
import { AdCopyPanel } from "@/components/admin/marketing/AdCopyPanel";
import {
  AdOfferProvider,
  MarketingSlideShell,
  SLIDE_SIZES,
  SlideSizeProvider,
} from "@/components/admin/marketing/slide-frame";
import { isSlidePosted } from "@/lib/marketing/carousel-post-status";
import {
  AccentLast,
  MarketingGardenHeader,
} from "@/components/admin/marketing/garden/MarketingGardenHeader";
import {
  MarketingStudioFrame,
  STUDIO_STAGE_CLASS,
} from "@/components/admin/marketing/garden/MarketingStudioFrame";
import { MarketingCarouselRail } from "@/components/admin/marketing/garden/MarketingCarouselRail";
import {
  GardenSegmented,
  MarketingCanvas,
} from "@/components/admin/marketing/garden/marketing-ui";
import {
  exportKey,
  useMarketingStudioModel,
} from "@/components/admin/marketing/useMarketingStudioModel";

const KIND_LABEL = {
  ad: "Ad set",
  post: "Post set",
  store: "App store screens",
} as const;

/** /admin/marketing: the Carousels studio (list rail, live slide, export, posted status, ad copy). */
export default function MarketingStudio() {
  const { stageRef, exportRefs, ...model } = useMarketingStudioModel();
  const {
    carousel,
    slides,
    slide,
    index,
    activeSize,
    activeDims,
    scale,
    offerOff,
    isSet,
    currentStatus,
  } = model;

  if (!carousel || !slide) {
    return (
      <MarketingStudioFrame
        header={
          <MarketingGardenHeader
            compact
            title={<AccentLast text="Social carousels" />}
          />
        }
        rail={null}
      >
        <GardenEmptyState title="No marketing carousels configured." />
      </MarketingStudioFrame>
    );
  }

  const kindLabel = carousel.kind
    ? KIND_LABEL[carousel.kind]
    : "Swipe carousel";
  const slideCount =
    slides.length === 1 ? "1 slide" : `${slides.length} slides`;
  const postedLine = model.postStatusLoading
    ? null
    : isSet
      ? `${model.postedSlideCount} of ${slides.length} posted`
      : currentStatus?.posted
        ? "Posted"
        : "Not posted yet";
  const subtitle = [kindLabel, slideCount, postedLine]
    .filter(Boolean)
    .join(" · ");

  return (
    <MarketingStudioFrame
      data-testid="marketing-studio"
      header={
        <MarketingGardenHeader
          compact
          title={<AccentLast text={carousel.title} />}
          subtitle={subtitle}
        />
      }
      rail={
        <MarketingCarouselRail
          carousels={model.carousels}
          selectedId={carousel.id}
          postedByCarouselId={model.postedByCarouselId}
          statusesLoading={model.postStatusLoading}
          flashId={model.flashId}
          onSelect={model.selectCarousel}
        />
      }
      overlays={
        <div
          key={carousel.id}
          aria-hidden
          className="pointer-events-none fixed top-0 -left-[4000px]"
        >
          {model.sizes.map((size) =>
            slides.map((item, itemIndex) => (
              <div
                key={exportKey(size, itemIndex)}
                ref={(node) => {
                  exportRefs.current[exportKey(size, itemIndex)] = node;
                }}
                style={{
                  width: SLIDE_SIZES[size].width,
                  height: SLIDE_SIZES[size].height,
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <SlideSizeProvider size={size}>
                  <AdOfferProvider show={!offerOff}>
                    <MarketingSlideShell
                      audienceBanner={
                        itemIndex === 0
                          ? model.firstSlideAudienceBanner
                          : undefined
                      }
                    >
                      <SlideView slide={item} />
                    </MarketingSlideShell>
                  </AdOfferProvider>
                </SlideSizeProvider>
              </div>
            )),
          )}
        </div>
      }
    >
      <div className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-3 rounded-[20px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white px-4 py-3 shadow-[0_3px_0_0_rgba(43,36,29,0.08)]">
        {model.multiSize ? (
          <GardenSegmented
            label="Export size"
            size="sm"
            value={activeSize}
            onChange={model.setPreferredSize}
            options={model.sizes.map((size) => ({
              value: size,
              label: SLIDE_SIZES[size].label,
            }))}
          />
        ) : null}
        {model.hasOfferToggle ? (
          <div className="min-w-[200px]">
            <GardenSwitch
              checked={model.showOffer}
              onChange={model.setShowOffer}
              label="Offer"
              description="Off = no-incentive control"
              data-testid="marketing-offer-switch"
            />
          </div>
        ) : null}
        <div className="min-w-[220px]">
          <GardenSwitch
            checked={model.currentPosted}
            onChange={model.togglePosted}
            disabled={model.postStatusLoading || !model.canMarkPosted}
            busy={model.postStatusSaving}
            label={model.postStatusSaving ? "Posted · Saving…" : "Posted"}
            description={
              isSet
                ? `This slide · ${model.postStatusLoading ? "–" : model.postedSlideCount} of ${slides.length} posted`
                : "Mark when this is live on social"
            }
            data-testid="marketing-posted-switch"
          />
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void model.downloadCurrent()}
            disabled={model.exporting != null}
            aria-busy={model.exporting === "slide" || undefined}
            className={gBtnOutlineSm}
          >
            <BusyLabel
              busy={model.exporting === "slide"}
              busyLabel="Exporting…"
              icon={<Download className="h-4 w-4" aria-hidden />}
            >
              Download this slide
            </BusyLabel>
          </button>
          <button
            type="button"
            onClick={() => void model.downloadAll()}
            disabled={model.exporting != null}
            aria-busy={model.exporting === "all" || undefined}
            className={gBtnPopSm}
          >
            <BusyLabel
              busy={model.exporting === "all"}
              busyLabel="Exporting…"
              icon={<Download className="h-4 w-4" aria-hidden />}
            >
              Download all
            </BusyLabel>
          </button>
        </div>
      </div>

      {model.postStatusLoadError ? (
        <GardenNotice
          tone="warning"
          role="alert"
          title="Couldn't load posted status."
          action={
            <button
              type="button"
              className={gBtnOutlineSm}
              onClick={model.reloadPostStatuses}
              disabled={model.postStatusLoading}
            >
              {model.postStatusLoading ? "Trying again…" : "Try again"}
            </button>
          }
        >
          {model.postStatusLoadError} Slides still preview and export; Posted
          switches unlock once this loads.
        </GardenNotice>
      ) : null}

      <div
        className={`flex min-h-0 flex-1 flex-col gap-3 ${
          model.panelVersions.length
            ? "xl:grid xl:grid-cols-[minmax(0,1fr)_320px] xl:grid-rows-[minmax(0,1fr)]"
            : ""
        }`}
      >
        <div className={STUDIO_STAGE_CLASS}>
          <div
            ref={stageRef}
            className="relative flex min-h-0 flex-1 items-center justify-center"
          >
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => model.go(-1)}
              className={`${gIconBtn} absolute left-3 z-10 !h-10 !w-10`}
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>

            <div
              className="overflow-hidden rounded-[6px] shadow-[0_8px_0_0_rgba(43,36,29,0.16),0_24px_50px_-28px_rgba(43,36,29,0.55)] ring-[1.5px] ring-[var(--sf-ink)]/15"
              style={{
                width: activeDims.width * scale,
                height: activeDims.height * scale,
              }}
            >
              <MarketingCanvas
                style={{
                  width: activeDims.width,
                  height: activeDims.height,
                  transform: `scale(${scale})`,
                  transformOrigin: "top left",
                }}
              >
                <SlideSizeProvider size={activeSize}>
                  <AdOfferProvider show={!offerOff}>
                    <MarketingSlideShell
                      audienceBanner={
                        index === 0 ? model.firstSlideAudienceBanner : undefined
                      }
                    >
                      <SlideView slide={slide} />
                    </MarketingSlideShell>
                  </AdOfferProvider>
                </SlideSizeProvider>
              </MarketingCanvas>
            </div>

            <button
              type="button"
              aria-label="Next slide"
              onClick={() => model.go(1)}
              className={`${gIconBtn} absolute right-3 z-10 !h-10 !w-10`}
            >
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
          </div>

          <div className="flex shrink-0 flex-wrap items-center justify-center gap-1.5 px-4 pb-3">
            {slides.map((item, itemIndex) => {
              const posted = isSet && isSlidePosted(currentStatus, item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-label={`Slide ${itemIndex + 1}${posted ? " (posted)" : ""}`}
                  aria-current={itemIndex === index}
                  onClick={() => model.setIndex(itemIndex)}
                  className={`h-2.5 rounded-full border-[1.5px] transition-all duration-300 ${
                    itemIndex === index
                      ? "w-7 border-[var(--sf-ink)] bg-[var(--sf-clay)]"
                      : posted
                        ? "w-2.5 border-[var(--sf-forest)] bg-[var(--sf-forest)]"
                        : "w-2.5 border-[var(--sf-ink)]/25 bg-white hover:border-[var(--sf-ink)]/50"
                  }`}
                />
              );
            })}
            <span className="ml-2 text-[12.5px] font-extrabold tabular-nums text-[var(--sf-soft)]">
              {index + 1} / {slides.length}
            </span>
          </div>
        </div>

        {model.panelVersions.length ? (
          <>
            <div className="hidden min-h-0 xl:flex">
              <AdCopyPanel
                key={`${carousel.id}:${slide.id}:col`}
                versions={model.panelVersions}
                layout="column"
              />
            </div>
            <div className="xl:hidden">
              <AdCopyPanel
                key={`${carousel.id}:${slide.id}`}
                versions={model.panelVersions}
              />
            </div>
          </>
        ) : null}
      </div>
    </MarketingStudioFrame>
  );
}

function SlideView({ slide }: { slide: MarketingSlide }) {
  return slide.render();
}
