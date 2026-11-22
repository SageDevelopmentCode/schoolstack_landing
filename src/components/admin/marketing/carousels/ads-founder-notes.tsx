"use client";

import type { ReactNode } from "react";
import type { MarketingCarousel, MarketingSlide } from "@/components/admin/marketing/carousels/types";
import { AdOfferProvider } from "@/components/admin/marketing/slide-frame";
import { Accent, AdCopy, AdFooter, AdFrame, Crew, FONT, G, Hand, InkCard, Pin, Scene, StickyNote } from "@/components/admin/marketing/ads/ad-kit";
import {
  FREE_PREVIEW_CTA,
  FREE_PREVIEW_URL,
  FREE_PREVIEW_UTM,
  FreeTag,
  YourAdminWindow,
  YourParentPhone,
  YourTeacherPhone,
  YourTeacherWindow,
  YourWebsiteWindow,
} from "@/components/admin/marketing/carousels/free-preview-mocks";
import {
  Annotation,
  FOUNDER_SIGNATURE,
  InboxEmail,
  LetterLine,
  NotebookPaper,
  Struck,
  TextThread,
} from "@/components/admin/marketing/carousels/founder-notes-kit";

// Set G: founder notes. Letters, texts, an email and notes "from the MudKitchen founder" to
// microschool founders, all selling the free custom preview. Every claim stays inside the offer
// (free, private, no obligation, no call needed, within 2 business days; your website, parent app,
// teacher portal and admin portal with your logo, colours and programs). Pain lines come from
// PAIN_COPY / ADMIN_COPY in src/components/home/home-copy.ts. Screens are the real Garden demos
// branded "Your School". Signed anonymously: no names, no quotes.

const noOffer = (node: ReactNode) => <AdOfferProvider show={false}>{node}</AdOfferProvider>;

function Footer({ tone = "light" }: { tone?: "light" | "dark" }) {
  return <AdFooter tone={tone} ctaLabel={FREE_PREVIEW_CTA} siteLabel={FREE_PREVIEW_URL} />;
}

