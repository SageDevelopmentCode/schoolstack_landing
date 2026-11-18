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
  GiftBox,
  GiftTag,
  Hand,
  InkCard,
  PINE,
  Pin,
  Scene,
} from "@/components/admin/marketing/ads/ad-kit";

// Set A: the $200 Amazon gift card is the message. (No offer switch: these ads only make sense with it.)

export const ADS_HOLIDAY_GIFT_CAROUSEL = {
  id: "ads-holiday-gift",
  title: "Ads: Holiday Amazon gift card (12)",
  description: "Offer-led single ads: book a demo, start a paid plan, get a $200 Amazon gift card. Feed + story.",
  fileSlug: "mudkitchen-ads-holiday-gift",
  kind: "ad",
  sizes: ["feed", "story"],
  slides: [
    {
      id: "gift-tag",
      fileName: "ad-a1-nutmeg-gift-tag.png",
      render: () => <GiftTagAd />,
      adCopy: {
        primaryText:
          "Microschool directors: teachers get apples, you get this. Book a MudKitchen demo before the new year, start a paid plan within 30 days, and get a $200 Amazon gift card. 🎁 Terms apply.",
        headline: "Sign up, get a $200 Amazon gift card",
        description: "Enrollment, tuition and families in one place.",
      },
    },
    {
      id: "stocking",
      fileName: "ad-a2-pip-stocking.png",
      render: () => <StockingAd />,
      adCopy: {
        primaryText:
          "School owners, a little something for your stocking: book a MudKitchen demo, start a paid plan within 30 days, and get a $200 Amazon gift card. A calmer spring semester comes with it. Terms apply.",
        headline: "$200 for you. A calmer spring.",
        description: "Built for microschools.",
      },
    },
    {
      id: "dear-santa",
      fileName: "ad-a3-dig-dear-santa.png",
      render: () => <DearSantaAd />,
      adCopy: {
        primaryText:
          "Every microschool director's letter to Santa: one school system instead of six spreadsheets, please. MudKitchen puts your website, enrollment, tuition and parent messages in one place. Book a demo this month, start a paid plan within 30 days, and get a $200 Amazon gift card. Terms apply.",
        headline: "One system, not six spreadsheets",
        description: "Sign up, get a $200 Amazon gift card.",
      },
    },
    {
      id: "holiday-list",
      fileName: "ad-a4-bramble-holiday-list.png",
      render: () => <HolidayListAd />,
      adCopy: {
        primaryText:
          "School directors: one less thing on your list. See how MudKitchen runs enrollment, tuition and family updates for your microschool in a demo. Start a paid plan within 30 days and get a $200 Amazon gift card. Terms apply.",
        headline: "Demo. Sign up. $200.",
        description: "A demo built around your school.",
      },
    },
    {
      id: "treat-yourself",
      fileName: "ad-a5-marigold-treat-yourself.png",
      render: () => <TreatYourselfAd />,
      adCopy: {
        primaryText:
          "Microschool founders, you survived fall semester. Treat yourself: book a MudKitchen demo, start a paid plan within 30 days, and we'll send you a $200 Amazon gift card. Terms apply.",
        headline: "You earned this one",
        description: "$200 Amazon gift card when you sign up.",
      },
    },
    {
      id: "crew-wrapped",
      fileName: "ad-a6-crew-wrapped.png",
      render: () => <CrewWrappedAd />,
      adCopy: {
        primaryText:
          "For microschool owners, the crew wrapped something: enrollment, tuition, messages and attendance in one place, plus a $200 Amazon gift card when you start a paid plan within 30 days of your demo. Terms apply.",
        headline: "Unwrap a calmer school year",
        description: "Sign up, get a $200 Amazon gift card.",
      },
    },
    {
      id: "apple",
      fileName: "ad-a7-dig-apple.png",
      render: () => <AppleAd />,
      adCopy: {
        primaryText:
          "Teachers get apples. Microschools get $200. Book a MudKitchen demo this holiday season, start a paid plan within 30 days, and the Amazon gift card is yours. 🍎 Terms apply.",
        headline: "Sign up, your school gets $200",
        description: "Book a demo of MudKitchen.",
      },
    },
    {
      id: "report-card",
      fileName: "ad-a8-fennel-report-card.png",
      render: () => <ReportCardAd />,
      adCopy: {
        primaryText:
          "School directors: your fall report card is in. Enrollment A+, tuition chasing needs work. Book a MudKitchen demo, start a paid plan within 30 days, and get a $200 Amazon gift card (teacher's orders). Terms apply.",
        headline: "Teacher's note: sign up, get $200",
        description: "Enrollment, tuition and families in one place.",
      },
    },
    {
      id: "permission-slip",
      fileName: "ad-a9-bramble-permission-slip.png",
      render: () => <PermissionSlipAd />,
      adCopy: {
        primaryText:
          "Microschool founders, this is your permission slip: take a MudKitchen demo. Start a paid plan within 30 days and get a $200 Amazon gift card. Signed, everyone who wants you to rest over break. Terms apply.",
        headline: "Signed: a demo, a plan, $200",
        description: "Built for microschools.",
      },
    },
    {
      id: "snow-day",
      fileName: "ad-a10-tansy-snow-day.png",
      render: () => <SnowDayAd />,
      adCopy: {
        primaryText:
          "School's out for winter. Your $200 isn't. Grab a cocoa, take a look at MudKitchen for your microschool, and get a $200 Amazon gift card when you start a paid plan within 30 days. ☕ Terms apply.",
        headline: "School's out. Your $200 isn't.",
        description: "Book a demo over break.",
      },
    },
    {
      id: "gift-swap",
      fileName: "ad-a11-staff-room-gift-swap.png",
      render: () => <GiftSwapAd />,
      adCopy: {
        primaryText:
          "Staff-room gift swap, director edition: you drew yourself. Book a MudKitchen demo, start a paid plan within 30 days, and get a $200 Amazon gift card. Your staff can keep the mugs. Terms apply.",
        headline: "You drew yourself. Nice.",
        description: "$200 Amazon gift card when you sign up.",
      },
    },
    {
      id: "founders-unwrapped",
      fileName: "ad-a12-founders-unwrapped.png",
      render: () => <UnwrappedAd />,
      adCopy: {
        primaryText:
          "Things microschool founders unwrapped this year: 37 late-night 'quick questions', a folder of Venmo screenshots, one lost enrollment form. Make the last one a $200 Amazon gift card: book a MudKitchen demo and start a paid plan within 30 days. Terms apply.",
        headline: "Unwrap something better",
        description: "Sign up, get a $200 Amazon gift card.",
      },
    },
  ] satisfies MarketingSlide[],
} satisfies MarketingCarousel;

