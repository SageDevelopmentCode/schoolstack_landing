"use client";

import {
  MarketingStudentsDemoWindow,
  MarketingTuitionDemoWindow,
} from "@/components/admin/marketing/screens/marketing-demo-windows";
import { GardenParentBillingWindow } from "@/components/admin/marketing/screens/marketing-garden-demo-windows";
import type { MarketingCarousel, MarketingSlide } from "@/components/admin/marketing/carousels/types";
import {
  Accent,
  FONT,
  G,
  MascotListSlide,
  MascotProductSlide,
  MascotPromoSlide,
} from "@/components/admin/marketing/mascot/mascot-slide-kit";

// Nutmeg (tuition) guides the five-number tuition check; Pip (enrollment) drops in for the head count.

const HOOK_NUMBERS = ["What it costs", "Who will pay", "Room above break-even", "What tuition covers", "Discounts you can afford"];

const COST_ROWS = ["Payroll", "Rent", "Insurance", "Supplies", "Software", "Field trips & programs"];

const EXAMPLE_ROWS: Array<{ label: string; value: string; color: string }> = [
  { label: "Yearly costs", value: "$180,000", color: G.clay },
  { label: "Other income (grants, fundraising)", value: "−$18,000", color: "#4A7C59" },
  { label: "Savings cushion (10%)", value: "+$18,000", color: G.clay },
  { label: "Students who pay", value: "÷ 20", color: G.ink },
];

const CHECKLIST = [
  { label: "What it really costs", detail: "Including the surprise costs" },
  { label: "Who will actually pay", detail: "Not every empty seat" },
  { label: "Room above break-even", detail: "A cushion for the unexpected" },
  { label: "What tuition covers", detail: "Included, optional or extra" },
  { label: "Discounts you can afford", detail: "Siblings, scholarships, payment plans" },
];

const DEMO_HEIGHT = 920;

export const TUITION_REVIEW_CAROUSEL = {
  id: "tuition-review",
  title: "Thinking about raising tuition?",
  description: "LinkedIn carousel for schools planning a tuition increase, guided by Nutmeg.",
  fileSlug: "mudkitchen-tuition-review",
  slides: [
    { id: "intro", fileName: "01-pressure-test-these-5-numbers.png", render: () => <CoverSlide /> },
    { id: "costs", fileName: "02-operating-costs.png", render: () => <CostsSlide /> },
    { id: "enrollment", fileName: "03-realistic-paid-enrollment.png", render: () => <EnrollmentSlide /> },
    { id: "margin", fileName: "04-sustainable-margin.png", render: () => <MarginSlide /> },
    { id: "included", fileName: "05-included-vs-separate.png", render: () => <IncludedSlide /> },
    { id: "options", fileName: "06-discounts-and-payment-terms.png", render: () => <OptionsSlide /> },
    { id: "close", fileName: "07-save-this.png", render: () => <SaveSlide /> },
    { id: "promo", fileName: "08-clear-family-billing.png", render: () => <HomePromoSlide /> },
  ] satisfies MarketingSlide[],
} satisfies MarketingCarousel;

function CoverSlide() {
  return (
    <MascotListSlide
      kicker="Tuition check"
      title={
        <>
          Thinking about raising tuition at your <Accent>Microschool?</Accent>
        </>
      }
      body="Check these 5 numbers first. A full class can still leave you short."
      rows={HOOK_NUMBERS.map((label) => ({ label }))}
      mascot={{ name: "nutmeg", view: "thinking" }}
      tip="I'm Nutmeg. Let's do the math together."
      background="#FFF3CF"
      headlineSize={72}
    />
  );
}

function CostsSlide() {
  return (
    <MascotListSlide
      kicker="1 of 5"
      title="Add up what it really costs to run your school."
      rows={COST_ROWS.map((label) => ({ label }))}
      aside="and the surprise costs: repairs, turnover, new supplies"
      mascot={{ name: "nutmeg", view: "hold" }}
      tip="Start with last year's real spending."
    />
  );
}

