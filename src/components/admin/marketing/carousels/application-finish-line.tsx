"use client";

import SlideCanvas, { displayStyle, SLIDE } from "@/components/admin/marketing/slide-frame";
import {
  CarouselProductSlide,
  type CarouselDemoCrop,
} from "@/components/admin/marketing/carousels/carousel-product-slide";
import type { MarketingCarousel, MarketingSlide } from "@/components/admin/marketing/carousels/types";
import {
  MARKETING_DEMO_CHECKLIST_FLOW_SELECTION,
  MarketingAdmissionsSubmissionsDemoWindow,
  MarketingEnrollmentFlowsDemoWindow,
  MarketingParentEnrollmentDemoWindow,
} from "@/components/admin/marketing/screens/marketing-demo-windows";
import { buildDemoMarketingSlide1Leads } from "@/data/school-demos/demo-admin-admissions-fixtures";
import { MarketingMobilePromoCluster } from "@/components/admin/marketing/screens/marketing-mobile-promo-cluster";

const FOREST_RULE = "1px solid rgba(247, 241, 231, 0.28)";
const FOREST_BODY = "rgba(247, 241, 231, 0.82)";

const HANDOFF_STEPS = [
  { label: "Application", detail: "Families submit their answers in one place." },
  { label: "Decision", detail: "Staff review and decide what happens next." },
  { label: "Enrollment checklist", detail: "Accepted families complete agreements, forms, and fees." },
];

const DEMO_CONTENT_HEIGHT = 920;
const SPOTLIGHT_LEAD_ID = "l3";

const SUBMITTED_INBOX_CROP: CarouselDemoCrop = { zoom: 1.22, originX: 0, originY: 0 };
const REVIEW_ANSWERS_CROP: CarouselDemoCrop = { zoom: 1.2, originX: 0.21, originY: 0 };
const NEXT_STEP_CROP: CarouselDemoCrop = { zoom: 1.25, originX: 0.23, originY: 0.1 };
const CHECKLIST_CROP: CarouselDemoCrop = { zoom: 1.35, originX: 0, originY: 0.05 };
const FAMILY_PROGRESS_CROP: CarouselDemoCrop = { zoom: 1.45, originX: 0, originY: 0 };

export const APPLICATION_FINISH_LINE_CAROUSEL = {
  id: "application-finish-line",
  title: "The application isn’t the finish line",
  description: "LinkedIn carousel for the path from application to enrollment.",
  fileSlug: "mudkitchen-application-finish-line",
  slides: [
    {
      id: "submitted",
      fileName: "01-application-submitted-who-owns-the-next-step.png",
      render: () => <SubmittedSlide />,
    },
    {
      id: "stages",
      fileName: "02-three-stages-one-connected-path.png",
      render: () => <StagesSlide />,
    },
    {
      id: "review",
      fileName: "03-review-the-application-in-one-place.png",
      render: () => <ReviewSlide />,
    },
    {
      id: "next-action",
      fileName: "04-make-the-next-action-clear.png",
      render: () => <NextActionSlide />,
    },
    {
      id: "checklist",
      fileName: "05-accepted-give-families-one-checklist.png",
      render: () => <ChecklistBuilderSlide />,
    },
    {
      id: "family-progress",
      fileName: "06-let-families-see-whats-left.png",
      render: () => <FamilyProgressSlide />,
    },
    {
      id: "promo",
      fileName: "07-from-application-to-enrollment.png",
      render: () => <PromoSlide />,
    },
  ] satisfies MarketingSlide[],
} satisfies MarketingCarousel;

function SubmittedSlide() {
  return (
    <CarouselProductSlide
      kicker="Admissions"
      title="A family applied. What happens next?"
      body="Give staff and families a clear path from application to enrollment."
      contentHeight={DEMO_CONTENT_HEIGHT}
      crop={SUBMITTED_INBOX_CROP}
    >
      <MarketingAdmissionsSubmissionsDemoWindow
        leads={buildDemoMarketingSlide1Leads()}
        highlightLeadId={SPOTLIGHT_LEAD_ID}
        contentHeight={DEMO_CONTENT_HEIGHT}
        compactForMarketing
      />
    </CarouselProductSlide>
  );
}

