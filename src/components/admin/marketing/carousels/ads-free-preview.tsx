"use client";

import type { ReactNode } from "react";
import type { MarketingCarousel, MarketingSlide } from "@/components/admin/marketing/carousels/types";
import { AdOfferProvider } from "@/components/admin/marketing/slide-frame";
import { BrowserTab } from "@/components/admin/marketing/mascot/mascot-slide-kit";
import {
  Accent,
  AdCopy,
  AdFooter,
  AdFrame,
  CheckList,
  Crew,
  FONT,
  G,
  Hand,
  InkCard,
  PaperSheet,
  Pin,
  Scene,
  SpeechBubble,
  StickyNote,
} from "@/components/admin/marketing/ads/ad-kit";
import {
  BrandSwatches,
  FREE_PREVIEW_CTA,
  FREE_PREVIEW_URL,
  FREE_PREVIEW_UTM,
  FreeTag,
  PreviewReadyEmail,
  YOUR,
  YourAdminWindow,
  YourParentPhone,
  YourSchoolMark,
  YourTeacherWindow,
  YourWebsiteWindow,
} from "@/components/admin/marketing/carousels/free-preview-mocks";

// Set F: the free custom preview. Send us your website → a private MudKitchen preview with your logo,
// colours and programs (website, parent app, teacher portal, admin portal). Free, private, no obligation, within
// 2 business days. Every slide drives to trymudkitchen.com/free-preview.
// Claims stay inside that offer: no gift card, no customer names, quotes or stats, and only the
// generic "Your School" placeholder brand (never a prospect's concept demo).

/** Founder-voice sets name the reader in the logo pill. */

/** This set has no gift-card callout, so the offer chip and fine print are always off. */
const noOffer = (node: ReactNode) => <AdOfferProvider show={false}>{node}</AdOfferProvider>;

function Footer({ tone = "light" }: { tone?: "light" | "dark" }) {
  return <AdFooter tone={tone} ctaLabel={FREE_PREVIEW_CTA} siteLabel={FREE_PREVIEW_URL} />;
}

