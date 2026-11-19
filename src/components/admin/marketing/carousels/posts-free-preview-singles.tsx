"use client";

import type { ReactNode } from "react";
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
  InkCard,
  PaperSheet,
  Pin,
  Scene,
  SpeechBubble,
  StickyNote,
} from "@/components/admin/marketing/ads/ad-kit";
import type { MascotName, MascotView } from "@/components/admin/marketing/mascot/Mascot";
import {
  BrandSwatches,
  FREE_PREVIEW_URL,
  FREE_PREVIEW_UTM,
  PreviewLinkCard,
  PreviewReadyEmail,
  YOUR,
  YourAdminWindow,
  YourParentPhone,
  YourSchoolMark,
  YourWebsiteWindow,
} from "@/components/admin/marketing/carousels/free-preview-mocks";

// Organic single posts for the free custom preview (no button, no gift card). `adCopy` holds the
// caption (primaryText, with hashtags) and a LinkedIn headline. Claims stay inside the offer:
// free, private link, no obligation, your logo/colours/programs, within 2 business days.

const TAGS = "#microschool #schoolfounder #microschooling";
const LINK = `Get yours: ${FREE_PREVIEW_URL}`;

function Footer() {
  return <AdFooter variant="site" siteLabel={FREE_PREVIEW_URL} />;
}

export const POSTS_FREE_PREVIEW_SINGLES_CAROUSEL = {
  id: "posts-free-preview-singles",
  title: "Free preview singles: organic posts (8)",
  description: `Organic single posts for the free custom preview (send your website, get a private preview with your logo, colours and programs). No offer chip. Link: ${FREE_PREVIEW_UTM}`,
  fileSlug: "mudkitchen-free-preview-singles",
  kind: "post",
  slides: [
    {
      id: "what-if",
      fileName: "post-fp01-what-if-it-had-your-logo.png",
      render: () => <WhatIfPost />,
      adCopy: {
        primaryText: `What if you could see MudKitchen with your logo, your colours and your programs before you decide anything?\n\nSend us your school's website and we'll build you a private preview. Free, no obligation.\n\n${LINK}\n\n${TAGS}`,
        headline: "See MudKitchen with your logo on it",
      },
    },
    {
      id: "how-it-works",
      fileName: "post-fp02-how-it-works.png",
      render: () => <HowItWorksPost />,
      adCopy: {
        primaryText: `How the free preview works:\n\n1. Send us your school's website.\n2. We build your website, parent app and admin portal with your logo, colours and programs.\n3. Within 2 business days, a private link lands in your inbox.\n\n${LINK}\n\n${TAGS}`,
        headline: "How the free preview works",
      },
    },
    {
      id: "three-things",
      fileName: "post-fp03-three-things-one-link.png",
      render: () => <ThreeThingsPost />,
      adCopy: {
        primaryText: `Three things, one private link: your website, your parent app and your admin portal, all set up with your school's details.\n\nFree, and yours to click around.\n\n${LINK}\n\n${TAGS}`,
        headline: "Website, parent app, admin portal",
      },
    },
    {
      id: "your-colours",
      fileName: "post-fp04-your-colours-not-ours.png",
      render: () => <YourColoursPost />,
      adCopy: {
        primaryText: `Your colours, not ours. Terra pulls them straight from your website, so the preview already looks like your school.\n\nSend us your link and we'll build it, free.\n\n${LINK}\n\n${TAGS} #schoolbranding`,
        headline: "Your colours, not ours",
      },
    },
    {
      id: "faq",
      fileName: "post-fp05-free-preview-faq.png",
      render: () => <FaqPost />,
      adCopy: {
        primaryText: `"Wait, what's the catch?" There isn't one.\n\nIt's free. You don't need a call. The link is private. And there's no obligation to sign up.\n\n${LINK}\n\n${TAGS}`,
        headline: "Free preview: the quick FAQ",
      },
    },
    {
      id: "terra-hex",
      fileName: "post-fp06-terra-matching-colours.png",
      render: () => <TerraHexPost />,
      adCopy: {
        primaryText: `Terra, matching your school's exact shade of blue for your free preview. (She has opinions about hex codes.) 🎨\n\nSend us your website and the crew gets to work.\n\n${LINK}\n\n${TAGS}`,
        headline: "Terra is matching your colours",
      },
    },
    {
      id: "this-or-that",
      fileName: "post-fp07-feature-list-or-preview.png",
      render: () => <ThisOrThatPost />,
      adCopy: {
        primaryText: `This or that: read another feature list, or click around a preview built for your school?\n\nWe'll make the second one for you. Free, within 2 business days.\n\n${LINK}\n\n${TAGS}`,
        headline: "Feature list or your own preview?",
      },
    },
    {
      id: "inbox",
      fileName: "post-fp08-in-your-inbox.png",
      render: () => <InboxPost />,
      adCopy: {
        primaryText: `Picture this in your inbox: your school's website, parent app and admin portal, built in MudKitchen with your logo and colours.\n\nFree and private. Send us your website to get yours.\n\n${LINK}\n\n${TAGS}`,
        headline: "Your preview, in your inbox",
      },
    },
  ] satisfies MarketingSlide[],
} satisfies MarketingCarousel;

