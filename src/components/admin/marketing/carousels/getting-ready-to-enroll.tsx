"use client";

import type { CarouselDemoCrop } from "@/components/admin/marketing/carousels/carousel-product-slide";
import type { MarketingCarousel, MarketingSlide } from "@/components/admin/marketing/carousels/types";
import {
  MARKETING_DEMO_APPLY_FLOW_SELECTION,
  MARKETING_DEMO_CHECKLIST_FLOW_SELECTION,
  MarketingEnrollmentFlowsDemoWindow,
  MarketingScheduleToursDemoWindow,
  MarketingTuitionDemoWindow,
} from "@/components/admin/marketing/screens/marketing-demo-windows";
import {
  GardenAdminDashboardWindow,
  GardenEnrollmentChecklistWindow,
  GardenParentHomeWindow,
} from "@/components/admin/marketing/screens/marketing-garden-demo-windows";
import { Accent, MascotProductSlide, MascotPromoSlide } from "@/components/admin/marketing/mascot/mascot-slide-kit";

// A different crew member owns each setup step: Dig (front office), Pip (enrollment), Terra (website & visits),
// Bramble (forms) and Nutmeg (tuition).

const DEMO_HEIGHT = 920;

const HOME_CROP: CarouselDemoCrop = { zoom: 1.22, originX: 0, originY: 0 };
const APPLICATION_CROP: CarouselDemoCrop = { zoom: 1.3, originX: 0, originY: 0.04 };
const VISITS_CROP: CarouselDemoCrop = { zoom: 1.2, originX: 0, originY: 0 };
const CHECKLIST_CROP: CarouselDemoCrop = { zoom: 1.35, originX: 0, originY: 0.05 };
const PREVIEW_CROP: CarouselDemoCrop = { zoom: 1.28, originX: 0, originY: 0 };
const TUITION_CROP: CarouselDemoCrop = { zoom: 1.22, originX: 0, originY: 0 };

export const GETTING_READY_TO_ENROLL_CAROUSEL = {
  id: "getting-ready-to-enroll",
  title: "Getting ready to enroll families for your Microschool?",
  description: "Five things to set up before families enroll, one crew member per step.",
  fileSlug: "mudkitchen-getting-ready-to-enroll",
  slides: [
    { id: "ready", fileName: "01-getting-ready-to-enroll-families.png",
      adCopy: {
        label: "5 things first",
        primaryText: "Getting ready to enroll families? Set up these 5 things first. 📋 One crew member per step. Swipe →\n\n#microschool #enrollment #schoolfounder",
        headline: "5 things to set up before you enroll",
      },
      adCopyVariants: [
        {
          label: "Save it",
          primaryText: "📌 Save this before enrollment opens. Five setup steps so families aren't stuck emailing you questions in week one. Swipe →\n\n#microschool #enrollment",
          headline: "Save this before enrollment opens",
        },
        {
          label: "Which is missing?",
          primaryText: "Application, visits, checklist, preview, tuition. Which one is your school still missing? Be honest. 👇 Swipe for how to set up each →\n\n#microschool #enrollment #schoolfounder",
          headline: "Which one are you missing?",
        },
      ], render: () => <ReadySlide /> },
    { id: "application", fileName: "02-build-the-application.png", render: () => <ApplicationSlide /> },
    { id: "visits", fileName: "03-set-up-visits.png", render: () => <VisitsSlide /> },
    { id: "checklist", fileName: "04-prepare-the-enrollment-checklist.png", render: () => <ChecklistSlide /> },
    { id: "preview", fileName: "05-decide-what-families-see.png", render: () => <PreviewSlide /> },
    { id: "tuition", fileName: "06-set-up-tuition.png", render: () => <TuitionSlide /> },
    { id: "promo", fileName: "07-set-it-up-once.png", render: () => <PromoSlide /> },
  ] satisfies MarketingSlide[],
} satisfies MarketingCarousel;

