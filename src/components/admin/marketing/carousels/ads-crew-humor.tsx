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
        label: "The 9th tab",
        primaryText:
          "Opening the 9th tab to check if a family paid tuition? 😵 MudKitchen puts enrollment, billing and messages in one workspace. Book a demo, start a paid plan within 30 days, and get a $200 Amazon gift card. Terms apply.",
        headline: "47 tabs → 1",
        description: "Your admin portal.",
      },
      adCopyVariants: [
        {
          label: "Tab count",
          primaryText: "Tab 1: enrollment. Tab 4: Venmo. Tab 9: \"did they pay?\" 😵 MudKitchen puts enrollment, billing and messages in one workspace. Book a demo, start a paid plan within 30 days, and get a $200 Amazon gift card. Terms apply.",
          headline: "Tab 9 of 47: \"did they pay?\"",
          description: "Your admin portal.",
        },
        {
          label: "Dig's take",
          primaryText: "Dig has 47 tabs open and refuses to close any. Don't be Dig. 🙃 Run enrollment, billing and messages from one MudKitchen workspace. Book a demo, start a paid plan within 30 days, and get a $200 Amazon gift card. Terms apply.",
          headline: "Don't be Dig",
          description: "Your admin portal.",
        },
      ],
    },
    {
      id: "new-rule",
      fileName: "ad-c2-nutmeg-new-rule.png",
      render: () => <NewRuleAd />,
      adCopy: {
        label: "Nutmeg's rule",
        primaryText:
          "Nutmeg's new rule: no chasing tuition over winter break. 💸 Families set up autopay once. Book a demo, start a paid plan within 30 days, and get a $200 Amazon gift card. Terms apply.",
        headline: "No more chasing tuition",
        description: "Bills and autopay.",
      },
      adCopyVariants: [
        {
          label: "House rules",
          primaryText: "Nutmeg's house rules for winter break: 💸\n1. No chasing tuition\n2. Families set up autopay once\n3. See rule 1\nBook a demo, start a paid plan within 30 days, and get a $200 Amazon gift card. Terms apply.",
          headline: "Rule 1: no chasing tuition",
          description: "Bills and autopay.",
        },
        {
          label: "Short",
          primaryText: "Nutmeg is done chasing tuition. So are you. 💸 Autopay, every bill and payment history in one place. Book a demo, start a paid plan within 30 days, and get a $200 Amazon gift card. Terms apply.",
          headline: "Nutmeg's done chasing. You too.",
          description: "Bills and autopay.",
        },
      ],
    },
    {
      id: "quick-question",
      fileName: "ad-c3-loam-quick-question.png",
      render: () => <QuickQuestionAd />,
      adCopy: {
        label: "\"Quick question\"",
        primaryText:
          "You know this one. 9:47pm on Christmas Eve: \"quick question\". 🎄 MudKitchen keeps every parent message in one inbox. Book a demo, start a paid plan within 30 days, and get a $200 Amazon gift card. Terms apply.",
        headline: "Every message, in the right place",
        description: "One family inbox.",
      },
      adCopyVariants: [
        {
          label: "Timestamp",
          primaryText: "Dec 24, 9:47pm: \"quick question\" 🎄 Loam caught it. MudKitchen keeps every parent message in one inbox, so you can answer on Dec 26. Book a demo, start a paid plan within 30 days, and get a $200 Amazon gift card. Terms apply.",
          headline: "Answer on Dec 26. It'll be there.",
          description: "One family inbox.",
        },
        {
          label: "Short",
          primaryText: "\"Quick question\" is never quick. But it can at least be in one place. 💬 Book a demo, start a paid plan within 30 days, and get a $200 Amazon gift card. Terms apply.",
          headline: "\"Quick question\": now in one place",
          description: "One family inbox.",
        },
      ],
    },
    {
      id: "in-the-car",
      fileName: "ad-c4-bramble-in-the-car.png",
      render: () => <InTheCarAd />,
      adCopy: {
        label: "\"In the car\"",
        primaryText:
          "POV: it's January and 22 enrollment forms are \"in the car.\" 🚗 With MudKitchen, families sign forms online. Book a demo, start a paid plan within 30 days, and get a $200 Amazon gift card. Terms apply.",
        headline: "Forms that don't live in the car",
        description: "Forms and e-signatures.",
      },
      adCopyVariants: [
        {
          label: "Where forms go",
          primaryText: "Where enrollment forms go to hide: 🚗\nThe car\nThe backpack\nUnder a juice box\nWith MudKitchen: online, signed, and you see what's missing. Book a demo, start a paid plan within 30 days, and get a $200 Amazon gift card. Terms apply.",
          headline: "Forms can't hide online",
          description: "Forms and e-signatures.",
        },
        {
          label: "Short",
          primaryText: "22 forms \"in the car\" → 22 forms signed online. 📝 Book a demo, start a paid plan within 30 days, and get a $200 Amazon gift card. Terms apply.",
          headline: "22 forms, signed online",
          description: "Forms and e-signatures.",
        },
      ],
    },
    {
      id: "pick-your-fighter",
      fileName: "ad-c5-pick-your-fighter.png",
      render: () => <PickFighterAd />,
      adCopy: {
        label: "Pick your fighter",
        primaryText:
          "Pick your fighter for spring enrollment. 🎮 Plot twist: you get the whole crew. Book a demo, start a paid plan within 30 days, and get a $200 Amazon gift card. Terms apply.",
        headline: "Plot twist: you get all 12",
        description: "Your school, one place.",
      },
      adCopyVariants: [
        {
          label: "Roster",
          primaryText: "Your spring roster: 🎮\nPip: enrollment\nNutmeg: tuition\nLoam: messages\nFennel: attendance\n…and 8 more. You don't pick one; you get the whole crew. Book a demo, start a paid plan within 30 days, and get a $200 Amazon gift card. Terms apply.",
          headline: "Your roster: all 12",
          description: "Your school, one place.",
        },
        {
          label: "Short",
          primaryText: "Why pick one fighter when the whole crew shows up? 🎮 Website, enrollment, tuition, attendance and messages in one place. Book a demo, start a paid plan within 30 days, and get a $200 Amazon gift card. Terms apply.",
          headline: "The whole crew shows up",
          description: "Your school, one place.",
        },
      ],
    },
    {
      id: "pip-resolution",
      fileName: "ad-c6-pip-resolution.png",
      render: () => <ResolutionAd />,
      adCopy: {
        label: "Pip's resolution",
        primaryText:
          "Pip's only New Year's resolution: no more paper applications. 🎆 Families apply online; you see each one by stage. Book a demo, start a paid plan within 30 days, and get a $200 Amazon gift card. Terms apply.",
        headline: "New year, no paper applications",
        description: "Online applications.",
      },
      adCopyVariants: [
        {
          label: "Pip's list",
          primaryText: "Pip's New Year's resolutions: 🎆\n1. No paper applications\n2. Every application by stage\n3. Smile at every new family\nBook a demo, start a paid plan within 30 days, and get a $200 Amazon gift card. Terms apply.",
          headline: "Resolution 1: no paper applications",
          description: "Online applications.",
        },
        {
          label: "Short",
          primaryText: "Pip's 2027 resolution is already done: families apply online. 📝 Book a demo, start a paid plan within 30 days, and get a $200 Amazon gift card. Terms apply.",
          headline: "Resolution already done",
          description: "Online applications.",
        },
      ],
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
