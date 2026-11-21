"use client";

import type { CSSProperties, ReactNode } from "react";
import type { MarketingCarousel, MarketingSlide } from "@/components/admin/marketing/carousels/types";
import { AdOfferProvider } from "@/components/admin/marketing/slide-frame";
import { Accent, AdCopy, AdFooter, AdFrame, BERRY, Crew, FONT, G, Hand, InkCard, NotificationCard, Pin, Scene, SpeechBubble } from "@/components/admin/marketing/ads/ad-kit";
import { BrowserTab } from "@/components/admin/marketing/mascot/mascot-slide-kit";
import { FREE_PREVIEW_CTA, FREE_PREVIEW_URL, FREE_PREVIEW_UTM, PreviewBundleTiles, YourAdminWindow, YourParentPhone } from "@/components/admin/marketing/carousels/free-preview-mocks";
import { Annotation, LetterLine, NotebookPaper, TickBox } from "@/components/admin/marketing/carousels/founder-notes-kit";
import { Leaf } from "@/components/admin/marketing/carousels/ads-preview-thanksgiving";

// Set B: Thanksgiving break (most microschools are off Nov 23–27, 2026; some from Nov 21). Built on
// what a founder's break actually looks like: parents still texting, December tuition right after,
// relatives asking "so how's the school going?", teachers resting while the founder catches up.
// Every ad ends on the payoff: send your website, get these four things (PreviewBundleTiles).
// Same guardrails as the other free-preview sets (no gift card, "% off" or codes; "Your School" only;
// claims stay inside the offer).

const AUDIENCE = "for microschool founders";
const noOffer = (node: ReactNode) => <AdOfferProvider show={false}>{node}</AdOfferProvider>;

function Footer({ tone = "light" }: { tone?: "light" | "dark" }) {
  return <AdFooter tone={tone} ctaLabel={FREE_PREVIEW_CTA} siteLabel={FREE_PREVIEW_URL} />;
}

