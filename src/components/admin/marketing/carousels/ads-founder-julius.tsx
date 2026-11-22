"use client";

import type { ReactNode } from "react";
import type { MarketingCarousel, MarketingSlide } from "@/components/admin/marketing/carousels/types";
import { AdOfferProvider } from "@/components/admin/marketing/slide-frame";
import { Accent, AdCopy, AdFooter, AdFrame, G, Hand, Pin, Scene, StickyNote } from "@/components/admin/marketing/ads/ad-kit";
import {
  FREE_PREVIEW_CTA,
  FREE_PREVIEW_URL,
  FREE_PREVIEW_UTM,
  FreeTag,
  PreviewLinkCard,
  YourAdminPhone,
  YourAdminWindow,
  YourParentPhone,
  YourTeacherPhone,
  YourTeacherWindow,
} from "@/components/admin/marketing/carousels/free-preview-mocks";
import {
  FounderAvatar,
  FounderPolaroid,
  InboxEmail,
  JULIUS_SIGNATURE,
  LetterLine,
  NotebookPaper,
  NotesAppCard,
  VoiceMemoCard,
} from "@/components/admin/marketing/carousels/founder-notes-kit";

// Set J: founder notes signed by Julius, with his real photo (FOUNDER_PORTRAITS.julius). The
// "real person, not a polished ad" angle: an instant photo, a Notes-app statement, a voice memo, a
// sticky note and an email. Same claims as Sets F–H; every screen is the "Your School" placeholder.

const noOffer = (node: ReactNode) => <AdOfferProvider show={false}>{node}</AdOfferProvider>;

function Footer({ tone = "light" }: { tone?: "light" | "dark" }) {
  return <AdFooter tone={tone} ctaLabel={FREE_PREVIEW_CTA} siteLabel={FREE_PREVIEW_URL} />;
}

const Gap = ({ h = 30 }: { h?: number }) => <div style={{ height: h, flexShrink: 0 }} />;

