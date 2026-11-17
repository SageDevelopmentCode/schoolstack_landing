"use client";

import type { MarketingCarousel, MarketingSlide } from "@/components/admin/marketing/carousels/types";
import { GardenParentBillingWindow } from "@/components/admin/marketing/screens/marketing-garden-demo-windows";
import {
  Accent,
  At,
  G,
  Hand,
  Headline,
  Kicker,
  MascotOutroSlide,
  MascotProductSlide,
  MascotSlide,
  NotificationCard,
  PlacedMascot,
  RealCopyNote,
  SpeechBubble,
  StickyNote,
  SwipeHint,
} from "@/components/admin/marketing/mascot/mascot-slide-kit";

// Jokes are original; product facts are word for word from product-preview-tabs.ts,
// download-app-slides.ts and the sample notifications in FloatingStickers.tsx.

export const MASCOT_NUTMEG_TUITION_CAROUSEL = {
  id: "mascot-nutmeg-tuition",
  title: "Nutmeg rehearses the tuition reminder (Tuition)",
  description: "Mascot carousel: Nutmeg dreads chasing tuition, then shows the real tuition dashboard and family billing.",
  fileSlug: "mudkitchen-nutmeg-tuition",
  slides: [
    { id: "hook", fileName: "01-rehearsing-the-reminder.png", render: () => <HookSlide /> },
    { id: "said", fileName: "02-things-nutmeg-has-said.png", render: () => <SaidSlide /> },
    { id: "turn", fileName: "03-what-if-it-just-happened.png", render: () => <TurnSlide /> },
    { id: "dashboard", fileName: "04-tuition-in-one-place.png", render: () => <DashboardSlide /> },
    { id: "phones", fileName: "05-autopay-set-it-once.png", render: () => <PhonesSlide /> },
    { id: "love", fileName: "06-autopay-love-language.png", render: () => <LoveSlide /> },
    { id: "outro", fileName: "07-nutmeg-retired-the-script.png", render: () => <OutroSlide /> },
  ] satisfies MarketingSlide[],
} satisfies MarketingCarousel;

function HookSlide() {
  return (
    <MascotSlide background="#FDEBDD">
      <div style={{ position: "absolute", left: 72, right: 72, top: 128, zIndex: 5 }}>
        <Kicker bg={G.paper}>Every school owner, the day tuition is late</Kicker>
        <Headline size={78} style={{ marginTop: 22 }}>
          Nutmeg rehearsing <Accent>the reminder</Accent> in the mirror
        </Headline>
      </div>
      <At x={560} y={560} z={6}>
        <StickyNote color="#FFFFFF" width={440} rotate={5} tape>
          <Hand size={26} color={G.soft} rotate={0}>
            draft 7
          </Hand>
          <p style={{ margin: "10px 0 0", fontFamily: "var(--font-sf-hand), cursive", fontSize: 46, lineHeight: 1.15, color: G.ink }}>
            hi!! no pressure!!
            <br />
            just checking in!!!
            <br />
            <span style={{ textDecoration: "line-through", color: G.clay }}>you owe us</span> :)
          </p>
        </StickyNote>
      </At>
      <PlacedMascot name="nutmeg" view="oops" width={540} x={40} y={640} z={4} />
      <SwipeHint />
    </MascotSlide>
  );
}

const SAID = [
  "just floating this to the top of your inbox!",
  "per my last email (affectionate)",
  "no rush!! (there is a rush)",
  "friendly reminder that this is a friendly reminder",
];

function SaidSlide() {
  return (
    <MascotSlide background="#FFF6D6">
      <div style={{ position: "absolute", left: 72, right: 72, top: 110 }}>
        <Headline size={60}>
          Things Nutmeg has said instead of <Accent>&ldquo;please pay tuition&rdquo;</Accent>
        </Headline>
      </div>
      {SAID.map((line, i) => (
        <At key={line} x={i % 2 ? 300 : 70} y={340 + i * 168} rotate={i % 2 ? 1.5 : -1.5} z={4}>
          <SpeechBubble tail={i % 2 ? "bottom-right" : "bottom-left"} size={38} width={700}>
            {line}
          </SpeechBubble>
        </At>
      ))}
      <PlacedMascot name="nutmeg" view="cheeky" width={330} x={-10} y={1010} z={5} />
      <Hand size={36} color={G.clayDeep} rotate={-4} style={{ position: "absolute", right: 70, bottom: 70, zIndex: 6 }}>
        nutmeg is very polite. it&rsquo;s a problem.
      </Hand>
    </MascotSlide>
  );
}

