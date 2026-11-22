"use client";

import type { MarketingCarousel, MarketingSlide } from "@/components/admin/marketing/carousels/types";
import {
  GardenAdminDashboardWindow,
  GardenAdmissionsWindow,
} from "@/components/admin/marketing/screens/marketing-garden-demo-windows";
import { Mascot, type MascotView } from "@/components/admin/marketing/mascot/Mascot";
import {
  Accent,
  At,
  BrowserTab,
  G,
  Hand,
  Headline,
  MascotOutroSlide,
  MascotProductSlide,
  MascotSlide,
  PlacedMascot,
  SwipeHint,
} from "@/components/admin/marketing/mascot/mascot-slide-kit";

// Jokes are original; product facts are word for word from product-preview-tabs.ts
// and get-started-showcase-slides.ts.

export const MASCOT_DIG_ADMIN_CAROUSEL = {
  id: "mascot-dig-admin",
  title: "Dig has 47 tabs open (Admin Portal)",
  description: "Mascot carousel: Dig drowns in tabs, then shows the Garden admin dashboard and admissions pipeline.",
  fileSlug: "mudkitchen-dig-admin",
  slides: [
    { id: "hook", fileName: "01-dig-has-47-tabs-open.png",
      adCopy: {
        label: "47 tabs",
        primaryText: "Dig has 47 tabs open. forms_FINAL_v3.pdf. tuition (2).xlsx. group chat (99+). 😵\n\nSwipe for the only tab Dig needs now: enrollment, billing and daily tasks in one workspace →\n\n#microschool #schooladmin #schoolfounder",
        headline: "Dig has 47 tabs open",
      },
      adCopyVariants: [
        {
          label: "Tab count",
          primaryText: "Be honest: how many tabs are open for your school right now? Dig's at 47. Swipe to see Dig close them all →\n\n#microschool #schooladmin",
          headline: "How many tabs are you at?",
        },
        {
          label: "Dig's day",
          primaryText: "Dig's day, as planned: coffee, peace, birdsong. Dig's day, as lived: \"someone needs a form,\" \"someone needs a different form,\" lunch (theoretically). ☕ Swipe →\n\n#microschool #founderlife",
          headline: "Coffee. Peace. Birdsong. (Not quite.)",
        },
      ], render: () => <HookSlide /> },
    { id: "day", fileName: "02-a-day-in-the-life.png", render: () => <DaySlide /> },
    { id: "turn", fileName: "03-what-if-one-place.png", render: () => <TurnSlide /> },
    { id: "dashboard", fileName: "04-one-workspace.png", render: () => <DashboardSlide /> },
    { id: "pipeline", fileName: "05-every-application-sorted.png", render: () => <PipelineSlide /> },
    { id: "numbers", fileName: "06-the-numbers-minus-the-spreadsheet.png", render: () => <NumbersSlide /> },
    { id: "outro", fileName: "07-47-tabs-to-1.png", render: () => <OutroSlide /> },
  ] satisfies MarketingSlide[],
} satisfies MarketingCarousel;

const TABS: { label: string; x: number; y: number; r: number; tint?: string }[] = [
  { label: "forms_FINAL_v3.pdf", x: 40, y: 500, r: -6, tint: "#FFF7DA" },
  { label: "tuition (2).xlsx", x: 600, y: 480, r: 5 },
  { label: "group chat (99+)", x: 660, y: 610, r: -4, tint: "#E3EDFB" },
  { label: "inbox (312)", x: 40, y: 630, r: 4 },
  { label: "permission slips", x: 760, y: 750, r: 8, tint: "#FDF0EA" },
  { label: "Untitled spreadsheet", x: 10, y: 770, r: -9 },
  { label: "allergies_NEW_new", x: 720, y: 900, r: -5, tint: "#F1FAEC" },
  { label: "tour signups?", x: 30, y: 920, r: 6, tint: "#ECE2F3" },
  { label: "calendar (old)", x: 780, y: 1050, r: 4 },
  { label: "staff hours ???", x: 20, y: 1070, r: -4, tint: "#FFF7DA" },
];

function HookSlide() {
  return (
    <MascotSlide background="#EAF1F8">
      <div style={{ position: "absolute", left: 72, right: 72, top: 120, zIndex: 5 }}>
        <Headline size={96}>
          Dig has <Accent>47 tabs</Accent> open.
        </Headline>
        <Hand size={46} color={G.forest} rotate={-3} style={{ marginTop: 14 }}>
          every single one is important.
        </Hand>
      </div>
      {TABS.map((t) => (
        <At key={t.label} x={t.x} y={t.y} z={3}>
          <BrowserTab label={t.label} rotate={t.r} tint={t.tint} />
        </At>
      ))}
      <PlacedMascot name="dig" view="oops" width={500} x={290} y={680} z={4} />
      <SwipeHint />
    </MascotSlide>
  );
}