export const ADS_FOUNDER_JULIUS_CAROUSEL = {
  id: "ads-founder-julius",
  title: "Ads: From Julius (6)",
  description: `Founder-voice single ads signed by Julius (co-founder) with his photo: an instant photo, a Notes-app statement, a voice memo, a sticky note, a P.S. letter and an email, all selling the free custom preview. No offer chip. Feed + story. Link: ${FREE_PREVIEW_UTM}`,
  fileSlug: "mudkitchen-ads-founder-julius",
  kind: "ad",
  sizes: ["feed", "story"],
  slides: [
    {
      id: "polaroid-letter",
      fileName: "ad-j01-a-note-from-julius.png",
      render: () => noOffer(<PolaroidLetterAd />),
      adCopy: {
        label: "Hi, I'm Julius",
        primaryText:
          "Hi, I'm Julius from MudKitchen. 👋 Send me your school's website. I'll build a free, private preview with your logo.",
        headline: "A note from our co-founder, Julius",
        description: "Free in 2 business days.",
      },
      adCopyVariants: [
        {
          label: "Real person",
          primaryText: "Not a bot. Not an agency. Just Julius, MudKitchen's co-founder. 👋 Send your website and get a free preview of your school.",
          headline: "Not a bot. A co-founder.",
          description: "Free in 2 business days.",
        },
        {
          label: "Short",
          primaryText: "Julius here. Free preview of your school, no call, your logo on it. Send your website. 📸",
          headline: "Julius here. Send your website.",
          description: "Free. No call needed.",
        },
      ],
    },
    {
      id: "notes-app",
      fileName: "ad-j02-a-quick-note-from-our-founder.png",
      render: () => noOffer(<NotesAppAd />),
      adCopy: {
        label: "Notes app",
        primaryText:
          "A quick note from our co-founder: send us your website and we'll build a free, private preview of your school. 📝",
        headline: "A quick note from our founder",
        description: "Free. No call.",
      },
      adCopyVariants: [
        {
          label: "Bullet notes",
          primaryText: "Notes app, from our co-founder Julius: 📝\n• free preview of your school\n• your logo on it\n• no call, 2 business days\n• just send your website",
          headline: "Notes: free, no call, 2 days",
          description: "Free. No call.",
        },
        {
          label: "Honest",
          primaryText: "The fastest way to know if MudKitchen fits? See your school in it. 📝 Send your website for a free, private preview.",
          headline: "The fastest way to know if it fits",
          description: "Free and private.",
        },
      ],
    },
    {
      id: "voice-memo",
      fileName: "ad-j03-a-voice-memo-from-julius.png",
      render: () => noOffer(<VoiceMemoAd />),
      adCopy: {
        label: "Voice memo",
        primaryText:
          "Julius here, from MudKitchen. 🎙️ Send me your website and I'll build a free preview of your school in 2 business days.",
        headline: "Our founder left you a voice memo",
        description: "Free and private.",
      },
      adCopyVariants: [
        {
          label: "Transcript",
          primaryText: "Voice memo, 0:14 🎙️\n\"Hey, it's Julius. Send me your school's website and I'll build you a free MudKitchen preview. That's it. Talk soon.\"",
          headline: "0:14 voice memo from Julius",
          description: "Free and private.",
        },
        {
          label: "Short",
          primaryText: "Press play: our co-founder Julius has a 14-second ask. Send your website, get a free MudKitchen preview of your school. 🎙️",
          headline: "A 14-second ask from Julius",
          description: "Free in 2 business days.",
        },
      ],
    },
    {
      id: "sticky-monitor",
      fileName: "ad-j04-send-me-your-website.png",
      render: () => noOffer(<StickyMonitorAd />),
      adCopy: {
        label: "Send me your website",
        primaryText:
          "\"Send me your website.\" That's the whole ask. 📌 We'll build a free, private MudKitchen preview of your school, with your logo.",
        headline: "Send me your website",
        description: "We build it, free.",
      },
      adCopyVariants: [
        {
          label: "Post-it",
          primaryText: "The note on Julius's monitor says one thing: \"Send me your website.\" 📌 Do it and get a free preview of your school.",
          headline: "One Post-it. One free preview.",
          description: "We build it, free.",
        },
        {
          label: "Short",
          primaryText: "Four words from Julius: send me your website. 📌 Five from us: we'll build your free preview.",
          headline: "Four words: send me your website",
          description: "Free. No call needed.",
        },
      ],
    },
    {
      id: "ps-all-three",
      fileName: "ad-j05-ps-your-teachers-and-parents-too.png",
      render: () => noOffer(<PsAllThreeAd />),
      adCopy: {
        label: "P.S. all three",
        primaryText:
          "Dear founder: we'll build you a free preview of your admin portal. ✉️ P.S. Teachers and families get theirs too. Same preview.",
        headline: "P.S. Your teachers and parents too.",
        description: "Free in 2 business days.",
      },
      adCopyVariants: [
        {
          label: "Three P.S.",
          primaryText: "Dear founder, your free MudKitchen preview includes your admin portal. ✉️\nP.S. And a teacher portal.\nP.P.S. And a parent app.\nP.P.P.S. And your website. Send it over.",
          headline: "P.P.P.S. Your website too.",
          description: "Free in 2 business days.",
        },
        {
          label: "Short",
          primaryText: "Most previews show the admin side. Ours shows everyone's: admin, teacher and parent. Free. ✉️ Send your website. (Julius)",
          headline: "Everyone's side, not just admin",
          description: "Free and private.",
        },
      ],
    },
    {
      id: "email-from-julius",
      fileName: "ad-j06-an-email-from-julius.png",
      render: () => noOffer(<EmailFromJuliusAd />),
      adCopy: {
        label: "An email",
        primaryText:
          "An email from Julius, our co-founder: ✉️ send us your website and we'll set up your admin, teacher and parent portals. Free.",
        headline: "An email from our co-founder",
        description: "No call. 2 business days.",
      },
      adCopyVariants: [
        {
          label: "The email",
          primaryText: "From: Julius (MudKitchen co-founder)\nSubject: your free preview ✉️\nSend me your school's website. I'll set up all three portals with your logo. Free.",
          headline: "Subject: your free preview",
          description: "No call. 2 business days.",
        },
        {
          label: "Reply",
          primaryText: "Reply to Julius with one thing: your school's website. ✉️ Get a free, private preview of all three portals back.",
          headline: "Reply with one thing: your website",
          description: "Free in 2 business days.",
        },
      ],
    },
  ] satisfies MarketingSlide[],
} satisfies MarketingCarousel;

