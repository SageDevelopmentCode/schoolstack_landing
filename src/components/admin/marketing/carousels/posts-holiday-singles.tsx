"use client";

import type { ReactNode } from "react";
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
  Hand,
  InkCard,
  PINE,
  Pin,
  Scene,
  SpeechBubble,
} from "@/components/admin/marketing/ads/ad-kit";
import type { MascotName, MascotView } from "@/components/admin/marketing/mascot/Mascot";

// Organic single posts for Thanksgiving through New Year (no offer, no "Book a demo" button).
// Captions in `adCopy` match the Schedule tab of the social playbook doc.

const TAGS = "#microschool #schoolfounder #microschooling";

export const POSTS_HOLIDAY_SINGLES_CAROUSEL = {
  id: "posts-holiday-singles",
  title: "Holiday singles: Thanksgiving to New Year (12)",
  description: "Organic single posts for late November through early January: memes, polls, templates. No offer.",
  fileSlug: "mudkitchen-holiday-singles",
  kind: "post",
  slides: [
    {
      id: "thankful",
      fileName: "holiday-01-thankful-for.png",
      render: () => <ThankfulPost />,
      adCopy: { primaryText: `Things we're thankful for this year, in order:\n\nAutopay. Forms that come back signed. A quiet inbox.\nAnd you, obviously. Happy Thanksgiving to every founder who teaches, bills and answers the 9pm texts. 🧡\n\n${TAGS} #thanksgiving`, headline: "Things we're thankful for" },
    },
    {
      id: "black-friday",
      fileName: "holiday-02-black-friday-haul.png",
      render: () => <BlackFridayPost />,
      adCopy: { primaryText: `Our Black Friday haul: one calm spring semester. No checkout, no line at 5am.\n\nWhat's the one thing you'd add to your school's cart? 👇\n\n${TAGS} #blackfriday`, headline: "Black Friday haul: 1 calm semester" },
    },
    {
      id: "december-crew",
      fileName: "holiday-03-which-crew-member-december.png",
      render: () => <DecemberCrewPost />,
      adCopy: { primaryText: `Which crew member is getting you through December? Comment a letter.\n\nWe're a solid E. Someone has to answer "is there school on the 23rd?"\n\n${TAGS} #schoollife`, headline: "Which crew member are you this December?" },
    },
    {
      id: "december-timeline",
      fileName: "holiday-04-december-as-told-by-a-founder.png",
      render: () => <DecemberTimelinePost />,
      adCopy: { primaryText: `December, as told by a microschool founder. Week 4 is a lifestyle.\n\nTag the founder who's currently in week 2. 🎄\n\n${TAGS} #founderlife`, headline: "December, as told by a founder" },
    },
    {
      id: "holiday-program-checklist",
      fileName: "holiday-05-holiday-program-checklist.png",
      render: () => <ProgramChecklistPost />,
      adCopy: { primaryText: `Holiday program in two weeks? Save this checklist.\n\nPermission slips, costumes, volunteers, photos, programs: tick them off now and enjoy the show later.\n\n${TAGS} #holidayprogram`, headline: "Holiday program checklist" },
    },
    {
      id: "two-truths",
      fileName: "holiday-06-two-truths-and-a-lie.png",
      render: () => <TwoTruthsPost />,
      adCopy: { primaryText: `Two truths and a lie, microschool founder edition. Which one's the lie? 1, 2 or 3?\n\n(Loam knows. Loam is not telling.)\n\n${TAGS}`, headline: "Two truths and a lie: founder edition" },
    },
    {
      id: "out-of-office",
      fileName: "holiday-07-winter-break-out-of-office.png",
      render: () => <OutOfOfficePost />,
      adCopy: { primaryText: `Your winter break out-of-office, written for you. Copy it, fill in the brackets, close the laptop.\n\nYou are allowed to not reply until January. We checked.\n\n${TAGS} #winterbreak`, headline: "A winter break auto-reply template" },
    },
    {
      id: "gift-guide",
      fileName: "holiday-08-gift-guide-for-founders.png",
      render: () => <GiftGuidePost />,
      adCopy: { primaryText: `The only gift guide a microschool founder needs.\n\n1. A printer that works. 2. A second coffee. 3. Three more hours. 4. One system for everything else.\n\nWhich one are you asking for? 🎁\n\n${TAGS} #giftguide`, headline: "A gift guide for microschool founders" },
    },
    {
      id: "real-break",
      fileName: "holiday-09-you-deserve-a-real-break.png",
      render: () => <RealBreakPost />,
      adCopy: { primaryText: `Unpopular opinion: you deserve a real break this year.\n\nNot a "check email once a day" break. A real one. Clover is already practicing.\n\n${TAGS} #winterbreak`, headline: "You deserve a real break" },
    },
    {
      id: "resolution-bingo",
      fileName: "holiday-10-resolution-bingo.png",
      render: () => <BingoPost />,
      adCopy: { primaryText: `New Year's resolution bingo, school founder edition. How many squares are you going for?\n\nScreenshot it, circle yours, and check back in March. 😅\n\n${TAGS} #newyear`, headline: "New Year's resolution bingo" },
    },
    {
      id: "year-wrapped",
      fileName: "holiday-11-school-year-wrapped.png",
      render: () => <WrappedPost />,
      adCopy: { primaryText: `Your school year, wrapped. Top phrase: "quick question." Top app: Venmo. Top genre: permission slips.\n\nWhat would be on yours? 👇\n\n${TAGS} #wrapped`, headline: "Your school year, wrapped" },
    },
    {
      id: "break-mode",
      fileName: "holiday-12-winter-break-mode-on.png",
      render: () => <BreakModePost />,
      adCopy: { primaryText: `Winter break mode: on. The crew is off until January, and we hope you are too.\n\nSee you in the new year. ❄️\n\n${TAGS}`, headline: "Winter break mode: on" },
    },
  ] satisfies MarketingSlide[],
} satisfies MarketingCarousel;

