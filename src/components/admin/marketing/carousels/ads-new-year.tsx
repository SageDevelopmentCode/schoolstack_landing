"use client";

import type { MarketingCarousel, MarketingSlide } from "@/components/admin/marketing/carousels/types";
import {
  Accent,
  AdCopy,
  AdFooter,
  AdFrame,
  BERRY,
  CheckList,
  Crew,
  FONT,
  G,
  Hand,
  InkCard,
  NotificationCard,
  PaperSheet,
  Pin,
  Scene,
  StickyNote,
} from "@/components/admin/marketing/ads/ad-kit";
import { BrowserTab } from "@/components/admin/marketing/mascot/mascot-slide-kit";
import type { MascotName, MascotView } from "@/components/admin/marketing/mascot/Mascot";
import { WORKFLOW_COPY } from "@/components/home/home-copy";

// Set F: January. Rotates in after the holiday set ends (refresh creative every 3–6 weeks).

export const ADS_NEW_YEAR_CAROUSEL = {
  id: "ads-new-year",
  title: "Ads: New year (6)",
  description: "January single ads: new year, one system. Offer chip can be switched off. Feed + story.",
  fileSlug: "mudkitchen-ads-new-year",
  kind: "ad",
  offerToggle: true,
  sizes: ["feed", "story"],
  slides: [
    {
      id: "same-tabs",
      fileName: "ad-f1-dig-same-tabs.png",
      render: () => <SameTabsAd />,
      adCopy: {
        primaryText:
          "Microschool directors: new year, same six tabs? MudKitchen puts enrollment, tuition, messages and attendance in one place. Book a demo, start a paid plan within 30 days, and get a $200 Amazon gift card. Terms apply.",
        headline: "Not this year, tabs",
        description: "One system for your microschool.",
      },
    },
    {
      id: "year-calling",
      fileName: "ad-f2-crew-2027-calling.png",
      render: () => <YearCallingAd />,
      adCopy: {
        primaryText:
          "2027 called. It wants one system for your school: website, enrollment, tuition and families together. Book a MudKitchen demo, start a paid plan within 30 days, and get a $200 Amazon gift card. Terms apply.",
        headline: "2027 wants one system",
        description: "Built for microschools.",
      },
    },
    {
      id: "spring-organized",
      fileName: "ad-f3-pip-spring-organized.png",
      render: () => <SpringOrganizedAd />,
      adCopy: {
        primaryText:
          "Start spring semester organized: applications open, forms online, tuition plans set and families invited, all from one place. Book a MudKitchen demo, start a paid plan within 30 days, and get a $200 Amazon gift card. Terms apply.",
        headline: "Spring semester, organized",
        description: "Enrollment for microschools.",
      },
    },
    {
      id: "tuition-run",
      fileName: "ad-f4-nutmeg-tuition-run.png",
      render: () => <TuitionRunAd />,
      adCopy: {
        primaryText:
          "Your January tuition run, minus the reminder texts. Families set up autopay once and see every bill in one place. Book a MudKitchen demo, start a paid plan within 30 days, and get a $200 Amazon gift card. Terms apply.",
        headline: "January tuition, minus the reminders",
        description: "Billing for microschools.",
      },
    },
    {
      id: "zero-slips",
      fileName: "ad-f5-bramble-zero-slips.png",
      render: () => <ZeroSlipsAd />,
      adCopy: {
        primaryText:
          "The one resolution you'll actually keep: zero paper permission slips. Families fill in and sign forms online. Book a MudKitchen demo, start a paid plan within 30 days, and get a $200 Amazon gift card. Terms apply.",
        headline: "Resolution kept: no paper slips",
        description: "Online forms and signatures.",
      },
    },
    {
      id: "setup-crew",
      fileName: "ad-f6-setup-crew-ready.png",
      render: () => <SetupReadyAd />,
      adCopy: {
        primaryText:
          "Switching systems doesn't mean starting over. We review how your school runs, build your setup inside MudKitchen and help you go live. Book a demo, start a paid plan within 30 days, and get a $200 Amazon gift card. Terms apply.",
        headline: "Guided setup, when you're ready",
        description: "Built for founder-led microschools.",
      },
    },
  ] satisfies MarketingSlide[],
} satisfies MarketingCarousel;

// ---------------------------------------------------------------- shared