// ---------------------------------------------------------------- J1 polaroid letter

function PolaroidLetterAd() {
  return (
    <AdFrame background={G.cream} pattern="grid">
      <AdCopy
        title={
          <>
            A note from <Accent>our co-founder.</Accent>
          </>
        }
        size={84}
      />
      <Scene>
        <Pin right={-40} top={380} z={2} rotate={7}>
          <YourAdminPhone scale={0.58} />
        </Pin>
        <Pin left={-6} top={70} z={4}>
          <NotebookPaper width={740} rotate={-2} lineGap={66} padding="40px 44px 34px 116px">
            <LetterLine size={50} color={G.clayDeep}>
              Hi, I&rsquo;m Julius.
            </LetterLine>
            <LetterLine size={44}>Send me your school&rsquo;s website.</LetterLine>
            <LetterLine size={44}>I&rsquo;ll build a free preview with your logo.</LetterLine>
            <LetterLine size={34} color={G.clayDeep} style={{ textAlign: "right", marginTop: 4 }}>
              {JULIUS_SIGNATURE}
            </LetterLine>
          </NotebookPaper>
        </Pin>
        <Pin right={-6} top={0} z={5}>
          <FounderPolaroid width={250} rotate={6} caption="that's me 👋" tape={G.peach} />
        </Pin>
      </Scene>
      <Gap />
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- J2 notes app

function NotesAppAd() {
  return (
    <AdFrame background="#FFF7DA">
      <AdCopy
        title={
          <>
            A quick note <Accent>from our founder.</Accent>
          </>
        }
        size={80}
      />
      <Scene>
        <Pin right={-40} top={330} z={2} rotate={8}>
          <YourParentPhone scale={0.56} />
        </Pin>
        <Pin left={0} top={40} z={4}>
          <NotesAppCard width={790} rotate={-1.5} title="to you">
            <p style={{ margin: 0 }}>Send me your school&rsquo;s website.</p>
            <p style={{ margin: "16px 0 0" }}>I&rsquo;ll build a private preview with your logo.</p>
            <p style={{ margin: "16px 0 0", fontWeight: 800 }}>Free. No call. 2 business days.</p>
            <p style={{ margin: "16px 0 0" }}>— Julius</p>
          </NotesAppCard>
        </Pin>
        <Pin right={60} top={0} z={6}>
          <FounderAvatar size={130} style={{ boxShadow: `0 8px 0 ${G.ink}`, transform: "rotate(4deg)" }} />
        </Pin>
        <Pin right={10} top={146} z={6}>
          <Hand size={32} color={G.clayDeep} rotate={-4}>
            (that&rsquo;s me)
          </Hand>
        </Pin>
      </Scene>
      <Gap />
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- J3 voice memo

function VoiceMemoAd() {
  return (
    <AdFrame background={G.sky} tag={<FreeTag text="Free · private" />}>
      <AdCopy
        title={
          <>
            Our founder left you <Accent>a voice memo.</Accent>
          </>
        }
        size={80}
      />
      <Scene>
        <Pin left={0} top={10} z={3}>
          <VoiceMemoCard
            width={952}
            rotate={-1}
            transcript={
              <>
                &ldquo;Hey, it&rsquo;s Julius. Send me your website and I&rsquo;ll build a free preview of your school, with your logo.&rdquo;
              </>
            }
          />
        </Pin>
        <Pin left={40} top={540} z={4} rotate={1.5}>
          <PreviewLinkCard width={870} />
        </Pin>
      </Scene>
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- J4 sticky on the monitor

function StickyMonitorAd() {
  return (
    <AdFrame background={G.peach}>
      <AdCopy
        title={
          <>
            &ldquo;Send me <Accent>your website.&rdquo;</Accent>
          </>
        }
        hand="that's the whole ask."
        size={88}
      />
      <Scene style={{ marginRight: -90 }}>
        <Pin left={0} top={140} z={2} rotate={-1}>
          <YourAdminWindow scale={0.92} />
        </Pin>
        <Pin left={-14} top={20} z={5}>
          <FounderPolaroid width={190} rotate={-7} caption="Julius" tape={G.butter} />
        </Pin>
        <Pin right={110} top={0} z={6}>
          <StickyNote width={380} rotate={5} color={G.butter} style={{ padding: "32px 28px 24px" }}>
            <Hand size={36} color={G.ink} rotate={0} style={{ lineHeight: 1.22 }}>
              All three portals, with your logo. Free.
            </Hand>
            <Hand size={28} color={G.clayDeep} rotate={0} style={{ marginTop: 10, textAlign: "right" }}>
              — Julius
            </Hand>
          </StickyNote>
        </Pin>
        <Pin left={30} top={600} z={6}>
          <StickyNote width={330} rotate={-4} color="#FFFFFF" tape={false} style={{ padding: "22px 24px" }}>
            <Hand size={32} color={G.forest} rotate={0} style={{ lineHeight: 1.2 }}>
              no call needed · 2 business days
            </Hand>
          </StickyNote>
        </Pin>
      </Scene>
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- J5 P.S. all three

function PsAllThreeAd() {
  return (
    <AdFrame background="#EEF5E9">
      <AdCopy
        title={
          <>
            P.S. Your teachers <Accent>and parents too.</Accent>
          </>
        }
        size={84}
      />
      <Scene>
        <Pin right={150} top={290} z={2} rotate={-4}>
          <YourTeacherPhone scale={0.54} />
        </Pin>
        <Pin right={-20} top={220} z={3} rotate={6}>
          <YourParentPhone scale={0.6} />
        </Pin>
        <Pin left={-6} top={30} z={4}>
          <NotebookPaper width={660} rotate={-1.5} lineGap={64} padding="36px 40px 30px 112px" tape={G.peach}>
            <LetterLine size={44} color={G.clayDeep}>
              Dear founder,
            </LetterLine>
            <LetterLine size={38}>Your free admin preview, with your logo.</LetterLine>
            <LetterLine size={38} color={G.clay}>
              P.S. Teachers and parents get theirs too.
            </LetterLine>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 14, marginTop: 6 }}>
              <FounderAvatar size={58} ring={3} />
              <LetterLine size={32} color={G.clayDeep}>
                — Julius
              </LetterLine>
            </div>
          </NotebookPaper>
        </Pin>
      </Scene>
      <Gap />
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- J6 email from Julius

function EmailFromJuliusAd() {
  return (
    <AdFrame background={G.lav}>
      <AdCopy
        title={
          <>
            An email from <Accent>our co-founder.</Accent>
          </>
        }
        size={84}
      />
      <Scene style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 30 }}>
        <InboxEmail
          named
          from="Julius at MudKitchen"
          width={940}
          style={{ transform: "rotate(-1deg)" }}
          subject="Your school, all three views 👋"
          body="Hi! Send me your school's website. I'll set up all three portals with your logo. Free. — Julius"
          attachment={
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 24 }}>
              <YourAdminWindow scale={0.42} label="Admin view" />
              <YourTeacherWindow scale={0.3} label="Teacher view" />
              <YourParentPhone scale={0.3} />
            </div>
          }
        />
      </Scene>
      <Footer />
    </AdFrame>
  );
}
