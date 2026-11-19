"use client";

import type { ReactNode } from "react";
import type { MarketingCarousel, MarketingSlide } from "@/components/admin/marketing/carousels/types";
import { Mascot, type MascotName, type MascotView } from "@/components/admin/marketing/mascot/Mascot";
import {
  Accent,
  At,
  FONT,
  G,
  Hand,
  Headline,
  Kicker,
  MascotSlide,
  PaperSheet,
  PlacedMascot,
  SpeechBubble,
  StickyNote,
} from "@/components/admin/marketing/mascot/mascot-slide-kit";

// Standalone single posts. Pure character humour — no product claims (Photos and Committees
// have no marketing copy yet, so Flicker and Tansy appear only here).

export const MASCOT_CREW_SINGLES_CAROUSEL = {
  id: "mascot-crew-singles",
  title: "Crew single posts (8 one-offs)",
  description: "Standalone mascot posts — download each with “Download current”.",
  fileSlug: "mudkitchen-crew-singles",
  slides: [
    { id: "flicker-attempts", fileName: "single-01-flicker-one-photo.png", render: () => <FlickerAttempts /> },
    { id: "flicker-one-more", fileName: "single-02-flicker-just-one-more.png", render: () => <FlickerOneMore /> },
    { id: "tansy-meeting", fileName: "single-03-tansy-meeting.png", render: () => <TansyMeeting /> },
    { id: "tansy-signup", fileName: "single-04-tansy-signup-sheet.png", render: () => <TansySignup /> },
    { id: "crew-this-week", fileName: "single-05-which-crew-member-are-you.png", render: () => <CrewThisWeek /> },
    { id: "dig-monday-friday", fileName: "single-06-monday-dig-vs-friday-dig.png", render: () => <DigMondayFriday /> },
    { id: "pick-your-fighter", fileName: "single-07-pick-your-fighter.png", render: () => <PickYourFighter /> },
    { id: "quick-question", fileName: "single-08-quick-question.png", render: () => <QuickQuestion /> },
  ] satisfies MarketingSlide[],
} satisfies MarketingCarousel;

// ---------------------------------------------------------------- helpers

function Polaroid({ caption, tint = "#CFE2F3", rotate = 0, width = 250 }: { caption: string; tint?: string; rotate?: number; width?: number }) {
  return (
    <div
      style={{
        width,
        padding: "16px 16px 0",
        background: "#FFFFFF",
        borderRadius: 6,
        boxShadow: "0 14px 26px rgba(43,36,29,.2)",
        transform: `rotate(${rotate}deg)`,
      }}
    >
      <div style={{ height: width * 0.78, borderRadius: 3, background: tint, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: "12%", right: "12%", bottom: "18%", height: 10, borderRadius: 6, background: "rgba(43,36,29,.18)", filter: "blur(4px)" }} />
        <div style={{ position: "absolute", left: "30%", top: "24%", width: "40%", height: "40%", borderRadius: "50%", background: "rgba(43,36,29,.12)", filter: "blur(10px)" }} />
      </div>
      <Hand size={30} color={G.ink} rotate={0} style={{ padding: "12px 0 16px", textAlign: "center" }}>
        {caption}
      </Hand>
    </div>
  );
}