function EnrollmentSlide() {
  return (
    <MascotProductSlide
      kicker="2 of 5"
      title="Count the students who will actually pay."
      body="Use enrolled and re-enrolled families, plus a careful guess. Not every empty seat."
      lane="left"
      mascot={{ name: "pip", view: "point" }}
      tip="Pip here. Count signed families only!"
      contentHeight={DEMO_HEIGHT}
    >
      <MarketingStudentsDemoWindow contentHeight={DEMO_HEIGHT} />
    </MascotProductSlide>
  );
}

function MarginSlide() {
  return (
    <MascotListSlide
      kicker="3 of 5"
      title="Leave room above break-even."
      body="Build in a cushion for surprises, growth and savings."
      mascot={{ name: "nutmeg", view: "determined" }}
      tip="Break-even is not a plan."
    >
      <div style={{ background: G.paper, borderRadius: 28, border: `4px solid ${G.ink}`, boxShadow: `0 10px 0 ${G.ink}`, overflow: "hidden" }}>
        <p style={{ margin: 0, padding: "22px 28px 4px", fontFamily: FONT.body, fontSize: 20, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: G.clayDeep }}>
          Example
        </p>
        {EXAMPLE_ROWS.map((row) => (
          <div
            key={row.label}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, minHeight: 82, padding: "0 28px", borderBottom: "2px dashed #E1D3BF" }}
          >
            <span style={{ fontFamily: FONT.body, fontWeight: 700, fontSize: 27, lineHeight: 1.2, color: G.soft }}>{row.label}</span>
            <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 34, color: row.color, whiteSpace: "nowrap" }}>{row.value}</span>
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, padding: "26px 28px", background: G.forest }}>
          <span style={{ fontFamily: FONT.body, fontWeight: 800, fontSize: 28, color: G.cream }}>Tuition per student</span>
          <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 48, color: G.butter, whiteSpace: "nowrap" }}>$9,000</span>
        </div>
      </div>
    </MascotListSlide>
  );
}

function IncludedSlide() {
  return (
    <MascotProductSlide
      kicker="4 of 5"
      title="Spell out what tuition covers."
      body="Meals, materials, field trips, after-care, fees: included, optional or extra?"
      lane="right"
      mascot={{ name: "nutmeg", view: "point" }}
      tip="No surprise bills for families."
      contentHeight={DEMO_HEIGHT}
    >
      <MarketingTuitionDemoWindow initialDashboardTab="families" contentHeight={DEMO_HEIGHT} />
    </MascotProductSlide>
  );
}

function OptionsSlide() {
  return (
    <MascotProductSlide
      kicker="5 of 5"
      title="Decide which discounts you can afford."
      body="Sibling discounts, scholarships and payment plans lower what you collect. Plan for them first."
      lane="left"
      mascot={{ name: "nutmeg", view: "thinking" }}
      tip="Every discount comes out of the budget."
      background="#F8EDE4"
      contentHeight={DEMO_HEIGHT}
    >
      <MarketingTuitionDemoWindow
        initialDashboardTab="families"
        initialFamilyId="family-rivera"
        initialOpenAdjust={{ familyId: "family-rivera", assignmentId: "assignment-rivera", studentName: "Emma Rivera" }}
        contentHeight={DEMO_HEIGHT}
      />
    </MascotProductSlide>
  );
}

function SaveSlide() {
  return (
    <MascotListSlide
      kicker="Save this"
      title={
        <>
          Before your next <Accent>tuition review</Accent>
        </>
      }
      rows={CHECKLIST}
      aside="share the plan before you share the number"
      mascot={{ name: "nutmeg", view: "thumbs" }}
      background="#FFF3CF"
    />
  );
}

function HomePromoSlide() {
  return (
    <MascotPromoSlide
      title="Turn your tuition plan into clear family bills."
      body="Rates, payment plans, discounts and family payments in one place."
      cast={[{ name: "nutmeg", view: "celebrate" }, { name: "pip", view: "wave", flip: true }]}
      contentHeight={DEMO_HEIGHT}
    >
      <GardenParentBillingWindow contentHeight={DEMO_HEIGHT} />
    </MascotPromoSlide>
  );
}
