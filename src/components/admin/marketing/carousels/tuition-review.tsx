"use client";

/* eslint-disable @next/next/no-img-element -- PNG export needs a plain img, not next/image. */
import type { ReactNode } from "react";
import SlideCanvas, { displayStyle, SLIDE } from "@/components/admin/marketing/slide-frame";
import { CarouselProductSlide, DEMO_SLIDE_PAPER } from "@/components/admin/marketing/carousels/carousel-product-slide";
import {
  MarketingParentDemoWindow,
  MarketingStudentsDemoWindow,
  MarketingTuitionDemoWindow,
  MarketingTuitionOptionsWindow,
} from "@/components/admin/marketing/screens/marketing-demo-windows";
import { MarketingMobilePromoCluster } from "@/components/admin/marketing/screens/marketing-mobile-promo-cluster";

export type MarketingSlide = {
  id: string;
  fileName: string;
  render: () => ReactNode;
};

const CHECKLIST = [
  "What it costs to run the school",
  "A realistic student count",
  "What’s included in tuition",
  "Discounts and payment options",
];

export const TUITION_REVIEW_CAROUSEL = {
  id: "tuition-review",
  title: "Thinking about raising tuition?",
  fileSlug: "mudkitchen-tuition-review",
  slides: [
    {
      id: "intro",
      fileName: "01-thinking-about-raising-tuition.png",
      render: () => <CoverSlide />,
    },
    {
      id: "students-roster",
      fileName: "02-my-students.png",
      render: () => <MyStudentsSlide />,
    },
    {
      id: "enrollment",
      fileName: "03-enrollment-checklist.png",
      render: () => <EnrollmentSlide />,
    },
    {
      id: "billing",
      fileName: "04-family-tuition.png",
      render: () => <BillingSlide />,
    },
    {
      id: "included",
      fileName: "05-whats-included.png",
      render: () => <IncludedSlide />,
    },
    {
      id: "options",
      fileName: "06-discounts-and-payment-options.png",
      render: () => <OptionsSlide />,
    },
    {
      id: "close",
      fileName: "07-make-the-plan-clear.png",
      render: () => <SaveSlide />,
    },
    {
      id: "promo",
      fileName: "08-book-a-demo.png",
      render: () => <HomePromoSlide />,
    },
  ] satisfies MarketingSlide[],
};

