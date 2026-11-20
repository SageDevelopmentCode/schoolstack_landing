"use client";

import type { ReactNode } from "react";
import type { MarketingCarousel, MarketingSlide } from "@/components/admin/marketing/carousels/types";
import { useAdOffer } from "@/components/admin/marketing/slide-frame";
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
  PaperSheet,
  Pin,
  Scene,
  StickyNote,
} from "@/components/admin/marketing/ads/ad-kit";
import type { MascotName, MascotView } from "@/components/admin/marketing/mascot/Mascot";

// Set B: timing. Students are out over winter break, so it's the calm window to get set up
// before spring enrollment. The Amazon gift card is a callout (switch it off for the control version).

const WINTER = "#E7EFF8";

export const ADS_WINTER_BREAK_CAROUSEL = {
  id: "ads-winter-break",
  title: "Ads: Onboard over winter break (6)",
  description: "Timing-led single ads: set up while students are out. Offer chip can be switched off. Feed + story.",
  fileSlug: "mudkitchen-ads-winter-break",
  kind: "ad",
  offerToggle: true,
  sizes: ["feed", "story"],
  slides: [
    {
      id: "halls-quiet",
      fileName: "ad-b1-dot-halls-are-quiet.png",
      render: () => <HallsQuietAd />,
      adCopy: {
        primaryText:
          "Microschool founders: winter break is the calmest two weeks of the school year. Use it to get MudKitchen set up, so enrollment, tuition and parent messages are ready when families come back. Book a demo, start a paid plan within 30 days, and get a $200 Amazon gift card. Terms apply.",
        headline: "Set up over break, open January ready",
        description: "Guided setup for microschools.",
      },
    },
    {
      id: "december-january",
      fileName: "ad-b2-december-vs-january.png",
      render: () => <DecemberJanuaryAd />,
      adCopy: {
        primaryText:
          "Running a microschool? December: a demo, then we set things up with you. January: families apply, pay and get updates in one place. Book a demo before the break, start a paid plan within 30 days, and get a $200 Amazon gift card. Terms apply.",
        headline: "Open January with it running",
        description: "We help move the important pieces over.",
      },
    },
    {
      id: "spring-forms",
      fileName: "ad-b3-pip-spring-enrollment.png",
      render: () => <SpringFormsAd />,
      adCopy: {
        primaryText:
          "Microschool directors: spring enrollment opens in January. Are your application, enrollment forms and tuition plans ready? We'll set them up with you over break. Book a demo, start a paid plan within 30 days, and get a $200 Amazon gift card. Terms apply.",
        headline: "Spring enrollment, ready by January",
        description: "Online applications, forms and tuition.",
      },
    },
    {
      id: "setup-crew",
      fileName: "ad-b4-setup-crew.png",
      render: () => <SetupCrewAd />,
      adCopy: {
        primaryText:
          "Microschool owners: students are out. Your setup crew is in. We review how your school runs today, build your setup inside MudKitchen and help you go live, without starting over. Book a demo, start a paid plan within 30 days, and get a $200 Amazon gift card. Terms apply.",
        headline: "Guided setup, without starting over",
        description: "Website, enrollment, tuition and families.",
      },
    },
    {
      id: "march-vs-december",
      fileName: "ad-b5-clover-march-vs-december.png",
      render: () => <MarchDecemberAd />,
      adCopy: {
        primaryText:
          "Microschool founders: switching systems mid-semester is chaos. Switching over winter break is a cozy afternoon. Book a MudKitchen demo now, start a paid plan within 30 days, and get a $200 Amazon gift card. Terms apply.",
        headline: "Switch while it's quiet",
        description: "Built for founder-led microschools.",
      },
    },
    {
      id: "break-todo",
      fileName: "ad-b6-winter-break-todo.png",
      render: () => <BreakTodoAd />,
      adCopy: {
        primaryText:
          "Microschool directors, your winter break to-do list: sleep in, eat too many cookies, and take a look at MudKitchen. Start a paid plan within 30 days of your demo and we'll send a $200 Amazon gift card. Terms apply.",
        headline: "One small item for your break",
        description: "Sign up, get a $200 Amazon gift card.",
      },
    },
  ] satisfies MarketingSlide[],
} satisfies MarketingCarousel;

// ---------------------------------------------------------------- B1

type Day = { d: string; label?: string; tone?: "break" | "demo" | "live" };
const WEEKS: Day[][] = [
  [{ d: "21", tone: "break" }, { d: "22", tone: "demo", label: "demo" }, { d: "23", tone: "break" }, { d: "24", tone: "break" }, { d: "25", tone: "break" }],
  [{ d: "28", tone: "break" }, { d: "29", tone: "demo", label: "setup" }, { d: "30", tone: "break" }, { d: "31", tone: "break" }, { d: "1", tone: "break" }],
  [{ d: "4", tone: "live", label: "live!" }, { d: "5" }, { d: "6" }, { d: "7" }, { d: "8" }],
];

