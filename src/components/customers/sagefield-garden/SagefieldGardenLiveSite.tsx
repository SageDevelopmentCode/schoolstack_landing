"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { InViewDemoGate } from "@/components/ui/InViewDemoGate";
import { DemoSkeleton } from "@/components/ui/DemoSkeleton";
import { Arrow, Draw, btnForest } from "@/components/garden/ui";
import GardenBrowserFrame from "@/components/home-garden/GardenBrowserFrame";
import SectionIntro from "@/components/home-garden/SectionIntro";
import { LIVE_SITE_COPY, SAGEFIELD_LOGO_SRC, SAGEFIELD_SITE_URL } from "./sagefield-copy";

const LOAD_TIMEOUT_MS = 8000;
const DESIGN_WIDTH = 1440;
const PREVIEW_HEIGHT = 680;

/** sagefield.co in a scaled iframe, with a friendly fallback if the site blocks framing. */
function LiveWebsiteFrame() {
  const outerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.75);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const update = () => setScale(el.offsetWidth / DESIGN_WIDTH);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!loaded) setFailed(true);
    }, LOAD_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [loaded]);

  if (failed) {
    return (
      <div className="sf-paper flex flex-col items-center justify-center gap-5 px-6 text-center" style={{ height: PREVIEW_HEIGHT * 0.6 }}>
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white p-2 ring-2 ring-[var(--sf-ink)]">
          <Image src={SAGEFIELD_LOGO_SRC} alt="Sage Field logo" width={48} height={48} className="h-full w-full object-contain" />
        </span>
        <div style={{ fontFamily: "var(--font-sf-body)" }}>
          <p className="text-lg font-extrabold text-[var(--sf-ink)]">{LIVE_SITE_COPY.fallbackTitle}</p>
          <p className="mx-auto mt-1.5 max-w-[340px] text-[15px] text-[var(--sf-soft)]">{LIVE_SITE_COPY.fallbackBody}</p>
        </div>
        <a href={SAGEFIELD_SITE_URL} target="_blank" rel="noopener noreferrer" className={btnForest} style={{ fontFamily: "var(--font-sf-body)" }}>
          {LIVE_SITE_COPY.fallbackCta}
          <ExternalLink size={16} aria-hidden />
        </a>
      </div>
    );
  }

  return (
    <div ref={outerRef} className="relative h-[420px] overflow-hidden sm:h-[560px] lg:h-[680px]">
      {!loaded && (
        <div className="absolute inset-0 z-10">
          <DemoSkeleton className="h-full rounded-none border-0" />
        </div>
      )}
      <div
        style={{
          width: DESIGN_WIDTH,
          height: scale > 0 ? PREVIEW_HEIGHT / scale : PREVIEW_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <iframe
          src={SAGEFIELD_SITE_URL}
          title="Sage Field website"
          loading="lazy"
          className="h-full w-full border-0"
          style={{ backgroundColor: "#FFF9F5" }}
          onLoad={() => setLoaded(true)}
        />
      </div>
    </div>
  );
}

/** "The site families visit today": sagefield.co pinned up in a taped browser frame. */
export default function SagefieldGardenLiveSite() {
  return (
    <section id="live-site" className="relative scroll-mt-24 bg-[var(--sf-paper)] py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionIntro
            pill={`🌐 ${LIVE_SITE_COPY.eyebrow}`}
            tint="sky"
            lead={LIVE_SITE_COPY.headlineLead}
            accent={LIVE_SITE_COPY.headlineAccent}
            squiggle="var(--sf-sky)"
            align="left"
            headingClassName="text-5xl md:text-6xl"
            body={
              <p>
                {LIVE_SITE_COPY.bodyBefore}
                <a
                  href={SAGEFIELD_SITE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded font-extrabold text-[var(--sf-clay-deep)] underline decoration-[var(--sf-moss)] decoration-2 underline-offset-4 hover:decoration-[var(--sf-clay)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30"
                >
                  {LIVE_SITE_COPY.bodyLink}
                </a>
                {LIVE_SITE_COPY.bodyAfter}
              </p>
            }
          />
          <div className="hidden shrink-0 items-end gap-2 pb-2 lg:flex" aria-hidden="true">
            <span className="sf-hand text-xl text-[var(--sf-soft)]">scroll around inside ↓</span>
            <Draw className="block w-12 rotate-90">
              <Arrow color="var(--sf-soft)" />
            </Draw>
          </div>
        </div>

        <GardenBrowserFrame
          label={
            <span className="inline-flex items-center gap-3">
              sagefield.co
              <a
                href={SAGEFIELD_SITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[var(--sf-clay-deep)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sf-clay)]/40"
              >
                {LIVE_SITE_COPY.openInTab}
                <ExternalLink size={11} aria-hidden />
              </a>
            </span>
          }
          tilt={-0.6}
          tape="var(--sf-sky)"
          tapeSide="left"
          className="mt-14"
        >
          <InViewDemoGate>
            <LiveWebsiteFrame />
          </InViewDemoGate>
        </GardenBrowserFrame>
      </div>
    </section>
  );
}
