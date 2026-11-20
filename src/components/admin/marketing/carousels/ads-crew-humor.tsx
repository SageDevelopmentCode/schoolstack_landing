"use client";

import type { MarketingCarousel, MarketingSlide } from "@/components/admin/marketing/carousels/types";
import {
  Accent,
  AdCopy,
  AdFooter,
  AdFrame,
  Crew,
  FONT,
  G,
  Hand,
  NotificationCard,
  PaperSheet,
  Pin,
  Scene,
  StickyNote,
} from "@/components/admin/marketing/ads/ad-kit";
import { BrowserTab } from "@/components/admin/marketing/mascot/mascot-slide-kit";
import type { MascotName } from "@/components/admin/marketing/mascot/Mascot";

// Set C: the crew's voice (self-aware, a little dramatic, always in role). Scroll-stoppers first,
// product second, offer chip last (switch it off for the control version).

export const ADS_CREW_HUMOR_CAROUSEL = {
  id: "ads-crew-humor",
  title: "Ads: Crew voice (6)",
  description: "Character-humour single ads: a meme hook, the product payoff and the offer chip. Feed + story.",
  fileSlug: "mudkitchen-ads-crew-humor",
  kind: "ad",
  offerToggle: true,
  sizes: ["feed", "story"],
  slides: [
    {
      id: "ninth-tab",
      fileName: "ad-c1-dig-ninth-tab.png",
      render: () => <NinthTabAd />,
      adCopy: {
        primaryText:
          "Microschool directors: opening the 9th tab to check whether a family paid tuition? MudKitchen puts enrollment, billing and messages in one workspace. Book a demo, start a paid plan within 30 days, and get a $200 Amazon gift card. Terms apply.",
        headline: "47 tabs → 1",
        description: "The admin portal for microschools.",
      },
    },
    {
      id: "new-rule",
      fileName: "ad-c2-nutmeg-new-rule.png",
      render: () => <NewRuleAd />,
      adCopy: {
        primaryText:
          "For microschool owners, Nutmeg's new rule: no chasing tuition over winter break. Families set up autopay once and tuition gets paid on time. Book a demo, start a paid plan within 30 days, and get a $200 Amazon gift card. Terms apply.",
        headline: "No more chasing tuition",
        description: "Bills, autopay and payment history in one place.",
      },
    },
    {
      id: "quick-question",
      fileName: "ad-c3-loam-quick-question.png",
      render: () => <QuickQuestionAd />,
      adCopy: {
        primaryText:
          "Microschool founders know this one. 9:47pm on Christmas Eve: \"quick question\". MudKitchen keeps every parent message in one inbox, so nothing gets lost in a group chat. Book a demo, start a paid plan within 30 days, and get a $200 Amazon gift card. Terms apply.",
        headline: "Every message, in the right place",
        description: "One inbox for every family.",
      },
    },
    {
      id: "in-the-car",
      fileName: "ad-c4-bramble-in-the-car.png",
      render: () => <InTheCarAd />,
      adCopy: {
        primaryText:
          "POV: you run a microschool, it's January and 22 enrollment forms are \"in the car.\" With MudKitchen, families fill in and sign forms online, and you see what's still missing. Book a demo, start a paid plan within 30 days, and get a $200 Amazon gift card. Terms apply.",
        headline: "Forms that don't live in the car",
        description: "Online forms and signatures.",
      },
    },
    {
      id: "pick-your-fighter",
      fileName: "ad-c5-pick-your-fighter.png",
      render: () => <PickFighterAd />,
      adCopy: {
        primaryText:
          "Microschool founders, pick your fighter for spring enrollment. Plot twist: you get the whole crew. Website, enrollment, tuition, attendance, messages and more in one place. Book a demo, start a paid plan within 30 days, and get a $200 Amazon gift card. Terms apply.",
        headline: "Plot twist: you get all 12",
        description: "Everything your microschool needs.",
      },
    },
    {
      id: "pip-resolution",
      fileName: "ad-c6-pip-resolution.png",
      render: () => <ResolutionAd />,
      adCopy: {
        primaryText:
          "For microschool directors: Pip's only New Year's resolution: no more paper applications. Families apply online, and you see every application by stage. Book a demo, start a paid plan within 30 days, and get a $200 Amazon gift card. Terms apply.",
        headline: "New year, no paper applications",
        description: "Online applications for microschools.",
      },
    },
  ] satisfies MarketingSlide[],
} satisfies MarketingCarousel;