function ReadySlide() {
  return (
    <MascotProductSlide
      kicker="Enrollment"
      title={
        <>
          Getting ready to enroll families at your <Accent>Microschool?</Accent>
        </>
      }
      body="Set up these 5 things first."
      lane="right"
      mascot={{ name: "dig", view: "hold", flip: true }}
      tip="I'm Dig. Here's the setup list."
      background="#E3EDFB"
      contentHeight={DEMO_HEIGHT}
      crop={HOME_CROP}
    >
      <GardenAdminDashboardWindow contentHeight={DEMO_HEIGHT} />
    </MascotProductSlide>
  );
}

function ApplicationSlide() {
  return (
    <MascotProductSlide
      kicker="1 of 5 · Application"
      title="Build your application."
      body="Pick the questions and steps families fill out."
      lane="left"
      mascot={{ name: "pip", view: "point" }}
      tip="Pip here. Keep it short!"
      background="#FFF3CF"
      contentHeight={DEMO_HEIGHT}
      crop={APPLICATION_CROP}
    >
      <MarketingEnrollmentFlowsDemoWindow initialFlowSelection={MARKETING_DEMO_APPLY_FLOW_SELECTION} contentHeight={DEMO_HEIGHT} />
    </MascotProductSlide>
  );
}

function VisitsSlide() {
  return (
    <MascotProductSlide
      kicker="2 of 5 · Visits"
      title="Let families book a visit."
      body="Post tour times. Families pick one."
      lane="right"
      mascot={{ name: "terra", view: "wave", flip: true }}
      tip="Terra here. No more back-and-forth emails."
      background="#EEF5E9"
      contentHeight={DEMO_HEIGHT}
      crop={VISITS_CROP}
    >
      <MarketingScheduleToursDemoWindow contentHeight={DEMO_HEIGHT} />
    </MascotProductSlide>
  );
}

function ChecklistSlide() {
  return (
    <MascotProductSlide
      kicker="3 of 5 · Checklist"
      title="Make your enrollment checklist."
      body="Agreements, forms, uploads, sign-offs and payments."
      lane="left"
      mascot={{ name: "bramble", view: "hold" }}
      tip="Bramble here. One list, nothing lost."
      background="#F3EEF8"
      contentHeight={DEMO_HEIGHT}
      crop={CHECKLIST_CROP}
    >
      <MarketingEnrollmentFlowsDemoWindow initialFlowSelection={MARKETING_DEMO_CHECKLIST_FLOW_SELECTION} wrapOutlineLabels contentHeight={DEMO_HEIGHT} />
    </MascotProductSlide>
  );
}

function PreviewSlide() {
  return (
    <MascotProductSlide
      kicker="4 of 5 · Preview"
      title="See it the way families will."
      body="Preview the checklist before you send it."
      lane="right"
      mascot={{ name: "pip", view: "peek", flip: true }}
      tip="Looks clear to me!"
      background="#FFF3CF"
      contentHeight={DEMO_HEIGHT}
      crop={PREVIEW_CROP}
    >
      <GardenEnrollmentChecklistWindow contentHeight={DEMO_HEIGHT} />
    </MascotProductSlide>
  );
}

function TuitionSlide() {
  return (
    <MascotProductSlide
      kicker="5 of 5 · Tuition"
      title="Set up tuition."
      body="Rates, fees and payment options, before the first bill."
      lane="left"
      mascot={{ name: "nutmeg", view: "point" }}
      tip="Nutmeg here. Bills go out on time."
      background="#F8EDE4"
      contentHeight={DEMO_HEIGHT}
      crop={TUITION_CROP}
    >
      <MarketingTuitionDemoWindow initialDashboardTab="catalog" initialRateCatalogTab="tuition_rates" contentHeight={DEMO_HEIGHT} />
    </MascotProductSlide>
  );
}

function PromoSlide() {
  return (
    <MascotPromoSlide
      title="Set it up once. Families always know the next step."
      body="Application, visits, enrollment and tuition stay connected."
      cast={[{ name: "dig", view: "celebrate" }, { name: "pip", view: "wave", flip: true }]}
      contentHeight={DEMO_HEIGHT}
    >
      <GardenParentHomeWindow contentHeight={DEMO_HEIGHT} />
    </MascotPromoSlide>
  );
}