const CONFETTI = Array.from({ length: 22 }, (_, i) => {
  const r = (n: number) => ((Math.sin(i * 57.3 + n * 91.1) * 10000) % 1 + 1) % 1;
  return { x: 4 + r(1) * 92, y: 2 + r(2) * 40, w: 12 + r(3) * 12, rot: r(4) * 180, c: [G.butter, G.peach, "#8DBF7A", "#7FB3D5", BERRY][i % 5] };
});

function Confetti() {
  return (
    <>
      {CONFETTI.map((piece, i) => (
        <span
          key={i}
          aria-hidden
          style={{ position: "absolute", left: `${piece.x}%`, top: `${piece.y}%`, width: piece.w, height: piece.w * 0.5, borderRadius: 4, background: piece.c, transform: `rotate(${piece.rot}deg)`, zIndex: 1 }}
        />
      ))}
    </>
  );
}

// ---------------------------------------------------------------- F1

const OLD_TABS = ["Tuition (FINAL)", "Venmo", "Google Form", "Group text", "Binder.pdf", "Who paid??"];

function SameTabsAd() {
  return (
    <AdFrame background={G.cream}>
      <AdCopy
        title={
          <>
            New year. Same six tabs?
            <br />
            <Accent>Not this year.</Accent>
          </>
        }
        size={84}
      />
      <Scene>
        {OLD_TABS.map((tab, i) => (
          <Pin key={tab} left={(i % 3) * 320} top={30 + Math.floor(i / 3) * 100} z={3} rotate={((i * 5) % 7) - 3}>
            <div style={{ position: "relative" }}>
              <BrowserTab label={tab} />
              <span aria-hidden style={{ position: "absolute", left: -8, right: -8, top: "50%", height: 6, marginTop: -3, background: BERRY, borderRadius: 4, transform: "rotate(-6deg)" }} />
            </div>
          </Pin>
        ))}
        <Pin left={-20} bottom={0} z={5}>
          <Crew name="dig" view="determined" width={340} />
        </Pin>
        <Pin right={0} bottom={50} z={6}>
          <StickyNote width={420} rotate={3} color={G.mint}>
            <Hand size={42} color={G.forest} rotate={0}>
              2027: one tab. ✓
            </Hand>
          </StickyNote>
        </Pin>
      </Scene>
      <AdFooter />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- F2

const CALLERS: Array<{ name: MascotName; view: MascotView }> = [
  { name: "terra", view: "excited" },
  { name: "pip", view: "celebrate" },
  { name: "nutmeg", view: "happy" },
  { name: "loam", view: "excited" },
  { name: "dot", view: "wave" },
];

function YearCallingAd() {
  return (
    <AdFrame background={G.forest} tone="dark">
      <AdCopy
        tone="dark"
        title={
          <>
            2027 called.
            <br />
            <Accent color={G.butter}>It wants one system.</Accent>
          </>
        }
        size={92}
      />
      <Scene>
        <Confetti />
        <Pin left="50%" top={30} z={4} style={{ marginLeft: -290 }}>
          <NotificationCard title="Incoming: 2027" sub="Accept: one place to run your school" color={G.forest} rotate={-2} style={{ width: 580 }} />
        </Pin>
        <div style={{ position: "absolute", left: -30, right: -30, bottom: 0, display: "flex", justifyContent: "space-between", alignItems: "flex-end", zIndex: 3 }}>
          {CALLERS.map((member) => (
            <Crew key={member.name} name={member.name} view={member.view} width={200} />
          ))}
        </div>
      </Scene>
      <AdFooter tone="dark" />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- F3

function SpringOrganizedAd() {
  return (
    <AdFrame background={G.mint}>
      <AdCopy
        title={
          <>
            Spring semester starts <Accent>organized.</Accent>
          </>
        }
        size={92}
      />
      <Scene>
        <Pin left={0} top={30} z={4}>
          <InkCard width={640} rotate={-2}>
            <p style={{ margin: "0 0 20px", fontFamily: FONT.display, fontWeight: 800, fontSize: 40, color: G.forest }}>Before the first bell</p>
            <CheckList
              rows={[
                { label: "Applications open", done: true },
                { label: "Enrollment forms online", done: true },
                { label: "Tuition plans set", done: true },
                { label: "Families invited", done: true },
              ]}
            />
          </InkCard>
        </Pin>
        <Pin right={-40} bottom={0} z={5}>
          <Crew name="pip" view="celebrate" width={340} flip />
        </Pin>
      </Scene>
      <AdFooter />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- F4

function TuitionRunAd() {
  return (
    <AdFrame background="#F3EEF8">
      <AdCopy
        title={
          <>
            Your January tuition run, <Accent>minus the reminders.</Accent>
          </>
        }
        size={80}
      />
      <Scene>
        <Pin left={0} top={30} z={3}>
          <InkCard width={470} rotate={-3} bg="#FFFDF8" style={{ padding: "26px 32px" }}>
            <p style={{ margin: "0 0 12px", fontFamily: FONT.body, fontWeight: 800, fontSize: 22, letterSpacing: "0.12em", color: G.soft }}>NOT THIS JANUARY</p>
            {["Reminder #1", "Reminder #2 (gentle)", "“just checking in!”"].map((line) => (
              <p key={line} style={{ margin: "8px 0", fontFamily: FONT.hand, fontSize: 38, color: BERRY, textDecoration: "line-through", textDecorationThickness: 3 }}>
                {line}
              </p>
            ))}
          </InkCard>
        </Pin>
        <Pin right={0} top={250} z={5}>
          <NotificationCard title="January tuition: paid" sub="Autopay · on time" color={G.forest} rotate={2} />
        </Pin>
        <Pin left={60} bottom={0} z={4}>
          <Crew name="nutmeg" view="love" width={320} />
        </Pin>
      </Scene>
      <AdFooter />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- F5

function PaperBin() {
  return (
    <div aria-hidden style={{ position: "relative", width: 300, height: 330 }}>
      <div style={{ position: "absolute", left: 30, top: 0, transform: "rotate(-14deg)", zIndex: 1 }}>
        <PaperSheet label="Slip" width={130} />
      </div>
      <div style={{ position: "absolute", left: 130, top: -20, transform: "rotate(10deg)", zIndex: 1 }}>
        <PaperSheet width={130} tint="#FFFDF4" />
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 230,
          background: "#9DB4C0",
          border: `4px solid ${G.ink}`,
          borderRadius: "10px 10px 26px 26px",
          clipPath: "polygon(0 0, 100% 0, 90% 100%, 10% 100%)",
          zIndex: 2,
        }}
      />
      <div style={{ position: "absolute", left: -10, right: -10, bottom: 222, height: 24, background: "#7E98A6", border: `4px solid ${G.ink}`, borderRadius: 12, zIndex: 3 }} />
    </div>
  );
}

function ZeroSlipsAd() {
  return (
    <AdFrame background={G.butter}>
      <AdCopy
        title={
          <>
            Resolution kept:
            <br />
            <Accent>zero paper permission slips.</Accent>
          </>
        }
        size={80}
      />
      <Scene>
        <Pin left={20} bottom={0} z={3}>
          <PaperBin />
        </Pin>
        <Pin left={340} bottom={0} z={5}>
          <Crew name="bramble" view="celebrate" width={320} />
        </Pin>
        <Pin right={0} top={40} z={6}>
          <StickyNote width={330} rotate={4} color="#FFFFFF">
            <Hand size={40} color={G.forest} rotate={0}>
              signed online ✓
              <br />
              filed itself ✓
            </Hand>
          </StickyNote>
        </Pin>
      </Scene>
      <AdFooter />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- F6

function SetupReadyAd() {
  return (
    <AdFrame background={G.sky}>
      <AdCopy
        title={
          <>
            Your setup crew is <Accent>ready when you are.</Accent>
          </>
        }
        hand="no starting over. promise."
        size={84}
      />
      <Scene>
        <Pin left={0} top={20} z={4}>
          <InkCard width={600} rotate={-2} style={{ padding: "26px 32px" }}>
            {WORKFLOW_COPY.steps.map((step) => (
              <div key={step.number} style={{ display: "flex", gap: 16, alignItems: "baseline", padding: "8px 0" }}>
                <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 30, color: G.clay }}>{step.number}</span>
                <span style={{ fontFamily: FONT.body, fontWeight: 800, fontSize: 30, lineHeight: 1.2, color: G.ink }}>{step.title}</span>
              </div>
            ))}
          </InkCard>
        </Pin>
        <div style={{ position: "absolute", right: -40, bottom: 0, display: "flex", alignItems: "flex-end", zIndex: 5 }}>
          <Crew name="terra" view="determined" width={220} />
          <Crew name="dig" view="wave" width={250} flip />
        </div>
      </Scene>
      <AdFooter />
    </AdFrame>
  );
}
