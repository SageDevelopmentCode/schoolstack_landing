"use client";

import type { CSSProperties, ReactNode } from "react";
import type { MarketingCarousel, MarketingSlide } from "@/components/admin/marketing/carousels/types";
import { AdOfferProvider } from "@/components/admin/marketing/slide-frame";
import { Accent, AdCopy, AdFooter, AdFrame, BERRY, Crew, FONT, G, GiftBox, Hand, InkCard, Pin, Scene } from "@/components/admin/marketing/ads/ad-kit";
import {
  FREE_PREVIEW_CTA,
  FREE_PREVIEW_URL,
  FREE_PREVIEW_UTM,
  FreeTag,
  PreviewReadyEmail,
  RoleSwitch,
  YOUR,
  YourAdminWindow,
  YourParentPhone,
  YourSchoolMark,
  YourTeacherPhone,
  YourWebsiteWindow,
} from "@/components/admin/marketing/carousels/free-preview-mocks";
import { Annotation, FormHeader, LetterLine, NotebookPaper, PaperForm, Stamp, Struck, TickBox } from "@/components/admin/marketing/carousels/founder-notes-kit";

// Set K: the free preview, tied to this season's moments. File names run in calendar order; run
// windows (2026–27) are in the description. Dates live in the ad copy, not the image, so a slipped
// date means editing text, not re-exporting. No "% off" or price language: the preview is free.
// Same guardrails as Sets F–H (no gift card, no customer names, quotes or stats, "Your School" only).

const noOffer = (node: ReactNode) => <AdOfferProvider show={false}>{node}</AdOfferProvider>;

function Footer({ tone = "light" }: { tone?: "light" | "dark" }) {
  return <AdFooter tone={tone} ctaLabel={FREE_PREVIEW_CTA} siteLabel={FREE_PREVIEW_URL} />;
}

const Gap = ({ h = 30 }: { h?: number }) => <div style={{ height: h, flexShrink: 0 }} />;