// ---------------------------------------------------------------- C1

const TABS = ["Tuition (FINAL)", "Venmo", "Google Form", "Bank", "Tuition (v2)", "Email", "Group text", "Who paid??", "USE THIS ONE"];

function NinthTabAd() {
  return (
    <AdFrame background="#F3EEF8">
      <AdCopy
        title={
          <>
            Me opening the 9th tab to see if a family <Accent>paid tuition.</Accent>
          </>
        }
        size={74}
      />
      <Scene>
        {TABS.map((tab, i) => (
          <Pin key={tab} left={(i % 3) * 320 + (Math.floor(i / 3) % 2) * 40} top={30 + Math.floor(i / 3) * 110} z={3 + i} rotate={((i * 7) % 9) - 4}>
            <BrowserTab label={tab} tint={i === 8 ? G.butter : "#FFFFFF"} />
          </Pin>
        ))}
        <Pin left={-20} bottom={0} z={20}>
          <Crew name="dig" view="tears" width={380} />
        </Pin>
        <Pin right={0} bottom={60} z={21}>
          <StickyNote width={380} rotate={3} color={G.mint}>
            <Hand size={40} color={G.forest} rotate={0}>
              there&apos;s one tab now.
            </Hand>
          </StickyNote>
        </Pin>
      </Scene>
      <AdFooter />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- C2

function NewRuleAd() {
  return (
    <AdFrame background={G.cream}>
      <AdCopy
        title={
          <>
            New year, <Accent>new rule.</Accent>
          </>
        }
        size={92}
      />
      <Scene>
        <Pin left={0} right={0} top={20} z={3}>
          <div style={{ padding: 22, borderRadius: 22, background: "#8A5A3B", boxShadow: `0 10px 0 ${G.ink}`, border: `4px solid ${G.ink}` }}>
            <div style={{ borderRadius: 10, background: "#264034", padding: "26px 34px 30px", display: "flex", flexDirection: "column", gap: 10 }}>
              {[0, 1, 2, 3].map((i) => (
                <Hand key={i} size={42} color={`rgba(255,250,244,${0.95 - i * 0.12})`} rotate={0}>
                  I will not chase tuition over winter break.
                </Hand>
              ))}
            </div>
          </div>
        </Pin>
        <Pin right={-30} bottom={0} z={5}>
          <Crew name="nutmeg" view="determined" width={330} flip />
        </Pin>
        <Pin left={10} bottom={50} z={6}>
          <Hand size={46} color={G.forest} rotate={-4}>
            (autopay does the chasing now.)
          </Hand>
        </Pin>
      </Scene>
      <AdFooter />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- C3

function QuickQuestionAd() {
  return (
    <AdFrame background="#1F2A3A" tone="dark" snow>
      <AdCopy
        tone="dark"
        title={
          <>
            It&apos;s 9:47pm on Christmas Eve.
            <br />
            <Accent color={G.butter}>Your phone buzzes.</Accent>
          </>
        }
        size={78}
      />
      <Scene>
        <Pin left={40} top={40} z={4}>
          <NotificationCard title={'"quick question"'} sub="A parent · 9:47 PM, Dec 24" color={G.clay} rotate={-3} style={{ width: 560 }} />
        </Pin>
        <Pin left={120} top={190} z={3}>
          <NotificationCard title={'"also, one more thing"'} sub="Same parent · 9:48 PM" color={G.clay} rotate={2} style={{ width: 560, opacity: 0.85 }} />
        </Pin>
        <Pin right={-30} bottom={0} z={5}>
          <Crew name="loam" view="surprised" width={330} flip />
        </Pin>
        <Pin left={10} bottom={40} z={6}>
          <Hand size={44} color={G.butter} rotate={-3}>
            one inbox for every family.
            <br />
            (it can wait till january.)
          </Hand>
        </Pin>
      </Scene>
      <AdFooter tone="dark" />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- C4

function InTheCarAd() {
  return (
    <AdFrame background={G.peach}>
      <AdCopy
        title={
          <>
            POV: it&apos;s January and 22 enrollment forms are <Accent>&ldquo;in the car.&rdquo;</Accent>
          </>
        }
        size={76}
      />
      <Scene>
        {[-14, 8, -4, 12, -9].map((rotate, i) => (
          <Pin key={i} right={30 + i * 70} top={20 + (i % 2) * 70} z={2 + i} rotate={rotate}>
            <PaperSheet label={i === 4 ? "Enrollment" : undefined} width={190} tint={i % 2 ? "#FFFFFF" : "#FFFDF4"} />
          </Pin>
        ))}
        <Pin left={-20} bottom={0} z={10}>
          <Crew name="bramble" view="oops" width={350} />
        </Pin>
        <Pin right={0} bottom={40} z={11}>
          <StickyNote width={470} rotate={3} color={G.butter}>
            <Hand size={38} color={G.forest} rotate={0}>
              online forms and signatures.
              <br />
              no car required.
            </Hand>
          </StickyNote>
        </Pin>
      </Scene>
      <AdFooter />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- C5

const CREW: Array<{ name: MascotName; role: string }> = [
  { name: "terra", role: "Website" },
  { name: "pip", role: "Enrollment" },
  { name: "nutmeg", role: "Tuition" },
  { name: "fennel", role: "Attendance" },
  { name: "clover", role: "Staff hours" },
  { name: "marigold", role: "Marketing" },
  { name: "dig", role: "Admin" },
  { name: "loam", role: "Messages" },
  { name: "dot", role: "Calendar" },
  { name: "flicker", role: "Photos" },
  { name: "bramble", role: "Forms" },
  { name: "tansy", role: "Committees" },
];

function PickFighterAd() {
  return (
    <AdFrame background={G.butter}>
      <AdCopy
        title={
          <>
            Pick your fighter for <Accent>spring enrollment.</Accent>
          </>
        }
        hand="plot twist: you get all 12."
        size={80}
      />
      <Scene style={{ display: "flex", alignItems: "center" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "6px 4px", width: "100%" }}>
          {CREW.map((member, i) => (
            <div key={member.name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <Crew name={member.name} view={i % 3 === 0 ? "determined" : i % 3 === 1 ? "cheeky" : "happy"} width={150} />
              <span style={{ fontFamily: FONT.body, fontWeight: 800, fontSize: 22, color: G.ink, whiteSpace: "nowrap" }}>{member.role}</span>
            </div>
          ))}
        </div>
      </Scene>
      <AdFooter />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- C6

function ResolutionAd() {
  return (
    <AdFrame background={G.mint} snow>
      <AdCopy
        title={
          <>
            Pip&apos;s only resolution: <Accent>no more paper applications.</Accent>
          </>
        }
        size={80}
      />
      <Scene>
        <Pin left={-10} bottom={0} z={5}>
          <Crew name="pip" view="determined" width={380} />
        </Pin>
        <Pin right={0} top={30} z={4}>
          <StickyNote width={520} rotate={3} color="#FFFFFF">
            <p style={{ margin: "0 0 14px", fontFamily: FONT.display, fontWeight: 800, fontSize: 38, color: G.ink }}>Goals for 2027</p>
            <Hand size={38} color={G.ink} rotate={0} style={{ lineHeight: 1.35 }}>
              1. online applications ✓
              <br />
              2. families see what&apos;s next ✓
              <br />
              3. <span style={{ textDecoration: "line-through" }}>file the paper ones</span>
              <br />
              4. actually sleep
            </Hand>
          </StickyNote>
        </Pin>
      </Scene>
      <AdFooter />
    </AdFrame>
  );
}
