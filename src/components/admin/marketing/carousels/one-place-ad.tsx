"use client";

/* eslint-disable @next/next/no-img-element -- PNG export needs a plain img, not next/image. */
import { ArrowRight } from "lucide-react";
import type { MarketingCarousel, MarketingSlide } from "@/components/admin/marketing/carousels/types";
import SlideCanvas, { SLIDE, SLIDE_WIDTH } from "@/components/admin/marketing/slide-frame";
import { dmSans, fraunces } from "@/lib/fonts/local";
import { Mascot, type MascotName } from "@/components/admin/marketing/mascot/Mascot";

export const ONE_PLACE_AD_CAROUSEL = {
  id: "one-place-ad",
  title: "Run your Microschool from one place",
  description: "Single ad post: classroom photo, tagline, Book a demo, and the crew row (one character per feature).",
  fileSlug: "mudkitchen-one-place-ad",
  slides: [
    {
      id: "one-place",
      fileName: "01-run-your-school-from-one-place.png",
      render: () => <OnePlaceAdSlide />,
    },
  ] satisfies MarketingSlide[],
} satisfies MarketingCarousel;

type CrewFeature = { name: MascotName; label: string };

/** One crew member per feature, matching their roles in the mascot carousels. */
const CREW_FEATURES: CrewFeature[] = [
  { name: "pip", label: "Enrollment" },
  { name: "nutmeg", label: "Tuition" },
  { name: "dot", label: "Calendar" },
  { name: "loam", label: "Messages" },
  { name: "fennel", label: "Attendance" },
  { name: "bramble", label: "Forms" },
  { name: "terra", label: "Website" },
  { name: "clover", label: "Staff hours" },
];

const HERO_IMAGE_SRC = "/images/marketing/ads/one-place-hero.png";
const HERO_OBJECT_POSITION = "55% center";

const CREW_SIZE = 120;
const CREW_GAP = 10;
const CREW_ROW_WIDTH = CREW_FEATURES.length * CREW_SIZE + (CREW_FEATURES.length - 1) * CREW_GAP;
const HERO_COPY_MAX_WIDTH = SLIDE_WIDTH - 48;

const FONT_DISPLAY = "var(--font-sf-display), 'Bricolage Grotesque', 'Avenir Next', sans-serif";
const FONT_BODY = "var(--font-sf-body), Nunito, 'Avenir', sans-serif";
const FONT_HAND = "var(--font-sf-hand), 'Gochi Hand', 'Comic Sans MS', cursive";

function OnePlaceAdSlide() {
  return (
    <SlideCanvas background="#000000" logo="none">
      <img
        src={HERO_IMAGE_SRC}
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: HERO_OBJECT_POSITION,
          display: "block",
        }}
      />
      <div style={{ position: "absolute", inset: 0, background: "rgba(0, 0, 0, 0.28)" }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.28) 24%, rgba(0,0,0,0) 36%, rgba(0,0,0,0) 42%, rgba(0,0,0,0.24) 54%, rgba(0,0,0,0.58) 70%, rgba(0,0,0,0.82) 100%)",
        }}
      />

      <div className={`${fraunces.variable} ${dmSans.variable}`} style={{ position: "absolute", inset: 0 }}>
        <AdLogo />
        <AdHero />
        <AdFeatureRow />
      </div>
    </SlideCanvas>
  );
}

function AdLogo() {
  return (
    <div
      style={{
        position: "absolute",
        top: 44,
        left: 0,
        right: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
      }}
    >
      <img src="/images/Logo.png" alt="" style={{ height: 64, width: "auto", display: "block" }} />
      <span
        style={{
          margin: 0,
          fontFamily: FONT_DISPLAY,
          fontSize: 36,
          fontWeight: 800,
          lineHeight: 1,
          letterSpacing: "-0.03em",
          color: SLIDE.white,
        }}
      >
        MudKitchen
      </span>
    </div>
  );
}

function AdHero() {
  return (
    <div
      style={{
        position: "absolute",
        top: 160,
        bottom: 300,
        left: 40,
        right: 40,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: 40,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: HERO_COPY_MAX_WIDTH,
          alignSelf: "center",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontFamily: FONT_DISPLAY,
            fontSize: 80,
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: "-0.03em",
            color: "#FFFFFF",
            textShadow: "0 2px 24px rgba(0,0,0,0.35)",
          }}
        >
          <span style={{ display: "block", whiteSpace: "nowrap" }}>Run your Microschool</span>
          from one place
        </h1>
        <p
          style={{
            margin: "8px 0 0",
            fontFamily: FONT_HAND,
            fontSize: 76,
            fontWeight: 400,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            color: SLIDE.white,
            textShadow: "0 2px 24px rgba(0,0,0,0.35)",
          }}
        >
          and get back to your kids
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 14,
            background: SLIDE.clay,
            color: "#FFFFFF",
            borderRadius: 24,
            padding: "26px 54px",
            fontFamily: FONT_BODY,
            fontSize: 38,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            boxShadow: "0 18px 44px rgba(0,0,0,0.35)",
          }}
        >
          Book a demo
          <ArrowRight size={38} strokeWidth={2.5} aria-hidden />
        </div>
        <p
          style={{
            margin: "22px 0 0",
            fontFamily: FONT_BODY,
            fontSize: 26,
            fontWeight: 500,
            color: "rgba(255, 250, 244, 0.78)",
          }}
        >
          trymudkitchen.com
        </p>
      </div>
    </div>
  );
}

function AdFeatureRow() {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 40,
        left: (SLIDE_WIDTH - CREW_ROW_WIDTH) / 2,
        width: CREW_ROW_WIDTH,
        display: "flex",
        gap: CREW_GAP,
      }}
    >
      {CREW_FEATURES.map((feature) => (
        <div key={feature.name} style={{ width: CREW_SIZE, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <Mascot name={feature.name} view="happy" width={CREW_SIZE} />
          <span
            style={{
              fontFamily: FONT_BODY,
              fontSize: 23,
              fontWeight: 800,
              letterSpacing: "-0.01em",
              color: "#FFFFFF",
              whiteSpace: "nowrap",
              textShadow: "0 2px 10px rgba(0,0,0,0.5)",
            }}
          >
            {feature.label}
          </span>
        </div>
      ))}
    </div>
  );
}
