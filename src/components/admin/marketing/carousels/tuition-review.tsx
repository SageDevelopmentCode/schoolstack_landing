"use client";

/* eslint-disable @next/next/no-img-element -- PNG export needs a plain img, not next/image. */
import SlideCanvas, { displayStyle, SLIDE } from "@/components/admin/marketing/slide-frame";
import { CarouselProductSlide, DEMO_SLIDE_PAPER } from "@/components/admin/marketing/carousels/carousel-product-slide";
import {
  MarketingStudentsDemoWindow,
  MarketingTuitionDemoWindow,
  MarketingTuitionOptionsWindow,
} from "@/components/admin/marketing/screens/marketing-demo-windows";
import { MarketingMobilePromoCluster } from "@/components/admin/marketing/screens/marketing-mobile-promo-cluster";
import type { MarketingCarousel, MarketingSlide } from "@/components/admin/marketing/carousels/types";

const HOOK_NUMBERS = [
  "Operating costs",
  "Paid enrollment",
  "Sustainable margin",
  "Included vs. separate",
  "Discounts and terms",
];

const COST_CATEGORIES = ["Payroll", "Rent", "Insurance", "Supplies", "Software", "Programming"];

const EXAMPLE_ROWS = [
  { label: "Annual operating costs", value: "$180,000" },
  { label: "Other revenue", value: "−$18,000" },
  { label: "Reserve", value: "+$18,000" },
  { label: "Paid enrollment", value: "20 students" },
];

const CHECKLIST = [
  "Operating costs",
  "Realistic paid enrollment",
  "Sustainable margin",
  "Included vs. separate costs",
  "Discounts and payment terms",
];

const ROW_RULE = "1px solid #E7D9C6";

export const TUITION_REVIEW_CAROUSEL = {
  id: "tuition-review",
  title: "Thinking about raising tuition?",
  description: "LinkedIn carousel for schools planning a tuition increase.",
  fileSlug: "mudkitchen-tuition-review",
  slides: [
    {
      id: "intro",
      fileName: "01-pressure-test-these-5-numbers.png",
      render: () => <CoverSlide />,
    },
    {
      id: "costs",
      fileName: "02-operating-costs.png",
      render: () => <CostsSlide />,
    },
    {
      id: "enrollment",
      fileName: "03-realistic-paid-enrollment.png",
      render: () => <EnrollmentSlide />,
    },
    {
      id: "margin",
      fileName: "04-sustainable-margin.png",
      render: () => <MarginSlide />,
    },
    {
      id: "included",
      fileName: "05-included-vs-separate.png",
      render: () => <IncludedSlide />,
    },
    {
      id: "options",
      fileName: "06-discounts-and-payment-terms.png",
      render: () => <OptionsSlide />,
    },
    {
      id: "close",
      fileName: "07-save-this.png",
      render: () => <SaveSlide />,
    },
    {
      id: "promo",
      fileName: "08-clear-family-billing.png",
      render: () => <HomePromoSlide />,
    },
  ] satisfies MarketingSlide[],
} satisfies MarketingCarousel;

function StepKicker({ children }: { children: string }) {
  return (
    <p
      style={{
        margin: 0,
        fontSize: 22,
        fontWeight: 700,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: SLIDE.clay,
      }}
    >
      {children}
    </p>
  );
}

function CoverSlide() {
  return (
    <SlideCanvas background={DEMO_SLIDE_PAPER}>
      <div style={{ padding: "148px 72px 0" }}>
        <h1 style={{ ...displayStyle(80), maxWidth: 900 }}>
          Before you raise
          <br />
          tuition, pressure‑test
          <br />
          these 5 numbers.
        </h1>
        <p style={{ margin: "28px 0 0", maxWidth: 720, fontSize: 36, lineHeight: 1.28, color: SLIDE.muted }}>
          A full classroom on paper can still leave your school underfunded.
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
          bottom: 88,
          width: 520,
          zIndex: 2,
          transform: "rotate(-6deg)",
          background: SLIDE.white,
          borderRadius: 28,
          padding: "26px 28px 18px",
          boxShadow: "0 24px 50px rgba(43, 36, 29, 0.16)",
          border: `1px solid ${SLIDE.line}`,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 800,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#729077",
          }}
        >
          The 5 numbers
        </p>
        <div style={{ marginTop: 8 }}>
          {HOOK_NUMBERS.map((line, index) => (
            <div
              key={line}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                height: 58,
                borderBottom: index === HOOK_NUMBERS.length - 1 ? "none" : ROW_RULE,
              }}
            >
              <span style={{ ...displayStyle(28, SLIDE.forest), width: 28 }}>{index + 1}</span>
              <span style={{ ...displayStyle(30), fontWeight: 560 }}>{line}</span>
            </div>
          ))}
        </div>
      </div>
    </SlideCanvas>
  );
}

