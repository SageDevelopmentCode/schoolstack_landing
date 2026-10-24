"use client";

import Link from "next/link";
import { useCallback, useState, type CSSProperties } from "react";
import GetStartedStoryHeader from "@/components/get-started/GetStartedStoryHeader";
import MobileAppDownloadBadges from "@/components/download/MobileAppDownloadBadges";
import DownloadAppScreenshotCarousel from "@/components/download/DownloadAppScreenshotCarousel";
import {
  DownloadFloatingIllustration,
  useDownloadPageParallax,
} from "@/components/download/DownloadPageMotion";
import { MUDKITCHEN_MARKETING_STORY_THEME } from "@/lib/marketing/mudkitchen-story-theme";

const theme = MUDKITCHEN_MARKETING_STORY_THEME;

export default function DownloadHeroSection() {
  const [slideIndex, setSlideIndex] = useState(0);
  const { parallax, animate } = useDownloadPageParallax();

  const handleSlideChange = useCallback((index: number) => {
    setSlideIndex(index);
  }, []);

  return (
    <section className="relative overflow-hidden pb-16 pt-[120px] sm:pb-20 sm:pt-[140px] lg:pb-24">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[min(560px,75vh)] opacity-90"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, color-mix(in srgb, #A6B89A 35%, transparent), transparent 70%), radial-gradient(ellipse 60% 40% at 90% 20%, color-mix(in srgb, #A05C45 12%, transparent), transparent 65%)",
        }}
      />

      <div className="hero-enter-slide-right pointer-events-none absolute top-[60px] right-[-200px] z-0 hidden select-none lg:block">
        <DownloadFloatingIllustration
          src="/images/illustrations/HeroRight.webp"
          width={420}
          height={500}
          parallax={parallax}
          parallaxStrength={18}
          animate={animate}
        />
      </div>

      <div className="hero-enter-slide-left pointer-events-none absolute top-[60px] left-[-200px] z-0 hidden select-none lg:block">
        <DownloadFloatingIllustration
          src="/images/illustrations/HeroLeft.webp"
          width={420}
          height={500}
          parallax={parallax}
          parallaxStrength={-18}
          floatDelay={0.4}
          animate={animate}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[1200px] px-6 lg:px-8">
        <div className="flex flex-col gap-10 lg:grid lg:grid-cols-2 lg:items-center lg:gap-10 xl:gap-14">
          <div>
            <GetStartedStoryHeader
              theme={theme}
              kicker="MudKitchen mobile"
              title={
                <>
                  Your school,{" "}
                  <em style={{ color: theme.coral, fontStyle: "italic" }}>
                    in your pocket.
                  </em>
                </>
              }
              subtitle="Download the MudKitchen app for iPhone today. On Android, leave your email and we’ll send you the Google Play link when it’s live."
              headingAs="h1"
              titleId="download-page-heading"
              className="mb-8 sm:mb-10"
            />

            <div
              className="hero-enter mt-8"
              style={{ "--hero-delay": "120ms" } as CSSProperties}
            >
              <p className="text-center text-[11px] font-bold uppercase tracking-[0.12em] text-text-faint font-secondary sm:text-left">
                Get the app
              </p>
              <MobileAppDownloadBadges
                className="mt-4 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-start sm:gap-5"
                badgeClassName="h-[52px] w-auto object-contain sm:h-[58px]"
                priority
              />
            </div>

            <p className="mt-8 text-center text-sm text-text-muted font-secondary leading-relaxed sm:text-left">
              Already have access?{" "}
              <Link href="/login" className="font-medium text-clay hover:underline">
                Sign in
              </Link>{" "}
              with the account your school provided.
            </p>
          </div>

          <div className="mt-2 lg:mt-0">
            <div
              className="hero-enter relative mx-auto max-w-[420px] px-2 sm:px-0 lg:px-0"
              style={{ "--hero-delay": "80ms" } as CSSProperties}
            >
              <DownloadAppScreenshotCarousel
                activeIndex={slideIndex}
                onIndexChange={handleSlideChange}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
