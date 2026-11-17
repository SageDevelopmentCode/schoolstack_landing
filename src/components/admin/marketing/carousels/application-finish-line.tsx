"use client";

import type { MarketingCarousel, MarketingSlide } from "@/components/admin/marketing/carousels/types";
import type { CarouselDemoCrop } from "@/components/admin/marketing/carousels/carousel-product-slide";
import {
  MARKETING_DEMO_CHECKLIST_FLOW_SELECTION,
  MarketingEnrollmentFlowsDemoWindow,
} from "@/components/admin/marketing/screens/marketing-demo-windows";
import {
  GardenAdmissionsWindow,
  GardenEnrollmentChecklistWindow,
  GardenParentHomeWindow,
} from "@/components/admin/marketing/screens/marketing-garden-demo-windows";
import {
  Accent,
  MascotListSlide,
  MascotProductSlide,
  MascotPromoSlide,
} from "@/components/admin/marketing/mascot/mascot-slide-kit";

// Pip (enrollment) walks a family from application to first day; Bramble (forms) takes over the checklist.

const STEPS = [
  { label: "Apply", detail: "The family sends their answers in one place." },
  { label: "Decide", detail: "Your team reviews and says yes, or not yet." },
  { label: "Enroll", detail: "The family finishes forms, agreements and fees." },
];

const DEMO_HEIGHT = 920;
const SPOTLIGHT_LEAD_ID = "l3";

const SUBMITTED_INBOX_CROP: CarouselDemoCrop = { zoom: 1.22, originX: 0, originY: 0 };
const REVIEW_ANSWERS_CROP: CarouselDemoCrop = { zoom: 1.2, originX: 0.21, originY: 0 };
const NEXT_STEP_CROP: CarouselDemoCrop = { zoom: 1.25, originX: 0.2, originY: 0.1 };
const CHECKLIST_CROP: CarouselDemoCrop = { zoom: 1.35, originX: 0, originY: 0.05 };
const FAMILY_PROGRESS_CROP: CarouselDemoCrop = { zoom: 1.45, originX: 0, originY: 0 };

export const APPLICATION_FINISH_LINE_CAROUSEL = {
  id: "application-finish-line",
  title: "The application isn’t the finish line",
  description: "LinkedIn carousel for the path from application to enrollment, guided by Pip and Bramble.",
  fileSlug: "mudkitchen-application-finish-line",
  slides: [
    { id: "submitted", fileName: "01-application-submitted-who-owns-the-next-step.png", render: () => <SubmittedSlide /> },
    { id: "stages", fileName: "02-three-stages-one-connected-path.png", render: () => <StagesSlide /> },
    { id: "review", fileName: "03-review-the-application-in-one-place.png", render: () => <ReviewSlide /> },
    { id: "next-action", fileName: "04-make-the-next-action-clear.png", render: () => <NextActionSlide /> },
    { id: "checklist", fileName: "05-accepted-give-families-one-checklist.png", render: () => <ChecklistBuilderSlide /> },
    { id: "family-progress", fileName: "06-let-families-see-whats-left.png", render: () => <FamilyProgressSlide /> },
    { id: "promo", fileName: "07-from-application-to-enrollment.png", render: () => <PromoSlide /> },
  ] satisfies MarketingSlide[],
} satisfies MarketingCarousel;

function SubmittedSlide() {
  return (
    <MascotProductSlide
      kicker="Admissions"
      title={
        <>
          A family applied to your <Accent>Microschool.</Accent> Now what?
        </>
      }
      body="Get them from application to first day without anyone guessing the next step."
      lane="right"
      mascot={{ name: "pip", view: "curious" }}
      tip="I'm Pip. I'll walk you through it."
      background="#FFF3CF"
      contentHeight={DEMO_HEIGHT}
      crop={SUBMITTED_INBOX_CROP}
    >
      <GardenAdmissionsWindow contentHeight={DEMO_HEIGHT} />
    </MascotProductSlide>
  );
}

function StagesSlide() {
  return (
    <MascotListSlide
      kicker="The path"
      title={
        <>
          3 steps from <Accent>“applied”</Accent> to <Accent>“enrolled”</Accent>
        </>
      }
      rows={STEPS}
      aside="the application is only step one"
      mascot={{ name: "pip", view: "point", flip: true }}
      tip="Each step needs a clear owner."
    />
  );
}

function ReviewSlide() {
  return (
    <MascotProductSlide
      kicker="Step 1 · Review"
      title="See the whole application on one screen."
      body="Answers, contact details and status together. No digging through email."
      lane="left"
      mascot={{ name: "pip", view: "thinking" }}
      tip="Everything I need, in one spot."
      contentHeight={DEMO_HEIGHT}
      crop={REVIEW_ANSWERS_CROP}
    >
      <GardenAdmissionsWindow selectedLeadId={SPOTLIGHT_LEAD_ID} contentHeight={DEMO_HEIGHT} />
    </MascotProductSlide>
  );
}

function NextActionSlide() {
  return (
    <MascotProductSlide
      kicker="Step 2 · Decide"
      title="Always know whose turn it is."
      body="Each application shows the next step, and whether it’s on your team or the family."
      lane="right"
      mascot={{ name: "pip", view: "point", flip: true }}
      tip="Here, it’s on us. Got it!"
      background="#F3EEF8"
      contentHeight={DEMO_HEIGHT}
      crop={NEXT_STEP_CROP}
    >
      <GardenAdmissionsWindow selectedLeadId={SPOTLIGHT_LEAD_ID} contentHeight={DEMO_HEIGHT} />
    </MascotProductSlide>
  );
}

function ChecklistBuilderSlide() {
  return (
    <MascotProductSlide
      kicker="Step 3 · Enroll"
      title="Accepted? Send one checklist."
      body="Agreements, forms, uploads and fees, all in one list."
      lane="left"
      mascot={{ name: "bramble", view: "hold" }}
      tip="Bramble here. I handle the forms."
      background="#EEF5E9"
      contentHeight={DEMO_HEIGHT}
      crop={CHECKLIST_CROP}
    >
      <MarketingEnrollmentFlowsDemoWindow initialFlowSelection={MARKETING_DEMO_CHECKLIST_FLOW_SELECTION} wrapOutlineLabels contentHeight={DEMO_HEIGHT} />
    </MascotProductSlide>
  );
}

function FamilyProgressSlide() {
  return (
    <MascotProductSlide
      kicker="For families"
      title="Families can see what’s left."
      body="Finished items get checked off. Nothing slips through."
      lane="right"
      mascot={{ name: "bramble", view: "thumbs", flip: true }}
      tip="No lost forms this year."
      background="#EEF5E9"
      contentHeight={DEMO_HEIGHT}
      crop={FAMILY_PROGRESS_CROP}
    >
      <GardenEnrollmentChecklistWindow contentHeight={DEMO_HEIGHT} />
    </MascotProductSlide>
  );
}

function PromoSlide() {
  return (
    <MascotPromoSlide
      title="From “applied” to “enrolled”, in one place."
      body="Applications, decisions and enrollment checklists stay connected."
      cast={[{ name: "pip", view: "celebrate" }, { name: "bramble", view: "wave", flip: true }]}
      contentHeight={DEMO_HEIGHT}
    >
      <GardenParentHomeWindow contentHeight={DEMO_HEIGHT} />
    </MascotPromoSlide>
  );
}
