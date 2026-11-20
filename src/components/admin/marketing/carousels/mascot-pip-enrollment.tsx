"use client";

import type { MarketingCarousel, MarketingSlide } from "@/components/admin/marketing/carousels/types";
import {
  GardenAdmissionsWindow,
  GardenEnrollmentChecklistWindow,
  GardenParentApplyWindow,
} from "@/components/admin/marketing/screens/marketing-garden-demo-windows";
import { Mascot, type MascotView } from "@/components/admin/marketing/mascot/Mascot";
import {
  Accent,
  At,
  G,
  Hand,
  Headline,
  MascotOutroSlide,
  MascotProductSlide,
  MascotSlide,
  PaperSheet,
  PlacedMascot,
  SpeechBubble,
  SwipeHint,
} from "@/components/admin/marketing/mascot/mascot-slide-kit";

// Jokes are original; product facts on the sticky notes are word for word from
// src/lib/marketing/product-preview-tabs.ts and get-started-showcase-slides.ts.

export const MASCOT_PIP_ENROLLMENT_CAROUSEL = {
  id: "mascot-pip-enrollment",
  title: "Pip has seen things (Enrollment)",
  description: "Mascot carousel: Pip survives enrollment season, then shows the real apply, inbox and checklist screens.",
  fileSlug: "mudkitchen-pip-enrollment",
  slides: [
    { id: "hook", fileName: "01-pov-already-sent-the-form.png", render: () => <HookSlide /> },
    { id: "stages", fileName: "02-five-stages-of-enrollment-season.png", render: () => <StagesSlide /> },
    { id: "turn", fileName: "03-what-if.png", render: () => <TurnSlide /> },
    { id: "apply", fileName: "04-families-apply-in-one-place.png", render: () => <ApplySlide /> },
    { id: "inbox", fileName: "05-one-inbox.png", render: () => <InboxSlide /> },
    { id: "checklist", fileName: "06-families-see-whats-left.png", render: () => <ChecklistSlide /> },
    { id: "outro", fileName: "07-enrollment-season-but-calm.png", render: () => <OutroSlide /> },
  ] satisfies MarketingSlide[],
} satisfies MarketingCarousel;

const FLYING_FORMS: { x: number; y: number; r: number; w: number; label?: string; tint?: string }[] = [
  { x: 60, y: 560, r: -18, w: 150, label: "Form" },
  { x: 820, y: 520, r: 14, w: 160, label: "Form v2", tint: "#FFF7DA" },
  { x: 40, y: 860, r: 10, w: 140, tint: "#F3F7FF" },
  { x: 880, y: 820, r: -12, w: 140, label: "Final" },
  { x: 250, y: 470, r: 8, w: 120, tint: "#FDF0EA" },
  { x: 700, y: 420, r: -6, w: 120, label: "Final2" },
  { x: 900, y: 1080, r: 20, w: 120, tint: "#F1FAEC" },
  { x: 30, y: 1100, r: -8, w: 120, label: "??" },
];

function HookSlide() {
  return (
    <MascotSlide background="#FFF3CF">
      <div style={{ position: "absolute", left: 72, right: 72, top: 128, zIndex: 5 }}>
        <Headline size={78}>
          It&rsquo;s August. 14 families say they <Accent>&ldquo;already sent the form.&rdquo;</Accent>
        </Headline>
      </div>
      {FLYING_FORMS.map((f, i) => (
        <At key={i} x={f.x} y={f.y} rotate={0} z={2}>
          <PaperSheet width={f.w} rotate={f.r} label={f.label} tint={f.tint} />
        </At>
      ))}
      <PlacedMascot name="pip" view="oops" width={560} x={260} y={600} z={4} />
      <Hand size={44} color={G.clayDeep} rotate={-5} style={{ position: "absolute", left: 70, bottom: 60, zIndex: 6 }}>
        pip has seen things.
      </Hand>
      <SwipeHint />
    </MascotSlide>
  );
}

const STAGES: { label: string; aside: string; view: MascotView; tint: string }[] = [
  { label: "Optimism", aside: "“this year we’ll be so organized”", view: "happy", tint: "#FFF3CF" },
  { label: "The spreadsheet", aside: "tab 14 of 31", view: "thinking", tint: "#E3EDFB" },
  { label: "“Did you get my email?”", aside: "(they did not)", view: "surprised", tint: "#F8DDCF" },
  { label: "Chasing signatures at 10pm", aside: "pip is fine. pip is fine.", view: "sleepy", tint: "#ECE2F3" },
  { label: "Acceptance", aside: "*stares at the stack*", view: "tears", tint: "#DDEBD5" },
];