export const ADS_PREVIEW_THANKSGIVING_BREAK_CAROUSEL = {
  id: "ads-preview-thanksgiving-break",
  title: "Ads: Thanksgiving break (9)",
  description: `Single ads for the free custom preview during Thanksgiving break, built on real founder moments (parent texts, relatives' questions, December tuition), each ending on what you get: website, admin portal, teacher portal, parent app. Run b01–b05c Nov 21–29 (b05a–c are three versions of "Enjoy the break", pick one); b06 on Mon Nov 23; b07 Nov 27 – Dec 1. No offer chip. Feed + story. Link: ${FREE_PREVIEW_UTM}`,
  fileSlug: "mudkitchen-ads-preview-thanksgiving-break",
  kind: "ad",
  sizes: ["feed", "story"],
  slides: [
    {
      id: "break-to-do",
      fileName: "ad-b01-thanksgiving-break-to-do.png",
      render: () => noOffer(<BreakToDoAd />),
      adCopy: {
        primaryText:
          "Thanksgiving break to-do for microschool founders: sleep in, pie, nap… and send your website. You'll get a free MudKitchen preview: your website, admin portal, teacher portal and parent app.",
        headline: "Break to-do: send your website.",
        description: "Free, within 2 business days.",
      },
    },
    {
      id: "dinner-questions",
      fileName: "ad-b02-thanksgiving-break-dinner-questions.png",
      render: () => noOffer(<DinnerQuestionsAd />),
      adCopy: {
        primaryText:
          "\"So… how's the school going?\" This Thanksgiving, show them. Microschool founders: send your website and get a free MudKitchen preview of your website, admin, teacher and parent portals.",
        headline: "“So… how's the school going?”",
        description: "Free, private, within 2 business days.",
      },
    },
    {
      id: "parent-texts-on-break",
      fileName: "ad-b03-thanksgiving-break-parent-texts.png",
      render: () => noOffer(<ParentTextsAd />),
      adCopy: {
        primaryText:
          "It's Thanksgiving break, but the parent texts didn't get the memo. 😅 See how the calendar, tuition and messages live in your own parent app: a free MudKitchen preview. Send your website.",
        headline: "The parent texts didn't get the memo",
        description: "Admin, teacher and parent portals, free.",
      },
    },
    {
      id: "teachers-vs-founders",
      fileName: "ad-b04-thanksgiving-break-teachers-vs-founders.png",
      render: () => noOffer(<TeachersVsFoundersAd />),
      adCopy: {
        primaryText:
          "Teachers on Thanksgiving break: pie and naps. Founders on break: re-enrollment, tuition and parent texts. 😅 See it all in one place with a free MudKitchen preview of your school.",
        headline: "Teachers on break vs. founders on break",
        description: "Send your website. No call needed.",
      },
    },
    {
      id: "crew-enjoy-the-break",
      fileName: "ad-b05a-thanksgiving-break-crew.png",
      render: () => noOffer(<CrewEnjoyTheBreakAd />),
      adCopy: {
        primaryText:
          "Enjoy Thanksgiving break, microschool founders. 🦃 Send us your website and the MudKitchen crew will build your free preview: website, admin portal, teacher portal and parent app.",
        headline: "Enjoy the break. We'll build it.",
        description: "In your inbox within 2 business days.",
      },
    },
    {
      id: "preview-in-the-oven",
      fileName: "ad-b05b-thanksgiving-break-oven.png",
      render: () => noOffer(<PreviewInTheOvenAd />),
      adCopy: {
        primaryText:
          "Thanksgiving break: you rest, we cook. 🥧 Send your website and your free MudKitchen preview comes out of the oven within 2 business days: website, admin, teacher and parent portals.",
        headline: "You rest. We cook.",
        description: "Free. No call needed.",
      },
    },
    {
      id: "do-not-disturb",
      fileName: "ad-b05c-thanksgiving-break-do-not-disturb.png",
      render: () => noOffer(<DoNotDisturbAd />),
      adCopy: {
        primaryText:
          "Do not disturb: enjoying Thanksgiving break. 🦃 Meanwhile, the MudKitchen crew is at work on your free preview: website, admin portal, teacher portal and parent app. Just send your website.",
        headline: "Do not disturb. Crew at work.",
        description: "Free, within 2 business days.",
      },
    },
    {
      id: "send-monday",
      fileName: "ad-b06-thanksgiving-break-send-monday.png",
      render: () => noOffer(<SendMondayAd />),
      adCopy: {
        primaryText:
          "Thanksgiving week plan for microschool founders: send your website link Monday; by Wednesday you get a free MudKitchen preview of your school: website, admin, teacher and parent portals. Show the family Thursday.",
        headline: "Send Monday. Get your preview Wednesday.",
        description: "Within 2 business days. No call needed.",
      },
    },
    {
      id: "december-tuition",
      fileName: "ad-b07-thanksgiving-break-december-tuition.png",
      render: () => noOffer(<DecemberTuitionAd />),
      adCopy: {
        primaryText:
          "December tuition lands right after Thanksgiving break. Microschool founders: see how tuition looks in your own parent app, plus your admin and teacher portals, in a free MudKitchen preview.",
        headline: "Dec 1 tuition, in your own app",
        description: "Free, within 2 business days.",
      },
    },
  ] satisfies MarketingSlide[],
} satisfies MarketingCarousel;

/** Bundle strip pinned to the bottom of a Scene. */
function Bundle({ title = "Send your website, get", tone = "light" }: { title?: string; tone?: "light" | "dark" }) {
  return (
    <Pin left={0} bottom={24} z={6}>
      <PreviewBundleTiles title={title} titleColor={tone === "dark" ? G.butter : G.clayDeep} />
    </Pin>
  );
}

// ---------------------------------------------------------------- B1 break to-do (send your website)

function ToDoRow({ children, done, highlight }: { children: ReactNode; done: boolean; highlight?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, minHeight: 68, margin: highlight ? "6px -14px 0" : 0, padding: highlight ? "6px 14px" : 0, borderRadius: 14, background: highlight ? G.butter : "transparent" }}>
      <TickBox checked={done} size={44} />
      <LetterLine size={highlight ? 48 : 44} style={{ lineHeight: 1.15 }}>
        {children}
      </LetterLine>
    </div>
  );
}