// ---------------------------------------------------------------- 1 what if

function WhatIfPost() {
  return (
    <AdFrame background={G.cream}>
      <AdCopy
        title={
          <>
            What if you could see it <Accent>with your logo first?</Accent>
          </>
        }
        hand="send us your website. we'll build it."
        size={84}
      />
      <Scene style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "relative" }}>
          <YourWebsiteWindow scale={0.9} />
          <Pin right={-30} top={-50} z={6}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "10px 20px 10px 10px", borderRadius: 999, background: "#FFFFFF", border: `4px dashed ${G.clay}`, transform: "rotate(4deg)" }}>
              <YourSchoolMark size={46} />
              <span style={{ fontFamily: FONT.hand, fontSize: 34, color: G.clayDeep }}>yours here</span>
            </span>
          </Pin>
        </div>
      </Scene>
      <div style={{ height: 30, flexShrink: 0 }} />
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- 2 how it works

const STEPS: Array<{ n: string; title: string; sub: string; bg: string }> = [
  { n: "1", title: "Send your website", sub: "just the link", bg: G.butter },
  { n: "2", title: "We build your preview", sub: "your logo, colours and programs", bg: G.peach },
  { n: "3", title: "Click around", sub: "private link, within 2 business days", bg: G.mint },
];

function HowItWorksPost() {
  return (
    <AdFrame background={G.sky}>
      <AdCopy
        title={
          <>
            Your free preview, <Accent>in 3 steps.</Accent>
          </>
        }
        size={88}
      />
      <Scene>
        <div style={{ position: "absolute", left: 0, top: 30, width: 700, display: "flex", flexDirection: "column", gap: 24 }}>
          {STEPS.map((s, i) => (
            <InkCard key={s.n} rotate={i % 2 ? 1 : -1} style={{ display: "flex", alignItems: "center", gap: 24, padding: "22px 28px" }}>
              <span style={{ width: 70, height: 70, flexShrink: 0, borderRadius: 999, background: s.bg, border: `4px solid ${G.ink}`, display: "grid", placeItems: "center", fontFamily: FONT.display, fontWeight: 800, fontSize: 38, color: G.ink }}>
                {s.n}
              </span>
              <span style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 42, lineHeight: 1.1, color: G.ink }}>{s.title}</span>
                <span style={{ fontFamily: FONT.hand, fontSize: 32, color: G.soft }}>{s.sub}</span>
              </span>
            </InkCard>
          ))}
        </div>
        <Pin right={-40} bottom={0} z={5}>
          <Crew name="pip" view="point" width={300} flip />
        </Pin>
      </Scene>
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- 3 three things