function StagesSlide() {
  return (
    <MascotSlide>
      <div style={{ position: "absolute", left: 72, right: 72, top: 110 }}>
        <Headline size={64}>
          The 5 stages of <Accent>enrollment season</Accent>
        </Headline>
      </div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 280, display: "flex", flexDirection: "column", gap: 14 }}>
        {STAGES.map((s, i) => (
          <div
            key={s.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 22,
              height: 190,
              padding: "0 28px 0 12px",
              background: s.tint,
              borderRadius: 30,
              transform: `rotate(${i % 2 ? 0.8 : -0.8}deg)`,
              flexDirection: i % 2 ? "row-reverse" : "row",
            }}
          >
            <Mascot name="pip" view={s.view} width={170} ground={false} />
            <div style={{ flex: 1, minWidth: 0, textAlign: i % 2 ? "right" : "left" }}>
              <p style={{ margin: 0, fontFamily: "var(--font-sf-display), sans-serif", fontWeight: 800, fontSize: 24, color: G.clayDeep, letterSpacing: "0.08em" }}>
                STAGE {i + 1}
              </p>
              <Headline size={46} style={{ marginTop: 4 }}>
                {s.label}
              </Headline>
              <Hand size={32} color={G.soft} rotate={0} style={{ marginTop: 6 }}>
                {s.aside}
              </Hand>
            </div>
          </div>
        ))}
      </div>
    </MascotSlide>
  );
}

function TurnSlide() {
  return (
    <MascotSlide background={G.sky}>
      <At x={120} y={170} z={5}>
        <SpeechBubble tail="bottom-right" size={64} width={840}>
          ok but what if&hellip; it <Accent>didn&rsquo;t</Accent> have to be like this?
        </SpeechBubble>
      </At>
      <PlacedMascot name="pip" view="curious" width={640} x={230} y={560} z={4} />
      <Hand size={40} color={G.forest} rotate={6} style={{ position: "absolute", left: 80, top: 640, zIndex: 6 }}>
        (spoiler: it doesn&rsquo;t.)
      </Hand>
      <SwipeHint text="here's how →" />
    </MascotSlide>
  );
}

const DEMO_HEIGHT = 920;

function ApplySlide() {
  return (
    <MascotProductSlide
      kicker="Step 1 · Apply"
      title="Families apply online, in one place."
          aside="pip supervises."
      note="Families add health info, emergency contacts, documents, and signatures."
      noteAt={{ x: 620, y: 950, rotate: 3, width: 400 }}
      mascot={{ name: "pip", view: "point", width: 380, x: -40, y: 900 }}
      contentHeight={DEMO_HEIGHT}
      crop={{ zoom: 1.2, originX: 0, originY: 0 }}
    >
      <GardenParentApplyWindow contentHeight={DEMO_HEIGHT} />
    </MascotProductSlide>
  );
}

function InboxSlide() {
  return (
    <MascotProductSlide
      kicker="Step 2 · Review"
      title="Every application in one inbox."
          aside="no more “which email was it in?”"
      note="See every family’s status and next step at a glance."
      background="#F3EEF8"
      noteAt={{ x: 60, y: 980, rotate: -3, width: 380 }}
      mascot={{ name: "pip", view: "thumbs", width: 360, x: 700, y: 900 }}
      contentHeight={DEMO_HEIGHT}
      crop={{ zoom: 1.22, originX: 0, originY: 0 }}
    >
      <GardenAdmissionsWindow contentHeight={DEMO_HEIGHT} />
    </MascotProductSlide>
  );
}

function ChecklistSlide() {
  return (
    <MascotProductSlide
      kicker="Step 3 · Enroll"
      title="Families can see what’s left to do."
          aside="pip sleeps at night now."
      note="Families see forms, agreements, and payments still due."
      background="#EEF5E9"
      noteAt={{ x: 630, y: 960, rotate: 4, width: 390 }}
      mascot={{ name: "pip", view: "sit", width: 360, x: 0, y: 940 }}
      contentHeight={DEMO_HEIGHT}
      crop={{ zoom: 1.35, originX: 0, originY: 0 }}
    >
      <GardenEnrollmentChecklistWindow contentHeight={DEMO_HEIGHT} />
    </MascotProductSlide>
  );
}

function OutroSlide() {
  return <MascotOutroSlide name="pip" view="celebrate" lead="Enrollment season," accent="without the chaos." aside="pip approved this message" />;
}