function CostsSlide() {
  return (
    <SlideCanvas background={DEMO_SLIDE_PAPER}>
      <div
        style={{
          height: "100%",
          boxSizing: "border-box",
          padding: "168px 80px 80px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <StepKicker>1 of 5</StepKicker>
        <h1 style={{ ...displayStyle(76), marginTop: 16, maxWidth: 900 }}>
          What does it actually cost to run your school?
        </h1>
        <div style={{ marginTop: 36, display: "flex", flexDirection: "column" }}>
          {COST_CATEGORIES.map((line, index) => (
            <div
              key={line}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                height: 96,
                borderBottom: ROW_RULE,
              }}
            >
              <span style={{ ...displayStyle(32, SLIDE.forest), width: 44 }}>{index + 1}</span>
              <span style={{ ...displayStyle(44), fontWeight: 560 }}>{line}</span>
            </div>
          ))}
        </div>
        <p style={{ margin: "36px 0 0", maxWidth: 760, fontSize: 32, lineHeight: 1.35, color: SLIDE.muted }}>
          And the costs that tend to show up later.
        </p>
      </div>
    </SlideCanvas>
  );
}

function EnrollmentSlide() {
  return (
    <CarouselProductSlide
      kicker="2 of 5"
      side="copyLeft"
      title="How many students will realistically pay tuition?"
      body="Budget from current enrollment, committed re-enrollments, and a conservative forecast—not every available seat."
      contentHeight={920}
      cropFocus="top"
    >
      <MarketingStudentsDemoWindow contentHeight={920} />
    </CarouselProductSlide>
  );
}

function MarginSlide() {
  return (
    <SlideCanvas background={DEMO_SLIDE_PAPER}>
      <div
        style={{
          height: "100%",
          boxSizing: "border-box",
          padding: "168px 80px 72px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <StepKicker>3 of 5</StepKicker>
        <h1 style={{ ...displayStyle(72), marginTop: 16, maxWidth: 900 }}>
          What margin keeps the school healthy?
        </h1>
        <p style={{ margin: "22px 0 0", maxWidth: 860, fontSize: 32, lineHeight: 1.32, color: SLIDE.muted }}>
          Tuition should cover more than break-even. Build room for surprises, growth, and a real operating reserve.
        </p>
        <div
          style={{
            marginTop: 48,
            background: SLIDE.white,
            borderRadius: 28,
            border: `1px solid ${SLIDE.line}`,
            overflow: "hidden",
          }}
        >
          <p
            style={{
              margin: 0,
              padding: "22px 32px 0",
              fontSize: 16,
              fontWeight: 800,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: SLIDE.clay,
            }}
          >
            Example
          </p>
          {EXAMPLE_ROWS.map((row) => (
            <div
              key={row.label}
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                gap: 24,
                margin: "0 32px",
                height: 84,
                borderBottom: ROW_RULE,
              }}
            >
              <span style={{ fontSize: 30, color: SLIDE.muted }}>{row.label}</span>
              <span style={{ ...displayStyle(36) }}>{row.value}</span>
            </div>
          ))}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: 24,
              marginTop: 8,
              padding: "28px 32px 32px",
              background: SLIDE.forest,
              color: SLIDE.paper,
            }}
          >
            <span style={{ fontSize: 30, fontWeight: 650 }}>Tuition target</span>
            <span style={{ ...displayStyle(52, SLIDE.paper) }}>$9,000 / student</span>
          </div>
        </div>
      </div>
    </SlideCanvas>
  );
}

function IncludedSlide() {
  return (
    <CarouselProductSlide
      kicker="4 of 5"
      side="copyRight"
      title="What is included in tuition—and what is separate?"
      body="Be clear about meals, materials, field trips, extended care, and enrollment fees: included, optional, or billed separately."
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
      kicker="5 of 5"
      side="copyLeft"
      title="What discounts and payment options can you sustain?"
      body="Price sibling discounts, scholarships, fee waivers, and payment plans into the model before you publish the rate."
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
      <div
        style={{
          height: "100%",
          boxSizing: "border-box",
          padding: "140px 80px 72px 120px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <p style={{ ...displayStyle(36, SLIDE.clay), letterSpacing: "0.08em", textTransform: "uppercase" }}>Save this</p>
        <h1 style={{ ...displayStyle(72), marginTop: 16, maxWidth: 860 }}>
          Before your next
          <br />
          tuition review.
        </h1>
        <div style={{ marginTop: 40, display: "flex", flexDirection: "column" }}>
          {CHECKLIST.map((line, index) => (
            <div
              key={line}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                height: 108,
                borderBottom: ROW_RULE,
              }}
            >
              <span style={{ ...displayStyle(36, SLIDE.forest), width: 52 }}>{index + 1}</span>
              <span style={{ ...displayStyle(42), fontWeight: 560 }}>{line}</span>
            </div>
          ))}
        </div>
        <p style={{ margin: "auto 0 0", fontSize: 32, lineHeight: 1.3, color: SLIDE.muted }}>
          Make the plan clear before you share the number.
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
      promoSiteLabel="trymudkitchen.com"
      title="Turn the plan into clear family billing."
      body="MudKitchen brings tuition rates, payment plans, discounts, and family-facing payments into one place."
      footer={
        <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
          <span
            style={{
              display: "inline-block",
              background: SLIDE.white,
              color: SLIDE.forest,
              borderRadius: 999,
              padding: "20px 40px",
              fontSize: 32,
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