function ThreeThingsPost() {
  return (
    <AdFrame background="#EEF5E9">
      <AdCopy
        title={
          <>
            Three things. <Accent>One private link.</Accent>
          </>
        }
        sub="Your website, parent app and admin portal, set up with your school's details."
        size={88}
      />
      <Scene>
        <Pin left={-6} top={30} z={2} rotate={-3}>
          <YourAdminWindow scale={0.6} />
        </Pin>
        <Pin right={-10} top={200} z={3} rotate={3}>
          <YourWebsiteWindow scale={0.54} />
        </Pin>
        <Pin left={260} top={0} z={4}>
          <YourParentPhone scale={0.66} />
        </Pin>
      </Scene>
      <div style={{ height: 30, flexShrink: 0 }} />
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- 4 your colours

function YourColoursPost() {
  return (
    <AdFrame background={G.cream}>
      <AdCopy
        title={
          <>
            Your colours. <Accent>Not ours.</Accent>
          </>
        }
        sub="We pull them from your website, so your preview already looks like your school."
        size={92}
      />
      <Scene>
        <Pin left={0} top={50} z={3}>
          <BrandSwatches size={190} />
        </Pin>
        <Pin left={0} top={370} z={3}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 16, padding: "14px 26px 14px 14px", borderRadius: 999, background: "#FFFFFF", border: `4px solid ${G.ink}`, boxShadow: `0 8px 0 ${G.ink}` }}>
            <YourSchoolMark size={58} />
            <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 34, color: YOUR.primaryDeep }}>{YOUR.name}</span>
          </span>
        </Pin>
        <Pin right={-40} bottom={0} z={5}>
          <Crew name="terra" view="hold" width={320} flip />
        </Pin>
      </Scene>
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- 5 faq

const FAQ: Array<{ q: string; a: string }> = [
  { q: "Is it really free?", a: "Yes." },
  { q: "Do I need to book a call?", a: "Nope." },
  { q: "Who can see it?", a: "Just you. It's a private link." },
  { q: "Do I have to sign up after?", a: "No obligation." },
];