export const ADS_PREVIEW_SEASONAL_CAROUSEL = {
  id: "ads-preview-seasonal",
  title: "Ads: Free preview this season (12)",
  description: `Seasonal single ads for the free custom preview. Run windows: k01 Thanksgiving (Nov 23–26) · k02 Black Friday (Nov 26–28) · k03 Black Friday weekend (Nov 26–29) · k04 Cyber Monday (Nov 30) · k05 Giving Tuesday (Dec 1) · k06 year-end "wrapped" (Dec 2–8) · k07 12 days of break (Dec 8–20) · k08 advent (Dec 8–24) · k09 letter to Santa (Dec 10–24) · k10 January families (Jan 2–15) · k11 re-enrollment (Jan 5–31) · k12 School Choice Week (Jan 24–30, 2027). No offer chip. Feed + story. Link: ${FREE_PREVIEW_UTM}`,
  fileSlug: "mudkitchen-ads-preview-seasonal",
  kind: "ad",
  sizes: ["feed", "story"],
  slides: [
    {
      id: "grateful-list",
      fileName: "ad-k01-thanksgiving-thankful-for-one-login.png",
      render: () => noOffer(<GratefulListAd />),
      adCopy: {
        label: "One login",
        primaryText:
          "Happy Thanksgiving. 🧡 This year, be thankful for one login. Send your website and we'll build a free preview of your school.",
        headline: "This year, be thankful for one login",
        description: "Free in 2 business days.",
      },
      adCopyVariants: [
        {
          label: "Gratitude list",
          primaryText: "Grateful this year for teachers, families and (soon) one login. 🧡 Send your website for a free MudKitchen preview.",
          headline: "Grateful: teachers, families, one login",
          description: "Free in 2 business days.",
        },
        {
          label: "Short",
          primaryText: "Thankful for fewer logins this year? 🦃 Send your website and get a free MudKitchen preview of your school, all in one place.",
          headline: "Thankful for fewer logins",
          description: "Free. No call needed.",
        },
      ],
    },
    {
      id: "doorbuster",
      fileName: "ad-k02-black-friday-doorbuster.png",
      render: () => noOffer(<DoorbusterAd />),
      adCopy: {
        label: "Doorbuster",
        primaryText:
          "Black Friday doorbuster: a free, private MudKitchen preview of your school, with your logo. 🛍️ No 5am line. Send your website.",
        headline: "The only doorbuster that's free",
        description: "One per school. No call.",
      },
      adCopyVariants: [
        {
          label: "Doors open",
          primaryText: "Doors open whenever you are. 🚪 This Black Friday doorbuster: a free, private MudKitchen preview of your school.",
          headline: "Doors open whenever you are",
          description: "One per school. No call.",
        },
        {
          label: "What you get",
          primaryText: "Black Friday doorbuster: a free MudKitchen preview. 🛍️\n✅ Your website\n✅ Admin portal\n✅ Teacher portal\n✅ Parent app\nSend your website.",
          headline: "Doorbuster: four things, $0",
          description: "Free in 2 business days.",
        },
      ],
    },
    {
      id: "while-they-shop",
      fileName: "ad-k03-black-friday-while-they-shop.png",
      render: () => noOffer(<WhileTheyShopAd />),
      adCopy: {
        label: "While they shop",
        primaryText:
          "While everyone's out Black Friday shopping, click through your own school instead. 🛋️ Send your website for a free preview.",
        headline: "While they shop, you preview your school",
        description: "Free and private.",
      },
      adCopyVariants: [
        {
          label: "From the couch",
          primaryText: "Skip the mall. Click around your own school from the couch. 🛋️ Send your website for a free MudKitchen preview.",
          headline: "Skip the mall. Tour your school.",
          description: "Free and private.",
        },
        {
          label: "Leftovers",
          primaryText: "Leftovers in one hand, your school's new parent app in the other. 🥪 Send your website for a free MudKitchen preview.",
          headline: "Leftovers in hand. Your app on screen.",
          description: "Free in 2 business days.",
        },
      ],
    },
    {
      id: "cyber-cart",
      fileName: "ad-k04-cyber-monday-cart.png",
      render: () => noOffer(<CyberCartAd />),
      adCopy: {
        label: "Cyber cart",
        primaryText:
          "Cyber Monday cart: your website, admin portal, teacher portal and parent app. 🛒 Total: $0. Checkout = send your website.",
        headline: "Cyber Monday cart: $0.00",
        description: "Free in 2 business days.",
      },
      adCopyVariants: [
        {
          label: "Checkout",
          primaryText: "Cyber Monday checkout steps: 🛒\n1. Send your website\n2. That's it\nIn 2 business days, a free MudKitchen preview of your school.",
          headline: "Checkout step 1: send your website",
          description: "Free. No card. No call.",
        },
        {
          label: "Short",
          primaryText: "Add to cart: one whole school, free. 🛒 Send your website and get a MudKitchen preview with your logo.",
          headline: "Add to cart: your whole school",
          description: "Free in 2 business days.",
        },
      ],
    },
    {
      id: "giving-tuesday",
      fileName: "ad-k05-giving-tuesday.png",
      render: () => noOffer(<GivingTuesdayAd />),
      adCopy: {
        label: "We're giving",
        primaryText:
          "It's Giving Tuesday, and we're giving every microschool a free, private preview of their school in MudKitchen. 🎁",
        headline: "Giving Tuesday: we're giving previews",
        description: "Just send your website.",
      },
      adCopyVariants: [
        {
          label: "You give a lot",
          primaryText: "You give all year. 🧡 This Giving Tuesday, it's our turn: a free MudKitchen preview of your school. Send your website.",
          headline: "You give all year. Our turn.",
          description: "Just send your website.",
        },
        {
          label: "What we're giving",
          primaryText: "What we're giving this Giving Tuesday: 🎁\n✅ A refreshed website\n✅ An admin portal\n✅ A teacher portal\n✅ A parent app\nA free MudKitchen preview. Send your website.",
          headline: "Giving Tuesday: four gifts, one school",
          description: "Free in 2 business days.",
        },
      ],
    },
    {
      id: "preview-wrapped",
      fileName: "ad-k06-your-school-wrapped.png",
      render: () => noOffer(<WrappedAd />),
      adCopy: {
        label: "Wrapped early",
        primaryText:
          "Everyone's sharing their year, wrapped. 🎁 Here's your school's, early: a free MudKitchen preview with your logo and colours.",
        headline: "Your school, wrapped early",
        description: "Free in 2 business days.",
      },
      adCopyVariants: [
        {
          label: "Your year in review",
          primaryText: "Your school's year, wrapped: 🎁\nTop app: the group chat\nMost texted: \"is there school Monday?\"\nNext year: one place for all of it\nSend your website for a free preview.",
          headline: "Top app this year: the group chat",
          description: "Free in 2 business days.",
        },
        {
          label: "Short",
          primaryText: "Wrapped, but make it your whole school. 🎁 Send your website for a free MudKitchen preview with your logo and colours.",
          headline: "Wrapped: your whole school",
          description: "Free. No call needed.",
        },
      ],
    },
    {
      id: "twelve-days",
      fileName: "ad-k07-on-the-first-day-of-break.png",
      render: () => noOffer(<TwelveDaysAd />),
      adCopy: {
        label: "First day of break",
        primaryText:
          "On the first day of break, my inbox gave to me… a preview of my own school. 🎄 Send your website before break.",
        headline: "On the first day of break…",
        description: "Admin, teacher, parent.",
      },
      adCopyVariants: [
        {
          label: "The full song",
          primaryText: "On the 12 days of break, MudKitchen gave to me: 🎄\n4 school portals\n3 sets of logins\n2 business days\n1 free school preview\nSend your website before break.",
          headline: "4 portals, 2 days, 1 free preview",
          description: "Admin, teacher, parent.",
        },
        {
          label: "Before break",
          primaryText: "Send your website before break, and on day one a free MudKitchen preview of your school is waiting. 🎄",
          headline: "Send before break. Open on day one.",
          description: "Free in 2 business days.",
        },
      ],
    },
    {
      id: "advent-door",
      fileName: "ad-k08-behind-door-24.png",
      render: () => noOffer(<AdventDoorAd />),
      adCopy: {
        label: "Door 24",
        primaryText:
          "Behind door 24: your own school app. 🎄 Send your website and we'll build a free preview with your logo.",
        headline: "Open door 24: your own school app",
        description: "Free and private.",
      },
      adCopyVariants: [
        {
          label: "No waiting",
          primaryText: "Why wait for door 24? 🎄 Send your website today and get a free MudKitchen preview of your school in 2 business days.",
          headline: "Skip to door 24",
          description: "Free and private.",
        },
        {
          label: "Every door",
          primaryText: "Behind every advent door, a piece of your free MudKitchen preview: 🚪\nDoor 1: a parent app\nDoor 2: a teacher portal\nDoor 3: an admin portal\nDoor 4: your website",
          headline: "Four doors. One free preview.",
          description: "Free in 2 business days.",
        },
      ],
    },
    {
      id: "letter-to-santa",
      fileName: "ad-k09-a-founders-letter-to-santa.png",
      render: () => noOffer(<LetterToSantaAd />),
      adCopy: {
        label: "Letter to Santa",
        primaryText:
          "Dear Santa, all I want is one login for admin, teachers and parents. 🎅 No chimney needed: send your website for a free preview.",
        headline: "A founder's letter to Santa",
        description: "Free in 2 business days.",
      },
      adCopyVariants: [
        {
          label: "Wish list",
          primaryText: "Dear Santa, all I want is: 🎅\n✅ An app parents actually check\n✅ A portal for my teachers\n✅ One admin view for me\n✅ A website that matches\nSkip the North Pole. Send your website.",
          headline: "Skip the North Pole. Send your website.",
          description: "Free in 2 business days.",
        },
        {
          label: "Faster than Santa",
          primaryText: "Santa takes 24 days. We take 2 business days. 🎅 Send your website and get a free MudKitchen preview of your school.",
          headline: "Faster than Santa: 2 business days",
          description: "Free. No call needed.",
        },
      ],
    },
    {
      id: "january-families",
      fileName: "ad-k10-january-families.png",
      render: () => noOffer(<JanuaryFamiliesAd />),
      adCopy: {
        label: "January families",
        primaryText:
          "New families tour microschools in January. 👀 See what they'd see: your website and parent app, in a free MudKitchen preview.",
        headline: "See what January families would see",
        description: "Free and private.",
      },
      adCopyVariants: [
        {
          label: "First impression",
          primaryText: "A January family finds your school online. What do they see first? 👀 Send your website for a free MudKitchen preview.",
          headline: "What January families see first",
          description: "Free and private.",
        },
        {
          label: "Tour season",
          primaryText: "January tour season, in a free MudKitchen preview: 🏫\n✅ A website families apply on\n✅ A parent app for after\n✅ An admin portal for you\n✅ A teacher portal\nSend your website.",
          headline: "Ready for January tours",
          description: "Free in 2 business days.",
        },
      ],
    },
    {
      id: "re-enrollment",
      fileName: "ad-k11-re-enrollment-season.png",
      render: () => noOffer(<ReEnrollmentAd />),
      adCopy: {
        label: "Re-enrollment",
        primaryText:
          "Re-enrollment season is coming. 📄 See families fill in forms in your own parent app. Free MudKitchen preview, your logo on it.",
        headline: "Re-enrollment, with your name on it",
        description: "Free in 2 business days.",
      },
      adCopyVariants: [
        {
          label: "No paper chase",
          primaryText: "Re-enrollment without the paper chase. 📄 Families fill in forms in their app; you track them in admin. Free preview.",
          headline: "Re-enrollment, minus the paper chase",
          description: "Free in 2 business days.",
        },
        {
          label: "Who does what",
          primaryText: "Re-enrollment by role, in a free MudKitchen preview: 📝\nParents: fill in forms in their app\nYou: see who's done\nTeachers: know who's coming back\nSend your website.",
          headline: "Re-enrollment, by role",
          description: "Free. No call needed.",
        },
      ],
    },
    {
      id: "choice-week",
      fileName: "ad-k12-school-choice-week.png",
      render: () => noOffer(<ChoiceWeekAd />),
      adCopy: {
        label: "Choose your tools",
        primaryText:
          "Happy School Choice Week (Jan 24–30). You chose to start a school. Now choose your tools. 🧡 Free MudKitchen preview.",
        headline: "You chose a school. Choose your tools.",
        description: "Free and private.",
      },
      adCopyVariants: [
        {
          label: "Your choice",
          primaryText: "Families choose your school. Choose what they open every day. 📱 Get a free MudKitchen preview this School Choice Week.",
          headline: "Families chose you. Now choose the app.",
          description: "Free and private.",
        },
        {
          label: "Short",
          primaryText: "Happy School Choice Week (Jan 24–30)! 🧡 To everyone who chose to build a school: a free MudKitchen preview of yours.",
          headline: "To the founders who chose to build",
          description: "Free in 2 business days.",
        },
      ],
    },
  ] satisfies MarketingSlide[],
} satisfies MarketingCarousel;

