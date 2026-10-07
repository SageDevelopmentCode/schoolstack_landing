"use client";

import SlideCanvas, { displayStyle, SLIDE } from "@/components/admin/marketing/slide-frame";
import { CarouselProductSlide, DEMO_SLIDE_PAPER } from "@/components/admin/marketing/carousels/carousel-product-slide";
import type { MarketingCarousel, MarketingSlide } from "@/components/admin/marketing/carousels/types";
import {
  MARKETING_DEMO_APPLY_FLOW_SELECTION,
  MARKETING_DEMO_CHECKLIST_FLOW_SELECTION,
  MarketingAdmissionsSubmissionsDemoWindow,
  MarketingEnrollmentChecklistPreviewDemoWindow,
  MarketingEnrollmentFlowsDemoWindow,
  MarketingParentEnrollmentDemoWindow,
} from "@/components/admin/marketing/screens/marketing-demo-windows";
import { MarketingMobilePromoCluster } from "@/components/admin/marketing/screens/marketing-mobile-promo-cluster";

const ROW_RULE = "1px solid #E7D9C6";

const HANDOFF_STEPS = [
  { label: "Application", detail: "Families submit interest and answers in one place." },
  { label: "Decision", detail: "Staff review, follow up, and move status forward." },
  { label: "Enrollment checklist", detail: "Accepted families complete agreements, forms, and fees." },
];

const DEMO_CONTENT_HEIGHT = 920;

export const APPLICATION_FINISH_LINE_CAROUSEL = {
  id: "application-finish-line",
  title: "The application isn’t the finish line",
  description: "LinkedIn carousel for the path from application to enrollment.",
  fileSlug: "mudkitchen-application-finish-line",
  slides: [
    {
      id: "submitted",
      fileName: "01-application-submitted-now-what.png",
      render: () => <SubmittedSlide />,
    },
    {
      id: "review",
      fileName: "02-review-the-familys-submission.png",
      render: () => <ReviewSlide />,
    },
    {
      id: "workflow",
      fileName: "03-move-the-process-forward.png",
      render: () => <WorkflowSlide />,
    },
    {
      id: "checklist",
      fileName: "04-give-accepted-families-a-checklist.png",
      render: () => <ChecklistBuilderSlide />,
    },
    {
      id: "preview",
      fileName: "05-preview-before-families-see-it.png",
      render: () => <PreviewSlide />,
    },
    {
      id: "visible",
      fileName: "06-make-the-next-step-visible.png",
      render: () => <VisibleSlide />,
    },
    {
      id: "handoff",
      fileName: "07-the-handoff-matters.png",
      render: () => <HandoffSlide />,
    },
    {
      id: "promo",
      fileName: "08-from-application-to-enrollment.png",
      render: () => <PromoSlide />,
    },
  ] satisfies MarketingSlide[],
} satisfies MarketingCarousel;

function SubmittedSlide() {
  return (
    <CarouselProductSlide
      kicker="Admissions"
      side="copyLeft"
      title="Application submitted. Now what?"
      body="The space between “interested” and “enrolled” is where families need clear next steps."
      contentHeight={DEMO_CONTENT_HEIGHT}
      cropFocus="top"
    >
      <MarketingAdmissionsSubmissionsDemoWindow contentHeight={DEMO_CONTENT_HEIGHT} />
    </CarouselProductSlide>
  );
}

function ReviewSlide() {
  return (
    <CarouselProductSlide
      kicker="Admissions"
      side="copyRight"
      title="Review the family’s submission."
      body="Keep the application and its answers together for staff review."
      contentHeight={DEMO_CONTENT_HEIGHT}
      cropFocus="top"
    >
      <MarketingAdmissionsSubmissionsDemoWindow
        initialSelectedLeadId="l3"
        contentHeight={DEMO_CONTENT_HEIGHT}
      />
    </CarouselProductSlide>
  );
}

function WorkflowSlide() {
  return (
    <CarouselProductSlide
      kicker="Admissions"
      side="copyLeft"
      title="Move the process forward."
      body="Use the school’s admissions workflow to manage next steps and follow-up."
      contentHeight={DEMO_CONTENT_HEIGHT}
      cropFocus="top"
    >
      <MarketingEnrollmentFlowsDemoWindow
        initialFlowSelection={MARKETING_DEMO_APPLY_FLOW_SELECTION}
        contentHeight={DEMO_CONTENT_HEIGHT}
      />
    </CarouselProductSlide>
  );
}

function ChecklistBuilderSlide() {
  return (
    <CarouselProductSlide
      kicker="Enrollment"
      side="copyRight"
      title="Give accepted families a checklist."
      body="Agreements, forms, uploads, acknowledgments, and payments can live in an enrollment flow."
      contentHeight={DEMO_CONTENT_HEIGHT}
      cropFocus="top"
    >
      <MarketingEnrollmentFlowsDemoWindow
        initialFlowSelection={MARKETING_DEMO_CHECKLIST_FLOW_SELECTION}
        contentHeight={DEMO_CONTENT_HEIGHT}
      />
    </CarouselProductSlide>
  );
}

function PreviewSlide() {
  return (
    <CarouselProductSlide
      kicker="Enrollment"
      side="copyLeft"
      title="Preview before families see it."
      body="Staff can preview the checklist before sharing it with a family."
      contentHeight={DEMO_CONTENT_HEIGHT}
      cropFocus="top"
    >
      <MarketingEnrollmentChecklistPreviewDemoWindow contentHeight={DEMO_CONTENT_HEIGHT} />
    </CarouselProductSlide>
  );
}

function VisibleSlide() {
  return (
    <CarouselProductSlide
      kicker="Example"
      side="copyLeft"
      title="Make the next step visible."
      body="A clear process helps families know what’s still needed and helps staff see what needs attention."
      contentHeight={DEMO_CONTENT_HEIGHT}
      cropFocus="top"
    >
      <MarketingParentEnrollmentDemoWindow contentHeight={DEMO_CONTENT_HEIGHT} />
    </CarouselProductSlide>
  );
}

function HandoffSlide() {
  return (
    <SlideCanvas background={DEMO_SLIDE_PAPER}>
      <div
        style={{
          height: "100%",
          boxSizing: "border-box",
          padding: "140px 80px 72px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <p style={{ ...displayStyle(36, SLIDE.clay), letterSpacing: "0.08em", textTransform: "uppercase" }}>
          The handoff
        </p>
        <h1 style={{ ...displayStyle(72), marginTop: 16, maxWidth: 900 }}>The handoff matters.</h1>
        <p style={{ margin: "22px 0 0", maxWidth: 860, fontSize: 32, lineHeight: 1.32, color: SLIDE.muted }}>
          Application → decision → enrollment checklist. One connected path, shaped by the school.
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
                borderBottom: index === HANDOFF_STEPS.length - 1 ? "none" : ROW_RULE,
              }}
            >
              <span style={{ ...displayStyle(36, SLIDE.forest), width: 48, flexShrink: 0 }}>
                {index + 1}
              </span>
              <div>
                <p style={{ ...displayStyle(40), fontWeight: 620, margin: 0 }}>{step.label}</p>
                <p style={{ margin: "8px 0 0", fontSize: 26, lineHeight: 1.35, color: SLIDE.muted }}>
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

function PromoSlide() {
  return (
    <CarouselProductSlide
      variant="promo"
      demoPresentation="phones"
      promoDensity="compact"
      promoSiteLabel="trymudkitchen.com"
      title="From application to enrollment, in one place."
      body="Submissions, admissions workflows, and enrollment checklists—connected for your school."
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