function FaqPost() {
  return (
    <AdFrame background={G.peach}>
      <AdCopy
        title={
          <>
            &ldquo;Wait, <Accent>what&rsquo;s the catch?&rdquo;</Accent>
          </>
        }
        hand="there isn't one."
        size={88}
      />
      <Scene>
        <div style={{ position: "absolute", left: 0, top: 20, width: 720, display: "flex", flexDirection: "column", gap: 18 }}>
          {FAQ.map((item, i) => (
            <InkCard key={item.q} rotate={i % 2 ? 0.8 : -0.8} style={{ padding: "18px 26px" }}>
              <p style={{ margin: 0, fontFamily: FONT.display, fontWeight: 800, fontSize: 36, lineHeight: 1.1, color: G.ink }}>{item.q}</p>
              <p style={{ margin: "4px 0 0", fontFamily: FONT.hand, fontSize: 36, lineHeight: 1.1, color: G.forest }}>{item.a}</p>
            </InkCard>
          ))}
        </div>
        <Pin right={-50} bottom={0} z={5}>
          <Crew name="clover" view="wink" width={270} flip />
        </Pin>
      </Scene>
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- 6 terra hex

const SHADES = ["#4A6A99", "#3E5C8A", "#36527D", "#41608F", "#3A5886"];

function TerraHexPost() {
  return (
    <AdFrame background={G.lav}>
      <AdCopy
        title={
          <>
            Terra, matching <Accent>your exact shade of blue.</Accent>
          </>
        }
        hand="she has opinions about hex codes."
        size={84}
      />
      <Scene>
        <div style={{ position: "absolute", left: 0, top: 40, display: "flex", flexDirection: "column", gap: 14 }}>
          {SHADES.map((shade, i) => (
            <span
              key={shade}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 18,
                padding: "10px 20px 10px 10px",
                borderRadius: 18,
                background: "#FFFFFF",
                border: shade === YOUR.primary ? `4px solid ${G.ink}` : "2px solid #D9CFC2",
                boxShadow: shade === YOUR.primary ? `0 6px 0 ${G.ink}` : "none",
                transform: `rotate(${[-2, 1, -1, 2, -1][i]}deg)`,
                width: shade === YOUR.primary ? 470 : 400,
                boxSizing: "border-box",
              }}
            >
              <span style={{ width: 66, height: 52, borderRadius: 12, background: shade }} />
              <span style={{ fontFamily: FONT.body, fontWeight: 800, fontSize: 28, color: shade === YOUR.primary ? G.ink : G.soft }}>{shade}</span>
              {shade === YOUR.primary ? <span style={{ marginLeft: "auto", fontFamily: FONT.hand, fontSize: 32, color: G.forest }}>this one ✓</span> : null}
            </span>
          ))}
        </div>
        <Pin right={-30} bottom={0} z={5}>
          <Crew name="terra" view="thinking" width={340} flip />
        </Pin>
        <Pin right={210} top={0} z={6}>
          <SpeechBubble size={30} tail="bottom-right" width={300} style={{ padding: "18px 22px" }}>
            no, the <i>other</i> blue
          </SpeechBubble>
        </Pin>
      </Scene>
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- 7 this or that

function ThisOrThatPost() {
  return (
    <AdFrame background={G.cream}>
      <AdCopy
        title={
          <>
            This or that: <Accent>how do you pick software?</Accent>
          </>
        }
        hand="comment “this” or “that.”"
        size={84}
      />
      <Scene style={{ display: "flex", gap: 24, paddingTop: 20 }}>
        <Side label="This" sub="a feature list" bg={G.peach} name="fennel" view="sleepy">
          <div style={{ position: "absolute", left: "50%", top: 100, transform: "translateX(-50%) rotate(-6deg)" }}>
            <PaperSheet label="Features" width={190} lines={5} />
          </div>
        </Side>
        <Side label="That" sub="your own preview" bg={G.mint} name="pip" view="love">
          <div style={{ position: "absolute", left: "50%", top: 96, transform: "translateX(-50%) rotate(3deg)" }}>
            <YourParentPhone scale={0.45} />
          </div>
        </Side>
      </Scene>
      <div style={{ height: 28, flexShrink: 0 }} />
      <Footer />
    </AdFrame>
  );
}

function Side({ label, sub, bg, name, view, children }: { label: string; sub: string; bg: string; name: MascotName; view: MascotView; children?: ReactNode }) {
  return (
    <InkCard bg={bg} style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", padding: "24px 20px 16px", overflow: "hidden" }}>
      <span style={{ position: "absolute", top: 20, left: 24, fontFamily: FONT.display, fontWeight: 800, fontSize: 44, color: G.ink }}>{label}</span>
      <span style={{ position: "absolute", top: 32, right: 24, fontFamily: FONT.hand, fontSize: 30, color: G.soft }}>{sub}</span>
      {children}
      <Crew name={name} view={view} width={260} />
    </InkCard>
  );
}

// ---------------------------------------------------------------- 8 inbox

function InboxPost() {
  return (
    <AdFrame background={G.forest} tone="dark">
      <AdCopy
        tone="dark"
        title={
          <>
            Picture this <Accent color={G.butter}>in your inbox.</Accent>
          </>
        }
        hand="free. private. within 2 business days."
        size={88}
      />
      <Scene>
        <Pin left={0} top={30} z={3}>
          <PreviewReadyEmail width={760} rotate={-2} />
        </Pin>
        <Pin left={40} top={440} z={4}>
          <PreviewLinkCard width={640} style={{ transform: "rotate(1.5deg)", padding: "20px 26px" }} />
        </Pin>
        <Pin right={-50} bottom={0} z={5}>
          <Crew name="loam" view="celebrate" width={250} flip />
        </Pin>
        <Pin right={-10} top={60} z={6}>
          <StickyNote width={200} rotate={6} color={G.butter} style={{ padding: "24px 18px 16px" }}>
            <Hand size={32} color={G.ink} rotate={0}>
              new mail!
            </Hand>
          </StickyNote>
        </Pin>
      </Scene>
      <AdFooter variant="site" tone="dark" siteLabel={FREE_PREVIEW_URL} />
    </AdFrame>
  );
}