export const ADS_FREE_PREVIEW_CAROUSEL = {
  id: "ads-free-preview",
  title: "Ads: Free custom preview (12)",
  description: `Single ads for the free custom preview: send your website, get a private MudKitchen preview with your logo, colours and programs within 2 business days. No offer chip. Feed + story. Link: ${FREE_PREVIEW_UTM}`,
  fileSlug: "mudkitchen-ads-free-preview",
  kind: "ad",
  sizes: ["feed", "story"],
  slides: [
    {
      id: "logo-here",
      fileName: "ad-f01-your-logo-here.png",
      render: () => noOffer(<LogoHereAd />),
      adCopy: {
        label: "Your logo on it",
        primaryText: "Send us your school's website and we'll build a private MudKitchen preview with your logo, colours and programs. Free.",
        headline: "See MudKitchen with your logo on it",
        description: "Free in 2 business days.",
      },
      adCopyVariants: [
        {
          label: "Your name everywhere",
          primaryText: "Your logo on the website. Your colours in the parent app. 🎨 Send your website and we'll build your free MudKitchen preview.",
          headline: "Your logo, your colours, your programs",
          description: "Free in 2 business days.",
        },
        {
          label: "Short",
          primaryText: "Picture MudKitchen with your logo on it. Now stop picturing: send your website and we'll build it for free. ✨",
          headline: "Stop picturing it. See it.",
          description: "Free in 2 business days.",
        },
      ],
    },
    {
      id: "before-the-call",
      fileName: "ad-f02-see-it-before-the-call.png",
      render: () => noOffer(<BeforeTheCallAd />),
      adCopy: {
        label: "Before the call",
        primaryText: "Skip the generic demo. Send your website and we'll build a private MudKitchen preview of your school. Free.",
        headline: "See it before you book a call",
        description: "Website, apps, portals.",
      },
      adCopyVariants: [
        {
          label: "Look first",
          primaryText: "Click around your own school before you talk to anyone. 🖱️ Send your website and get a free, private MudKitchen preview.",
          headline: "Click around first. Talk later.",
          description: "No call needed.",
        },
        {
          label: "Generic vs. yours",
          primaryText: "Generic demo: someone else's school. 😴\nMudKitchen preview: your school, your logo.\nSend your website. Free in 2 business days.",
          headline: "Not a generic demo. Yours.",
          description: "Website, apps, portals.",
        },
      ],
    },
    {
      id: "free-two-days",
      fileName: "ad-f03-free-in-two-business-days.png",
      render: () => noOffer(<FreeTwoDaysAd />),
      adCopy: {
        label: "Free in 2 days",
        primaryText: "A preview that's free, built for your school, and in your inbox in 2 business days. 📬 Send your website to get it.",
        headline: "Free. Built for you. 2 business days.",
        description: "No obligation.",
      },
      adCopyVariants: [
        {
          label: "Three facts",
          primaryText: "Three things about the MudKitchen preview: ✅\n1. It's free\n2. It's built for your school\n3. It's ready in 2 business days\nSend your website to get yours.",
          headline: "Free. Yours. 2 business days.",
          description: "No obligation.",
        },
        {
          label: "Short",
          primaryText: "Send your website today. See your school in MudKitchen by the end of the week. 📬 Free, private, no obligation.",
          headline: "Send today. See it this week.",
          description: "Within 2 business days.",
        },
      ],
    },
    {
      id: "feature-list",
      fileName: "ad-f04-still-picturing-it.png",
      render: () => noOffer(<FeatureListAd />),
      adCopy: {
        label: "Skip the feature list",
        primaryText: "Feature lists all blur together. 👀 See MudKitchen with your school's logo, colours and programs instead. Free preview.",
        headline: "Skip the feature list. See yours.",
        description: "Free in 2 business days.",
      },
      adCopyVariants: [
        {
          label: "Show, don't list",
          primaryText: "You don't need another feature list. You need to see your own school working. 👀 Send your website for a free preview.",
          headline: "No feature list. Your school, working.",
          description: "Free in 2 business days.",
        },
        {
          label: "By role",
          primaryText: "Instead of a feature list, a free preview of who gets what: 📋\n✅ Families: a parent app\n✅ Teachers: their own portal\n✅ You: an admin portal\n✅ Everyone: your website",
          headline: "Families, teachers, you, your site",
          description: "Free in 2 business days.",
        },
      ],
    },
    {
      id: "crew-building",
      fileName: "ad-f05-the-crew-is-building-yours.png",
      render: () => noOffer(<CrewBuildingAd />),
      adCopy: {
        label: "Crew at work",
        primaryText: "Send us your website and the MudKitchen crew gets to work: 🛠️ your logo, your colours, your programs. Free and private.",
        headline: "Let the crew build your preview",
        description: "Ready in 2 business days.",
      },
      adCopyVariants: [
        {
          label: "Who builds what",
          primaryText: "Send your website, and the MudKitchen crew splits up: 🧑‍🍳\nTerra builds your website\nPip sets up enrollment\nNutmeg handles tuition\nLoam takes the messages",
          headline: "Twelve tiny coworkers, one free preview",
          description: "Free and private.",
        },
        {
          label: "Short",
          primaryText: "The crew's ready. They just need your website. 🛠️ Send it and get a free, private MudKitchen preview of your microschool.",
          headline: "The crew just needs your website",
          description: "Ready in 2 business days.",
        },
      ],
    },
    {
      id: "parent-app",
      fileName: "ad-f06-parent-app-with-your-name.png",
      render: () => noOffer(<ParentAppAd />),
      adCopy: {
        label: "Your name on it",
        primaryText: "Picture your families opening an app with your school's name on it. 📱 Send your website and we'll build a free preview.",
        headline: "A parent app with your name on it",
        description: "In your free preview.",
      },
      adCopyVariants: [
        {
          label: "What families see",
          primaryText: "What families would open every morning, in your free MudKitchen preview: 📱\n✅ The calendar\n✅ Tuition and payments\n✅ Messages from you\nSend your website to get it.",
          headline: "What families would open each morning",
          description: "In your free preview.",
        },
        {
          label: "Group chat",
          primaryText: "Your families deserve better than a group chat. 💬 See your own parent app in a free MudKitchen preview.",
          headline: "Better than a group chat",
          description: "Free in 2 business days.",
        },
      ],
    },
    {
      id: "admin-portal",
      fileName: "ad-f07-your-admin-portal.png",
      render: () => noOffer(<AdminPortalAd />),
      adCopy: {
        label: "Set up for you",
        primaryText: "Admissions, tuition and messages in one admin portal, set up with your school's details. ☕ Get a free private preview.",
        headline: "Your admin portal, set up for you",
        description: "Free in 2 business days.",
      },
      adCopyVariants: [
        {
          label: "One screen",
          primaryText: "Admissions, tuition and parent messages in three places? 😵 See them in one admin portal: free MudKitchen preview.",
          headline: "Three tabs into one admin portal",
          description: "Free in 2 business days.",
        },
        {
          label: "Your morning",
          primaryText: "Your morning in one admin portal, in a free MudKitchen preview: ☕\n✅ New applications\n✅ Who's paid tuition\n✅ Parent messages waiting\nSend your website.",
          headline: "Your morning, in one admin portal",
          description: "Free and private.",
        },
      ],
    },
    {
      id: "website-makeover",
      fileName: "ad-f08-website-makeover.png",
      render: () => noOffer(<WebsiteMakeoverAd />),
      adCopy: {
        label: "Website makeover",
        primaryText: "Send us your current website. 🎨 We'll rebuild it in MudKitchen with your logo and colours, as a free private preview.",
        headline: "See your website, made over",
        description: "Free and private.",
      },
      adCopyVariants: [
        {
          label: "Before & after",
          primaryText: "Before: the website you made in a weekend three years ago. 😅\nAfter: the same school, rebuilt in MudKitchen.\nSee the after for free.",
          headline: "See the after. Free.",
          description: "Free and private.",
        },
        {
          label: "Short",
          primaryText: "Your website, made over. Your apps, built to match. 🎨 Send us your current site for a free MudKitchen preview.",
          headline: "Your website, plus everything behind it",
          description: "Free in 2 business days.",
        },
      ],
    },
    {
      id: "no-sales-call",
      fileName: "ad-f09-no-sales-call.png",
      render: () => noOffer(<NoSalesCallAd />),
      adCopy: {
        label: "No sales call",
        primaryText: "No sales call needed. 📵 Send your website and a private MudKitchen preview of your school lands in your inbox. Free.",
        headline: "No sales call. Just your preview.",
        description: "Within 2 business days.",
      },
      adCopyVariants: [
        {
          label: "No calendar link",
          primaryText: "No calendar link. No 30-minute call. No follow-up voicemail. 📵 Just a free preview of your school, in your inbox.",
          headline: "No call. No voicemail. Just yours.",
          description: "Within 2 business days.",
        },
        {
          label: "Email only",
          primaryText: "Prefer email to phone calls? Same. ✉️ Send your website and get a free, private MudKitchen preview of your school by email within 2 business days.",
          headline: "Prefer email? So do we.",
          description: "Free and private.",
        },
      ],
    },
    {
      id: "founder-note",
      fileName: "ad-f10-founder-note.png",
      render: () => noOffer(<FounderNoteAd />),
      adCopy: {
        label: "From our founder",
        primaryText: "A note from our founder: send us your school's website and we'll build you a private MudKitchen preview. Free, no strings. 🧡",
        headline: "Send us your website",
        description: "We build it, free.",
      },
      adCopyVariants: [
        {
          label: "Founder to founder",
          primaryText: "Founder to founder: I know you don't have time for another demo. 🧡 So send me your website. I'll build a free preview instead.",
          headline: "Founder to founder: send your website",
          description: "We build it, free.",
        },
        {
          label: "Built for yours",
          primaryText: "Every microschool is different, so every preview is built for one school: yours. 🛠️ Send your website. It's free.",
          headline: "Built for one school: yours",
          description: "Free in 2 business days.",
        },
      ],
    },
    {
      id: "whats-inside",
      fileName: "ad-f11-whats-inside.png",
      render: () => noOffer(<WhatsInsideAd />),
      adCopy: {
        label: "What's inside",
        primaryText: "Inside your free preview: 📦 your website, parent app, teacher portal and admin portal, with your logo and colours.",
        headline: "What's inside your free preview",
        description: "Free in 2 business days.",
      },
      adCopyVariants: [
        {
          label: "Checklist",
          primaryText: "Inside your free MudKitchen preview: 📦\n✅ Your website\n✅ A parent app\n✅ A teacher portal\n✅ An admin portal\nSend your website.",
          headline: "Four things inside. All yours.",
          description: "Free in 2 business days.",
        },
        {
          label: "Short",
          primaryText: "One website link in. Your whole school out. 📦 Get a free MudKitchen preview of your school.",
          headline: "One link in. Your whole school out.",
          description: "Free in 2 business days.",
        },
      ],
    },
    {
      id: "48-hours",
      fileName: "ad-f12-48-hours.png",
      render: () => noOffer(<FortyEightHoursAd />),
      adCopy: {
        label: "2 business days",
        primaryText: "Send your website today. ⏱️ In 2 business days, a private MudKitchen preview of your school is in your inbox. Free.",
        headline: "Your preview in 2 business days",
        description: "Free and private.",
      },
      adCopyVariants: [
        {
          label: "Timeline",
          primaryText: "Day 0: send your website. ✉️\nDay 1: the MudKitchen crew builds your school.\nDay 2: your free preview is in your inbox.",
          headline: "Day 0: send it. Day 2: see it.",
          description: "Free and private.",
        },
        {
          label: "Short",
          primaryText: "Faster than a permission slip comes back signed. ⏱️ Send your website and get a free MudKitchen preview of your school within 2 business days.",
          headline: "Faster than a permission slip",
          description: "Free. No call needed.",
        },
      ],
    },
  ] satisfies MarketingSlide[],
} satisfies MarketingCarousel;