function CoverSlide() {
  return (
    <SlideCanvas background={DEMO_SLIDE_PAPER}>
      <div style={{ padding: "156px 72px 0", maxWidth: 820 }}>
        <p style={{ margin: "0 0 24px", fontSize: 22, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: SLIDE.forest }}>
          Before you raise tuition
        </p>
        <h1 style={{ ...displayStyle(108), maxWidth: 780 }}>Thinking about raising tuition?</h1>
        <p style={{ margin: "28px 0 0", maxWidth: 680, fontSize: 38, lineHeight: 1.25, color: SLIDE.muted }}>
          Check these five things before you decide.
        </p>
      </div>

      <img
        src="/images/illustrations/Notebook.webp"
        alt=""
        style={{
          position: "absolute",
          width: 640,
          height: 520,
          right: -90,
          bottom: -50,
          objectFit: "cover",
          objectPosition: "center",
          borderRadius: 40,
          transform: "rotate(7deg)",
          boxShadow: "0 30px 60px rgba(43, 36, 29, 0.28)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 72,
          bottom: 96,
          width: 480,
          zIndex: 2,
          transform: "rotate(-6deg)",
          background: SLIDE.white,
          borderRadius: 28,
          padding: "28px 28px 30px",
          boxShadow: "0 24px 50px rgba(43, 36, 29, 0.16)",
          border: `1px solid ${SLIDE.line}`,
        }}
      >
        <p style={{ margin: 0, fontSize: 16, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#729077" }}>
          Next payment
        </p>
        <p style={{ ...displayStyle(80), marginTop: 10 }}>$1,250</p>
        <p style={{ margin: "8px 0 20px", fontSize: 22, color: SLIDE.muted }}>Due May 15, 2026</p>
        <span
          style={{
            display: "inline-block",
            background: SLIDE.forest,
            color: "#fff",
            borderRadius: 14,
            padding: "14px 20px",
            fontSize: 20,
            fontWeight: 700,
          }}
        >
          Pay now
        </span>
      </div>
    </SlideCanvas>
  );
}

function MyStudentsSlide() {
  return (
    <CarouselProductSlide
      side="copyLeft"
      title="How many students are you counting on?"
      body="Start from the students already on the roster."
      contentHeight={920}
      cropFocus="top"
    >
      <MarketingStudentsDemoWindow contentHeight={920} />
    </CarouselProductSlide>
  );
}

function EnrollmentSlide() {
  return (
    <CarouselProductSlide
      side="copyRight"
      title="Count a realistic enrollment."
      body="Make your plan using a realistic enrollment number—not just a full classroom."
      contentHeight={700}
      cropFocus="top"
    >
      <MarketingParentDemoWindow tab="enrollment" contentHeight={700} />
    </CarouselProductSlide>
  );
}

function BillingSlide() {
  return (
    <CarouselProductSlide
      side="copyLeft"
      title="This is the page families see."
      body="Family tuition, the next payment, and each child’s balance."
      contentHeight={700}
      cropFocus="top"
    >
      <MarketingParentDemoWindow tab="billing" contentHeight={700} />
    </CarouselProductSlide>
  );
}

function IncludedSlide() {
  return (
    <CarouselProductSlide
      side="copyRight"
      title="What’s included in tuition?"
      body="Make it clear what tuition covers and what families pay for separately."
      contentHeight={920}
      cropFocus="top"
    >
      <MarketingTuitionDemoWindow initialDashboardTab="catalog" contentHeight={920} />
    </CarouselProductSlide>
  );
}

function OptionsSlide() {
  return (
    <CarouselProductSlide
      side="copyLeft"
      title="What discounts or payment options do you offer?"
      body="Write down the rules for sibling discounts, payment plans, scholarships, or fee waivers."
      contentHeight={720}
      cropFocus="top"
    >
      <MarketingTuitionOptionsWindow contentHeight={720} />
    </CarouselProductSlide>
  );
}

function SaveSlide() {
  return (
    <SlideCanvas background={DEMO_SLIDE_PAPER}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 72, background: "#E7C2C2" }} />
      <div style={{ height: "100%", boxSizing: "border-box", padding: "140px 80px 72px 120px", display: "flex", flexDirection: "column" }}>
        <p style={{ ...displayStyle(36, SLIDE.clay), letterSpacing: "0.08em", textTransform: "uppercase" }}>Save this</p>
        <h1 style={{ ...displayStyle(80), marginTop: 16, maxWidth: 820 }}>
          Make the plan clear before you share the number.
        </h1>
        <div style={{ marginTop: 48, display: "flex", flexDirection: "column" }}>
          {CHECKLIST.map((line, index) => (
            <div
              key={line}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                height: 108,
                borderBottom: "1px solid #E7D9C6",
              }}
            >
              <span style={{ ...displayStyle(36, SLIDE.forest), width: 52 }}>{index + 1}</span>
              <span style={{ ...displayStyle(44), fontWeight: 560 }}>{line}</span>
            </div>
          ))}
          <div style={{ height: 108, borderBottom: "1px solid #E7D9C6" }} />
        </div>
        <p style={{ margin: "auto 0 0", fontSize: 32, color: SLIDE.muted }}>
          Save this checklist for your next tuition review.
        </p>
      </div>
    </SlideCanvas>
  );
}

function HomePromoSlide() {
  return (
    <CarouselProductSlide
      variant="promo"
      demoPresentation="phones"
      kicker="MudKitchen"
      title="See how MudKitchen handles tuition."
      body=""
      footer={
        <div style={{ marginTop: 20, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 20 }}>
          <p style={{ margin: 0, fontSize: 32, color: "rgba(247, 241, 231, 0.82)" }}>trymudkitchen.com</p>
          <span
            style={{
              display: "inline-block",
              background: SLIDE.white,
              color: SLIDE.forest,
              borderRadius: 999,
              padding: "16px 28px",
              fontSize: 26,
              fontWeight: 750,
            }}
          >
            Book a demo
          </span>
        </div>
      }
    >
      <MarketingMobilePromoCluster />
    </CarouselProductSlide>
  );
}