function VersusPanel({ label, name, view, children, tint }: { label: string; name: MascotName; view: MascotView; children: ReactNode; tint: string }) {
  return (
    <div style={{ flex: 1, minWidth: 0, background: tint, borderRadius: 36, padding: "26px 24px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, overflow: "hidden" }}>
      <Kicker bg={G.paper}>{label}</Kicker>
      <div style={{ minHeight: 210, display: "flex", alignItems: "center", textAlign: "center" }}>{children}</div>
      <Mascot name={name} view={view} width={360} style={{ marginTop: "auto" }} />
    </div>
  );
}

// ---------------------------------------------------------------- posts

function FlickerAttempts() {
  return (
    <MascotSlide background="#FFF3CF">
      <div style={{ position: "absolute", left: 72, right: 72, top: 120, zIndex: 5 }}>
        <Headline size={66}>
          Flicker trying to get one photo where <Accent>all 12 kids</Accent> look at the camera
        </Headline>
      </div>
      <At x={600} y={500} z={3}>
        <Polaroid caption="attempt 46" rotate={8} tint="#D9E8F5" />
      </At>
      <At x={700} y={760} z={4}>
        <Polaroid caption="47 (a blur)" rotate={-6} tint="#F5E0D3" />
      </At>
      <At x={560} y={1000} z={5}>
        <Polaroid caption="48 (an elbow)" rotate={4} tint="#E1EED7" width={230} />
      </At>
      <PlacedMascot name="flicker" view="determined" width={560} x={20} y={600} z={6} />
      <Hand size={40} color={G.clayDeep} rotate={-4} style={{ position: "absolute", left: 70, bottom: 60, zIndex: 7 }}>
        flicker does not give up.
      </Hand>
    </MascotSlide>
  );
}

function FlickerOneMore() {
  return (
    <MascotSlide background="#E3EDFB">
      <div style={{ position: "absolute", left: 72, right: 72, top: 120, zIndex: 5 }}>
        <Headline size={72}>
          a parent asks for <Accent>&ldquo;just one more&rdquo;</Accent> field trip photo
        </Headline>
      </div>
      {[-14, -6, 4, 12].map((r, i) => (
        <At key={r} x={600 + i * 18} y={520 + i * 30} z={2 + i}>
          <Polaroid caption={["#212", "#213", "#214", "#215"][i]} rotate={r} tint={["#D9E8F5", "#F5E0D3", "#E1EED7", "#EFE3F7"][i]} width={240} />
        </At>
      ))}
      <At x={70} y={500} z={7}>
        <SpeechBubble size={40} tail="bottom-right" width={420} bg="#FFF7DA">
          just one more!!
        </SpeechBubble>
      </At>
      <PlacedMascot name="flicker" view="sleepy" width={540} x={40} y={680} z={6} />
      <Hand size={40} color={G.forest} rotate={-4} style={{ position: "absolute", right: 70, bottom: 64, zIndex: 8 }}>
        it was not one more.
      </Hand>
    </MascotSlide>
  );
}

const MEETING_LINES = ["“let’s circle back”", "“quick round of intros”", "“any other business?”", "“let’s take this offline”"];

function TansyMeeting() {
  return (
    <MascotSlide background="#EEF5E9">
      <div style={{ position: "absolute", left: 72, right: 72, top: 120, zIndex: 5 }}>
        <Headline size={66}>
          Tansy at a committee meeting that <Accent>could have been a message</Accent>
        </Headline>
      </div>
      {MEETING_LINES.map((line, i) => (
        <At key={line} x={i % 2 ? 560 : 60} y={470 + i * 120} rotate={i % 2 ? 3 : -3} z={3}>
          <SpeechBubble size={34} tail={i % 2 ? "bottom-right" : "bottom-left"} width={440}>
            {line}
          </SpeechBubble>
        </At>
      ))}
      <PlacedMascot name="tansy" view="sleepy" width={520} x={280} y={800} z={6} />
      <Hand size={40} color={G.clayDeep} rotate={-4} style={{ position: "absolute", left: 70, bottom: 70, zIndex: 7 }}>
        minute 74.
      </Hand>
    </MascotSlide>
  );
}

function TansySignup() {
  return (
    <MascotSlide background={G.cream}>
      <div style={{ position: "absolute", left: 72, right: 72, top: 120, zIndex: 5 }}>
        <Headline size={68}>
          The volunteer sign-up sheet, <Accent>minute 1 vs minute 3</Accent>
        </Headline>
      </div>
      <div style={{ position: "absolute", left: 50, right: 50, top: 380, bottom: 60, display: "flex", gap: 20 }}>
        <VersusPanel label="Minute 1" name="tansy" view="excited" tint="#E3EDFB">
          <p style={{ margin: 0, fontFamily: FONT.display, fontWeight: 800, fontSize: 44, lineHeight: 1.1 }}>0 sign-ups. &ldquo;it&rsquo;s early!&rdquo;</p>
        </VersusPanel>
        <VersusPanel label="Minute 3" name="tansy" view="tears" tint="#F8DDCF">
          <p style={{ margin: 0, fontFamily: FONT.display, fontWeight: 800, fontSize: 40, lineHeight: 1.12 }}>
            Napkins: 23 people
            <br />
            <span style={{ color: G.clay }}>Setup: 0. Cleanup: 0.</span>
          </p>
        </VersusPanel>
      </div>
    </MascotSlide>
  );
}

const CREW: { name: MascotName; view: MascotView; label: string; vibe: string }[] = [
  { name: "pip", view: "happy", label: "Pip", vibe: "optimistic" },
  { name: "nutmeg", view: "cheeky", label: "Nutmeg", vibe: "politely owed money" },
  { name: "dig", view: "oops", label: "Dig", vibe: "47 tabs open" },
  { name: "terra", view: "sleepy", label: "Terra", vibe: "slow but steady" },
  { name: "fennel", view: "surprised", label: "Fennel", vibe: "counting heads" },
  { name: "clover", view: "excited", label: "Clover", vibe: "very busy" },
  { name: "marigold", view: "wink", label: "Marigold", vibe: "main character" },
  { name: "loam", view: "shy", label: "Loam", vibe: "wrong group chat" },
  { name: "dot", view: "surprised", label: "Dot", vibe: "it’s picture day??" },
  { name: "flicker", view: "love", label: "Flicker", vibe: "one more photo" },
  { name: "bramble", view: "confused", label: "Bramble", vibe: "lost the form" },
  { name: "tansy", view: "sleepy", label: "Tansy", vibe: "in a meeting" },
];
const TILE_TINTS = ["#FFF3CF", "#F8DDCF", "#E3EDFB", "#DDEBD5", "#ECE2F3", "#FDEBDD"];

function CrewThisWeek() {
  return (
    <MascotSlide background={G.cream}>
      <div style={{ position: "absolute", left: 60, right: 60, top: 110, zIndex: 5 }}>
        <Headline size={58}>
          Which MudKitchen crew member <Accent>are you this week?</Accent>
        </Headline>
      </div>
      <div style={{ position: "absolute", left: 44, right: 44, top: 290, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {CREW.map((c, i) => (
          <div key={c.name} style={{ background: TILE_TINTS[i % TILE_TINTS.length], borderRadius: 24, padding: "8px 8px 14px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Mascot name={c.name} view={c.view} width={168} ground={false} />
            <p style={{ margin: "2px 0 0", fontFamily: FONT.display, fontWeight: 800, fontSize: 28, color: G.ink }}>{c.label}</p>
            <p style={{ margin: "2px 0 0", fontFamily: FONT.hand, fontSize: 24, color: G.clayDeep, textAlign: "center", lineHeight: 1.05 }}>{c.vibe}</p>
          </div>
        ))}
      </div>
      <Hand size={42} color={G.forest} rotate={-4} style={{ position: "absolute", right: 70, bottom: 48, zIndex: 6, whiteSpace: "nowrap" }}>
        tell us yours ↓
      </Hand>
    </MascotSlide>
  );
}

function DigMondayFriday() {
  return (
    <MascotSlide background={G.cream}>
      <div style={{ position: "absolute", left: 72, right: 72, top: 120, zIndex: 5 }}>
        <Headline size={80}>
          Monday Dig <Accent>vs</Accent> Friday Dig
        </Headline>
      </div>
      <div style={{ position: "absolute", left: 50, right: 50, top: 300, bottom: 60, display: "flex", gap: 20 }}>
        <VersusPanel label="Monday" name="dig" view="determined" tint="#DDEBD5">
          <p style={{ margin: 0, fontFamily: FONT.display, fontWeight: 800, fontSize: 46, lineHeight: 1.1 }}>&ldquo;inbox zero by noon.&rdquo;</p>
        </VersusPanel>
        <VersusPanel label="Friday" name="dig" view="sleepy" tint="#ECE2F3">
          <p style={{ margin: 0, fontFamily: FONT.display, fontWeight: 800, fontSize: 46, lineHeight: 1.1 }}>
            &ldquo;the inbox and I <span style={{ color: G.clay }}>don&rsquo;t talk</span>.&rdquo;
          </p>
        </VersusPanel>
      </div>
    </MascotSlide>
  );
}

const FIGHTERS: { name: MascotName; view: MascotView; label: string; move: string; tint: string }[] = [
  { name: "pip", view: "determined", label: "Pip", move: "remembers every family’s name", tint: "#FFF3CF" },
  { name: "nutmeg", view: "cheeky", label: "Nutmeg", move: "the polite reminder (×7)", tint: "#F8DDCF" },
  { name: "bramble", view: "determined", label: "Bramble", move: "finds the lost form", tint: "#DDEBD5" },
];

function PickYourFighter() {
  return (
    <MascotSlide background="#2E4A3C">
      <div style={{ position: "absolute", left: 72, right: 72, top: 120, zIndex: 5 }}>
        <Headline size={86} color={G.cream}>
          Pick your <Accent color={G.butter}>fighter</Accent>
        </Headline>
      </div>
      <div style={{ position: "absolute", left: 46, right: 46, top: 420, display: "flex", gap: 16 }}>
        {FIGHTERS.map((f) => (
          <div key={f.name} style={{ flex: 1, background: f.tint, borderRadius: 30, padding: "18px 14px 22px", display: "flex", flexDirection: "column", alignItems: "center", border: `4px solid ${G.ink}`, boxShadow: `0 10px 0 ${G.forestDeep}` }}>
            <Mascot name={f.name} view={f.view} width={290} />
            <p style={{ margin: "6px 0 0", fontFamily: FONT.display, fontWeight: 800, fontSize: 40, color: G.ink }}>{f.label}</p>
            <p style={{ margin: "8px 0 0", fontFamily: FONT.body, fontWeight: 800, fontSize: 16, letterSpacing: "0.1em", textTransform: "uppercase", color: G.clayDeep }}>Special move</p>
            <p style={{ margin: "4px 0 0", fontFamily: FONT.hand, fontSize: 30, lineHeight: 1.1, textAlign: "center", color: G.ink }}>{f.move}</p>
          </div>
        ))}
      </div>
      <Hand size={42} color={G.mint} rotate={-4} style={{ position: "absolute", left: 72, bottom: 60, zIndex: 6, whiteSpace: "nowrap" }}>
        comment your pick ↓
      </Hand>
    </MascotSlide>
  );
}

const REACTIONS: { name: MascotName; view: MascotView; label: string }[] = [
  { name: "dig", view: "surprised", label: "Dig" },
  { name: "pip", view: "oops", label: "Pip" },
  { name: "nutmeg", view: "confused", label: "Nutmeg" },
  { name: "fennel", view: "sleepy", label: "Fennel" },
  { name: "clover", view: "laughing", label: "Clover" },
  { name: "dot", view: "tears", label: "Dot" },
];

function QuickQuestion() {
  return (
    <MascotSlide background="#FDEBDD">
      <div style={{ position: "absolute", left: 72, right: 72, top: 120, zIndex: 5 }}>
        <Headline size={70}>
          The crew when someone says <Accent>&ldquo;quick question&rdquo;</Accent>
        </Headline>
      </div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 390, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
        {REACTIONS.map((r, i) => (
          <div key={r.name} style={{ background: TILE_TINTS[(i + 2) % TILE_TINTS.length], borderRadius: 28, padding: "10px 10px 16px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Mascot name={r.name} view={r.view} width={230} ground={false} />
            <p style={{ margin: 0, fontFamily: FONT.display, fontWeight: 800, fontSize: 30, color: G.ink }}>{r.label}</p>
          </div>
        ))}
      </div>
      <At x={640} y={1180} rotate={-3} z={6}>
        <StickyNote width={330} color={G.butter} rotate={-3}>
          <Hand size={36} color={G.ink} rotate={0}>
            (it was not quick)
          </Hand>
        </StickyNote>
      </At>
      <At x={70} y={1190} z={2}>
        <PaperSheet width={110} rotate={-8} label="Q?" />
      </At>
    </MascotSlide>
  );
}