function BreakToDoAd() {
  return (
    <AdFrame audience={AUDIENCE} background={G.peach}>
      <AdCopy
        title={
          <>
            Break to-do: <Accent>send your website.</Accent>
          </>
        }
        size={84}
      />
      <Scene>
        <Pin left={-6} top={44} z={4}>
          <NotebookPaper width={600} rotate={-2} lineGap={68} padding="26px 36px 26px 108px" tape={BERRY}>
            <LetterLine size={48} color={G.clayDeep}>
              Thanksgiving break
            </LetterLine>
            <ToDoRow done>sleep in</ToDoRow>
            <ToDoRow done>pie (seconds)</ToDoRow>
            <ToDoRow done>nap</ToDoRow>
            <ToDoRow done={false} highlight>
              send your website
            </ToDoRow>
          </NotebookPaper>
        </Pin>
        <Pin left={630} top={290} z={5}>
          <Annotation arrow="down-left" color={G.clayDeep} size={40}>
            and you get all 4
          </Annotation>
        </Pin>
        <Pin right={10} top={70} z={3}>
          <Leaf color={G.clay} size={56} rotate={20} />
        </Pin>
        <Pin right={110} top={140} z={3}>
          <Leaf color="#E3A64A" size={46} rotate={-35} />
        </Pin>
        <Bundle title="What you get" />
      </Scene>
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- B2 dinner questions

function DinnerQuestionsAd() {
  const bubble = (text: string, tail: "left" | "right", style: CSSProperties) => (
    <SpeechBubble tail={tail} size={30} width={320} style={{ padding: "20px 26px", ...style }}>
      {text}
    </SpeechBubble>
  );
  return (
    <AdFrame audience={AUDIENCE} background={G.peach}>
      <AdCopy
        title={
          <>
            &ldquo;So&hellip; how&rsquo;s the <Accent>school going?&rdquo;</Accent>
          </>
        }
        hand="this year, have an answer."
        size={84}
      />
      <Scene>
        <Pin left={0} top={30} z={4} rotate={-3}>
          {bubble("wait, you started a school?", "right", {})}
        </Pin>
        <Pin left={0} top={200} z={4} rotate={2}>
          {bubble("is it like… a real school?", "right", { background: G.butter })}
        </Pin>
        <Pin right={0} top={40} z={4} rotate={3}>
          {bubble("do they have an app?", "left", { background: "#E3EDFB" })}
        </Pin>
        <Pin right={0} top={210} z={4} rotate={-2}>
          {bubble("ooh, can I see it?", "left", { background: G.mint })}
        </Pin>
        {/* the app they don't have yet */}
        <Pin left={381} top={10} z={3} rotate={2}>
          <div style={{ width: 190, height: 320, boxSizing: "border-box", border: `5px dashed ${G.ink}`, borderRadius: 40, background: "rgba(255,255,255,.55)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, textAlign: "center" }}>
            <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 96, lineHeight: 1, color: G.clay }}>?</span>
            <Hand size={30} color={G.ink} rotate={0} style={{ lineHeight: 1.1, padding: "0 12px" }}>
              your school&rsquo;s app
            </Hand>
          </div>
        </Pin>
        <Pin left={352} top={300} z={5} rotate={-2}>
          <SpeechBubble tail="none" size={34} width={250} bg="#FFFFFF" style={{ padding: "14px 22px", textAlign: "center" }}>
            &hellip;not yet 😅
          </SpeechBubble>
        </Pin>
        <Bundle title="Get all four, free" />
      </Scene>
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- B3 parent texts on break

const BREAK_TEXTS = [
  { title: "Is there school Monday?", sub: "a parent · 8:14 AM", color: "#7FB3D5" },
  { title: "Did December tuition go out?", sub: "a parent · 11:02 AM", color: BERRY },
  { title: "Where's the new calendar?", sub: "a parent · 7:46 PM", color: "#E3A64A" },
];

function ParentTextsAd() {
  return (
    <AdFrame audience={AUDIENCE} background={G.forest} tone="dark">
      <AdCopy
        tone="dark"
        title={
          <>
            The parent texts <Accent color={G.butter}>didn&rsquo;t get the memo.</Accent>
          </>
        }
        size={80}
      />
      <Scene>
        <Pin left={4} top={0} z={4}>
          <span style={{ fontFamily: FONT.body, fontWeight: 800, fontSize: 21, letterSpacing: "0.14em", textTransform: "uppercase", color: G.mint }}>To: your personal phone</span>
        </Pin>
        {BREAK_TEXTS.map((t, i) => (
          <Pin key={t.title} left={i === 1 ? 30 : 0} top={44 + i * 140} z={4} rotate={[-2, 1.5, -1][i]}>
            <NotificationCard title={t.title} sub={t.sub} color={t.color} style={{ width: 600 }} />
          </Pin>
        ))}
        <Pin right={10} top={40} z={5}>
          <Hand size={42} color={G.butter} rotate={-4}>
            it&rsquo;s break. still. 🙃
          </Hand>
        </Pin>
        <Pin right={0} top={120} z={3}>
          <Crew name="loam" view="tears" width={230} flip />
        </Pin>
        <Bundle title="What you're missing: one app parents can check" tone="dark" />
      </Scene>
      <Footer tone="dark" />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- B4 teachers vs founders

const FOUNDER_TABS = [
  { label: "Re-enrollment", x: 20, y: 70, r: -4, tint: "#FFF7DA" },
  { label: "December tuition", x: 150, y: 150, r: 3, tint: "#E8F3E1" },
  { label: "Parent texts", x: 30, y: 236, r: -2, tint: "#E3EDFB" },
  { label: "Spring calendar", x: 170, y: 312, r: 4, tint: "#ECE2F3" },
];

function SplitPanel({ label, bg, headerBg, children }: { label: string; bg: string; headerBg: string; children: ReactNode }) {
  return (
    <div style={{ position: "relative", width: 466, height: 420, boxSizing: "border-box", background: bg, border: `4px solid ${G.ink}`, borderRadius: 26, boxShadow: `0 8px 0 #14241B`, overflow: "hidden" }}>
      <p style={{ margin: 0, padding: "14px 20px", borderBottom: `4px solid ${G.ink}`, background: headerBg, fontFamily: FONT.display, fontWeight: 800, fontSize: 28, letterSpacing: "0.04em", textAlign: "center", color: G.ink }}>{label}</p>
      {children}
    </div>
  );
}

function TeachersVsFoundersAd() {
  return (
    <AdFrame audience={AUDIENCE} background={G.forest} tone="dark">
      <AdCopy
        tone="dark"
        title={
          <>
            Teachers on break <Accent color={G.butter}>vs. founders on break.</Accent>
          </>
        }
        size={74}
      />
      <Scene>
        <Pin left={0} top={30} z={3} rotate={-1.5}>
          <SplitPanel label="TEACHERS ON BREAK" bg="#CFE3F5" headerBg={G.butter}>
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 10, display: "flex", justifyContent: "center" }}>
              <Crew name="clover" view="sleepy" width={230} />
            </div>
            <Hand size={38} color={G.forest} rotate={-4} style={{ position: "absolute", left: 24, top: 90 }}>
              pie. nap. pie.
            </Hand>
          </SplitPanel>
        </Pin>
        <Pin right={0} top={30} z={3} rotate={1.5}>
          <SplitPanel label="FOUNDERS ON BREAK" bg={BERRY} headerBg="#FFFFFF">
            {FOUNDER_TABS.map((t) => (
              <div key={t.label} style={{ position: "absolute", left: t.x, top: t.y }}>
                <BrowserTab label={t.label} tint={t.tint} rotate={t.r} />
              </div>
            ))}
          </SplitPanel>
        </Pin>
        <Bundle title="What you need: all of it, in one place" tone="dark" />
      </Scene>
      <Footer tone="dark" />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- B5a–c enjoy the break (crew versions, pick one)

function EnjoyTitle() {
  return (
    <AdCopy
      title={
        <>
          Enjoy the break. <Accent>We&rsquo;ll build it.</Accent>
        </>
      }
      size={84}
    />
  );
}

const CREW_LINES: Array<{ text: string; bg: string; name: "pip" | "loam" | "terra"; view: "wave" | "thumbs" | "point" }> = [
  { text: "enjoy the break! 🦃", bg: "#FFFFFF", name: "pip", view: "wave" },
  { text: "send us your website", bg: G.butter, name: "loam", view: "thumbs" },
  { text: "we'll build all of this, free 👇", bg: G.mint, name: "terra", view: "point" },
];

function CrewEnjoyTheBreakAd() {
  return (
    <AdFrame audience={AUDIENCE} background="#EEF5E9">
      <EnjoyTitle />
      <Scene>
        {CREW_LINES.map((line, i) => (
          <Pin key={line.name} left={i * 326} top={i === 1 ? 110 : 90} z={4} rotate={[-2, 1, -1][i]}>
            <SpeechBubble tail="bottom-left" size={30} width={300} bg={line.bg} style={{ padding: "18px 22px" }}>
              {line.text}
            </SpeechBubble>
          </Pin>
        ))}
        {CREW_LINES.map((line, i) => (
          <Pin key={`${line.name}-crew`} left={30 + i * 326} top={260} z={3}>
            <Crew name={line.name} view={line.view} width={190} />
          </Pin>
        ))}
        <Bundle title="Your free preview" />
      </Scene>
      <Footer />
    </AdFrame>
  );
}

function PreviewInTheOvenAd() {
  return (
    <AdFrame audience={AUDIENCE} background={G.peach}>
      <EnjoyTitle />
      <Scene>
        <Pin left={0} top={14} z={3} rotate={-1}>
          <div style={{ width: 560, boxSizing: "border-box", background: "#FFFAF4", border: `5px solid ${G.ink}`, borderRadius: 26, boxShadow: `0 10px 0 ${G.ink}`, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 18px", background: "#E4D8C8", borderBottom: `5px solid ${G.ink}` }}>
              {[0, 1, 2].map((k) => (
                <span key={k} style={{ width: 30, height: 30, borderRadius: 999, background: "#FFFFFF", border: `4px solid ${G.ink}`, boxSizing: "border-box" }} />
              ))}
              <span style={{ marginLeft: "auto", padding: "6px 14px", borderRadius: 10, background: G.ink, color: G.butter, fontFamily: FONT.body, fontWeight: 800, fontSize: 20, letterSpacing: "0.04em" }}>⏲ READY IN 2 BUSINESS DAYS</span>
            </div>
            <div style={{ padding: "16px 22px 22px" }}>
              <div style={{ height: 14, margin: "0 40px 14px", borderRadius: 999, background: "#9B8B78", border: `3px solid ${G.ink}` }} />
              <div style={{ position: "relative", height: 250, borderRadius: 16, border: `6px solid ${G.ink}`, background: "radial-gradient(circle at 50% 60%, #F7C873 0%, #E89A4B 70%)", overflow: "hidden", display: "flex", justifyContent: "center", paddingTop: 22, boxSizing: "border-box" }}>
                <YourAdminWindow scale={0.4} />
              </div>
            </div>
          </div>
        </Pin>
        <Pin left={600} top={40} z={4}>
          <Hand size={46} color={G.clayDeep} rotate={-4} style={{ lineHeight: 1.1 }}>
            you rest.
            <br />
            we cook.
          </Hand>
        </Pin>
        <Pin left={640} top={170} z={4}>
          <Crew name="dig" view="hold" width={230} />
        </Pin>
        <Bundle title="Out of the oven: your free preview" />
      </Scene>
      <Footer />
    </AdFrame>
  );
}

function DoorHanger({ bg, color, title, note, rotate }: { bg: string; color: string; title: ReactNode; note: ReactNode; rotate: number }) {
  return (
    <div style={{ position: "relative", width: 300, height: 400, boxSizing: "border-box", padding: "150px 22px 24px", background: bg, border: `5px solid ${G.ink}`, borderRadius: 30, boxShadow: `0 10px 0 ${G.ink}`, transform: `rotate(${rotate}deg)`, textAlign: "center" }}>
      <span aria-hidden style={{ position: "absolute", left: "50%", top: 30, marginLeft: -48, width: 96, height: 96, borderRadius: 999, background: G.lav, border: `5px solid ${G.ink}`, boxSizing: "border-box" }} />
      <span aria-hidden style={{ position: "absolute", left: "50%", top: 0, marginLeft: -9, width: 18, height: 40, background: G.lav, borderLeft: `5px solid ${G.ink}`, borderRight: `5px solid ${G.ink}`, boxSizing: "border-box" }} />
      <p style={{ margin: 0, fontFamily: FONT.display, fontWeight: 800, fontSize: 42, lineHeight: 1, letterSpacing: "0.02em", color }}>{title}</p>
      <Hand size={32} color={color} rotate={0} style={{ marginTop: 14, lineHeight: 1.15 }}>
        {note}
      </Hand>
    </div>
  );
}

function DoNotDisturbAd() {
  return (
    <AdFrame audience={AUDIENCE} background={G.lav}>
      <EnjoyTitle />
      <Scene>
        <Pin left={30} top={20} z={3}>
          <DoorHanger bg={BERRY} color="#FFFFFF" rotate={-5} title={<>DO NOT<br />DISTURB</>} note="enjoying Thanksgiving break 🦃" />
        </Pin>
        <Pin left={370} top={36} z={3}>
          <DoorHanger bg={G.butter} color={G.ink} rotate={4} title={<>CREW AT<br />WORK</>} note="building your free preview" />
        </Pin>
        <Pin right={-10} top={150} z={4}>
          <Crew name="pip" view="peek" width={220} flip />
        </Pin>
        <Bundle title="What the crew is building" />
      </Scene>
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- B6 send Monday

const PLAN = [
  { day: "MON", date: "Nov 23", label: "You send", text: "your website link", color: G.butter },
  { day: "WED", date: "Nov 25", label: "You get", text: "your free preview, built for you", color: G.mint },
  { day: "THU", date: "Nov 26 🦃", label: "You show", text: "the family your school\u2019s own app", color: G.peach },
];

function SendMondayAd() {
  return (
    <AdFrame audience={AUDIENCE} background={G.cream} pattern="grid">
      <AdCopy
        title={
          <>
            Send your website Monday.
            <br />
            <Accent>Get your school&rsquo;s preview by Wednesday.</Accent>
          </>
        }
        size={64}
      />
      <Scene>
        <div style={{ position: "absolute", left: 0, right: 0, top: 24, display: "flex", alignItems: "center", gap: 8 }}>
          {PLAN.map((step, i) => (
            <div key={step.day} style={{ display: "contents" }}>
              <InkCard bg="#FFFFFF" rotate={[-2, 1, -1][i]} style={{ flex: 1, padding: 0, overflow: "hidden", borderRadius: 24 }}>
                <div style={{ padding: "12px 16px", background: step.color, borderBottom: `4px solid ${G.ink}`, textAlign: "center" }}>
                  <span style={{ display: "block", fontFamily: FONT.display, fontWeight: 800, fontSize: 46, lineHeight: 1, color: G.ink }}>{step.day}</span>
                  <span style={{ display: "block", fontFamily: FONT.body, fontWeight: 800, fontSize: 20, color: G.soft, marginTop: 4 }}>{step.date}</span>
                </div>
                <div style={{ padding: "14px 14px 20px", textAlign: "center", minHeight: 150, boxSizing: "border-box" }}>
                  <p style={{ margin: 0, fontFamily: FONT.body, fontWeight: 800, fontSize: 20, letterSpacing: "0.14em", textTransform: "uppercase", color: BERRY }}>{step.label}</p>
                  <Hand size={36} color={G.ink} rotate={0} style={{ marginTop: 6, lineHeight: 1.15 }}>
                    {step.text}
                  </Hand>
                </div>
              </InkCard>
              {i < PLAN.length - 1 ? <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 48, color: BERRY }}>→</span> : null}
            </div>
          ))}
        </div>
        <Pin left={10} top={400} z={4}>
          <Hand size={40} color={G.clayDeep} rotate={-2}>
            within 2 business days. no call needed.
          </Hand>
        </Pin>
        <Bundle title="Wednesday, you get all four" />
      </Scene>
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- B7 December tuition

function DecemberTuitionAd() {
  return (
    <AdFrame audience={AUDIENCE} background={G.sky}>
      <AdCopy
        title={
          <>
            Dec 1 tuition, <Accent>in your own app.</Accent>
          </>
        }
        size={84}
      />
      <Scene>
        <Pin left={20} top={40} z={4} rotate={-4}>
          <InkCard style={{ width: 400, padding: 0, overflow: "hidden", textAlign: "center", borderRadius: 24 }}>
            <div style={{ padding: "12px 0", background: BERRY, borderBottom: `4px solid ${G.ink}`, fontFamily: FONT.display, fontWeight: 800, fontSize: 34, letterSpacing: "0.12em", color: "#FFFFFF" }}>DECEMBER</div>
            <p style={{ margin: "4px 0 0", fontFamily: FONT.display, fontWeight: 800, fontSize: 170, lineHeight: 1, color: G.ink }}>1</p>
            <Hand size={40} color={G.clayDeep} rotate={-3} style={{ padding: "0 0 18px" }}>
              tuition due
            </Hand>
          </InkCard>
        </Pin>
        <Pin left={40} top={430} z={5}>
          <Hand size={36} color={G.forest} rotate={-2}>
            right after break
          </Hand>
        </Pin>
        <Pin left={460} top={80} z={4}>
          <Annotation arrow="right" color={G.clayDeep} size={30}>
            see it in your
            <br />
            free preview
          </Annotation>
        </Pin>
        <Pin right={-10} top={24} z={3} rotate={4}>
          <YourParentPhone scale={0.56} screen="billing" />
        </Pin>
        <Bundle title="What you'd get, free" />
      </Scene>
      <Footer />
    </AdFrame>
  );
}