export const ADS_FOUNDER_NOTES_CAROUSEL = {
  id: "ads-founder-notes",
  title: "Ads: Founder notes (8)",
  description: `Founder-voice single ads for microschool founders: a letter, a text thread, an email, a P.S. and honest to-do lists, all selling the free custom preview on the real "Your School" screens. No offer chip. Feed + story. Link: ${FREE_PREVIEW_UTM}`,
  fileSlug: "mudkitchen-ads-founder-notes",
  kind: "ad",
  sizes: ["feed", "story"],
  slides: [
    {
      id: "dear-founder",
      fileName: "ad-g01-dear-microschool-founder.png",
      render: () => noOffer(<DearFounderAd />),
      adCopy: {
        label: "A letter",
        primaryText:
          "Dear founder: send me your school's website and I'll build a private MudKitchen preview with your logo. Free, no call. 💌",
        headline: "A short letter about your school",
        description: "Free and private.",
      },
      adCopyVariants: [
        {
          label: "P.S.",
          primaryText: "Dear founder, I'll keep it short: send me your website and get a free, private preview of your school. 💌 P.S. No call.",
          headline: "Short letter: send your website",
          description: "Free and private.",
        },
        {
          label: "What you'll get",
          primaryText: "Dear founder, here's what you'll get in your free MudKitchen preview: 💌\n✅ Your website, refreshed\n✅ A parent app for families\n✅ A teacher portal\n✅ An admin portal for you\nIn your inbox within 2 business days. Just send your website.",
          headline: "Dear founder: here's what you get",
          description: "Free and private.",
        },
      ],
    },
    {
      id: "text-thread",
      fileName: "ad-g02-a-text-from-our-founder.png",
      render: () => noOffer(<TextThreadAd />),
      adCopy: {
        label: "\"Wait, it's free?\"",
        primaryText:
          "A quick text from our founder: send your school's website and get a free MudKitchen preview with your logo. 💬",
        headline: "Wait, it's free? Yes.",
        description: "Free in 2 business days.",
      },
      adCopyVariants: [
        {
          label: "The thread",
          primaryText: "You: what's the catch?\nUs: no catch. Send your website.\nYou: and I get…?\nUs: a free MudKitchen preview of your school, with your logo, in 2 business days. 💬",
          headline: "\"What's the catch?\" None.",
          description: "Free in 2 business days.",
        },
        {
          label: "Short",
          primaryText: "Text-length version: send your website, get a free MudKitchen preview of your school. 📱 That's it.",
          headline: "Send website. Get preview. Done.",
          description: "Free in 2 business days.",
        },
      ],
    },
    {
      id: "inbox",
      fileName: "ad-g03-check-your-inbox.png",
      render: () => noOffer(<InboxAd />),
      adCopy: {
        label: "In your inbox",
        primaryText:
          "Picture this in your inbox: your school, built in MudKitchen with your logo and colours. 📬 Send your website to get it, free.",
        headline: "Your school, in MudKitchen",
        description: "Free in 2 business days.",
      },
      adCopyVariants: [
        {
          label: "Subject line",
          primaryText: "Subject: Your school, in MudKitchen 📬\nA free, private preview with your logo and colours. Send your website to get it.",
          headline: "Subject: your school, in MudKitchen",
          description: "Free in 2 business days.",
        },
        {
          label: "Inbox zero",
          primaryText: "One email worth keeping: a free MudKitchen preview of your school. 📬 Send your website. It arrives in 2 business days.",
          headline: "One email worth keeping",
          description: "Free and private.",
        },
      ],
    },
    {
      id: "ps-free",
      fileName: "ad-g04-ps-its-free.png",
      render: () => noOffer(<PsFreeAd />),
      adCopy: {
        label: "P.S. It's free",
        primaryText:
          "Your admin portal, set up with your school's details so you can click around first. P.S. It's free. No obligation.",
        headline: "P.S. It's free.",
        description: "Free in 2 business days.",
      },
      adCopyVariants: [
        {
          label: "Fine print",
          primaryText: "The fine print on our free preview: 🔍 it's free, private, and there's no call. That's all of it. Send your website.",
          headline: "The fine print: there isn't any",
          description: "Free in 2 business days.",
        },
        {
          label: "Short",
          primaryText: "Click around before you decide. 🖱️ Get a free MudKitchen admin portal preview set up with your school's details. Send your website.",
          headline: "Click first. Decide later.",
          description: "No obligation.",
        },
      ],
    },
    {
      id: "monday-list",
      fileName: "ad-g05-a-founders-monday.png",
      render: () => noOffer(<MondayListAd />),
      adCopy: {
        label: "Cross it off",
        primaryText:
          "Running a microschool? Forms in one app, parent texts in another, records in a spreadsheet. See it in one place: free preview.",
        headline: "Cross it all off. See it in one place.",
        description: "Free, with your logo.",
      },
      adCopyVariants: [
        {
          label: "Monday list",
          primaryText: "Monday to-do for a microschool founder, and one free fix: ✏️\n☐ Check the form builder\n☐ Answer parent texts\n☐ Update the spreadsheet\n☑️ Send your website for a free MudKitchen preview of it all in one place",
          headline: "One item that clears the rest",
          description: "Free, with your logo.",
        },
        {
          label: "Short",
          primaryText: "Forms, texts, spreadsheets: three places. Your free MudKitchen preview: one. 📋 Send your website and see it with your school's name.",
          headline: "Three places into one",
          description: "Free in 2 business days.",
        },
      ],
    },
    {
      id: "admin-grows",
      fileName: "ad-g06-the-admin-grows-faster.png",
      render: () => noOffer(<AdminGrowsAd />),
      adCopy: {
        label: "The admin grows",
        primaryText:
          "As enrollment grows, the admin grows faster. 📈 See forms, reminders and records in one MudKitchen workspace. Free preview.",
        headline: "The admin grows faster",
        description: "See it all, free.",
      },
      adCopyVariants: [
        {
          label: "By the numbers",
          primaryText: "More students means more of everything, and a free MudKitchen preview shows it in one place: 📈\nMore forms\nMore reminders\nMore onboarding\nMore follow-ups\nOne workspace, set up for your school. Send your website.",
          headline: "More students, one workspace",
          description: "See it all, free.",
        },
        {
          label: "Before it grows",
          primaryText: "Set up one place before enrollment grows, not after. 🌱 Get a free MudKitchen preview of your school. Send your website.",
          headline: "Set it up before you grow",
          description: "Free and private.",
        },
      ],
    },
    {
      id: "founder-to-founder",
      fileName: "ad-g07-from-one-founder-to-another.png",
      render: () => noOffer(<FounderToFounderAd />),
      adCopy: {
        label: "Founder to founder",
        primaryText:
          "From one founder to another: see MudKitchen with your school's name on it before you decide. Free, private preview. 🤝",
        headline: "See it before you decide",
        description: "Website, apps, portals.",
      },
      adCopyVariants: [
        {
          label: "We get it",
          primaryText: "Founder to founder: you shouldn't have to commit before you see it. 🤝 So we'll build a free preview of your school first.",
          headline: "See it first. Decide later.",
          description: "Website, apps, portals.",
        },
        {
          label: "Short",
          primaryText: "One founder's tip for another: see the software with your school's name on it first. 🤝 Free preview. Send your website.",
          headline: "Founder tip: see it with your name",
          description: "Free and private.",
        },
      ],
    },
    {
      id: "your-name-here",
      fileName: "ad-g08-your-schools-name-goes-here.png",
      render: () => noOffer(<YourNameHereAd />),
      adCopy: {
        label: "Your name here",
        primaryText:
          "Your school's name goes on all of it: website, parent app, teacher and admin portals. ✍️ Free preview. Send your website.",
        headline: "Your school's name goes here",
        description: "Free and private.",
      },
      adCopyVariants: [
        {
          label: "Name everywhere",
          primaryText: "Your school's name, in a free MudKitchen preview: ✍️\nOn the website\nOn the parent app\nOn the teacher portal\nOn the admin portal\nNot ours. Yours. Send your website.",
          headline: "Your name on every screen",
          description: "Free and private.",
        },
        {
          label: "Short",
          primaryText: "[Your school's name here] 👈 That's where it goes, on every screen of your free MudKitchen preview. Send your website and we'll fill it in.",
          headline: "[Your school's name here]",
          description: "Free in 2 business days.",
        },
      ],
    },
  ] satisfies MarketingSlide[],
} satisfies MarketingCarousel;