// ---------------------------------------------------------------- shared bits

function ListRow({ children, done, struck }: { children: ReactNode; done?: boolean; struck?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, minHeight: 66 }}>
      {done !== undefined ? <TickBox checked={done} size={42} /> : null}
      <LetterLine size={40} style={{ lineHeight: 1.2 }}>
        {struck ? <Struck>{children}</Struck> : children}
      </LetterLine>
    </div>
  );
}

// ---------------------------------------------------------------- K1 Thanksgiving

function GratefulListAd() {
  return (
    <AdFrame background={G.peach}>
      <AdCopy
        title={
          <>
            This year, I&rsquo;m thankful for <Accent>one login.</Accent>
          </>
        }
        size={80}
      />
      <Scene>
        <Pin right={-20} top={110} z={2} rotate={6}>
          <YourParentPhone scale={0.72} />
        </Pin>
        <Pin left={-6} top={30} z={4}>
          <NotebookPaper width={660} rotate={-2} lineGap={66} padding="28px 40px 26px 112px" tape={G.butter}>
            <LetterLine size={48} color={G.clayDeep}>
              Thankful for:
            </LetterLine>
            <ListRow struck>nine open tabs</ListRow>
            <ListRow struck>9pm parent texts</ListRow>
                        <ListRow done>my school&rsquo;s own app</ListRow>
            <ListRow done>one login for everyone</ListRow>
          </NotebookPaper>
        </Pin>
        <Pin right={0} bottom={0} z={5}>
          <Crew name="marigold" view="love" width={210} flip />
        </Pin>
      </Scene>
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- K2 doorbuster

function PriceTag({ children, width = 600, rotate = -6, style }: { children: ReactNode; width?: number; rotate?: number; style?: CSSProperties }) {
  return (
    <div style={{ position: "relative", width, transform: `rotate(${rotate}deg)`, ...style }}>
      <span aria-hidden style={{ position: "absolute", left: "50%", top: -120, width: 4, height: 130, background: G.ink, transform: "rotate(10deg)", transformOrigin: "bottom center" }} />
      <div style={{ position: "relative", boxSizing: "border-box", width, padding: "70px 44px 40px", background: "#FFFFFF", border: `5px solid ${G.ink}`, borderRadius: "120px 120px 30px 30px", boxShadow: `0 12px 0 ${G.ink}`, textAlign: "center", fontFamily: FONT.body, color: G.ink }}>
        <span aria-hidden style={{ position: "absolute", left: "50%", top: 22, marginLeft: -18, width: 36, height: 36, borderRadius: 999, background: G.butter, border: `5px solid ${G.ink}`, boxSizing: "border-box" }} />
        {children}
      </div>
    </div>
  );
}

function DoorbusterAd() {
  return (
    <AdFrame background={G.butter} pattern="none">
      <AdCopy
        title={
          <>
            The only doorbuster <Accent>that&rsquo;s free.</Accent>
          </>
        }
        size={86}
      />
      <Scene>
        <Pin left={30} top={150} z={4}>
          <PriceTag width={600} rotate={-5}>
            <Stamp color={BERRY} rotate={-4} size={40}>
              Doorbuster
            </Stamp>
            <p style={{ margin: "22px 0 0", fontFamily: FONT.display, fontWeight: 800, fontSize: 62, lineHeight: 1, letterSpacing: "-0.03em" }}>Your free preview</p>
            <p style={{ margin: "16px 0 0", fontWeight: 800, fontSize: 28, lineHeight: 1.3, color: G.soft }}>Admin, teacher and parent portals, with your logo</p>
            <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 24, flexWrap: "wrap" }}>
              {["Limit 1 per school", "No line at 5am"].map((t) => (
                <span key={t} style={{ padding: "10px 20px", borderRadius: 999, background: G.cream, border: `3px solid ${G.ink}`, fontWeight: 800, fontSize: 24 }}>
                  {t}
                </span>
              ))}
            </div>
          </PriceTag>
        </Pin>
        <Pin right={-20} bottom={0} z={5}>
          <Crew name="pip" view="run" width={290} flip />
        </Pin>
      </Scene>
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- K3 while they shop

function WhileTheyShopAd() {
  return (
    <AdFrame background={G.cream} pattern="grid">
      <AdCopy
        title={
          <>
            While they&rsquo;re out <Accent>Black Friday shopping&hellip;</Accent>
          </>
        }
        hand="…I'm clicking through my own school."
        size={78}
      />
      <Scene>
        <Pin left={0} top={150} z={2} rotate={-1.5}>
          <YourAdminWindow scale={0.76} />
        </Pin>
        <Pin left={20} top={50} z={5}>
          <RoleSwitch active="Teacher" size={28} />
        </Pin>
        <Pin right={-10} bottom={0} z={4}>
          <Crew name="terra" view="determined" width={250} flip />
        </Pin>
      </Scene>
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- K4 Cyber Monday cart

const CART = [
  { label: "Your website, made over", tint: YOUR.soft },
  { label: "Admin portal", tint: YOUR.tint },
  { label: "Teacher portal", tint: G.mint },
  { label: "Parent app", tint: G.lav },
];

function CyberCartAd() {
  return (
    <AdFrame background={G.sky}>
      <AdCopy
        title={
          <>
            Cyber Monday cart: <Accent>$0.00.</Accent>
          </>
        }
        size={88}
      />
      <Scene>
        <Pin right={-30} top={40} z={2} rotate={8}>
          <YourParentPhone scale={0.56} />
        </Pin>
        <Pin left={0} top={30} z={4} rotate={-1.5}>
          <InkCard width={720} style={{ padding: "30px 36px" }}>
            <p style={{ margin: 0, fontFamily: FONT.display, fontWeight: 800, fontSize: 40, letterSpacing: "-0.02em" }}>Your cart ({CART.length})</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 20 }}>
              {CART.map((item) => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 18, paddingBottom: 14, borderBottom: "2px dashed #E4D8C8" }}>
                  <span style={{ width: 64, height: 64, borderRadius: 16, background: item.tint, border: `3px solid ${G.ink}`, display: "grid", placeItems: "center", flexShrink: 0 }}>
                    <YourSchoolMark size={40} />
                  </span>
                  <span style={{ flex: 1, fontFamily: FONT.body, fontWeight: 800, fontSize: 30 }}>{item.label}</span>
                  <span style={{ fontFamily: FONT.body, fontWeight: 800, fontSize: 28, color: G.forest }}>Free</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: 18 }}>
              <span style={{ fontFamily: FONT.body, fontWeight: 800, fontSize: 30, color: G.soft }}>Total</span>
              <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 52, letterSpacing: "-0.03em" }}>$0.00</span>
            </div>
            <div style={{ marginTop: 18, padding: "18px 24px", borderRadius: 999, background: G.forest, color: "#FFFFFF", textAlign: "center", fontFamily: FONT.body, fontWeight: 800, fontSize: 28 }}>Checkout: send your website</div>
          </InkCard>
        </Pin>
        <Pin right={0} bottom={0} z={5}>
          <Crew name="dot" view="excited" width={200} flip />
        </Pin>
      </Scene>
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- K5 Giving Tuesday

