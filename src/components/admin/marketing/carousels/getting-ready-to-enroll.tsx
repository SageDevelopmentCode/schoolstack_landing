"use client";

import { SLIDE } from "@/components/admin/marketing/slide-frame";
import {
  CarouselProductSlide,
  type CarouselDemoCrop,
} from "@/components/admin/marketing/carousels/carousel-product-slide";
import type { MarketingCarousel, MarketingSlide } from "@/components/admin/marketing/carousels/types";
import {
  MARKETING_DEMO_APPLY_FLOW_SELECTION,
  MARKETING_DEMO_CHECKLIST_FLOW_SELECTION,
  MarketingAdminHomeDemoWindow,
  MarketingEnrollmentChecklistPreviewDemoWindow,
  MarketingEnrollmentFlowsDemoWindow,
  MarketingParentApplyDemoWindow,
  MarketingScheduleToursDemoWindow,
  MarketingTuitionDemoWindow,
} from "@/components/admin/marketing/screens/marketing-demo-windows";
import { MarketingMobilePromoCluster } from "@/components/admin/marketing/screens/marketing-mobile-promo-cluster";

const DEMO_CONTENT_HEIGHT = 920;

const HOME_CROP: CarouselDemoCrop = { zoom: 1.22, originX: 0, originY: 0 };
const APPLICATION_CROP: CarouselDemoCrop = { zoom: 1.3, originX: 0, originY: 0.04 };
const VISITS_CROP: CarouselDemoCrop = { zoom: 1.2, originX: 0, originY: 0 };
const CHECKLIST_CROP: CarouselDemoCrop = { zoom: 1.35, originX: 0, originY: 0.05 };
const PREVIEW_CROP: CarouselDemoCrop = { zoom: 1.28, originX: 0, originY: 0 };
const TUITION_CROP: CarouselDemoCrop = { zoom: 1.22, originX: 0, originY: 0 };
const FAMILY_NEXT_STEP_CROP: CarouselDemoCrop = { zoom: 1.15, originX: -0.04, originY: 0.24 };

export const GETTING_READY_TO_ENROLL_CAROUSEL = {
  id: "getting-ready-to-enroll",
  title: "Getting ready to enroll families?",
  description: "Five things to set up before families enroll.",
  fileSlug: "mudkitchen-getting-ready-to-enroll",
  slides: [
    {
      id: "ready",
      fileName: "01-getting-ready-to-enroll-families.png",
      render: () => <ReadySlide />,
    },
    {
      id: "application",
      fileName: "02-build-the-application.png",
      render: () => <ApplicationSlide />,
    },
    {
      id: "visits",
      fileName: "03-set-up-visits.png",
      render: () => <VisitsSlide />,
    },
    {
      id: "checklist",
      fileName: "04-prepare-the-enrollment-checklist.png",
      render: () => <ChecklistSlide />,
    },
    {
      id: "preview",
      fileName: "05-decide-what-families-see.png",
      render: () => <PreviewSlide />,
    },
    {
      id: "tuition",
      fileName: "06-set-up-tuition.png",
      render: () => <TuitionSlide />,
    },
    {
      id: "next-step",
      fileName: "07-make-the-familys-next-step-easy-to-find.png",
      render: () => <NextStepSlide />,
    },
    {
      id: "promo",
      fileName: "08-set-it-up-once.png",
      render: () => <PromoSlide />,
    },
  ] satisfies MarketingSlide[],
} satisfies MarketingCarousel;

function ReadySlide() {
  return (
    <CarouselProductSlide
      kicker="Enrollment"
      title="Getting ready to enroll families?"
      body="Make sure these five things are ready first."
      contentHeight={DEMO_CONTENT_HEIGHT}
      crop={HOME_CROP}
    >
      <MarketingAdminHomeDemoWindow contentHeight={DEMO_CONTENT_HEIGHT} innerPadding={16} />
    </CarouselProductSlide>
  );
}

function ApplicationSlide() {
  return (
    <CarouselProductSlide
      kicker="Application"
      tone="forest"
      title="1. Build the application."
      body="Choose the questions and steps families need to complete."
      contentHeight={DEMO_CONTENT_HEIGHT}
      crop={APPLICATION_CROP}
    >
      <MarketingEnrollmentFlowsDemoWindow
        initialFlowSelection={MARKETING_DEMO_APPLY_FLOW_SELECTION}
        contentHeight={DEMO_CONTENT_HEIGHT}
      />
    </CarouselProductSlide>
  );
}

function VisitsSlide() {
  return (
    <CarouselProductSlide
      kicker="Visits"
      title="2. Set up visits."
      body="Publish times families can book for tours, interviews, or shadow days."
      contentHeight={DEMO_CONTENT_HEIGHT}
      crop={VISITS_CROP}
    >
      <MarketingScheduleToursDemoWindow contentHeight={DEMO_CONTENT_HEIGHT} />
    </CarouselProductSlide>
  );
}

function ChecklistSlide() {
  return (
    <CarouselProductSlide
      kicker="Enrollment"
      tone="forest"
      title="3. Prepare the enrollment checklist."
      body="Add the agreements, forms, uploads, acknowledgments, and payments your school needs."
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

function PreviewSlide() {
  return (
    <CarouselProductSlide
      kicker="Checklist"
      title="4. Decide what families see."
      body="Preview the checklist before you share it."
      contentHeight={DEMO_CONTENT_HEIGHT}
      crop={PREVIEW_CROP}
    >
      <MarketingEnrollmentChecklistPreviewDemoWindow contentHeight={DEMO_CONTENT_HEIGHT} />
    </CarouselProductSlide>
  );
}

function TuitionSlide() {
  return (
    <CarouselProductSlide
      kicker="Tuition"
      tone="forest"
      title="5. Set up tuition."
      body="Add rate plans, fees, and payment options before families need to pay."
      contentHeight={DEMO_CONTENT_HEIGHT}
      crop={TUITION_CROP}
    >
      <MarketingTuitionDemoWindow
        initialDashboardTab="catalog"
        initialRateCatalogTab="tuition_rates"
        contentHeight={DEMO_CONTENT_HEIGHT}
      />
    </CarouselProductSlide>
  );
}

function NextStepSlide() {
  return (
    <CarouselProductSlide
      kicker="Family"
      title="Make the family’s next step easy to find."
      body="Application. Visit. Enrollment. Tuition."
      contentHeight={DEMO_CONTENT_HEIGHT}
      crop={FAMILY_NEXT_STEP_CROP}
    >
      <MarketingParentApplyDemoWindow
        story="enrolling"
        celebrateSubmission={false}
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
      title="Set it up once. Families see what to do next."
      body="Application, visits, enrollment, and tuition stay connected from the first setup."
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
