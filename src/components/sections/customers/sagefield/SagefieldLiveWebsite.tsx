"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowRight, ExternalLink } from "lucide-react";
import { FadeInView } from "@/components/ui/FadeInView";
import { InViewDemoGate } from "@/components/ui/InViewDemoGate";
import { DemoSkeleton } from "@/components/ui/DemoSkeleton";
import { ACCENT_HIGHLIGHT, BOLD_HEADING, DARK_PILL } from "@/components/home/bright-styles";

const SITE_URL = "https://www.sagefield.co/";
const LOAD_TIMEOUT_MS = 8000;
const DESIGN_WIDTH = 1440;
const PREVIEW_HEIGHT = 720;

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
      <div
        className="flex flex-col items-center justify-center gap-5 bg-[#F7F5F2] px-6 text-center"
        style={{ height: PREVIEW_HEIGHT }}
      >
        <Image
          src="/images/SageFieldLogo.png"
          alt="Sage Field logo"
          width={48}
          height={48}
          className="h-12 w-12 object-contain"
        />
        <div>
          <p className="font-secondary text-[15px] font-semibold text-[#1d1a16]">
            Preview unavailable in this frame
          </p>
          <p className="mt-1.5 max-w-[320px] font-secondary text-[13px] text-[#1d1a16]/65">
            Visit Sage Field&apos;s live site to explore programs, tuition, team, and enrollment.
          </p>
        </div>
        <a href={SITE_URL} target="_blank" rel="noopener noreferrer" className={DARK_PILL}>
          Visit sagefield.co
          <ExternalLink size={14} aria-hidden />
        </a>
      </div>
    );
  }

  return (
    <div ref={outerRef} className="relative overflow-hidden" style={{ height: PREVIEW_HEIGHT }}>
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
          src={SITE_URL}
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

export default function SagefieldLiveWebsite() {
  return (
    <section id="live-site" className="bg-white px-3 py-12 lg:px-6">
      <div className="mx-auto max-w-[1400px] px-3 md:px-6 lg:px-10">
        <div className="max-w-[640px]">
          <FadeInView>
            <p className="font-secondary text-[13px] font-semibold uppercase tracking-widest text-clay">
              See it live
            </p>
          </FadeInView>
          <FadeInView delay={0.08}>
            <h2 className={`mt-5 text-[clamp(1.9rem,3.5vw,2.6rem)] ${BOLD_HEADING}`}>
              The site families visit <span className={ACCENT_HIGHLIGHT}>today.</span>
            </h2>
          </FadeInView>
          <FadeInView delay={0.14}>
            <p className="mt-4 font-secondary text-[16px] leading-relaxed text-[#1d1a16]/70">
              Programs, tuition, team profiles, and enrollment pathways are all published on{" "}
              <a
                href={SITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-clay underline underline-offset-2 transition-colors hover:text-[#1d1a16]"
              >
                sagefield.co
              </a>
              — the same public surface families used during Sage Field&apos;s launch.
            </p>
          </FadeInView>
        </div>

        <FadeInView delay={0.18}>
          <div className="mt-10 overflow-hidden rounded-[24px] border border-black/10 bg-white shadow-[0_24px_60px_rgba(30,60,30,0.08)]">
            <div className="flex items-center gap-3 border-b border-black/10 bg-[#F7F5F2] px-4 py-2.5">
              <div className="flex shrink-0 items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-black/15" />
                <div className="h-2.5 w-2.5 rounded-full bg-black/15" />
                <div className="h-2.5 w-2.5 rounded-full bg-black/15" />
              </div>
              <div className="min-w-0 flex-1 truncate rounded-md bg-white px-3 py-1 font-mono text-[12px] text-[#1d1a16]/50">
                sagefield.co
              </div>
              <a
                href={SITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-1.5 font-secondary text-[12px] font-medium text-clay transition-colors hover:text-[#1d1a16]"
              >
                Open in new tab
                <ArrowRight size={12} aria-hidden />
              </a>
            </div>

            <InViewDemoGate>
              <LiveWebsiteFrame />
            </InViewDemoGate>
          </div>
        </FadeInView>
      </div>
    </section>
  );
}