// ---------------------------------------------------------------- G1 dear founder

function DearFounderAd() {
  return (
    <AdFrame background={G.cream} pattern="grid">
      <AdCopy
        title={
          <>
            A short letter <Accent>about your school.</Accent>
          </>
        }
        size={80}
      />
      <Scene>
        <Pin right={-24} top={170} z={2} rotate={6}>
          <YourParentPhone scale={0.74} />
        </Pin>
        <Pin left={-6} top={60} z={4}>
          <NotebookPaper width={770} rotate={-2} lineGap={68} padding="44px 44px 38px 116px">
            <LetterLine size={50} color={G.clayDeep}>
              Dear founder,
            </LetterLine>
            <LetterLine size={44}>Send me your school&rsquo;s website.</LetterLine>
            <LetterLine size={44}>I&rsquo;ll build a free preview with your logo.</LetterLine>
            <LetterLine size={38} color={G.clayDeep} style={{ textAlign: "right", marginTop: 4 }}>
              {FOUNDER_SIGNATURE}
            </LetterLine>
          </NotebookPaper>
        </Pin>
      </Scene>
      <div style={{ height: 30, flexShrink: 0 }} />
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- G2 text thread

function TextThreadAd() {
  return (
    <AdFrame background="#E3EDFB" tag={<FreeTag text="Free · private" />}>
      <AdCopy
        title={
          <>
            A text from <Accent>our founder.</Accent>
          </>
        }
        size={84}
      />
      <Scene>
        <Pin right={-20} top={60} z={2} rotate={5}>
          <YourParentPhone scale={0.86} screen="messages" />
        </Pin>
        <Pin left={0} top={30} z={4} rotate={-1.5}>
          <TextThread
            width={640}
            messages={[
              { from: "founder", text: "Send me your school’s website 👋" },
              { from: "founder", text: "I’ll build you a private preview with your logo." },
              { from: "you", text: "wait, is it free?" },
              { from: "founder", text: "Free. 2 business days." },
            ]}
          />
        </Pin>
      </Scene>
      <div style={{ height: 30, flexShrink: 0 }} />
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- G3 inbox

function InboxAd() {
  return (
    <AdFrame background={G.peach}>
      <AdCopy
        title={
          <>
            Check your inbox. <Accent>Your school&rsquo;s in it.</Accent>
          </>
        }
        size={80}
      />
      <Scene style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <InboxEmail
          width={900}
          style={{ transform: "rotate(-1deg)" }}
          subject="Your school, in MudKitchen 🎉"
          body="Here’s your private preview, with your logo and colours."
          attachment={
            <div style={{ display: "flex", justifyContent: "center" }}>
              <YourAdminWindow scale={0.66} />
            </div>
          }
        />
      </Scene>
      <div style={{ height: 30, flexShrink: 0 }} />
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- G4 P.S.

function PsFreeAd() {
  return (
    <AdFrame background="#EEF5E9">
      <AdCopy
        title={
          <>
            Your admin portal, set up for you. <Accent>P.S. it&rsquo;s free.</Accent>
          </>
        }
        size={78}
      />
      <Scene style={{ marginRight: -110 }}>
        <Pin left={10} top={56} z={2} rotate={-1}>
          <YourAdminWindow scale={1.02} />
        </Pin>
        <Pin right={130} top={0} z={6}>
          <StickyNote width={330} rotate={6} color={G.butter} style={{ padding: "34px 26px 26px" }}>
            <Hand size={40} color={G.ink} rotate={0} style={{ lineHeight: 1.2 }}>
              no obligation.
            </Hand>
            <Hand size={30} color={G.clayDeep} rotate={0} style={{ marginTop: 12 }}>
              {FOUNDER_SIGNATURE}
            </Hand>
          </StickyNote>
        </Pin>
      </Scene>
      <div style={{ height: 30, flexShrink: 0 }} />
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- G5 Monday list

const MONDAY = ["Check the form builder", "Answer parent texts", "Update the spreadsheet", "Remember everything else"];

function MondayListAd() {
  return (
    <AdFrame background={G.cream} pattern="grid">
      <AdCopy
        title={
          <>
            A founder&rsquo;s <Accent>Monday list.</Accent>
          </>
        }
        size={82}
      />
      <Scene>
        <Pin right={-90} top={350} z={2} rotate={3}>
          <YourAdminWindow scale={0.7} />
        </Pin>
        <Pin left={-6} top={20} z={4}>
          <NotebookPaper width={640} rotate={-2.5} lineGap={70} padding="26px 40px 22px 116px" tape={G.peach}>
            {MONDAY.map((item) => (
              <LetterLine key={item} size={40} style={{ lineHeight: "70px", whiteSpace: "nowrap" }}>
                <Struck>{item}</Struck>
              </LetterLine>
            ))}
          </NotebookPaper>
        </Pin>
        <Pin left={20} top={520} z={5}>
          <Annotation arrow="down-right" color={G.forest}>
            all of it, one place
          </Annotation>
        </Pin>
      </Scene>
      <div style={{ height: 24, flexShrink: 0 }} />
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- G6 the admin grows faster

const ADMIN_PILE: Array<{ label: string; bg: string; left: number; top: number; rotate: number }> = [
  { label: "forms", bg: G.butter, left: 0, top: 20, rotate: -8 },
  { label: "reminders", bg: "#E3EDFB", left: 250, top: 0, rotate: 5 },
  { label: "onboarding", bg: G.peach, left: 40, top: 170, rotate: 4 },
  { label: "records", bg: G.mint, left: 330, top: 150, rotate: -6 },
  { label: "follow-ups", bg: "#ECE2F3", left: 150, top: 300, rotate: -2 },
];

function AdminGrowsAd() {
  return (
    <AdFrame background={G.sky}>
      <AdCopy
        title={
          <>
            As enrollment grows, <Accent>the admin grows faster.</Accent>
          </>
        }
        size={80}
      />
      <Scene>
        {ADMIN_PILE.map((card) => (
          <Pin key={card.label} left={card.left} top={card.top + 30} z={3} rotate={card.rotate}>
            <InkCard bg={card.bg} style={{ padding: "22px 34px", borderRadius: 18, boxShadow: `0 8px 0 ${G.ink}` }}>
              <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 46, letterSpacing: "-0.03em", color: G.ink }}>{card.label}</span>
            </InkCard>
          </Pin>
        ))}
        <Pin right={-20} top={60} z={5}>
          <StickyNote width={330} rotate={4} color="#FFFFFF" style={{ padding: "30px 26px 24px" }}>
            <Hand size={38} color={G.forest} rotate={0} style={{ lineHeight: 1.2 }}>
              all in one place →
            </Hand>
          </StickyNote>
        </Pin>
        <Pin right={0} bottom={0} z={4}>
          <Crew name="dig" view="confused" width={270} flip />
        </Pin>
      </Scene>
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- G7 founder to founder

function FounderToFounderAd() {
  return (
    <AdFrame background={G.forest} tone="dark">
      <AdCopy
        tone="dark"
        title={
          <>
            Founder to founder: <Accent color={G.butter}>see it before you decide.</Accent>
          </>
        }
        size={76}
      />
      <Scene>
        <Pin left={-30} top={60} z={2} rotate={-6}>
          <YourWebsiteWindow scale={0.5} label="Your website" />
        </Pin>
        <Pin left={230} top={20} z={3} rotate={-1}>
          <YourAdminWindow scale={0.52} label="Your admin portal" />
        </Pin>
        <Pin left={40} top={330} z={4} rotate={3}>
          <YourTeacherWindow scale={0.5} label="Your teacher portal" />
        </Pin>
        <Pin left={520} top={300} z={5} rotate={-4}>
          <YourTeacherPhone scale={0.5} />
        </Pin>
        <Pin right={-30} top={190} z={6} rotate={5}>
          <YourParentPhone scale={0.6} />
        </Pin>
        <Pin left={0} bottom={10} z={6}>
          <Hand size={40} color={G.butter} rotate={-3}>
            free · private · 2 business days
          </Hand>
        </Pin>
      </Scene>
      <Footer tone="dark" />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- G8 your name here

function YourNameHereAd() {
  return (
    <AdFrame background={G.cream} tag={<FreeTag text="Free · private" />}>
      <AdCopy
        title={
          <>
            Your school&rsquo;s name <Accent>goes here.</Accent>
          </>
        }
        size={88}
      />
      <Scene>
        <Pin left={-30} top={110} z={2} rotate={-1.5}>
          <YourWebsiteWindow scale={0.98} />
        </Pin>
        <Pin left={150} top={0} z={5}>
          <Annotation arrow="down-left" color={G.clayDeep}>
            and on every portal too
          </Annotation>
        </Pin>
        <Pin right={-10} bottom={0} z={6}>
          <InkCard bg={G.butter} rotate={3} width={430} style={{ padding: "24px 28px" }}>
            <Hand size={34} color={G.ink} rotate={0} style={{ lineHeight: 1.25 }}>
              Send your website. I&rsquo;ll do the rest.
            </Hand>
            <Hand size={28} color={G.clayDeep} rotate={0} style={{ marginTop: 10, textAlign: "right" }}>
              {FOUNDER_SIGNATURE}
            </Hand>
          </InkCard>
        </Pin>
      </Scene>
      <div style={{ height: 30, flexShrink: 0 }} />
      <Footer />
    </AdFrame>
  );
}