// ---------------------------------------------------------------- shared bits

/** Hand-drawn arrow + label pointing at something. */
function Callout({ children, arrow = "down-left", color = G.clayDeep }: { children: ReactNode; arrow?: "down-left" | "down-right" | "left" | "right"; color?: string }) {
  const paths: Record<typeof arrow, string> = {
    "down-left": "M90 6 C 70 30, 40 40, 12 70 M12 70 L 14 48 M12 70 L 34 66",
    "down-right": "M10 6 C 30 30, 60 40, 88 70 M88 70 L 66 66 M88 70 L 86 48",
    left: "M92 40 C 70 20, 40 20, 10 40 M10 40 L 28 26 M10 40 L 30 52",
    right: "M8 40 C 30 20, 60 20, 90 40 M90 40 L 72 26 M90 40 L 70 52",
  };
  const flip = arrow === "down-right" || arrow === "right";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, flexDirection: flip ? "row" : "row-reverse" }}>
      <Hand size={40} color={color} rotate={-3}>
        {children}
      </Hand>
      <svg width="100" height="80" viewBox="0 0 100 80" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d={paths[arrow]} />
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------- F1 your logo here

function LogoHereAd() {
  return (
    <AdFrame background={G.cream} tag={<FreeTag text="Free · private" />}>
      <AdCopy
        title={
          <>
            Picture MudKitchen with <Accent>your school&rsquo;s logo on it.</Accent>
          </>
        }
        hand="send your website. we'll build it."
        size={84}
      />
      <Scene style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "relative", marginTop: 44 }}>
          <YourWebsiteWindow scale={0.92} />
          <Pin left={-40} top={-72} z={6}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 14,
                padding: "12px 22px 12px 12px",
                borderRadius: 999,
                background: "#FFFFFF",
                border: `4px dashed ${G.clay}`,
                transform: "rotate(-4deg)",
              }}
            >
              <YourSchoolMark size={52} />
              <span style={{ fontFamily: FONT.hand, fontSize: 38, color: G.clayDeep }}>your logo here</span>
            </span>
          </Pin>
          <Pin right={-26} bottom={-34} z={6}>
            <BrandSwatches size={96} />
          </Pin>
        </div>
      </Scene>
      <div style={{ height: 34, flexShrink: 0 }} />
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- F2 before the call