function GivingTuesdayAd() {
  return (
    <AdFrame background={G.lav}>
      <AdCopy
        title={
          <>
            Giving Tuesday: <Accent>we&rsquo;re giving you a preview.</Accent>
          </>
        }
        size={78}
      />
      <Scene>
        <Pin left={0} top={20} z={4} rotate={-4}>
          <InkCard bg={G.butter} width={560} style={{ padding: "30px 36px", borderRadius: "28px 28px 28px 28px" }}>
            <Hand size={40} color={G.clayDeep} rotate={0}>
              To: your school
            </Hand>
            <Hand size={40} color={G.clayDeep} rotate={0}>
              From: the MudKitchen crew
            </Hand>
            <p style={{ margin: "16px 0 0", fontFamily: FONT.body, fontWeight: 800, fontSize: 30, lineHeight: 1.3, color: G.ink }}>Inside: your website, admin portal, teacher portal and parent app.</p>
          </InkCard>
        </Pin>
        <Pin left={40} top={400} z={3}>
          <GiftBox width={280} label={YOUR.name} rotate={-3} />
        </Pin>
        <Pin right={190} top={210} z={2} rotate={-5}>
          <YourParentPhone scale={0.56} />
        </Pin>
        <Pin right={-20} top={290} z={3} rotate={7}>
          <YourTeacherPhone scale={0.5} />
        </Pin>
      </Scene>
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- K6 wrapped

function WrapCard({ label, value, bg, color = G.ink, rotate, children }: { label: string; value: ReactNode; bg: string; color?: string; rotate: number; children?: ReactNode }) {
  return (
    <div
      style={{
        boxSizing: "border-box",
        height: "100%",
        padding: "26px 28px",
        background: bg,
        border: `4px solid ${G.ink}`,
        borderRadius: 30,
        boxShadow: `0 10px 0 ${G.ink}`,
        transform: `rotate(${rotate}deg)`,
        color,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <span style={{ fontFamily: FONT.body, fontWeight: 800, fontSize: 22, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.8 }}>{label}</span>
      {children}
      <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 52, lineHeight: 1, letterSpacing: "-0.03em" }}>{value}</span>
    </div>
  );
}

function WrappedAd() {
  return (
    <AdFrame background={G.forest} tone="dark">
      <AdCopy
        tone="dark"
        title={
          <>
            Your school, <Accent color={G.butter}>wrapped early.</Accent>
          </>
        }
        hand="a free preview of your next year."
        size={86}
      />
      <Scene>
        <div style={{ position: "absolute", left: 0, right: 0, top: 40, height: 680, display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 26 }}>
          <WrapCard label="Top colour" value="Yours." bg={YOUR.primary} color="#FFFFFF" rotate={-2}>
            <span style={{ display: "flex", gap: 10 }}>
              {[YOUR.primaryDeep, YOUR.accent, YOUR.soft].map((c) => (
                <span key={c} style={{ width: 54, height: 54, borderRadius: 14, background: c, border: "3px solid #FFFFFF" }} />
              ))}
            </span>
          </WrapCard>
          <WrapCard label="Top logo" value="Also yours." bg={G.butter} rotate={2}>
            <YourSchoolMark size={86} />
          </WrapCard>
          <WrapCard label="Views unlocked" value="Admin, teacher, parent" bg={G.peach} rotate={1.5} />
          <WrapCard label="Bonus track" value="Your website" bg={G.mint} rotate={-1.5} />
        </div>
      </Scene>
      <Footer tone="dark" />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- K7 12 days of break

function TwelveDaysAd() {
  return (
    <AdFrame background={G.cream} garland snow>
      <AdCopy
        title={
          <>
            On the first day of break, <Accent>my inbox gave to me&hellip;</Accent>
          </>
        }
        size={74}
      />
      <Scene>
        <Pin left={0} top={30} z={4}>
          <PreviewReadyEmail width={800} rotate={-2} />
        </Pin>
        <Pin left={20} top={420} z={5}>
          <Hand size={52} color={G.clayDeep} rotate={-3} style={{ maxWidth: 620 }}>
            &hellip;a preview of my own school 🎄
          </Hand>
        </Pin>
        <Pin right={-20} top={330} z={5} rotate={7}>
          <YourParentPhone scale={0.6} />
        </Pin>
        <Pin left={20} bottom={0} z={4}>
          <Crew name="clover" view="celebrate" width={240} />
        </Pin>
      </Scene>
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- K8 advent door

const DOORS = [7, 15, 2, 19, 11, 4, 22, 9, 13, 1, 17, 6, 20, 3, 10, 16, 8, 23, 5, 12];

function AdventDoorAd() {
  return (
    <AdFrame background={G.forest} tone="dark" snow>
      <AdCopy
        tone="dark"
        title={
          <>
            Behind door 24: <Accent color={G.butter}>your own school app.</Accent>
          </>
        }
        size={80}
      />
      <Scene>
        <div style={{ position: "absolute", left: 0, top: 30, width: 620, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {DOORS.map((n, i) => (
            <span
              key={n}
              style={{
                height: 138,
                boxSizing: "border-box",
                display: "grid",
                placeItems: "center",
                background: [G.cream, G.butter, G.peach, G.mint][i % 4],
                border: `4px solid ${G.ink}`,
                borderRadius: 14,
                fontFamily: FONT.display,
                fontWeight: 800,
                fontSize: 42,
                color: G.ink,
              }}
            >
              {n}
            </span>
          ))}
        </div>
        <Pin right={-20} top={170} z={3} rotate={4}>
          <YourParentPhone scale={0.66} />
        </Pin>
        <Pin right={190} top={100} z={4}>
          <span style={{ display: "grid", placeItems: "center", width: 120, height: 240, background: BERRY, border: `4px solid ${G.ink}`, borderRadius: 14, transform: "perspective(400px) rotateY(38deg)", transformOrigin: "right center", fontFamily: FONT.display, fontWeight: 800, fontSize: 64, color: "#FFFFFF" }}>
            24
          </span>
        </Pin>
      </Scene>
      <Footer tone="dark" />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- K9 letter to Santa

function LetterToSantaAd() {
  return (
    <AdFrame background={G.sky} snow>
      <AdCopy
        title={
          <>
            A founder&rsquo;s <Accent>letter to Santa.</Accent>
          </>
        }
        size={86}
      />
      <Scene>
        <Pin left={-6} top={30} z={4}>
          <NotebookPaper width={800} rotate={-2} lineGap={72} padding="38px 44px 34px 116px" tape={BERRY}>
            <LetterLine size={54} color={G.clayDeep}>
              Dear Santa,
            </LetterLine>
            <LetterLine size={44}>I answered every parent text this year.</LetterLine>
            <LetterLine size={44}>All I want is one login for admin, teachers and parents.</LetterLine>
            <LetterLine size={40} color={G.clay}>
              P.S. No chimney needed.
            </LetterLine>
            <LetterLine size={36} color={G.clayDeep} style={{ textAlign: "right" }}>
              — a microschool founder
            </LetterLine>
          </NotebookPaper>
        </Pin>
        <Pin right={-10} bottom={0} z={5}>
          <GiftBox width={220} rotate={6} />
        </Pin>
      </Scene>
      <Gap h={20} />
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- K10 January families

function JanuaryFamiliesAd() {
  return (
    <AdFrame background="#EEF5E9">
      <AdCopy
        title={
          <>
            New families tour in January. <Accent>See what they&rsquo;d see.</Accent>
          </>
        }
        size={76}
      />
      <Scene>
        <Pin left={0} top={60} z={2} rotate={-1.5}>
          <YourWebsiteWindow scale={0.74} label="Your website" />
        </Pin>
        <Pin right={-20} top={170} z={4} rotate={5}>
          <YourParentPhone scale={0.62} />
        </Pin>
        <Pin right={10} top={-10} z={6} rotate={6}>
          <InkCard width={170} style={{ padding: 0, overflow: "hidden", textAlign: "center", borderRadius: 22 }}>
            <div style={{ padding: "8px 0", background: BERRY, color: "#FFFFFF", fontFamily: FONT.display, fontWeight: 800, fontSize: 30, letterSpacing: "0.08em", borderBottom: `4px solid ${G.ink}` }}>JAN</div>
            <div style={{ padding: "6px 0 10px", fontFamily: FONT.hand, fontSize: 32, color: G.ink }}>tours!</div>
          </InkCard>
        </Pin>
        <Pin left={20} top={560} z={5}>
          <Annotation arrow="up-left" color={G.clayDeep} size={36}>
            your website, then their parent app
          </Annotation>
        </Pin>
      </Scene>
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- K11 re-enrollment

function ReEnrollmentAd() {
  return (
    <AdFrame background="#FFF7DA" tag={<FreeTag text="Free · private" />}>
      <AdCopy
        title={
          <>
            Re-enrollment season, <Accent>with your name on it.</Accent>
          </>
        }
        size={80}
      />
      <Scene>
        <Pin right={-10} top={40} z={2} rotate={3}>
          <PaperForm width={560} rotate={0}>
            <FormHeader label="Next fall" title="Re-enrollment" />
            <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "26px 28px 30px" }}>
              {["Family details", "Program choice", "Tuition plan", "Forms signed"].map((row, i) => (
                <div key={row} style={{ display: "flex", alignItems: "center", gap: 18 }}>
                  <TickBox checked={i < 3} size={42} />
                  <span style={{ fontFamily: FONT.body, fontWeight: 800, fontSize: 32 }}>{row}</span>
                </div>
              ))}
            </div>
          </PaperForm>
        </Pin>
        <Pin left={30} top={20} z={4} rotate={-4}>
          <YourParentPhone scale={0.8} screen="forms" />
        </Pin>
        <Pin left={360} top={480} z={5}>
          <Annotation arrow="left" color={G.clayDeep} size={36}>
            forms, in your parent app
          </Annotation>
        </Pin>
      </Scene>
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- K12 School Choice Week

function ChoiceWeekAd() {
  return (
    <AdFrame background={G.forest} tone="dark">
      <AdCopy
        tone="dark"
        title={
          <>
            You chose to start a school. <Accent color={G.butter}>Now choose your tools.</Accent>
          </>
        }
        hand="happy School Choice Week."
        size={72}
      />
      <Scene>
        <Pin left={0} top={20} z={4} rotate={-2}>
          <InkCard width={540} style={{ padding: "28px 32px" }}>
            <p style={{ margin: "0 0 18px", fontFamily: FONT.body, fontWeight: 800, fontSize: 22, letterSpacing: "0.14em", textTransform: "uppercase", color: G.soft }}>Your school&rsquo;s tools</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <TickBox checked={false} size={42} />
                <span style={{ fontFamily: FONT.body, fontWeight: 800, fontSize: 30, color: G.soft }}>
                  <Struck>Spreadsheets + group texts</Struck>
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <TickBox checked size={42} />
                <span style={{ fontFamily: FONT.body, fontWeight: 800, fontSize: 30, color: G.ink }}>One place for admin, teachers and parents</span>
              </div>
            </div>
          </InkCard>
        </Pin>
        <Pin left={30} top={360} z={3} rotate={-5}>
          <YourTeacherPhone scale={0.44} />
        </Pin>
        <Pin left={250} top={330} z={2} rotate={2}>
          <YourAdminWindow scale={0.52} label="Your admin portal" />
        </Pin>
        <Pin right={-20} top={10} z={3} rotate={6}>
          <YourParentPhone scale={0.52} />
        </Pin>
      </Scene>
      <Footer tone="dark" />
    </AdFrame>
  );
}