// ---------------------------------------------------------------- shared

function Row({ children, rotate = 0, bg = "#FFFFFF" }: { children: ReactNode; rotate?: number; bg?: string }) {
  return (
    <InkCard rotate={rotate} bg={bg} style={{ display: "flex", alignItems: "center", gap: 20, padding: "16px 26px" }}>
      {children}
    </InkCard>
  );
}

const rowText = { fontFamily: FONT.body, fontWeight: 800, fontSize: 34, lineHeight: 1.2, color: G.ink } as const;

// ---------------------------------------------------------------- 1 thankful

const THANKFUL: Array<{ name: MascotName; label: string }> = [
  { name: "nutmeg", label: "Autopay" },
  { name: "bramble", label: "Forms that come back signed" },
  { name: "loam", label: "A quiet inbox" },
];

function ThankfulPost() {
  return (
    <AdFrame background={G.peach}>
      <AdCopy
        title={
          <>
            Things we&apos;re <Accent>thankful for:</Accent>
          </>
        }
        size={92}
      />
      <Scene>
        <div style={{ position: "absolute", left: 0, right: 0, top: 30, display: "flex", flexDirection: "column", gap: 20 }}>
          {THANKFUL.map((item, i) => (
            <Row key={item.name} rotate={i % 2 ? 1 : -1}>
              <Crew name={item.name} view="love" width={130} ground={false} />
              <span style={{ ...rowText, fontSize: 40 }}>{item.label}</span>
            </Row>
          ))}
        </div>
        <Pin right={10} bottom={20} z={5}>
          <Hand size={48} color={G.clayDeep} rotate={-4}>
            and you. obviously.
          </Hand>
        </Pin>
      </Scene>
      <AdFooter variant="site" />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- 2 Black Friday

const RECEIPT: Array<[string, string]> = [
  ["1 calm spring semester", "×1"],
  ["Tuition on autopay", "✓"],
  ["“Quick question” texts", "0"],
  ["Lines at 5am", "none"],
];

function BlackFridayPost() {
  return (
    <AdFrame background="#2B241D" tone="dark">
      <AdCopy
        tone="dark"
        title={
          <>
            Black Friday haul:
            <br />
            <Accent color={G.butter}>1 calm spring semester.</Accent>
          </>
        }
        hand="no checkout required."
        size={82}
      />
      <Scene>
        <Pin left={20} top={30} z={4}>
          <div style={{ width: 520, padding: "28px 32px 34px", background: "#FFFDF8", transform: "rotate(-3deg)", boxShadow: "0 16px 30px rgba(0,0,0,.35)", clipPath: "polygon(0 0, 100% 0, 100% 96%, 95% 100%, 90% 96%, 85% 100%, 80% 96%, 75% 100%, 70% 96%, 65% 100%, 60% 96%, 55% 100%, 50% 96%, 45% 100%, 40% 96%, 35% 100%, 30% 96%, 25% 100%, 20% 96%, 15% 100%, 10% 96%, 5% 100%, 0 96%)" }}>
            <p style={{ margin: "0 0 16px", textAlign: "center", fontFamily: FONT.body, fontWeight: 800, fontSize: 24, letterSpacing: "0.14em", color: G.soft }}>MUDKITCHEN · RECEIPT</p>
            {RECEIPT.map(([item, qty]) => (
              <div key={item} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderTop: "2px dashed #E4D8C8", fontFamily: FONT.body, fontWeight: 800, fontSize: 28, color: G.ink }}>
                <span>{item}</span>
                <span>{qty}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 14, borderTop: `3px solid ${G.ink}`, fontFamily: FONT.display, fontWeight: 800, fontSize: 32, color: G.ink }}>
              <span>Total</span>
              <span>one system</span>
            </div>
          </div>
        </Pin>
        <Pin right={-30} bottom={0} z={5}>
          <Crew name="dig" view="excited" width={320} flip />
        </Pin>
      </Scene>
      <AdFooter tone="dark" variant="site" />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- 3 which crew member

const DECEMBER: Array<{ letter: string; name: MascotName; view: MascotView; role: string }> = [
  { letter: "A", name: "nutmeg", view: "determined", role: "chases the last tuition" },
  { letter: "B", name: "dot", view: "surprised", role: "remembers the program" },
  { letter: "C", name: "tansy", view: "happy", role: "fills the cookie sign-up" },
  { letter: "D", name: "flicker", view: "silly", role: "takes 400 photos" },
  { letter: "E", name: "loam", view: "thinking", role: "“school on the 23rd?”" },
  { letter: "F", name: "clover", view: "sleepy", role: "counts down to break" },
];

function DecemberCrewPost() {
  return (
    <AdFrame background={G.mint} snow>
      <AdCopy
        title={
          <>
            Who&apos;s getting you <Accent>through December?</Accent>
          </>
        }
        hand="comment a letter."
        size={84}
      />
      <Scene style={{ display: "flex", alignItems: "center" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px 18px", width: "100%" }}>
          {DECEMBER.map((member) => (
            <InkCard key={member.letter} bg="#FFFFFF" style={{ padding: "14px 12px 16px", display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
              <span style={{ position: "absolute", top: 10, left: 14, fontFamily: FONT.display, fontWeight: 800, fontSize: 36, color: G.clay }}>{member.letter}</span>
              <Crew name={member.name} view={member.view} width={150} ground={false} />
              <span style={{ fontFamily: FONT.hand, fontSize: 28, lineHeight: 1.1, color: G.ink, textAlign: "center" }}>{member.role}</span>
            </InkCard>
          ))}
        </div>
      </Scene>
      <AdFooter variant="site" />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- 4 December timeline

const WEEKS: Array<{ week: string; line: string; tint: string }> = [
  { week: "Week 1", line: "Holiday program rehearsal #1. Adorable.", tint: G.butter },
  { week: "Week 2", line: "Who has the costumes??", tint: G.peach },
  { week: "Week 3", line: "“Is there school on the 23rd?” ×30", tint: "#ECE2F3" },
  { week: "Week 4", line: "*lies face down on the rug*", tint: "#DCE8F5" },
];

function DecemberTimelinePost() {
  return (
    <AdFrame background={G.cream} snow garland>
      <AdCopy
        title={
          <>
            December, as told by <Accent>a microschool founder.</Accent>
          </>
        }
        size={78}
      />
      <Scene>
        <div style={{ position: "absolute", left: 0, top: 24, width: 720, display: "flex", flexDirection: "column", gap: 16 }}>
          {WEEKS.map((week, i) => (
            <Row key={week.week} rotate={i % 2 ? 1 : -1} bg={week.tint}>
              <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 30, color: G.clayDeep, whiteSpace: "nowrap" }}>{week.week}</span>
              <span style={rowText}>{week.line}</span>
            </Row>
          ))}
        </div>
        <Pin right={-40} bottom={0} z={5}>
          <Crew name="dot" view="tears" width={290} flip />
        </Pin>
      </Scene>
      <AdFooter variant="site" />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- 5 program checklist

function ProgramChecklistPost() {
  return (
    <AdFrame background="#E7EFF8" snow>
      <AdCopy
        title={
          <>
            Holiday program <Accent>checklist.</Accent>
          </>
        }
        hand="save this one."
        size={92}
      />
      <Scene>
        <Pin left={0} top={30} z={4}>
          <InkCard width={680} rotate={-1.5}>
            <CheckList
              size={36}
              rows={[
                { label: "Permission slips signed" },
                { label: "Costumes sorted (and labeled)" },
                { label: "Volunteer sign-ups full" },
                { label: "Someone on photos" },
                { label: "Programs printed" },
              ]}
            />
          </InkCard>
        </Pin>
        <Pin right={-40} bottom={0} z={5}>
          <Crew name="tansy" view="point" width={300} flip />
        </Pin>
      </Scene>
      <AdFooter variant="site" />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- 6 two truths

const TRUTHS = ["I've answered a parent text at 11pm", "I've fixed the printer with a paperclip", "I've never re-typed the same form twice"];

function TwoTruthsPost() {
  return (
    <AdFrame background="#F3EEF8">
      <AdCopy
        title={
          <>
            Two truths and a lie: <Accent>founder edition.</Accent>
          </>
        }
        hand="guess the lie. 1, 2 or 3?"
        size={84}
      />
      <Scene>
        <div style={{ position: "absolute", left: 0, top: 30, width: 720, display: "flex", flexDirection: "column", gap: 18 }}>
          {TRUTHS.map((line, i) => (
            <Row key={line} rotate={i % 2 ? 1 : -1}>
              <span style={{ width: 60, height: 60, flexShrink: 0, borderRadius: 999, background: [G.butter, G.peach, G.mint][i], border: `4px solid ${G.ink}`, display: "grid", placeItems: "center", fontFamily: FONT.display, fontWeight: 800, fontSize: 32, color: G.ink }}>
                {i + 1}
              </span>
              <span style={rowText}>{line}</span>
            </Row>
          ))}
        </div>
        <Pin right={-40} bottom={0} z={5}>
          <Crew name="loam" view="cheeky" width={300} flip />
        </Pin>
      </Scene>
      <AdFooter variant="site" />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- 7 out of office

function Mark({ children }: { children: ReactNode }) {
  return <span style={{ background: G.butter, borderRadius: 8, padding: "0 6px" }}>{children}</span>;
}

function OutOfOfficePost() {
  return (
    <AdFrame background={G.sky} snow>
      <AdCopy
        title={
          <>
            Your winter break <Accent>out-of-office.</Accent>
          </>
        }
        hand="copy, paste, close the laptop."
        size={84}
      />
      <Scene>
        <Pin left={0} top={30} z={4}>
          <InkCard width={740} rotate={-1.5} style={{ padding: "28px 34px" }}>
            <p style={{ margin: "0 0 12px", fontFamily: FONT.body, fontWeight: 800, fontSize: 22, letterSpacing: "0.12em", color: G.clayDeep }}>AUTO-REPLY</p>
            <p style={{ margin: 0, fontFamily: FONT.body, fontWeight: 700, fontSize: 30, lineHeight: 1.42, color: G.ink }}>
              Thanks for your message! <Mark>[School]</Mark> is closed for winter break from <Mark>[date]</Mark> to <Mark>[date]</Mark>. For anything urgent, contact <Mark>[name, number]</Mark>. We&apos;ll reply when we&apos;re back on <Mark>[date]</Mark>. Happy holidays!
            </p>
          </InkCard>
        </Pin>
        <Pin right={-40} bottom={0} z={5}>
          <Crew name="loam" view="sleepy" width={300} flip />
        </Pin>
      </Scene>
      <AdFooter variant="site" />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- 8 gift guide

const GIFTS: Array<{ label: string; color: string; ribbon: string }> = [
  { label: "A printer that works", color: BERRY, ribbon: G.butter },
  { label: "A second coffee", color: PINE, ribbon: G.peach },
  { label: "3 more hours", color: "#7FB3D5", ribbon: G.butter },
  { label: "One system for the rest", color: "#B9A1D0", ribbon: G.butter },
];

function GiftGuidePost() {
  return (
    <AdFrame background={G.cream} garland snow>
      <AdCopy
        title={
          <>
            Gift guide for <Accent>microschool founders.</Accent>
          </>
        }
        size={82}
      />
      <Scene>
        <div style={{ position: "absolute", left: 0, top: 20, width: 640, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px" }}>
          {GIFTS.map((gift) => (
            <div key={gift.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <GiftBox width={170} color={gift.color} ribbon={gift.ribbon} />
              <span style={{ fontFamily: FONT.body, fontWeight: 800, fontSize: 28, color: G.ink, textAlign: "center" }}>{gift.label}</span>
            </div>
          ))}
        </div>
        <Pin right={-40} bottom={0} z={5}>
          <Crew name="marigold" view="excited" width={300} flip />
        </Pin>
      </Scene>
      <AdFooter variant="site" />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- 9 real break

function RealBreakPost() {
  return (
    <AdFrame background={G.forest} tone="dark" snow>
      <AdCopy
        tone="dark"
        title={
          <>
            Unpopular opinion:
          </>
        }
        size={84}
      />
      <Scene>
        <Pin left={0} top={20} z={4}>
          <SpeechBubble size={74} width={760} tail="bottom-right" style={{ transform: "rotate(-2deg)" }}>
            you deserve a <Accent>real</Accent> break this year.
          </SpeechBubble>
        </Pin>
        <Pin left={0} bottom={30} z={5}>
          <Hand size={42} color={G.butter} rotate={-3}>
            not a &ldquo;check email once a day&rdquo; break.
            <br />a real one.
          </Hand>
        </Pin>
        <Pin right={-30} bottom={0} z={5}>
          <Crew name="clover" view="sleepy" width={340} flip />
        </Pin>
      </Scene>
      <AdFooter tone="dark" variant="site" />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- 10 bingo

const BINGO = ["Laptop shut by 6", "No paper forms", "Everyone on autopay", "Take a lunch break", "FREE (you earned it)", "One open house", "“I’ll reply tomorrow”", "Inbox zero (lol)", "A real vacation"];

function BingoPost() {
  return (
    <AdFrame background={G.butter}>
      <AdCopy
        title={
          <>
            New Year&apos;s resolution <Accent>bingo.</Accent>
          </>
        }
        hand="screenshot it. circle yours."
        size={90}
      />
      <Scene>
        <Pin left={0} top={20} z={4}>
          <div style={{ width: 660, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", border: `4px solid ${G.ink}`, borderRadius: 24, overflow: "hidden", background: "#FFFFFF", boxShadow: `0 10px 0 ${G.ink}`, transform: "rotate(-1.5deg)" }}>
            {BINGO.map((square, i) => (
              <div
                key={square}
                style={{
                  height: 170,
                  display: "grid",
                  placeItems: "center",
                  padding: 14,
                  boxSizing: "border-box",
                  textAlign: "center",
                  background: i === 4 ? G.forest : "transparent",
                  borderRight: i % 3 < 2 ? `3px solid ${G.ink}` : "none",
                  borderBottom: i < 6 ? `3px solid ${G.ink}` : "none",
                  fontFamily: i === 4 ? FONT.hand : FONT.body,
                  fontWeight: i === 4 ? 400 : 800,
                  fontSize: i === 4 ? 32 : 27,
                  lineHeight: 1.15,
                  color: i === 4 ? G.butter : G.ink,
                }}
              >
                {square}
              </div>
            ))}
          </div>
        </Pin>
        <Pin right={-40} bottom={0} z={5}>
          <Crew name="pip" view="excited" width={270} flip />
        </Pin>
      </Scene>
      <AdFooter variant="site" />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- 11 wrapped

const WRAPPED: Array<[string, string]> = [
  ["Your top phrase", "“quick question”"],
  ["Your most-used app", "Venmo (sorry)"],
  ["Your top genre", "permission slips"],
  ["Minutes spent looking for a form", "yes"],
];

function WrappedPost() {
  return (
    <AdFrame background="#3B2A55" tone="dark" snow>
      <AdCopy
        tone="dark"
        title={
          <>
            Your school year, <Accent color={G.butter}>wrapped.</Accent>
          </>
        }
        size={92}
      />
      <Scene>
        <div style={{ position: "absolute", left: 0, top: 30, width: 700, display: "flex", flexDirection: "column", gap: 14 }}>
          {WRAPPED.map(([label, value], i) => (
            <div key={label} style={{ padding: "18px 26px", borderRadius: 24, background: [G.butter, G.peach, G.mint, "#DCE8F5"][i], transform: `rotate(${i % 2 ? 1 : -1}deg)` }}>
              <p style={{ margin: 0, fontFamily: FONT.body, fontWeight: 800, fontSize: 24, color: G.soft }}>{label}</p>
              <p style={{ margin: "2px 0 0", fontFamily: FONT.display, fontWeight: 800, fontSize: 44, lineHeight: 1.05, color: G.ink }}>{value}</p>
            </div>
          ))}
        </div>
        <Pin right={-40} bottom={0} z={5}>
          <Crew name="dig" view="silly" width={290} flip />
        </Pin>
      </Scene>
      <AdFooter tone="dark" variant="site" />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- 12 break mode

const SLEEPERS: MascotName[] = ["pip", "nutmeg", "dig", "loam", "clover"];

function BreakModePost() {
  return (
    <AdFrame background="#1F2A3A" tone="dark" snow garland>
      <AdCopy
        tone="dark"
        title={
          <>
            Winter break mode: <Accent color={G.butter}>on.</Accent>
          </>
        }
        sub="The crew is off until January. We hope you are too."
        size={92}
      />
      <Scene>
        <Pin right={40} top={30} z={4}>
          <Hand size={64} color="rgba(255,250,244,.75)" rotate={-6}>
            Zzz…
          </Hand>
        </Pin>
        <div style={{ position: "absolute", left: -30, right: -30, bottom: 0, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          {SLEEPERS.map((name) => (
            <Crew key={name} name={name} view="sleepy" width={200} />
          ))}
        </div>
      </Scene>
      <AdFooter tone="dark" variant="site" />
    </AdFrame>
  );
}