function BeforeTheCallAd() {
  return (
    <AdFrame background="#EEF5E9" tag={<FreeTag text="Free · private" />}>
      <AdCopy
        title={
          <>
            See it <Accent>before</Accent> you book a call.
          </>
        }
        sub="Your website and portals, with your name on them."
        size={88}
      />
      <Scene>
        <Pin left={-6} top={30} z={2} rotate={-3}>
          <YourAdminWindow scale={0.56} />
        </Pin>
        <Pin right={-10} top={40} z={2} rotate={3}>
          <YourTeacherWindow scale={0.5} />
        </Pin>
        <Pin left={-10} top={330} z={3} rotate={2}>
          <YourWebsiteWindow scale={0.5} />
        </Pin>
        <Pin right={60} top={150} z={4} rotate={-2}>
          <YourParentPhone scale={0.66} />
        </Pin>
      </Scene>
      <div style={{ height: 30, flexShrink: 0 }} />
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- F3 free, 2 business days

const STAMPS: Array<{ big: string; small: string; bg: string; rotate: number }> = [
  { big: "Free", small: "no obligation", bg: G.butter, rotate: -4 },
  { big: "Built for you", small: "your logo and colours", bg: G.peach, rotate: 2 },
  { big: "2 business days", small: "straight to your inbox", bg: G.mint, rotate: -2 },
];

function FreeTwoDaysAd() {
  return (
    <AdFrame background={G.cream}>
      <AdCopy
        title={
          <>
            Your microschool in MudKitchen. <Accent>Free.</Accent>
          </>
        }
        hand="we build it, you click around."
        size={86}
      />
      <Scene>
        <div style={{ position: "absolute", left: 0, top: 30, width: 640, display: "flex", flexDirection: "column", gap: 26 }}>
          {STAMPS.map((s, i) => (
            <InkCard key={s.big} bg={s.bg} rotate={s.rotate} style={{ padding: "22px 30px", marginLeft: i * 34 }}>
              <p style={{ margin: 0, fontFamily: FONT.display, fontWeight: 800, fontSize: 52, lineHeight: 1, letterSpacing: "-0.03em", color: G.ink }}>{s.big}</p>
              <p style={{ margin: "6px 0 0", fontFamily: FONT.body, fontWeight: 700, fontSize: 28, color: G.soft }}>{s.small}</p>
            </InkCard>
          ))}
        </div>
        <Pin right={-40} bottom={0} z={5}>
          <Crew name="dig" view="thumbs" width={330} flip />
        </Pin>
      </Scene>
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- F4 feature list

const FEATURES = ["Online enrollment", "Tuition & autopay", "Parent messaging", "Attendance"];

function FeatureListAd() {
  return (
    <AdFrame background={G.sky}>
      <AdCopy
        title={
          <>
            Still picturing it <Accent>from a feature list?</Accent>
          </>
        }
        sub="See it with your logo instead."
        size={86}
      />
      <Scene>
        <Pin left={-10} top={40} z={2} rotate={-5}>
          <div style={{ width: 420, boxSizing: "border-box", padding: "30px 34px", background: "#FFFFFF", border: "2px solid #D9CFC2", borderRadius: 14, boxShadow: "0 14px 26px rgba(43,36,29,.14)" }}>
            <p style={{ margin: "0 0 14px", fontFamily: FONT.body, fontWeight: 800, fontSize: 22, letterSpacing: "0.1em", textTransform: "uppercase", color: G.soft }}>Features</p>
            {FEATURES.map((f) => (
              <p key={f} style={{ margin: "0 0 10px", fontFamily: FONT.body, fontWeight: 700, fontSize: 28, color: G.soft }}>
                • {f}
              </p>
            ))}
          </div>
        </Pin>
        <Pin left={20} bottom={0} z={4}>
          <Crew name="fennel" view="confused" width={230} />
        </Pin>
        <Pin right={-14} top={70} z={5} rotate={3}>
          <YourParentPhone scale={0.72} />
        </Pin>
        <Pin left={390} top={180} z={6}>
          <Callout arrow="right">vs. this</Callout>
        </Pin>
      </Scene>
      <div style={{ height: 24, flexShrink: 0 }} />
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- F5 crew building

function CrewBuildingAd() {
  return (
    <AdFrame background="#F3EEF8" tag={<FreeTag text="Free · private" />}>
      <AdCopy
        title={
          <>
            Send your website. <Accent>The crew builds your preview.</Accent>
          </>
        }
        size={82}
      />
      <Scene>
        <Pin left="50%" top={80} z={2} style={{ marginLeft: -340 }}>
          <YourWebsiteWindow scale={0.71} />
        </Pin>
        <Pin left={-20} bottom={0} z={5}>
          <Crew name="terra" view="hold" width={270} />
        </Pin>
        <Pin left="50%" bottom={-10} z={6} style={{ marginLeft: -130 }}>
          <Crew name="dig" view="determined" width={260} />
        </Pin>
        <Pin right={-20} bottom={0} z={5}>
          <Crew name="pip" view="excited" width={260} flip />
        </Pin>
        <Pin left={20} top={50} z={7}>
          <StickyNote width={220} rotate={-6} color={G.butter} style={{ padding: "26px 20px 18px" }}>
            <Hand size={34} color={G.ink} rotate={0}>
              logo ✓
            </Hand>
          </StickyNote>
        </Pin>
        <Pin right={10} top={60} z={7}>
          <StickyNote width={240} rotate={5} color={G.mint} style={{ padding: "26px 20px 18px" }}>
            <Hand size={34} color={G.ink} rotate={0}>
              colours ✓
            </Hand>
          </StickyNote>
        </Pin>
        <Pin right={60} top={300} z={7}>
          <StickyNote width={240} rotate={-3} color={G.peach} style={{ padding: "26px 20px 18px" }}>
            <Hand size={34} color={G.ink} rotate={0}>
              programs ✓
            </Hand>
          </StickyNote>
        </Pin>
      </Scene>
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- F6 parent app

function ParentAppAd() {
  return (
    <AdFrame background={YOUR.soft}>
      <AdCopy
        title={
          <>
            A parent app with <Accent>your name on it.</Accent>
          </>
        }
        sub="Tuition, forms and updates for your families."
        size={86}
      />
      <Scene>
        <Pin left="50%" top={20} z={3} style={{ marginLeft: -150 }}>
          <YourParentPhone scale={0.82} />
        </Pin>
        <Pin left={-10} bottom={0} z={5}>
          <Crew name="nutmeg" view="love" width={280} />
        </Pin>
        <Pin right={-10} top={60} z={5}>
          <Callout arrow="left">your name here</Callout>
        </Pin>
      </Scene>
      <div style={{ height: 24, flexShrink: 0 }} />
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- F7 admin portal

function AdminPortalAd() {
  return (
    <AdFrame background="#EEF5E9">
      <AdCopy
        title={
          <>
            Your admin portal, <Accent>ready to click around.</Accent>
          </>
        }
        sub="Admissions, tuition and messages, set up for you."
        size={84}
      />
      <Scene style={{ marginRight: -110 }}>
        <Pin left={30} top={40} z={2}>
          <YourAdminWindow scale={1} />
        </Pin>
        <Pin left={-90} bottom={-20} z={8}>
          <Crew name="dig" view="point" width={290} />
        </Pin>
      </Scene>
      <div style={{ height: 30, flexShrink: 0 }} />
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- F8 website makeover

function WebsiteMakeoverAd() {
  return (
    <AdFrame background={G.peach}>
      <AdCopy
        title={
          <>
            Your website, <Accent>made over.</Accent>
          </>
        }
        sub="Send us the one you have. We'll rebuild it, free."
        size={92}
      />
      <Scene>
        <Pin left={-10} top={20} z={2} rotate={-6}>
          <div style={{ width: 380, boxSizing: "border-box", padding: 20, background: "#E9E4DC", border: `3px solid ${G.soft}`, borderRadius: 18, filter: "grayscale(1)" }}>
            <BrowserTab label="home-OLD-v2.html" tint="#F4F1EC" />
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
              <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 30, color: G.soft }}>Welcome to our school!!</span>
              <span style={{ fontFamily: FONT.body, fontWeight: 700, fontSize: 22, color: "#9C9186" }}>🚧 page under construction 🚧</span>
              <PaperSheet width={150} lines={3} rotate={0} />
            </div>
          </div>
          <Hand size={36} color={G.clayDeep} rotate={-2} style={{ marginTop: 12 }}>
            before
          </Hand>
        </Pin>
        <Pin right={-40} top={150} z={4} rotate={2}>
          <YourWebsiteWindow scale={0.68} />
          <Hand size={36} color={G.forest} rotate={-2} style={{ marginTop: 18, textAlign: "right" }}>
            after (your preview)
          </Hand>
        </Pin>
        <Pin left={170} bottom={0} z={5}>
          <Crew name="terra" view="celebrate" width={220} />
        </Pin>
      </Scene>
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- F9 no sales call

function NoSalesCallAd() {
  return (
    <AdFrame background={G.cream}>
      <AdCopy
        title={
          <>
            No sales call. <Accent>Just your preview.</Accent>
          </>
        }
        sub="Send your website. Your preview lands in your inbox."
        size={88}
      />
      <Scene>
        <Pin left={-10} top={30} z={2} rotate={-5}>
          <InkCard bg="#FFFFFF" width={470} style={{ padding: "22px 28px" }}>
            <p style={{ margin: 0, fontFamily: FONT.body, fontWeight: 800, fontSize: 22, letterSpacing: "0.08em", textTransform: "uppercase", color: G.soft }}>Calendar invite</p>
            <p style={{ margin: "8px 0 0", fontFamily: FONT.display, fontWeight: 800, fontSize: 34, lineHeight: 1.1, color: G.soft, textDecoration: "line-through", textDecorationThickness: 4, textDecorationColor: G.clay }}>
              45-min discovery call
            </p>
            <Hand size={34} color={G.clay} rotate={-2} style={{ marginTop: 8 }}>
              not needed
            </Hand>
          </InkCard>
        </Pin>
        <Pin right={-20} top={200} z={4}>
          <PreviewReadyEmail width={640} rotate={2} />
        </Pin>
        <Pin left={30} bottom={0} z={5}>
          <Crew name="clover" view="cheeky" width={230} />
        </Pin>
      </Scene>
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- F10 founder note

function FounderNoteAd() {
  return (
    <AdFrame background={G.forest} tone="dark">
      <AdCopy
        tone="dark"
        title={
          <>
            A note from <Accent color={G.butter}>our founder</Accent>
          </>
        }
        size={84}
      />
      <Scene style={{ display: "flex", alignItems: "center" }}>
        <StickyNote width={760} rotate={-2} color={G.butter} style={{ padding: "54px 50px 44px" }}>
          <Hand size={48} color={G.ink} rotate={0} style={{ lineHeight: 1.25 }}>
            Dear founder: send me your school&rsquo;s website. We&rsquo;ll build a private preview with your logo.
          </Hand>
          <Hand size={48} color={G.ink} rotate={0} style={{ marginTop: 22, lineHeight: 1.25 }}>
            Free. No call. 2 business days.
          </Hand>
          <Hand size={40} color={G.clayDeep} rotate={-2} style={{ marginTop: 26, textAlign: "right" }}>
            — the MudKitchen founder
          </Hand>
        </StickyNote>
        <Pin right={-50} bottom={-10} z={5}>
          <Crew name="loam" view="wave" width={240} flip />
        </Pin>
      </Scene>
      <Footer tone="dark" />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- F11 what's inside

function WhatsInsideAd() {
  return (
    <AdFrame background={G.cream} tag={<FreeTag text="Free · private" />}>
      <AdCopy
        title={
          <>
            What&rsquo;s inside <Accent>your free preview</Accent>
          </>
        }
        size={88}
      />
      <Scene style={{ display: "flex", alignItems: "center" }}>
        <InkCard width={720} rotate={-1.5} style={{ padding: "36px 40px" }}>
          <CheckList
            size={34}
            rows={[
              { label: "Your website", done: true },
              { label: "Your parent app", done: true },
              { label: "Your teacher portal", done: true },
              { label: "Your admin portal", done: true },
              { label: "A private link, just for you", done: true, highlight: true },
            ]}
          />
        </InkCard>
        <Pin right={-40} bottom={0} z={5}>
          <Crew name="bramble" view="thumbs" width={270} flip />
        </Pin>
      </Scene>
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- F12 48 hours

function FlipDigit({ value }: { value: string }) {
  return (
    <span
      style={{
        position: "relative",
        display: "inline-grid",
        placeItems: "center",
        width: 190,
        height: 250,
        borderRadius: 28,
        background: G.ink,
        boxShadow: "0 12px 0 #14100C",
        fontFamily: FONT.display,
        fontWeight: 800,
        fontSize: 200,
        lineHeight: 1,
        color: G.butter,
      }}
    >
      {value}
      <span aria-hidden style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 4, marginTop: -2, background: G.forestDeep }} />
    </span>
  );
}

function FortyEightHoursAd() {
  return (
    <AdFrame background={G.mint} tag={<FreeTag text="Free · private" />}>
      <AdCopy
        title={
          <>
            Send it today. <Accent>See your school in 48 hours.*</Accent>
          </>
        }
        size={82}
      />
      <Scene>
        <div style={{ position: "absolute", left: 0, top: 40, display: "flex", alignItems: "flex-end", gap: 22 }}>
          <FlipDigit value="4" />
          <FlipDigit value="8" />
          <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 64, color: G.ink, marginLeft: 6, marginBottom: 10 }}>hrs</span>
        </div>
        <Pin left={0} top={340} z={4}>
          <SpeechBubble size={30} tail="none" width={520} style={{ padding: "22px 28px" }}>
            <Hand size={34} color={G.forest} rotate={0}>
              Your whole school, built with your details.
            </Hand>
          </SpeechBubble>
        </Pin>
        <Pin right={-30} bottom={0} z={5}>
          <Crew name="dot" view="excited" width={290} flip />
        </Pin>
        <Pin left={0} bottom={0} z={4}>
          <p style={{ margin: 0, fontFamily: FONT.body, fontWeight: 700, fontSize: 24, color: G.soft }}>*Within 2 business days of your request.</p>
        </Pin>
      </Scene>
      <Footer />
    </AdFrame>
  );
}