function TurnSlide() {
  return (
    <MascotSlide background={G.mint}>
      <div style={{ position: "absolute", left: 72, right: 72, top: 150, zIndex: 5 }}>
        <Headline size={120} color={G.forest}>
          wait&hellip;
        </Headline>
        <Headline size={66} style={{ marginTop: 20 }}>
          what if the reminder just&hellip; <Accent>happened?</Accent>
        </Headline>
      </div>
      <PlacedMascot name="nutmeg" view="surprised" width={620} x={230} y={620} z={4} />
      <Hand size={38} color={G.forest} rotate={-3} style={{ position: "absolute", left: 76, top: 470, zIndex: 6 }}>
        (the cap pops off when nutmeg gets ideas. it does that.)
      </Hand>
      <SwipeHint text="here's how →" />
    </MascotSlide>
  );
}

const DEMO_HEIGHT = 920;

function DashboardSlide() {
  return (
    <MascotProductSlide
      kicker="Tuition & Billing"
      title={
        <>
          What families see. <Accent>Nutmeg&rsquo;s new favorite screen.</Accent>
        </>
      }
      note="Families view invoices, make payments, and track tuition history in one place."
      noteAt={{ x: 620, y: 930, rotate: 3, width: 400 }}
      mascot={{ name: "nutmeg", view: "point", width: 380, x: -30, y: 880 }}
      windowTop={340}
      contentHeight={DEMO_HEIGHT}
      crop={{ zoom: 1.15, originX: 0, originY: 0 }}
    >
      <GardenParentBillingWindow contentHeight={DEMO_HEIGHT} />
    </MascotProductSlide>
  );
}

function PhonesSlide() {
  return (
    <MascotProductSlide
      kicker="Autopay"
      title={
        <>
          Set it once. <Accent>Nutmeg cried a little.</Accent>
        </>
      }
      note="See balances, pay tuition, and manage autopay in one place."
      background="#F3EEF8"
      noteAt={{ x: 60, y: 990, rotate: -3, width: 390 }}
      mascot={{ name: "nutmeg", view: "tears", width: 330, x: 720, y: 960 }}
      contentHeight={DEMO_HEIGHT}
      crop={{ zoom: 1.45, originX: 1, originY: 0.08 }}
    >
      <GardenParentBillingWindow contentHeight={DEMO_HEIGHT} />
    </MascotProductSlide>
  );
}

function LoveSlide() {
  return (
    <MascotSlide background="#FBE6E2">
      <div style={{ position: "absolute", left: 72, right: 72, top: 130, zIndex: 5 }}>
        <Headline size={96}>
          autopay is my <Accent>love language</Accent>
        </Headline>
        <Hand size={40} color={G.soft} rotate={-2} style={{ marginTop: 18 }}>
          &mdash; nutmeg, probably on a mug soon
        </Hand>
      </div>
      <PlacedMascot name="nutmeg" view="love" width={520} x={30} y={620} z={4} />
      <At x={560} y={640} rotate={-3} z={6}>
        <NotificationCard title="Tuition paid" sub="October · autopay" color="#059669" />
      </At>
      <At x={540} y={800} rotate={2} z={6}>
        <NotificationCard title="Payment received" sub="Paid on time" color="#059669" />
      </At>
      <At x={580} y={960} rotate={-1} z={6}>
        <NotificationCard title="Invoice sent" sub="November tuition" color="#7C3AED" />
      </At>
    </MascotSlide>
  );
}

function OutroSlide() {
  return <MascotOutroSlide name="nutmeg" view="wink" lead="Nutmeg retired" accent="the script." aside="draft 8 was never needed" />;
}