function StagesSlide() {
  return (
    <SlideCanvas background={SLIDE.forest}>
      <div
        style={{
          height: "100%",
          boxSizing: "border-box",
          padding: "140px 80px 72px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <p style={{ ...displayStyle(36, SLIDE.white), letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Admissions
        </p>
        <h1 style={{ ...displayStyle(72, SLIDE.white), marginTop: 16, maxWidth: 900 }}>
          Three stages. One connected path.
        </h1>
        <p style={{ margin: "22px 0 0", maxWidth: 860, fontSize: 32, lineHeight: 1.32, color: FOREST_BODY }}>
          Families apply. Staff review and decide. Accepted families complete enrollment.
        </p>
        <div style={{ marginTop: 48, display: "flex", flexDirection: "column" }}>
          {HANDOFF_STEPS.map((step, index) => (
            <div
              key={step.label}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 20,
                padding: "28px 0",
                borderBottom: index === HANDOFF_STEPS.length - 1 ? "none" : FOREST_RULE,
              }}
            >
              <span style={{ ...displayStyle(36, SLIDE.white), width: 48, flexShrink: 0 }}>
                {index + 1}
              </span>
              <div>
                <p style={{ ...displayStyle(40, SLIDE.white), fontWeight: 620, margin: 0 }}>{step.label}</p>
                <p style={{ margin: "8px 0 0", fontSize: 26, lineHeight: 1.35, color: FOREST_BODY }}>
                  {step.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SlideCanvas>
  );
}

function ReviewSlide() {
  return (
    <CarouselProductSlide
      kicker="Admissions"
      title="Review the application in one place."
      body="See the family’s answers, contact details, and status together."
      contentHeight={DEMO_CONTENT_HEIGHT}
      crop={REVIEW_ANSWERS_CROP}
    >
      <MarketingAdmissionsSubmissionsDemoWindow
        initialSelectedLeadId={SPOTLIGHT_LEAD_ID}
        initialDetailTab="application"
        contentHeight={DEMO_CONTENT_HEIGHT}
      />
    </CarouselProductSlide>
  );
}

function NextActionSlide() {
  return (
    <CarouselProductSlide
      kicker="Admissions"
      tone="forest"
      title="Make the next action clear."
      body="Review this application. The next step stays visible — here, it’s with staff."
      contentHeight={DEMO_CONTENT_HEIGHT}
      crop={NEXT_STEP_CROP}
    >
      <MarketingAdmissionsSubmissionsDemoWindow
        initialSelectedLeadId={SPOTLIGHT_LEAD_ID}
        initialDetailTab="overview"
        contentHeight={DEMO_CONTENT_HEIGHT}
      />
    </CarouselProductSlide>
  );
}

function ChecklistBuilderSlide() {
  return (
    <CarouselProductSlide
      kicker="Enrollment"
      title="Accepted? Give families one checklist."
      body="Agreements, forms, uploads, and fees belong in one enrollment checklist."
      contentHeight={DEMO_CONTENT_HEIGHT}
      crop={CHECKLIST_CROP}
    >
      <MarketingEnrollmentFlowsDemoWindow
        initialFlowSelection={MARKETING_DEMO_CHECKLIST_FLOW_SELECTION}
        wrapOutlineLabels
        contentHeight={DEMO_CONTENT_HEIGHT}
      />
    </CarouselProductSlide>
  );
}

function FamilyProgressSlide() {
  return (
    <CarouselProductSlide
      kicker="Enrollment"
      tone="forest"
      title="Let families see what’s left."
      body="Preview their checklist before sharing it. Completed items stay marked, and what’s left stays visible."
      contentHeight={DEMO_CONTENT_HEIGHT}
      crop={FAMILY_PROGRESS_CROP}
    >
      <MarketingParentEnrollmentDemoWindow
        initialActiveItem="registration-fee"
        contentHeight={DEMO_CONTENT_HEIGHT}
      />
    </CarouselProductSlide>
  );
}

function PromoSlide() {
  return (
    <CarouselProductSlide
      variant="promo"
      demoPresentation="phones"
      promoDensity="compact"
      promoSiteLabel="trymudkitchen.com"
      title="From application to enrollment, in one place."
      body="See how your school’s review steps and enrollment requirements fit together."
      footer={
        <div style={{ marginTop: 22, display: "flex", justifyContent: "center" }}>
          <span
            style={{
              display: "inline-block",
              background: SLIDE.white,
              color: SLIDE.forest,
              borderRadius: 999,
              padding: "18px 40px",
              fontSize: 28,
              fontWeight: 750,
            }}
          >
            Book a demo
          </span>
        </div>
      }
    >
      <MarketingMobilePromoCluster variant="admissions" />
    </CarouselProductSlide>
  );
}
