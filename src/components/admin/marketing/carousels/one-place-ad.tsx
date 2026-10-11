"use client";

/* eslint-disable @next/next/no-img-element -- PNG export needs a plain img, not next/image. */
import {
  ArrowRight,
  CalendarCheck,
  CalendarDays,
  Clock,
  CreditCard,
  FilePen,
  FolderOpen,
  Globe,
  MessageSquare,
  Receipt,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import type { MarketingCarousel, MarketingSlide } from "@/components/admin/marketing/carousels/types";
import SlideCanvas, { SLIDE, SLIDE_WIDTH } from "@/components/admin/marketing/slide-frame";
import { dmSans, fraunces } from "@/lib/fonts";

export const ONE_PLACE_AD_CAROUSEL = {
  id: "one-place-ad",
  title: "Run your whole school from one place",
  description: "Single ad post: classroom photo, tagline, Book a demo, feature row.",
  fileSlug: "mudkitchen-one-place-ad",
  slides: [
    {
      id: "one-place",
      fileName: "01-run-your-school-from-one-place.png",
      render: () => <OnePlaceAdSlide />,
    },
  ] satisfies MarketingSlide[],
} satisfies MarketingCarousel;

type AdFeature = {
  label: string;
  icon: LucideIcon;
  color: string;
};

const AD_FEATURES: AdFeature[] = [
  { label: "Calendar", icon: CalendarDays, color: "#DC2626" },
  { label: "Website", icon: Globe, color: "#A05C45" },
  { label: "Enrollment", icon: UserPlus, color: "#2563EB" },
  { label: "Tuition", icon: CreditCard, color: "#059669" },
  { label: "Messaging", icon: MessageSquare, color: "#0284C7" },
  { label: "Attendance", icon: CalendarCheck, color: "#D97706" },
  { label: "Billing", icon: Receipt, color: "#7C3AED" },
  { label: "Contracts", icon: FilePen, color: "#4F46E5" },
  { label: "Files", icon: FolderOpen, color: "#D97706" },
  { label: "Staff", icon: Clock, color: "#0D9488" },
];

const HERO_IMAGE_SRC = "/images/marketing/ads/one-place-hero.png";
const HERO_OBJECT_POSITION = "55% center";

const TILE_SIZE = 128;
const TILE_GAP = 24;
const TILE_RADIUS = 34;
const FEATURE_ROW_WIDTH = AD_FEATURES.length * TILE_SIZE + (AD_FEATURES.length - 1) * TILE_GAP;

const FONT_DISPLAY = "var(--font-fraunces), Georgia, serif";
const FONT_BODY = "var(--font-dm-sans), system-ui, sans-serif";

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
      <div style={{ position: "absolute", inset: 0, background: "rgba(0, 0, 0, 0.42)" }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.45) 24%, rgba(0,0,0,0) 38%, rgba(0,0,0,0) 46%, rgba(0,0,0,0.35) 58%, rgba(0,0,0,0.7) 76%, rgba(0,0,0,0.92) 100%)",
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
      <img src="/images/Logo.png" alt="" style={{ height: 76, width: "auto", display: "block" }} />
      <span
        style={{
          margin: 0,
          fontFamily: FONT_DISPLAY,
          fontSize: 46,
          fontWeight: 560,
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
        top: 200,
        bottom: 220,
        left: 56,
        right: 56,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: 40,
      }}
    >
      <div>
        <h1
          style={{
            margin: 0,
            fontFamily: FONT_BODY,
            fontSize: 80,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: "-0.04em",
            color: "#FFFFFF",
            textShadow: "0 2px 24px rgba(0,0,0,0.35)",
          }}
        >
          Run your whole school
          <br />
          from one place
        </h1>
        <p
          style={{
            margin: "8px 0 0",
            fontFamily: FONT_DISPLAY,
            fontSize: 68,
            fontWeight: 500,
            fontStyle: "italic",
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            color: SLIDE.white,
            textShadow: "0 2px 24px rgba(0,0,0,0.35)",
          }}
        >
          and get back to the kids
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
        bottom: 48,
        left: (SLIDE_WIDTH - FEATURE_ROW_WIDTH) / 2,
        width: FEATURE_ROW_WIDTH,
        display: "flex",
        gap: TILE_GAP,
      }}
    >
      {AD_FEATURES.map((feature) => (
        <AdFeatureTile key={feature.label} feature={feature} />
      ))}
    </div>
  );
}

function AdFeatureTile({ feature }: { feature: AdFeature }) {
  const Icon = feature.icon;
  return (
    <div
      style={{
        width: TILE_SIZE,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
      }}
    >
      <div
        style={{
          width: TILE_SIZE,
          height: TILE_SIZE,
          borderRadius: TILE_RADIUS,
          background: feature.color,
          color: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.16), 0 18px 40px rgba(0,0,0,0.4)",
        }}
      >
        <Icon size={60} strokeWidth={2} aria-hidden />
      </div>
      <span
        style={{
          fontFamily: FONT_BODY,
          fontSize: 26,
          fontWeight: 600,
          letterSpacing: "-0.01em",
          color: "#FFFFFF",
          whiteSpace: "nowrap",
        }}
      >
        {feature.label}
      </span>
    </div>
  );
}