function MiniCalendar() {
  const cell = 104;
  return (
    <InkCard width={cell * 5 + 14 * 4 + 72} rotate={-2} style={{ padding: "28px 36px 32px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 18 }}>
        <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 40, color: G.ink }}>Dec → Jan</span>
        <span style={{ fontFamily: FONT.hand, fontSize: 34, color: "#3E6E93" }}>winter break</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(5, ${cell}px)`, gap: 14 }}>
        {["M", "T", "W", "T", "F"].map((day, i) => (
          <span key={i} style={{ textAlign: "center", fontFamily: FONT.body, fontWeight: 800, fontSize: 22, color: G.soft }}>
            {day}
          </span>
        ))}
        {WEEKS.flat().map((day, i) => {
          const bg = day.tone === "break" ? "#DCE8F5" : day.tone === "demo" ? G.butter : day.tone === "live" ? G.forest : "#F4EFE6";
          const color = day.tone === "live" ? G.cream : G.ink;
          return (
            <div
              key={i}
              style={{
                height: 92,
                borderRadius: 16,
                background: bg,
                border: day.tone === "demo" || day.tone === "live" ? `3px solid ${G.ink}` : "3px solid transparent",
                boxSizing: "border-box",
                padding: "8px 12px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontFamily: FONT.body, fontWeight: 800, fontSize: 26, color }}>{day.d}</span>
              {day.label ? <span style={{ fontFamily: FONT.hand, fontSize: 26, lineHeight: 1, color: day.tone === "live" ? G.butter : G.clayDeep }}>{day.label}</span> : null}
            </div>
          );
        })}
      </div>
    </InkCard>
  );
}

function HallsQuietAd() {
  return (
    <AdFrame background={WINTER} snow>
      <AdCopy
        title={
          <>
            The halls are quiet.
            <br />
            <Accent>Perfect time to move in.</Accent>
          </>
        }
        size={80}
      />
      <Scene>
        <Pin left={0} top={40} z={4}>
          <MiniCalendar />
        </Pin>
        <Pin right={-40} bottom={0} z={5}>
          <Crew name="dot" view="point" width={330} flip />
        </Pin>
      </Scene>
      <AdFooter />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- B2

function MonthCard({ month, bg, name, view, lines }: { month: string; bg: string; name: MascotName; view: MascotView; lines: ReactNode[] }) {
  return (
    <InkCard bg={bg} width={430} style={{ padding: "26px 30px 30px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <span style={{ fontFamily: FONT.body, fontWeight: 800, fontSize: 24, letterSpacing: "0.12em", textTransform: "uppercase", color: G.ink, background: "rgba(255,255,255,.7)", borderRadius: 999, padding: "8px 18px" }}>
        {month}
      </span>
      <Crew name={name} view={view} width={240} />
      <div style={{ display: "flex", flexDirection: "column", gap: 8, alignSelf: "stretch" }}>
        {lines.map((line, i) => (
          <span key={i} style={{ fontFamily: FONT.body, fontWeight: 800, fontSize: 28, lineHeight: 1.2, color: G.ink }}>
            {line}
          </span>
        ))}
      </div>
    </InkCard>
  );
}

function DecemberJanuaryAd() {
  return (
    <AdFrame background={G.cream} snow>
      <AdCopy
        title={
          <>
            Set it up over break.
            <br />
            <Accent>
              Open January
              <br />
              with it running.
            </Accent>
          </>
        }
        size={72}
      />
      <Scene style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ transform: "rotate(-2deg)" }}>
          <MonthCard month="December" bg="#DCE8F5" name="dig" view="sleepy" lines={["• a quick demo", "• we set it up with you", "• invite your families"]} />
        </div>
        <Hand size={80} color={G.clay} rotate={0}>
          →
        </Hand>
        <div style={{ transform: "rotate(2deg)" }}>
          <MonthCard month="January" bg={G.mint} name="pip" view="celebrate" lines={["✓ applications coming in", "✓ tuition on autopay", "✓ families in the loop"]} />
        </div>
      </Scene>
      <AdFooter />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- B3

function SpringFormsAd() {
  return (
    <AdFrame background={G.mint} snow>
      <AdCopy
        title={
          <>
            Spring enrollment opens in January.
            <br />
            <Accent>Are your forms ready?</Accent>
          </>
        }
        hand="we'll set them up with you over break."
        size={78}
      />
      <Scene>
        <Pin left={-20} bottom={0} z={5}>
          <Crew name="pip" view="thinking" width={360} />
        </Pin>
        <Pin right={250} top={40} z={3}>
          <PaperSheet label="Application" width={230} rotate={-8} />
        </Pin>
        <Pin right={60} top={10} z={4}>
          <PaperSheet label="Enrollment" width={230} rotate={5} />
        </Pin>
        <Pin right={150} top={190} z={4}>
          <PaperSheet label="Tuition plan" width={230} rotate={-2} />
        </Pin>
        <Pin right={0} bottom={30} z={6}>
          <StickyNote width={340} rotate={4}>
            <Hand size={38} color={G.forest} rotate={0} style={{ whiteSpace: "nowrap" }}>
              ready by Jan ✓
            </Hand>
          </StickyNote>
        </Pin>
      </Scene>
      <AdFooter />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- B4

const SETUP_CREW: Array<{ name: MascotName; label: string }> = [
  { name: "terra", label: "Website" },
  { name: "dig", label: "Admin" },
  { name: "bramble", label: "Forms" },
];

function SetupCrewAd() {
  return (
    <AdFrame background={G.forest} tone="dark" snow>
      <AdCopy
        tone="dark"
        title={
          <>
            Students are out.
            <br />
            <Accent color={G.butter}>Your setup crew is in.</Accent>
          </>
        }
        sub="We help move the important pieces over and set things up with you, without starting over."
        size={86}
      />
      <Scene>
        <div style={{ position: "absolute", left: -20, right: -20, bottom: 0, display: "flex", justifyContent: "space-around", alignItems: "flex-end" }}>
          {SETUP_CREW.map((member) => (
            <div key={member.name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <Crew name={member.name} view="determined" width={290} />
              <span style={{ fontFamily: FONT.body, fontWeight: 800, fontSize: 26, letterSpacing: "0.08em", textTransform: "uppercase", color: G.butter }}>{member.label}</span>
            </div>
          ))}
        </div>
      </Scene>
      <AdFooter tone="dark" />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- B5

function MarchDecemberAd() {
  return (
    <AdFrame background={G.cream} snow>
      <AdCopy
        title={
          <>
            Switching systems in March? <Accent>Chaos.</Accent>
            <br />
            In December? <Accent color={G.forest}>Cozy.</Accent>
          </>
        }
        size={78}
      />
      <Scene style={{ display: "flex", gap: 24, alignItems: "stretch", paddingTop: 30 }}>
        <InkCard bg={G.peach} rotate={-2} style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", padding: "24px 20px 20px" }}>
          <span style={{ position: "absolute", top: 22, left: 24, fontFamily: FONT.body, fontWeight: 800, fontSize: 26, letterSpacing: "0.12em", color: G.clayDeep }}>MARCH</span>
          <Hand size={34} color={BERRY} rotate={-6} style={{ position: "absolute", top: 70, right: 24 }}>
            mid-semester!!
          </Hand>
          <Crew name="clover" view="tears" width={350} />
        </InkCard>
        <InkCard bg="#DCE8F5" rotate={2} style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", padding: "24px 20px 20px" }}>
          <span style={{ position: "absolute", top: 22, left: 24, fontFamily: FONT.body, fontWeight: 800, fontSize: 26, letterSpacing: "0.12em", color: "#2F5878" }}>DECEMBER</span>
          <Hand size={34} color={G.forest} rotate={-4} style={{ position: "absolute", top: 70, right: 24 }}>
            a cozy afternoon
          </Hand>
          <Crew name="clover" view="love" width={350} />
        </InkCard>
      </Scene>
      <div style={{ height: 36, flexShrink: 0 }} />
      <AdFooter />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- B6

function BreakTodoAd() {
  const offer = useAdOffer();
  return (
    <AdFrame background={WINTER} snow garland>
      <AdCopy
        title={
          <>
            Your winter break
            <br />
            <Accent>to-do list.</Accent>
          </>
        }
        size={92}
      />
      <Scene>
        <Pin left={0} top={30} z={4}>
          <InkCard width={700} rotate={-2} bg="#FFFDF8">
            <CheckList
              size={38}
              rows={[
                { label: "Sleep in", done: true },
                { label: "Eat too many cookies", done: true },
                { label: "MudKitchen demo", note: offer ? "+ $200 gift card when you sign up*" : "spring, sorted.", highlight: true },
                { label: "Do absolutely nothing else", done: true },
              ]}
            />
          </InkCard>
        </Pin>
        <Pin right={-30} bottom={0} z={5}>
          <Crew name="tansy" view="wink" width={300} flip />
        </Pin>
      </Scene>
      <AdFooter chip={false} />
    </AdFrame>
  );
}