const DAY: { time: string; text: string; view: MascotView }[] = [
  { time: "7:45", text: "coffee. peace. birdsong.", view: "neutral" },
  { time: "7:46", text: "someone needs a form", view: "surprised" },
  { time: "7:47", text: "someone needs a different form", view: "oops" },
  { time: "12:00", text: "lunch (theoretically)", view: "sleepy" },
  { time: "4:59", text: "“quick question”", view: "confused" },
];

function DaySlide() {
  return (
    <MascotSlide>
      <div style={{ position: "absolute", left: 72, right: 72, top: 110 }}>
        <Headline size={64}>
          A day in the life of <Accent>Dig</Accent>
        </Headline>
      </div>
      <div style={{ position: "absolute", left: 72, right: 72, top: 260, display: "flex", flexDirection: "column", gap: 10 }}>
        {DAY.map((d, i) => (
          <div key={d.time} style={{ display: "flex", alignItems: "center", gap: 26, height: 196, borderBottom: i < DAY.length - 1 ? `3px dashed ${G.moss}` : "none" }}>
            <span style={{ width: 170, fontFamily: "var(--font-sf-display), sans-serif", fontWeight: 800, fontSize: 56, color: G.clay, fontVariantNumeric: "tabular-nums" }}>{d.time}</span>
            <Headline size={44} style={{ flex: 1 }}>
              {d.text}
            </Headline>
            <Mascot name="dig" view={d.view} width={160} ground={false} />
          </div>
        ))}
      </div>
    </MascotSlide>
  );
}

function TurnSlide() {
  return (
    <MascotSlide background={G.forest}>
      <div style={{ position: "absolute", left: 72, right: 72, top: 150, zIndex: 5 }}>
        <Hand size={46} color={G.mint} rotate={-3}>
          *closes 46 tabs dramatically*
        </Hand>
        <Headline size={86} color={G.cream} style={{ marginTop: 26 }}>
          what if it all lived in <Accent color={G.butter}>one place?</Accent>
        </Headline>
      </div>
      <PlacedMascot name="dig" view="determined" width={600} x={240} y={600} z={4} />
      <SwipeHint text="here's how →" color={G.butter} />
    </MascotSlide>
  );
}

const DEMO_HEIGHT = 920;

function DashboardSlide() {
  return (
    <MascotProductSlide
      kicker="Admin Portal"
      title="One place to run your school."
          aside="the only tab dig needs now."
      note="Enrollment, billing, and daily tasks in one workspace."
      noteAt={{ x: 630, y: 930, rotate: 3, width: 390 }}
      mascot={{ name: "dig", view: "point", width: 380, x: -30, y: 880 }}
      windowTop={340}
      contentHeight={DEMO_HEIGHT}
      crop={{ zoom: 1.15, originX: 0, originY: 0 }}
    >
      <GardenAdminDashboardWindow contentHeight={DEMO_HEIGHT} />
    </MascotProductSlide>
  );
}

function PipelineSlide() {
  return (
    <MascotProductSlide
      kicker="Admissions"
      title="Applications sorted by stage, automatically."
          aside="no more digging through spreadsheets."
      note="See every family, from first inquiry to enrolled."
      background="#F3EEF8"
      noteAt={{ x: 60, y: 980, rotate: -3, width: 380 }}
      mascot={{ name: "dig", view: "thumbs", width: 360, x: 700, y: 900 }}
      contentHeight={DEMO_HEIGHT}
      crop={{ zoom: 1.15, originX: 0, originY: 0 }}
    >
      <GardenAdmissionsWindow contentHeight={DEMO_HEIGHT} />
    </MascotProductSlide>
  );
}

function NumbersSlide() {
  return (
    <MascotProductSlide
      kicker="At a glance"
      title="Your key numbers on one screen."
          aside="dig has free time now."
      note="Applications, tuition, and messages at a glance."
      background="#EEF5E9"
      noteAt={{ x: 630, y: 990, rotate: 4, width: 380 }}
      mascot={{ name: "dig", view: "sit", width: 340, x: 10, y: 960 }}
      contentHeight={DEMO_HEIGHT}
      crop={{ zoom: 1.35, originX: 0.12, originY: 0.25 }}
    >
      <GardenAdminDashboardWindow contentHeight={DEMO_HEIGHT} />
    </MascotProductSlide>
  );
}

function OutroSlide() {
  return <MascotOutroSlide name="dig" view="sit" lead="47 tabs → 1." accent="Dig took a real lunch break." aside="with a sandwich and everything." />;
}