// ---------------------------------------------------------------- A1

function GiftTagAd() {
  return (
    <AdFrame background={G.cream} snow>
      <AdCopy
        title={
          <>
            Book a demo. Sign up.
            <br />
            Get a <Accent>$200</Accent>
            <br />
            <Accent>Amazon gift card.</Accent>
          </>
        }
        hand="teachers get apples. your microschool gets this."
        size={80}
      />
      <Scene>
        <Pin left={-20} bottom={0} z={4}>
          <Crew name="nutmeg" view="hold" width={400} />
        </Pin>
        <Pin right={10} top="50%" z={5} style={{ marginTop: -150 }}>
          <GiftTag width={470} rotate={-7} to="for your microschool" />
        </Pin>
      </Scene>
      <AdFooter chip={false} />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- A2

function Stocking({ width = 300 }: { width?: number }) {
  return (
    <svg width={width} height={width * 1.25} viewBox="0 0 240 300" aria-hidden style={{ display: "block", overflow: "visible" }}>
      <path
        d="M40 70 L170 70 L170 190 Q170 220 195 230 L215 238 Q240 250 232 275 Q222 300 190 296 L80 280 Q40 274 40 236 Z"
        fill={BERRY}
        stroke={G.ink}
        strokeWidth="7"
        strokeLinejoin="round"
      />
      <path d="M150 260 Q180 236 210 248" fill="none" stroke="#FFFFFF" strokeOpacity=".55" strokeWidth="10" strokeLinecap="round" />
      <rect x="22" y="22" width="168" height="62" rx="20" fill="#FFFFFF" stroke={G.ink} strokeWidth="7" />
      <circle cx="58" cy="140" r="9" fill={G.butter} />
      <circle cx="120" cy="175" r="9" fill={G.butter} />
      <circle cx="80" cy="220" r="9" fill={G.butter} />
    </svg>
  );
}

function StockingAd() {
  return (
    <AdFrame background={G.forest} tone="dark" snow garland>
      <AdCopy
        tone="dark"
        title={
          <>
            A little something
            <br />
            for your <Accent color={G.butter}>stocking.</Accent>
          </>
        }
        sub="$200 Amazon gift card when you start a paid plan. A calmer spring for your microschool."
        size={88}
      />
      <Scene>
        <Pin left={120} bottom={10} z={3}>
          <div style={{ position: "relative", width: 330, height: 600 }}>
            <div style={{ position: "absolute", left: 40, top: 0, zIndex: 1 }}>
              <Crew name="pip" view="excited" width={250} ground={false} />
            </div>
            <div style={{ position: "absolute", left: 0, bottom: 0, zIndex: 2 }}>
              <Stocking width={330} />
            </div>
          </div>
        </Pin>
        <Pin right={0} top="22%" z={4}>
          <GiftTag width={400} rotate={8} to="for your microschool" />
        </Pin>
      </Scene>
      <AdFooter tone="dark" chip={false} />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- A3

function DearSantaAd() {
  return (
    <AdFrame background="#F3EEF8" snow>
      <AdCopy
        title={
          <>
            One school system,
            <br />
            not <Accent>six spreadsheets.</Accent>
          </>
        }
        size={86}
      />
      <Scene>
        <Pin left={0} top={40} z={4}>
          <InkCard width={620} rotate={-3} bg="#FFFDF8" style={{ padding: "36px 44px 40px" }}>
            <Hand size={48} color={G.ink} rotate={0}>
              Dear Santa,
            </Hand>
            <Hand size={40} color={G.ink} rotate={0} style={{ marginTop: 16, lineHeight: 1.25 }}>
              I&apos;ve been very good this semester. All I want is enrollment, tuition and parent messages in one place.
            </Hand>
            <Hand size={36} color={G.clay} rotate={0} style={{ marginTop: 22 }}>
              love, every school director
            </Hand>
          </InkCard>
        </Pin>
        <Pin right={-30} bottom={0} z={5}>
          <Crew name="dig" view="thinking" width={360} flip />
        </Pin>
        <Pin right={300} bottom={40} z={6}>
          <Hand size={40} color={G.forest} rotate={-6}>
            santa&apos;s busy.
            <br />
            we&apos;ll handle this one.
          </Hand>
        </Pin>
      </Scene>
      <AdFooter />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- A4

function HolidayListAd() {
  return (
    <AdFrame background={G.peach} snow>
      <AdCopy
        title={
          <>
            Demo. Sign up. $200.
            <br />
            <Accent>One less thing on your list.</Accent>
          </>
        }
        size={84}
      />
      <Scene>
        <Pin left={0} top={36} z={4}>
          <InkCard width={660} rotate={-2}>
            <p style={{ margin: "0 0 22px", fontFamily: FONT.display, fontWeight: 800, fontSize: 40, color: G.clayDeep }}>Holiday to-do</p>
            <CheckList
              rows={[
                { label: "Finish 14 report cards", done: true },
                { label: "Plan spring enrollment", done: true },
                { label: "Book a MudKitchen demo", note: "+ $200 gift card when you sign up*", highlight: true },
              ]}
            />
          </InkCard>
        </Pin>
        <Pin right={-40} bottom={0} z={5}>
          <Crew name="bramble" view="point" width={360} flip />
        </Pin>
      </Scene>
      <AdFooter chip={false} />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- A5

const CONFETTI = Array.from({ length: 26 }, (_, i) => {
  const r = (n: number) => ((Math.sin(i * 91.7 + n * 47.3) * 10000) % 1 + 1) % 1;
  return { x: 6 + r(1) * 88, y: 4 + r(2) * 70, w: 14 + r(3) * 14, rot: r(4) * 180, c: [G.butter, G.peach, "#8DBF7A", "#7FB3D5", BERRY][i % 5] };
});

function TreatYourselfAd() {
  return (
    <AdFrame background={G.forest} tone="dark" snow>
      <AdCopy
        tone="dark"
        title={
          <>
            You survived fall semester.
            <br />
            <Accent color={G.butter}>Treat yourself.</Accent>
          </>
        }
        sub="Book a demo, start a paid plan within 30 days, and we'll send you a $200 Amazon gift card.*"
        size={84}
      />
      <Scene>
        {CONFETTI.map((piece, i) => (
          <span
            key={i}
            aria-hidden
            style={{ position: "absolute", left: `${piece.x}%`, top: `${piece.y}%`, width: piece.w, height: piece.w * 0.5, borderRadius: 4, background: piece.c, transform: `rotate(${piece.rot}deg)`, zIndex: 2 }}
          />
        ))}
        <Pin left="50%" bottom={0} z={4} style={{ marginLeft: -210 }}>
          <Crew name="marigold" view="celebrate" width={420} />
        </Pin>
        <Pin left={20} bottom={20} z={3}>
          <GiftBox width={190} color={BERRY} rotate={-6} />
        </Pin>
        <Pin right={20} bottom={20} z={3}>
          <GiftBox width={170} color={PINE} ribbon={G.peach} rotate={7} />
        </Pin>
      </Scene>
      <AdFooter tone="dark" chip={false} />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- A6

const WRAPPED: Array<{ name: "pip" | "nutmeg" | "loam" | "dot"; label: string; color: string; ribbon: string }> = [
  { name: "pip", label: "Enrollment", color: "#7FB3D5", ribbon: G.butter },
  { name: "nutmeg", label: "Tuition", color: PINE, ribbon: G.peach },
  { name: "loam", label: "Messages", color: "#B9A1D0", ribbon: G.butter },
  { name: "dot", label: "Amazon $200*", color: BERRY, ribbon: G.butter },
];

function CrewWrappedAd() {
  return (
    <AdFrame background={G.cream} snow garland>
      <AdCopy
        title={
          <>
            The crew wrapped
            <br />
            <Accent>something for you.</Accent>
          </>
        }
        hand="demo + sign up to open them."
        size={90}
      />
      <Scene>
        <div style={{ position: "absolute", left: -24, right: -24, bottom: 0, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          {WRAPPED.map((gift) => (
            <div key={gift.name} style={{ position: "relative", width: 236, height: 400 }}>
              <div style={{ position: "absolute", left: 6, top: 0 }}>
                <Crew name={gift.name} view="hold" width={224} ground={false} />
              </div>
              <div style={{ position: "absolute", left: 18, bottom: 0, zIndex: 2 }}>
                <GiftBox width={200} color={gift.color} ribbon={gift.ribbon} label={gift.label} />
              </div>
            </div>
          ))}
        </div>
      </Scene>
      <AdFooter chip={false} />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- round 2 props

function Apple({ width = 150 }: { width?: number }) {
  return (
    <svg width={width} height={width * 1.1} viewBox="0 0 100 110" aria-hidden style={{ display: "block", overflow: "visible" }}>
      <path d="M50 30 C 30 14, 4 22, 6 52 C 8 84, 30 104, 42 102 C 46 101, 48 98, 50 98 C 52 98, 54 101, 58 102 C 70 104, 92 84, 94 52 C 96 22, 70 14, 50 30 Z" fill={BERRY} stroke={G.ink} strokeWidth="5" strokeLinejoin="round" />
      <path d="M26 44 Q 22 56 26 66" fill="none" stroke="#FFFFFF" strokeOpacity=".55" strokeWidth="6" strokeLinecap="round" />
      <path d="M50 30 Q 50 16 56 6" fill="none" stroke={G.ink} strokeWidth="5" strokeLinecap="round" />
      <path d="M54 16 Q 70 2 84 12 Q 70 24 54 16 Z" fill="#8DBF7A" stroke={G.ink} strokeWidth="4" strokeLinejoin="round" />
    </svg>
  );
}

function Desk() {
  return (
    <div aria-hidden style={{ position: "absolute", left: -64, right: -64, bottom: 0, height: 110, zIndex: 6 }}>
      <div style={{ height: 34, background: "#C99A68", border: `4px solid ${G.ink}`, borderRadius: 10, boxSizing: "border-box" }} />
      <div style={{ height: 76, margin: "0 40px", background: "#B5865A", borderLeft: `4px solid ${G.ink}`, borderRight: `4px solid ${G.ink}`, boxSizing: "border-box" }} />
    </div>
  );
}

function CocoaMug({ width = 130 }: { width?: number }) {
  return (
    <svg width={width} height={width * 1.25} viewBox="0 0 100 125" aria-hidden style={{ display: "block", overflow: "visible" }}>
      <path d="M36 30 Q 28 18 38 8 M54 30 Q 46 16 58 4" fill="none" stroke="rgba(255,250,244,.75)" strokeWidth="5" strokeLinecap="round" />
      <path d="M78 58 Q 100 58 98 78 Q 96 98 74 96" fill="none" stroke={G.ink} strokeWidth="6" />
      <path d="M78 58 Q 100 58 98 78 Q 96 98 74 96" fill="none" stroke={G.peach} strokeWidth="2" />
      <path d="M10 40 L 80 40 L 76 112 Q 75 120 66 120 L 24 120 Q 15 120 14 112 Z" fill={BERRY} stroke={G.ink} strokeWidth="5" strokeLinejoin="round" />
      <ellipse cx="45" cy="42" rx="34" ry="7" fill="#6B4430" stroke={G.ink} strokeWidth="4" />
      <circle cx="36" cy="40" r="5" fill="#FFFFFF" stroke={G.ink} strokeWidth="2" />
      <circle cx="50" cy="38" r="5" fill="#FFFFFF" stroke={G.ink} strokeWidth="2" />
      <path d="M26 70 L 64 70 M30 84 L 60 84" stroke="rgba(255,250,244,.6)" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

function Schoolhouse() {
  return (
    <div aria-hidden style={{ position: "relative", width: 380, height: 360 }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 150, background: G.ink, clipPath: "polygon(50% 0, 100% 100%, 0 100%)" }} />
      <div style={{ position: "absolute", left: 10, right: 10, top: 10, height: 136, background: BERRY, clipPath: "polygon(50% 0, 100% 100%, 0 100%)" }} />
      <div style={{ position: "absolute", left: 160, top: 64, width: 60, height: 60, borderRadius: 999, background: G.butter, border: `4px solid ${G.ink}`, boxSizing: "border-box" }} />
      <div style={{ position: "absolute", left: 30, right: 30, top: 146, bottom: 0, background: G.cream, border: `4px solid ${G.ink}`, borderTop: "none", boxSizing: "border-box" }}>
        <div style={{ position: "absolute", left: 30, top: 40, width: 70, height: 70, background: "#3B4A63", border: `4px solid ${G.ink}`, borderRadius: 8 }} />
        <div style={{ position: "absolute", right: 30, top: 40, width: 70, height: 70, background: "#3B4A63", border: `4px solid ${G.ink}`, borderRadius: 8 }} />
        <div style={{ position: "absolute", left: "50%", marginLeft: -40, bottom: 0, width: 80, height: 120, background: PINE, border: `4px solid ${G.ink}`, borderBottom: "none", borderRadius: "40px 40px 0 0", boxSizing: "border-box" }} />
      </div>
      <div style={{ position: "absolute", left: 4, top: 196, transform: "rotate(-8deg)", padding: "10px 16px", background: "#FFFFFF", border: `4px solid ${G.ink}`, borderRadius: 10, fontFamily: FONT.hand, fontSize: 32, color: G.clayDeep, whiteSpace: "nowrap", zIndex: 2 }}>
        closed for break
      </div>
      <div style={{ position: "absolute", left: 30, right: 30, top: 140, height: 18, background: "#FFFFFF", borderRadius: 999, border: `3px solid ${G.ink}` }} />
    </div>
  );
}

// ---------------------------------------------------------------- A7

function AppleAd() {
  return (
    <AdFrame background={G.cream} snow>
      <AdCopy
        title={
          <>
            Teachers get apples.
            <br />
            <Accent>Your school gets $200.</Accent>
          </>
        }
        hand="sign up after your demo to claim it."
        size={90}
      />
      <Scene>
        <Pin left={150} bottom={70} z={3}>
          <Crew name="dig" view="excited" width={330} ground={false} />
        </Pin>
        <Desk />
        <Pin left={0} bottom={104} z={7}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <Hand size={32} color={G.soft} rotate={-6}>
              for the teacher
            </Hand>
            <Apple width={130} />
          </div>
        </Pin>
        <Pin right={0} top={10} z={8}>
          <GiftTag width={430} rotate={6} to="for your microschool" />
        </Pin>
      </Scene>
      <AdFooter chip={false} />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- A8

const GRADES: Array<{ subject: string; grade: string; hand?: boolean; color: string }> = [
  { subject: "Enrollment", grade: "A+", color: G.forest },
  { subject: "Tuition chasing", grade: "needs work", hand: true, color: G.clay },
  { subject: "Group-text wrangling", grade: "D", color: BERRY },
  { subject: "Self-care", grade: "incomplete", hand: true, color: G.clay },
];

function ReportCardAd() {
  return (
    <AdFrame background="#E7EFF8" snow>
      <AdCopy
        title={
          <>
            Your fall report card <Accent>is in.</Accent>
          </>
        }
        size={92}
      />
      <Scene>
        <Pin left={0} top={30} z={4}>
          <InkCard width={720} rotate={-2} bg="#FFFDF8" style={{ padding: "30px 38px 32px" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16, paddingBottom: 14, borderBottom: `3px solid ${G.ink}` }}>
              <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 40, color: G.ink }}>Report card</span>
              <span style={{ fontFamily: FONT.body, fontWeight: 700, fontSize: 24, color: G.soft }}>Fall · School Director</span>
            </div>
            {GRADES.map((row) => (
              <div key={row.subject} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: "2px dashed #E4D8C8" }}>
                <span style={{ fontFamily: FONT.body, fontWeight: 800, fontSize: 32, color: G.ink }}>{row.subject}</span>
                <span style={{ fontFamily: row.hand ? FONT.hand : FONT.display, fontWeight: row.hand ? 400 : 800, fontSize: row.hand ? 36 : 44, color: row.color }}>{row.grade}</span>
              </div>
            ))}
            <Hand size={36} color={G.clayDeep} rotate={-1} style={{ marginTop: 18 }}>
              teacher&apos;s note: sign up, get a $200 Amazon gift card.*
            </Hand>
          </InkCard>
        </Pin>
        <Pin right={-40} bottom={0} z={5}>
          <Crew name="fennel" view="point" width={310} flip />
        </Pin>
      </Scene>
      <AdFooter chip={false} />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- A9

function PermissionSlipAd() {
  return (
    <AdFrame background={G.mint} snow>
      <AdCopy
        title={
          <>
            Permission <Accent>granted.</Accent>
          </>
        }
        size={100}
      />
      <Scene>
        <Pin left={0} top={20} z={4}>
          <InkCard width={790} rotate={-2} bg="#FFFDF4" style={{ padding: "30px 40px 26px" }}>
            <p style={{ margin: 0, fontFamily: FONT.body, fontWeight: 800, fontSize: 24, letterSpacing: "0.14em", color: G.clayDeep }}>PERMISSION SLIP</p>
            <p style={{ margin: "10px 0 20px", fontFamily: FONT.body, fontWeight: 700, fontSize: 28, lineHeight: 1.25, color: G.ink }}>I, the person running this school, give myself permission to:</p>
            <CheckList
              size={32}
              rows={[
                { label: "take a MudKitchen demo", done: true },
                { label: "sign up, accept a $200 Amazon gift card*", done: true, highlight: true },
                { label: "not check email for an hour", done: true },
              ]}
            />
            <div style={{ display: "flex", alignItems: "flex-end", gap: 16, marginTop: 24 }}>
              <span style={{ fontFamily: FONT.body, fontWeight: 700, fontSize: 24, color: G.soft }}>Signed</span>
              <span style={{ flex: 1, borderBottom: `3px solid ${G.ink}`, paddingBottom: 2 }}>
                <Hand size={44} color="#2F5878" rotate={-3}>
                  me
                </Hand>
              </span>
            </div>
            <div style={{ margin: "26px -40px 0", borderTop: `3px dashed ${G.soft}`, position: "relative" }}>
              <span style={{ position: "absolute", right: 40, top: -20, padding: "0 10px", background: "#FFFDF4", fontFamily: FONT.hand, fontSize: 28, color: G.soft }}>
                return to: trymudkitchen.com
              </span>
            </div>
          </InkCard>
        </Pin>
        <Pin right={-40} bottom={0} z={5}>
          <Crew name="bramble" view="thumbs" width={300} flip />
        </Pin>
      </Scene>
      <AdFooter chip={false} />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- A10

function SnowDayAd() {
  return (
    <AdFrame background="#1F2A3A" tone="dark" snow>
      <AdCopy
        tone="dark"
        title={
          <>
            School&apos;s out for winter.
            <br />
            <Accent color={G.butter}>Your $200 isn&apos;t.</Accent>
          </>
        }
        hand="cocoa + a demo. sign up for the $200."
        size={86}
      />
      <Scene>
        <Pin left={-10} bottom={0} z={3} style={{ transform: "scale(1.35)", transformOrigin: "bottom left" }}>
          <Schoolhouse />
        </Pin>
        <Pin right={130} bottom={0} z={5}>
          <Crew name="tansy" view="sit" width={360} />
        </Pin>
        <Pin right={-10} bottom={20} z={6}>
          <CocoaMug width={170} />
        </Pin>
      </Scene>
      <AdFooter tone="dark" chip={false} />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- A11

function GiftSwapAd() {
  return (
    <AdFrame background={G.peach} snow garland>
      <AdCopy
        title={
          <>
            Staff-room gift swap:
            <br />
            <Accent>you drew yourself.</Accent>
          </>
        }
        size={88}
      />
      <Scene>
        <Pin left={-10} bottom={0} z={3}>
          <Crew name="marigold" view="curious" width={260} />
        </Pin>
        <Pin left={210} bottom={0} z={4}>
          <GiftBox width={380} color={BERRY} />
        </Pin>
        <Pin left={560} bottom={0} z={5}>
          <Crew name="loam" view="excited" width={250} flip />
        </Pin>
        <Pin right={0} top={40} z={6}>
          <InkCard width={380} rotate={7} bg={G.butter} style={{ padding: "26px 30px" }}>
            <Hand size={40} color={G.ink} rotate={0} style={{ lineHeight: 1.25 }}>
              To: your microschool
              <br />
              From: MudKitchen
            </Hand>
            <p style={{ margin: "14px 0 0", fontFamily: FONT.body, fontWeight: 800, fontSize: 26, color: G.clayDeep }}>$200 Amazon gift card when you sign up*</p>
          </InkCard>
        </Pin>
      </Scene>
      <AdFooter chip={false} />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- A12

const UNWRAPPED: Array<{ label: string; note?: string; best?: boolean }> = [
  { label: "37 “quick question” texts at 9pm" },
  { label: "A folder of Venmo screenshots" },
  { label: "One (1) lost enrollment form" },
  { label: "A $200 Amazon gift card*", note: "demo + sign up", best: true },
];

function UnwrappedAd() {
  return (
    <AdFrame background={G.cream} snow garland>
      <AdCopy
        title={
          <>
            Things microschool founders <Accent>unwrapped this year:</Accent>
          </>
        }
        size={80}
      />
      <Scene>
        <Pin left={0} top={30} z={4}>
          <InkCard width={760} rotate={-1.5} style={{ padding: "26px 34px" }}>
            {UNWRAPPED.map((row, i) => (
              <div
                key={row.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  padding: row.best ? "14px 18px" : "14px 18px",
                  margin: "0 -18px",
                  borderRadius: 18,
                  background: row.best ? G.butter : "transparent",
                  borderTop: i && !row.best ? "2px dashed #E4D8C8" : "2px solid transparent",
                }}
              >
                <span style={{ width: 52, height: 52, flexShrink: 0, borderRadius: 999, background: row.best ? G.forest : G.cream, border: `3px solid ${G.ink}`, display: "grid", placeItems: "center", fontFamily: FONT.display, fontWeight: 800, fontSize: 28, color: row.best ? G.cream : G.ink }}>
                  {i + 1}
                </span>
                <span style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontFamily: FONT.body, fontWeight: 800, fontSize: 32, lineHeight: 1.15, color: G.ink, textDecoration: row.best ? "none" : "line-through", textDecorationColor: "rgba(43,36,29,.35)" }}>{row.label}</span>
                  {row.note ? <span style={{ fontFamily: FONT.hand, fontSize: 32, color: G.clay }}>{row.note}</span> : null}
                </span>
              </div>
            ))}
          </InkCard>
        </Pin>
        <Pin right={-40} bottom={0} z={5}>
          <Crew name="dig" view="silly" width={290} flip />
        </Pin>
      </Scene>
      <AdFooter chip={false} />
    </AdFrame>
  );
}
