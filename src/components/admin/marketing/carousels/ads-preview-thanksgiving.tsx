"use client";

import type { CSSProperties, ReactNode } from "react";
import type { MarketingCarousel, MarketingSlide } from "@/components/admin/marketing/carousels/types";
import { AdOfferProvider } from "@/components/admin/marketing/slide-frame";
import { Accent, AdCopy, AdFooter, AdFrame, BERRY, Crew, FONT, G, Hand, InkCard, Pin, Scene } from "@/components/admin/marketing/ads/ad-kit";
import { BrowserTab } from "@/components/admin/marketing/mascot/mascot-slide-kit";
import {
  FREE_PREVIEW_CTA,
  FREE_PREVIEW_URL,
  FREE_PREVIEW_UTM,
  ROLE_COLOR,
  RoleSwitch,
  YOUR,
  YourAdminPhone,
  YourAdminWindow,
  YourParentPhone,
  YourSchoolLockup,
  YourSchoolMark,
  YourTeacherPhone,
  YourWebsiteWindow,
  type PreviewRole,
} from "@/components/admin/marketing/carousels/free-preview-mocks";
import { FounderPolaroid, InboxEmail, JULIUS_SIGNATURE, LetterLine, NotebookPaper, Stamp, Struck, TextThread, TickBox } from "@/components/admin/marketing/carousels/founder-notes-kit";

// Set T: more Thanksgiving, Black Friday, Small Business Saturday and Cyber Monday ads for the free
// custom preview (2026: Thanksgiving Nov 26, Black Friday Nov 27, Small Business Saturday Nov 28,
// Cyber Monday Nov 30). File names run in date order; run windows are in the description and on the
// Posting schedule. "$0.00" jokes only: no "% off", no codes, no reviews or stars. Same guardrails as
// Sets F–K (no gift card, no customer names, quotes or stats, "Your School" only).

const noOffer = (node: ReactNode) => <AdOfferProvider show={false}>{node}</AdOfferProvider>;

function Footer({ tone = "light" }: { tone?: "light" | "dark" }) {
  return <AdFooter tone={tone} ctaLabel={FREE_PREVIEW_CTA} siteLabel={FREE_PREVIEW_URL} />;
}

const Gap = ({ h = 30 }: { h?: number }) => <div style={{ height: h, flexShrink: 0 }} />;
const MONO = "ui-monospace, 'SF Mono', Menlo, Consolas, monospace";

export const ADS_PREVIEW_THANKSGIVING_CAROUSEL = {
  id: "ads-preview-thanksgiving",
  title: "Ads: Thanksgiving to Cyber Monday (18)",
  description: `More holiday-weekend single ads for the free custom preview. Run windows: t01–t04 Thanksgiving (Nov 23–26) · t05 the crew's note (Nov 24–26) · t06 Black Friday receipt (Nov 27–28) · t07–t09 Black Friday weekend (Nov 27–29) · t10–t10f Small Business Saturday (Nov 28) · t11–t12 Cyber Monday (Nov 30) · t13 Cyber Monday + Tuesday (Nov 30 – Dec 1). No offer chip. Feed + story. Link: ${FREE_PREVIEW_UTM}`,
  fileSlug: "mudkitchen-ads-preview-thanksgiving",
  kind: "ad",
  sizes: ["feed", "story"],
  slides: [
    {
      id: "recipe-card",
      fileName: "ad-t01-thanksgiving-recipe-card.png",
      render: () => noOffer(<RecipeCardAd />),
      adCopy: {
        label: "Recipe card",
        primaryText:
          "A Thanksgiving recipe: 1 admin portal + 1 teacher portal + 1 parent app, with your logo. 🥧 Send your website. Free preview.",
        headline: "Recipe: one free school preview",
        description: "Serves your whole school.",
      },
      adCopyVariants: [
        {
          label: "Ingredients",
          primaryText: "Recipe for a free MudKitchen preview of your school: 🥧\n1 website\n1 admin portal\n1 teacher portal\n1 parent app\nAdd your logo. Ready in 2 business days.",
          headline: "Ingredients: your whole school, free",
          description: "Serves your whole school.",
        },
        {
          label: "Short",
          primaryText: "Prep time: 5 minutes. Cook time: 2 business days. 🥧 Send your website and we'll bake a free preview of your school.",
          headline: "Prep: 5 min. Cook: 2 business days.",
          description: "Free. No call needed.",
        },
      ],
    },
    {
      id: "hand-turkey",
      fileName: "ad-t02-thanksgiving-hand-turkey.png",
      render: () => noOffer(<HandTurkeyAd />),
      adCopy: {
        label: "Hand turkey",
        primaryText:
          "We made you a hand turkey. 🦃 Every feather is part of your free MudKitchen preview. Send your website to get yours.",
        headline: "We made you a hand turkey",
        description: "Free in 2 business days.",
      },
      adCopyVariants: [
        {
          label: "Feathers",
          primaryText: "Four feathers, one free MudKitchen preview: 🦃\n🪶 Your website\n🪶 Your admin portal\n🪶 Your teacher portal\n🪶 Your parent app\nSend your website to get yours.",
          headline: "Four feathers. One free preview.",
          description: "Free in 2 business days.",
        },
        {
          label: "Fridge-worthy",
          primaryText: "Some things belong on the fridge. 🦃 Your school's own app might be one. Send your website for a free MudKitchen preview.",
          headline: "Fridge-worthy: your school's own app",
          description: "Free. No call needed.",
        },
      ],
    },
    {
      id: "place-cards",
      fileName: "ad-t03-thanksgiving-place-cards.png",
      render: () => noOffer(<PlaceCardsAd />),
      adCopy: {
        label: "A seat for everyone",
        primaryText:
          "This Thanksgiving, everyone at your school gets a seat: admin, teachers and parents. 🍽️ See all three in a free preview.",
        headline: "A seat at the table for everyone",
        description: "Free and private.",
      },
      adCopyVariants: [
        {
          label: "Seating chart",
          primaryText: "Seating chart for your free MudKitchen preview: 🍽️\nAdmin: head of the table\nTeachers: their own portal\nParents: their own app\nWebsite: greeting guests\nSend your website.",
          headline: "Your school's seating chart",
          description: "Free and private.",
        },
        {
          label: "Nobody left out",
          primaryText: "Nobody eats at the kids' table, not even your website. 😄 Get a free MudKitchen preview with a seat for everyone.",
          headline: "Nobody at the kids' table",
          description: "Free in 2 business days.",
        },
      ],
    },
    {
      id: "pie-chart",
      fileName: "ad-t04-thanksgiving-pie-chart.png",
      render: () => noOffer(<PieChartAd />),
      adCopy: {
        label: "Pie chart",
        primaryText:
          "Thanksgiving week for a microschool founder, as a pie chart. 🥧 The slice we can help with: a free preview of your school.",
        headline: "Thanksgiving week, as a pie chart",
        description: "We build it. You look.",
      },
      adCopyVariants: [
        {
          label: "The slices",
          primaryText: "Thanksgiving week by the slice: 🥧\n40% parent texts\n30% tuition questions\n20% actual pie\n10% where's the calendar?\nMudKitchen helps with the first two. Free preview.",
          headline: "40% parent texts. 20% actual pie.",
          description: "We build it. You look.",
        },
        {
          label: "Bigger slice",
          primaryText: "Want a bigger slice of pie this week? 🥧 Send your website and we'll build a free preview of your school while you eat.",
          headline: "Take the bigger slice. We'll build.",
          description: "Free. No call needed.",
        },
      ],
    },
    {
      id: "crew-thanksgiving-note",
      fileName: "ad-t05-thanksgiving-note-from-mudkitchen.png",
      render: () => noOffer(<CrewThanksgivingNoteAd />),
      adCopy: {
        label: "Crew's note",
        primaryText:
          "Happy Thanksgiving from the MudKitchen crew. 🧡 Our thank-you to every microschool: a free preview of your school.",
        headline: "A Thanksgiving note from MudKitchen",
        description: "Free in 2 business days.",
      },
      adCopyVariants: [
        {
          label: "Thank you",
          primaryText: "Thank you for teaching, billing, planning and answering texts at 9pm. 🧡 Our thank-you note: a free preview of your school.",
          headline: "Thank you, founders. This one's free.",
          description: "Free in 2 business days.",
        },
        {
          label: "Short",
          primaryText: "Happy Thanksgiving from the MudKitchen crew. 🦃 We'll be building free school previews all week. Send your website and yours lands within 2 business days.",
          headline: "Happy Thanksgiving from the crew",
          description: "Free. No call needed.",
        },
      ],
    },
    {
      id: "receipt",
      fileName: "ad-t06-black-friday-receipt.png",
      render: () => noOffer(<ReceiptAd />),
      adCopy: {
        label: "$0.00 receipt",
        primaryText:
          "Black Friday receipt: website, admin portal, teacher portal, parent app. 🧾 Total: $0.00. A free MudKitchen preview, no call.",
        headline: "Black Friday receipt: $0.00",
        description: "Free in 2 business days.",
      },
      adCopyVariants: [
        {
          label: "Line items",
          primaryText: "Your Black Friday receipt for a free MudKitchen preview: 🧾\nWebsite .......... $0.00\nAdmin portal .... $0.00\nTeacher portal .. $0.00\nParent app ....... $0.00\nTotal: $0.00. Send your website to check out.",
          headline: "Four items. $0.00. No line.",
          description: "Free in 2 business days.",
        },
        {
          label: "No doorbusters",
          primaryText: "No doorbusters, no 5am line, no sales call. 🛍️ Just a free MudKitchen preview of your school. Send your website.",
          headline: "No 5am line. No sales call.",
          description: "Free in 2 business days.",
        },
      ],
    },
    {
      id: "shopping-list",
      fileName: "ad-t07-black-friday-shopping-list.png",
      render: () => noOffer(<ShoppingListAd />),
      adCopy: {
        label: "Shopping list",
        primaryText:
          "Black Friday list: skip the TV, skip another login. 📺 Get your school's own app instead, as a free MudKitchen preview.",
        headline: "Black Friday list: one thing for you",
        description: "Free. No line. No call.",
      },
      adCopyVariants: [
        {
          label: "Crossed off",
          primaryText: "Black Friday list: ✏️\n❌ Another app login\n❌ A bigger group chat\n❌ One more spreadsheet\n✅ Your school's own app\nFree MudKitchen preview. Send your website.",
          headline: "Cross off everything but this",
          description: "Free. No line. No call.",
        },
        {
          label: "One thing",
          primaryText: "The only thing on your Black Friday list that costs $0: 🛒 a free MudKitchen preview of your school. Send your website.",
          headline: "The only $0 thing on your list",
          description: "Free in 2 business days.",
        },
      ],
    },
    {
      id: "in-stock",
      fileName: "ad-t08-black-friday-in-stock.png",
      render: () => noOffer(<InStockAd />),
      adCopy: {
        label: "In stock",
        primaryText:
          "In stock this Black Friday: a free MudKitchen preview of your school, with your logo. 📦 Ships in 2 business days.",
        headline: "In stock. Ships in 2 business days.",
        description: "One per school. No call.",
      },
      adCopyVariants: [
        {
          label: "Limited? No.",
          primaryText: "Limited stock? Nope. 😄 Every microschool can get a free MudKitchen preview this Black Friday. Send your website.",
          headline: "Not limited. One per school.",
          description: "Ships as a private link.",
        },
        {
          label: "What's in the box",
          primaryText: "What's in the box: your free MudKitchen preview. 📦\n✅ Your website\n✅ An admin portal\n✅ A teacher portal\n✅ A parent app\nShips in 2 business days.",
          headline: "What's in the box: your whole school",
          description: "One per school. No call.",
        },
      ],
    },
    {
      id: "always-free",
      fileName: "ad-t09-black-friday-always-free.png",
      render: () => noOffer(<AlwaysFreeAd />),
      adCopy: {
        label: "Always free",
        primaryText:
          "\"Are you doing a Black Friday sale?\" Nope. 😄 The MudKitchen preview is free every day. Send your website.",
        headline: "Our Black Friday sale? Always free.",
        description: "Free and private.",
      },
      adCopyVariants: [
        {
          label: "Every day",
          primaryText: "Black Friday price on the MudKitchen preview: free. Regular price: also free. 😄 Send your website.",
          headline: "Black Friday price: free. Also Monday.",
          description: "Free and private.",
        },
        {
          label: "No rush",
          primaryText: "No countdown timer here. ⏳ Your MudKitchen preview isn't a Black Friday deal. It's free every day. Send your website.",
          headline: "No countdown. It's free every day.",
          description: "Within 2 business days.",
        },
      ],
    },
    {
      id: "small-business-saturday",
      fileName: "ad-t10-small-business-saturday.png",
      render: () => noOffer(<SmallBusinessAd />),
      adCopy: {
        label: "Small business too",
        primaryText:
          "Happy Small Business Saturday. 🏫 Your microschool is a small business too. See it in MudKitchen, free.",
        headline: "Your school is a small business too",
        description: "Free in 2 business days.",
      },
      adCopyVariants: [
        {
          label: "Run like one",
          primaryText: "Your microschool is a small business: tuition, staff, and customers (you call them parents 😄). See it in one place, free.",
          headline: "Customers? You call them parents.",
          description: "Free in 2 business days.",
        },
        {
          label: "Every role",
          primaryText: "Small Business Saturday, in a free MudKitchen preview: 🏫\n✅ Owner: admin portal\n✅ Staff: teacher portal\n✅ Customers: parent app\n✅ Storefront: your website\nSend your website.",
          headline: "Owner, staff, customers, storefront",
          description: "Free. No call needed.",
        },
      ],
    },
    {
      id: "shop-small-bag",
      fileName: "ad-t10b-small-business-saturday-shop-small-bag.png",
      render: () => noOffer(<ShopSmallBagAd />),
      adCopy: {
        label: "Shop small",
        primaryText:
          "Happy Small Business Saturday! 🛍️ Shop small: get your school's own app, as a free MudKitchen preview with your logo.",
        headline: "Shop small. Get your school's own app.",
        description: "Free in 2 business days.",
      },
      adCopyVariants: [
        {
          label: "In the bag",
          primaryText: "Shop small today: your free MudKitchen preview is in the bag. 🛍️ Your school's own app, with your logo. Send your website.",
          headline: "In the bag: your school's own app",
          description: "Free in 2 business days.",
        },
        {
          label: "Short",
          primaryText: "Small school. Big app energy. 💪 Get a free MudKitchen preview of your school this Small Business Saturday.",
          headline: "Small school. Big app energy.",
          description: "Free. No call needed.",
        },
      ],
    },
    {
      id: "chalkboard-special",
      fileName: "ad-t10c-small-business-saturday-chalkboard.png",
      render: () => noOffer(<ChalkboardAd />),
      adCopy: {
        label: "Today's special",
        primaryText:
          "Small Business Saturday special: 1 free MudKitchen preview of your school, with your logo. 🧑‍🍳 No call. Ready in 2 days.",
        headline: "Today's special: your free preview",
        description: "No call. 2 business days.",
      },
      adCopyVariants: [
        {
          label: "The menu",
          primaryText: "Small Business Saturday menu, free from MudKitchen: 🧑‍🍳\nStarter: your website\nMain: admin + teacher portals\nDessert: a parent app\nServed in 2 business days.",
          headline: "Starter, main, dessert. Price: free.",
          description: "No call. 2 business days.",
        },
        {
          label: "Chef's pick",
          primaryText: "Chef's pick today: a free preview of your school, made to order. 👩‍🍳 Send your website and MudKitchen does the cooking.",
          headline: "Chef's pick: your school, made to order",
          description: "Free in 2 business days.",
        },
      ],
    },
    {
      id: "main-street",
      fileName: "ad-t10d-small-business-saturday-main-street.png",
      render: () => noOffer(<MainStreetAd />),
      adCopy: {
        label: "Main Street",
        primaryText:
          "Happy Small Business Saturday to every microschool on Main Street. 🧡 See your school in MudKitchen, free.",
        headline: "You're on Main Street too",
        description: "Free and private.",
      },
      adCopyVariants: [
        {
          label: "Open for families",
          primaryText: "Main Street shops have a sign on the door. Your microschool can have a whole app. 🏫 Send your website for a free preview.",
          headline: "A sign on the door? Try a whole app.",
          description: "Free and private.",
        },
        {
          label: "Neighbours",
          primaryText: "To the bakery, the bookshop and the microschool on Main Street: happy Small Business Saturday. 🧡 Get a free MudKitchen preview of your school. Send your website.",
          headline: "Bakery, bookshop, microschool",
          description: "Free in 2 business days.",
        },
      ],
    },
    {
      id: "julius-small-business",
      fileName: "ad-t10e-small-business-saturday-julius.png",
      render: () => noOffer(<JuliusSmallBusinessAd />),
      adCopy: {
        label: "From Julius",
        primaryText:
          "From one small business to another: happy Small Business Saturday. 🧡 Send your website for a free preview. (Julius)",
        headline: "From one small business to another",
        description: "Free in 2 business days.",
      },
      adCopyVariants: [
        {
          label: "We get it",
          primaryText: "We're a small business too, so here's a free MudKitchen preview for yours. 🧡 We know you do every job yourself. (Julius)",
          headline: "Small business to small business",
          description: "Free in 2 business days.",
        },
        {
          label: "Personal",
          primaryText: "Hi, I'm Julius from MudKitchen. 👋 This Small Business Saturday, send me your school's website. I'll build a free preview.",
          headline: "Send Julius your website",
          description: "Free. No call needed.",
        },
      ],
    },
    {
      id: "open-sign",
      fileName: "ad-t10f-small-business-saturday-open-sign.png",
      render: () => noOffer(<OpenSignAd />),
      adCopy: {
        label: "Open online",
        primaryText:
          "Small Business Saturday: your school's doors can be open online too. 🚪 Get a free MudKitchen preview with your logo.",
        headline: "Your school's doors, open online",
        description: "Free and private.",
      },
      adCopyVariants: [
        {
          label: "Always open",
          primaryText: "Your school closes at 3. Your parent app doesn't. 🌙 Families check the calendar, tuition and messages anytime. Free preview.",
          headline: "You close at 3. The app doesn't.",
          description: "Free and private.",
        },
        {
          label: "Short",
          primaryText: "Flip the sign: OPEN. 🪧 Get a free MudKitchen preview of your school online, with your logo. Send your website.",
          headline: "Flip the sign: OPEN",
          description: "Free in 2 business days.",
        },
      ],
    },
    {
      id: "order-confirmed",
      fileName: "ad-t11-cyber-monday-order-confirmed.png",
      render: () => noOffer(<OrderConfirmedAd />),
      adCopy: {
        label: "Order confirmed",
        primaryText:
          "Cyber Monday order: 1 free MudKitchen preview of your school, with your logo. 📦 Arrives in 2 business days. Total: $0.00.",
        headline: "Order confirmed: 1 free preview",
        description: "Just send your website.",
      },
      adCopyVariants: [
        {
          label: "Order summary",
          primaryText: "Cyber Monday order summary: 📦\n1 × website\n1 × admin portal\n1 × teacher portal\n1 × parent app\nTotal: $0.00. Send your website to order.",
          headline: "Order summary: your school. $0.00.",
          description: "Just send your website.",
        },
        {
          label: "No cart",
          primaryText: "No cart, no checkout, no card. 🛒 This Cyber Monday, just send your website and get a free MudKitchen preview.",
          headline: "No cart. No checkout. No card.",
          description: "Free in 2 business days.",
        },
      ],
    },
    {
      id: "no-code-needed",
      fileName: "ad-t12-cyber-monday-no-code-needed.png",
      render: () => noOffer(<NoCodeAd />),
      adCopy: {
        label: "No code needed",
        primaryText:
          "Cyber Monday code for the MudKitchen preview: none needed. 💻 It's already free. Send your website.",
        headline: "Cyber Monday code: none needed",
        description: "Free and private.",
      },
      adCopyVariants: [
        {
          label: "Promo code",
          primaryText: "Promo code: YOURWEBSITE. 😄 That's it. Send your school's website and get a free MudKitchen preview.",
          headline: "Promo code: your website",
          description: "Free and private.",
        },
        {
          label: "No coding either",
          primaryText: "No promo code. No coding either. 💻 Send your website and we'll build a free preview of your school in 2 business days.",
          headline: "No promo code. No coding either.",
          description: "Free. No call needed.",
        },
      ],
    },
    {
      id: "close-the-tabs",
      fileName: "ad-t13-cyber-monday-close-the-tabs.png",
      render: () => noOffer(<CloseTheTabsAd />),
      adCopy: {
        label: "Close the tabs",
        primaryText:
          "This Cyber Monday, close the tabs and open one: 🗂️ a free MudKitchen preview of your school. Send your website.",
        headline: "Cyber Monday: close tabs, open one",
        description: "Free in 2 business days.",
      },
      adCopyVariants: [
        {
          label: "Tab count",
          primaryText: "Cyber Monday tab count: 14 deals, 3 carts, 1 school spreadsheet. 😵 Close them. Open one: a free preview of your school.",
          headline: "14 tabs open? Open just one.",
          description: "Free in 2 business days.",
        },
        {
          label: "One per role",
          primaryText: "One tab per person, in a free MudKitchen preview: 🗂️\n✅ You: admin portal\n✅ Teachers: teacher portal\n✅ Parents: parent app\n✅ New families: your website",
          headline: "One tab per person. That's it.",
          description: "Free. No call needed.",
        },
      ],
    },
  ] satisfies MarketingSlide[],
} satisfies MarketingCarousel;

// ---------------------------------------------------------------- shared bits

function SmallCaps({ children, color = G.soft, style }: { children: ReactNode; color?: string; style?: CSSProperties }) {
  return <p style={{ margin: 0, fontFamily: FONT.body, fontWeight: 800, fontSize: 21, letterSpacing: "0.14em", textTransform: "uppercase", color, ...style }}>{children}</p>;
}

function ListRow({ children, done, struck }: { children: ReactNode; done?: boolean; struck?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, minHeight: 78 }}>
      {done !== undefined ? <TickBox checked={done} size={46} /> : null}
      <LetterLine size={48} style={{ lineHeight: 1.2 }}>
        {struck ? <Struck>{children}</Struck> : children}
      </LetterLine>
    </div>
  );
}

// ---------------------------------------------------------------- T1 recipe card

/** Autumn leaf drawn with CSS: a pointed rounded square on its corner, plus a stem. */
export function Leaf({ color, size = 58, rotate = 0 }: { color: string; size?: number; rotate?: number }) {
  return (
    <span aria-hidden style={{ position: "relative", display: "block", width: size, height: size, transform: `rotate(${45 + rotate}deg)` }}>
      <span style={{ position: "absolute", inset: 0, boxSizing: "border-box", background: color, border: `3px solid ${G.ink}`, borderRadius: "0 70% 0 70%" }} />
      <span style={{ position: "absolute", left: "50%", top: "50%", width: Math.round(size * 0.62), height: 3, marginTop: -1, background: G.ink, transformOrigin: "left center", transform: "rotate(45deg)" }} />
    </span>
  );
}

// One leaf on the card's corner, two in the strip between the card and the footer.
const RECIPE_LEAVES: Array<{ x: number; y: number; r: number; color: string; size?: number }> = [
  { x: -26, y: 12, r: 20, color: G.clay, size: 54 },
  { x: 24, y: 646, r: -30, color: G.butter, size: 54 },
  { x: 112, y: 668, r: 50, color: "#E3A64A", size: 44 },
];

const RECIPE_INGREDIENTS: Array<{ label: string; bg: string; color: string }> = [
  { label: "Admin portal", bg: ROLE_COLOR.Admin, color: "#FFFFFF" },
  { label: "Teacher portal", bg: ROLE_COLOR.Teacher, color: "#FFFFFF" },
  { label: "Parent app", bg: ROLE_COLOR.Parent, color: G.ink },
];

const RECIPE_STEPS = ["Send your website", "We build it", "Ready in 2 business days"];

function RecipeCardAd() {
  return (
    <AdFrame background={G.peach}>
      <AdCopy
        title={
          <>
            Recipe: one free <Accent>school preview.</Accent>
          </>
        }
        size={84}
      />
      <Scene>
        <Pin right={-30} top={120} z={2} rotate={7}>
          <YourParentPhone scale={0.6} />
        </Pin>
        <Pin left={0} top={30} z={4} rotate={-2}>
          <div style={{ width: 700, boxSizing: "border-box", background: "#FFFEFA", border: `4px solid ${G.ink}`, borderRadius: 18, boxShadow: `0 12px 0 ${G.ink}`, overflow: "hidden" }}>
            <div style={{ height: 18, background: BERRY, borderBottom: `4px solid ${G.ink}` }} />
            <div style={{ padding: "28px 34px 30px" }}>
              <SmallCaps>Ingredients</SmallCaps>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
                {RECIPE_INGREDIENTS.map((item) => (
                  <span
                    key={item.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      minHeight: 100,
                      boxSizing: "border-box",
                      padding: "16px 22px",
                      borderRadius: 18,
                      background: item.bg,
                      border: `4px solid ${G.ink}`,
                      boxShadow: `0 6px 0 ${G.ink}`,
                      fontFamily: FONT.display,
                      fontWeight: 800,
                      fontSize: 36,
                      lineHeight: 1.05,
                      letterSpacing: "-0.02em",
                      color: item.color,
                    }}
                  >
                    {item.label}
                  </span>
                ))}
              </div>
              <SmallCaps style={{ marginTop: 28 }}>Directions</SmallCaps>
              <div style={{ display: "flex", gap: 14, marginTop: 14 }}>
                {RECIPE_STEPS.map((step, i) => (
                  <div key={step} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 10 }}>
                    <span style={{ width: 54, height: 54, borderRadius: 999, background: BERRY, border: `4px solid ${G.ink}`, boxSizing: "border-box", display: "grid", placeItems: "center", fontFamily: FONT.display, fontWeight: 800, fontSize: 28, color: "#FFFFFF" }}>{i + 1}</span>
                    <span style={{ fontFamily: FONT.body, fontWeight: 800, fontSize: 30, lineHeight: 1.15, color: G.ink }}>{step}</span>
                  </div>
                ))}
              </div>
              <Hand size={34} color={G.forest} rotate={0} style={{ marginTop: 22, textAlign: "center" }}>
                serves your whole school 🦃
              </Hand>
            </div>
          </div>
        </Pin>
        <Pin left={460} top={34} z={6}>
          <Stamp color={BERRY} rotate={9} size={24} style={{ background: "#FFFEFA" }}>
            Thanksgiving special
          </Stamp>
        </Pin>
        {RECIPE_LEAVES.map((leaf) => (
          <Pin key={`${leaf.x}-${leaf.y}`} left={leaf.x} top={leaf.y} z={5}>
            <Leaf color={leaf.color} size={leaf.size} rotate={leaf.r} />
          </Pin>
        ))}
        <Pin right={20} top={600} z={3}>
          <span aria-hidden style={{ position: "relative", display: "block", width: 180, height: 180 }}>
            <span style={{ position: "absolute", inset: 0, boxSizing: "border-box", borderRadius: 999, background: "#D9873A", border: `5px solid ${G.ink}`, boxShadow: `inset 0 0 0 20px #E8B46C, inset 0 0 0 24px ${G.ink}, 0 8px 0 ${G.ink}` }} />
            <span style={{ position: "absolute", left: 62, top: 56, width: 56, height: 44, borderRadius: "50% 50% 46% 46%", background: "#FFFAF4", border: `4px solid ${G.ink}`, boxSizing: "border-box" }} />
          </span>
        </Pin>
      </Scene>
      <Gap />
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- T2 hand turkey

const FEATHERS: Array<{ label: string; angle: number; color: string }> = [
  { label: "website", angle: -46, color: "#E9897A" },
  { label: "admin", angle: -16, color: G.butter },
  { label: "teacher", angle: 14, color: "#8DBF7A" },
  { label: "parent app", angle: 44, color: "#7FB3D5" },
];

function HandTurkeyAd() {
  const cx = 360;
  const cy = 500;
  const len = 300;
  const rad = (d: number) => (d * Math.PI) / 180;
  const thumb = 64;
  return (
    <AdFrame background={G.cream} pattern="grid">
      <AdCopy
        title={
          <>
            We made you <Accent>a hand turkey.</Accent>
          </>
        }
        hand="every feather is in your free preview."
        size={86}
      />
      <Scene>
        {FEATHERS.map((f) => (
          <Pin key={f.label} left={cx - 50} top={cy - len} z={2} style={{ width: 100, height: len, transform: `rotate(${f.angle}deg)`, transformOrigin: "50% 100%" }}>
            <span style={{ display: "block", width: "100%", height: "100%", boxSizing: "border-box", background: f.color, border: `5px solid ${G.ink}`, borderRadius: "50px 50px 20px 20px" }} />
          </Pin>
        ))}
        {FEATHERS.map((f) => {
          const x = cx + (len + 46) * Math.sin(rad(f.angle));
          const y = cy - (len + 46) * Math.cos(rad(f.angle));
          return (
            <Pin key={`${f.label}-tag`} left={x} top={y} z={5} style={{ transform: "translate(-50%, -50%)" }}>
              <span style={{ display: "inline-block", padding: "8px 18px", background: "#FFFFFF", border: `3px solid ${G.ink}`, borderRadius: 999, fontFamily: FONT.hand, fontSize: 34, color: G.ink, whiteSpace: "nowrap", transform: `rotate(${f.angle / 4}deg)` }}>{f.label}</span>
            </Pin>
          );
        })}
        {/* thumb = the head */}
        <Pin left={cx - 48} top={cy - 210} z={3} style={{ width: 96, height: 210, transform: `rotate(${thumb}deg)`, transformOrigin: "50% 100%" }}>
          <span style={{ display: "block", width: "100%", height: "100%", boxSizing: "border-box", background: "#B07A4E", border: `5px solid ${G.ink}`, borderRadius: "48px 48px 20px 20px" }} />
        </Pin>
        {(() => {
          const ex = cx + 160 * Math.sin(rad(thumb));
          const ey = cy - 160 * Math.cos(rad(thumb));
          return (
            <>
              <Pin left={ex - 22} top={ey - 34} z={6}>
                <span style={{ display: "grid", placeItems: "center", width: 44, height: 44, borderRadius: 999, background: "#FFFFFF", border: `4px solid ${G.ink}`, boxSizing: "border-box" }}>
                  <span style={{ width: 16, height: 16, borderRadius: 999, background: G.ink, marginLeft: 6 }} />
                </span>
              </Pin>
              <Pin left={ex + 46} top={ey - 18} z={6}>
                <span style={{ display: "block", width: 0, height: 0, borderTop: "14px solid transparent", borderBottom: "14px solid transparent", borderLeft: `30px solid ${YOUR.accent}` }} />
              </Pin>
              <Pin left={ex + 30} top={ey + 8} z={6}>
                <span style={{ display: "block", width: 24, height: 40, borderRadius: "50% 50% 50% 50% / 30% 30% 70% 70%", background: BERRY, border: `3px solid ${G.ink}` }} />
              </Pin>
            </>
          );
        })()}
        {/* palm */}
        <Pin left={cx - 150} top={cy - 150} z={4}>
          <div style={{ width: 300, height: 300, boxSizing: "border-box", borderRadius: 999, background: "#B07A4E", border: `5px solid ${G.ink}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <YourSchoolMark size={86} ring={G.ink} />
            <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 34, color: "#FFFFFF" }}>{YOUR.name}</span>
          </div>
        </Pin>
        {[cx - 50, cx + 34].map((x) => (
          <Pin key={x} left={x} top={cy + 140} z={3}>
            <span style={{ display: "block", width: 10, height: 70, background: G.ink, borderRadius: 4 }} />
            <span style={{ display: "block", width: 46, height: 10, marginLeft: -18, background: G.ink, borderRadius: 4 }} />
          </Pin>
        ))}
        <Pin right={-20} top={230} z={2} rotate={6}>
          <YourParentPhone scale={0.56} />
        </Pin>
      </Scene>
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- T3 place cards

function PlaceCard({ role }: { role: PreviewRole }) {
  return (
    <div style={{ width: 230, boxSizing: "border-box", background: "#FFFFFF", border: `4px solid ${G.ink}`, borderRadius: 12, boxShadow: `0 8px 0 ${G.ink}`, overflow: "hidden", textAlign: "center" }}>
      <div style={{ height: 22, background: ROLE_COLOR[role], borderBottom: `3px solid ${G.ink}` }} />
      <div style={{ padding: "12px 10px 14px" }}>
        <SmallCaps style={{ fontSize: 16 }}>reserved for</SmallCaps>
        <Hand size={44} color={G.ink} rotate={0} style={{ marginTop: 2 }}>
          {role === "Parent" ? "Parents" : role === "Teacher" ? "Teachers" : "Admin"}
        </Hand>
      </div>
    </div>
  );
}

function PlaceCardsAd() {
  return (
    <AdFrame background={G.peach}>
      <AdCopy
        title={
          <>
            A seat at the table <Accent>for everyone.</Accent>
          </>
        }
        hand="admin, teachers and parents all get one."
        size={84}
      />
      <Scene>
        <Pin left={-120} right={-120} top={500} z={1}>
          <div style={{ height: 400, background: "repeating-linear-gradient(90deg, #FFFAF4 0 70px, #F3E3D0 70px 140px)", borderTop: `5px solid ${G.ink}` }} />
        </Pin>
        <Pin left={0} top={150} z={2} rotate={-2}>
          <YourAdminWindow scale={0.42} label="Admin portal" />
        </Pin>
        <Pin left={455} top={100} z={2} rotate={2}>
          <YourTeacherPhone scale={0.5} />
        </Pin>
        <Pin left={720} top={110} z={2} rotate={5}>
          <YourParentPhone scale={0.5} />
        </Pin>
        {(
          [
            { role: "Admin", x: 90 },
            { role: "Teacher", x: 430 },
            { role: "Parent", x: 700 },
          ] as Array<{ role: PreviewRole; x: number }>
        ).map((c, i) => (
          <Pin key={c.role} left={c.x} top={470} z={4} rotate={[-3, 1, 3][i]}>
            <PlaceCard role={c.role} />
          </Pin>
        ))}
        {[90, 430, 700].map((x) => (
          <Pin key={x} left={x} top={660} z={3}>
            <span style={{ display: "grid", placeItems: "center", width: 230, height: 76, borderRadius: "50%", background: "#FFFFFF", border: `4px solid ${G.ink}`, boxSizing: "border-box" }}>
              <span style={{ width: 150, height: 44, borderRadius: "50%", border: "3px solid #E4D8C8" }} />
            </span>
          </Pin>
        ))}
      </Scene>
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- T4 pie chart

const SLICES = [
  { label: "pie (obviously)", color: "#E89A4B" },
  { label: "“is there school Wednesday?”", color: "#C9772F" },
  { label: "spreadsheets", color: "#F2B872" },
  { label: "your free preview", color: G.butter, highlight: true },
];

function PieChartAd() {
  return (
    <AdFrame background={G.cream} pattern="grid">
      <AdCopy
        title={
          <>
            Thanksgiving week, <Accent>as a pie chart.</Accent>
          </>
        }
        size={84}
      />
      <Scene>
        <Pin left={-10} top={60} z={3}>
          <div
            style={{
              width: 470,
              height: 470,
              boxSizing: "border-box",
              borderRadius: 999,
              border: `6px solid ${G.ink}`,
              boxShadow: `inset 0 0 0 30px #D9A25C, inset 0 0 0 34px ${G.ink}, 0 12px 0 ${G.ink}`,
              background: `conic-gradient(from -90deg, ${SLICES[0].color} 0 34%, ${G.ink} 34% 34.6%, ${SLICES[1].color} 34.6% 60%, ${G.ink} 60% 60.6%, ${SLICES[2].color} 60.6% 79%, ${G.ink} 79% 79.6%, ${SLICES[3].color} 79.6% 99.4%, ${G.ink} 99.4% 100%)`,
            }}
          />
        </Pin>
        <Pin left={480} top={40} z={4} rotate={1.5}>
          <InkCard width={480} style={{ padding: "26px 28px" }}>
            <SmallCaps>Thanksgiving week</SmallCaps>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 14 }}>
              {SLICES.map((s) => (
                <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 14, padding: s.highlight ? "10px 12px" : "0 12px", margin: "0 -12px", borderRadius: 14, background: s.highlight ? G.mint : "transparent" }}>
                  <span style={{ width: 34, height: 34, flexShrink: 0, borderRadius: 8, background: s.color, border: `3px solid ${G.ink}` }} />
                  <span style={{ fontFamily: FONT.body, fontWeight: 800, fontSize: 28, lineHeight: 1.2, color: G.ink }}>{s.label}</span>
                </div>
              ))}
            </div>
          </InkCard>
        </Pin>
        <Pin left={500} top={470} z={5}>
          <Hand size={40} color={G.clayDeep} rotate={-3} style={{ maxWidth: 420 }}>
            the butter slice is on us.
          </Hand>
        </Pin>
        <Pin right={-10} bottom={0} z={4}>
          <Crew name="nutmeg" view="happy" width={200} flip />
        </Pin>
      </Scene>
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- T5 Julius's Thanksgiving note

/** Instant-photo frame with three crew mascots inside ("the crew"). */
function CrewPolaroid({ width = 280, rotate = 6 }: { width?: number; rotate?: number }) {
  const pad = Math.round(width * 0.06);
  const crew: Array<{ name: "pip" | "nutmeg" | "loam"; view: "love" | "wave" | "happy" }> = [
    { name: "pip", view: "love" },
    { name: "nutmeg", view: "wave" },
    { name: "loam", view: "happy" },
  ];
  return (
    <div style={{ position: "relative", width, transform: `rotate(${rotate}deg)` }}>
      <div style={{ boxSizing: "border-box", width, padding: `${pad}px ${pad}px ${Math.round(pad * 0.6)}px`, background: "#FFFFFF", border: `4px solid ${G.ink}`, borderRadius: 10, boxShadow: `0 10px 0 ${G.ink}` }}>
        <div style={{ width: "100%", aspectRatio: "4 / 3", borderRadius: 4, background: `linear-gradient(180deg, ${G.butter} 0%, #F7D9A8 100%)`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          {crew.map((m, i) => (
            <div key={m.name} style={{ flexShrink: 0, marginLeft: i ? -Math.round(width * 0.13) : 0, marginBottom: -2, zIndex: i === 1 ? 2 : 1, position: "relative" }}>
              <Crew name={m.name} view={m.view} width={Math.round(width * 0.4)} ground={false} />
            </div>
          ))}
        </div>
        <Hand size={Math.round(width * 0.12)} color={G.ink} rotate={0} style={{ textAlign: "center", marginTop: Math.round(pad * 0.5), lineHeight: 1.15 }}>
          the crew 🦃
        </Hand>
      </div>
      <span aria-hidden style={{ position: "absolute", top: -20, left: "50%", marginLeft: -Math.round(width * 0.26), width: Math.round(width * 0.52), height: 40, background: G.butter, opacity: 0.9, transform: "rotate(4deg)", borderRadius: 4 }} />
    </div>
  );
}

function CrewThanksgivingNoteAd() {
  return (
    <AdFrame background="#F6E4CF">
      <AdCopy
        title={
          <>
            A Thanksgiving note <Accent>from MudKitchen.</Accent>
          </>
        }
        size={84}
      />
      <Scene>
        <Pin left={-6} top={60} z={4}>
          <NotebookPaper width={730} rotate={-2} lineGap={66} padding="38px 42px 32px 116px" tape={G.peach}>
            <LetterLine size={48} color={G.clayDeep}>
              Happy Thanksgiving,
            </LetterLine>
            <LetterLine size={42}>Thank you for answering the 9pm texts.</LetterLine>
            <LetterLine size={42}>Our thank-you: a free preview of your school.</LetterLine>
            <LetterLine size={34} color={G.clayDeep} style={{ textAlign: "right", marginTop: 4 }}>
              — the MudKitchen crew 🧡
            </LetterLine>
          </NotebookPaper>
        </Pin>
        <Pin right={-6} top={60} z={5}>
          <CrewPolaroid width={270} rotate={6} />
        </Pin>
        <Pin right={0} bottom={0} z={5}>
          <Crew name="terra" view="celebrate" width={220} flip />
        </Pin>
        <Pin right={200} bottom={10} z={6}>
          <Leaf color={G.clay} size={46} rotate={25} />
        </Pin>
        <Pin right={-14} bottom={30} z={6}>
          <Leaf color="#E3A64A" size={40} rotate={-40} />
        </Pin>
      </Scene>
      <Gap />
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- T6 Black Friday receipt

const RECEIPT_ROWS = ["Website", "Admin portal", "Teacher portal", "Parent app"];

function ReceiptAd() {
  const dash = <div style={{ borderTop: "3px dashed rgba(43,36,29,.4)", margin: "14px 0" }} />;
  return (
    <AdFrame background={G.forestDeep} tone="dark">
      <AdCopy
        tone="dark"
        title={
          <>
            Black Friday receipt: <Accent color={G.butter}>$0.00.</Accent>
          </>
        }
        size={84}
      />
      <Scene>
        <Pin right={-20} top={60} z={2} rotate={7}>
          <YourParentPhone scale={0.6} />
        </Pin>
        <Pin left={30} top={10} z={4} rotate={-3}>
          <div
            style={{
              width: 560,
              boxSizing: "border-box",
              padding: "34px 36px 56px",
              background: "#FFFEFA",
              fontFamily: MONO,
              color: G.ink,
              clipPath: "polygon(0 0, 100% 0, 100% 97%, 95% 100%, 90% 97%, 85% 100%, 80% 97%, 75% 100%, 70% 97%, 65% 100%, 60% 97%, 55% 100%, 50% 97%, 45% 100%, 40% 97%, 35% 100%, 30% 97%, 25% 100%, 20% 97%, 15% 100%, 10% 97%, 5% 100%, 0 97%)",
            }}
          >
            <p style={{ margin: 0, textAlign: "center", fontWeight: 800, fontSize: 34, letterSpacing: "0.12em" }}>MUDKITCHEN</p>
            <p style={{ margin: "6px 0 0", textAlign: "center", fontSize: 20 }}>BLACK FRIDAY · NOV 27</p>
            <p style={{ margin: "2px 0 0", textAlign: "center", fontSize: 20 }}>ORDER FOR: {YOUR.name.toUpperCase()}</p>
            {dash}
            {RECEIPT_ROWS.map((r) => (
              <div key={r} style={{ display: "flex", justifyContent: "space-between", fontSize: 24, lineHeight: 1.7 }}>
                <span>{r}</span>
                <span>$0.00</span>
              </div>
            ))}
            {dash}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22 }}>
              <span>You skipped</span>
              <span>1 sales call</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 10 }}>
              <span style={{ fontWeight: 800, fontSize: 32 }}>TOTAL</span>
              <span style={{ fontWeight: 800, fontSize: 48 }}>$0.00</span>
            </div>
            {dash}
            <p style={{ margin: 0, textAlign: "center", fontSize: 20 }}>SHIPS IN 2 BUSINESS DAYS</p>
            <p style={{ margin: "4px 0 0", textAlign: "center", fontWeight: 800, fontSize: 22 }}>THANK YOU, FOUNDER!</p>
          </div>
        </Pin>
      </Scene>
      <Footer tone="dark" />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- T7 Black Friday shopping list

function ShoppingListAd() {
  return (
    <AdFrame background="#FFF7DA">
      <AdCopy
        title={
          <>
            My Black Friday list: <Accent>one thing.</Accent>
          </>
        }
        size={84}
      />
      <Scene>
        <Pin right={-20} top={150} z={2} rotate={6}>
          <YourParentPhone scale={0.74} />
        </Pin>
        <Pin left={-6} top={40} z={4}>
          <NotebookPaper width={680} rotate={-2} lineGap={78} padding="34px 40px 34px 112px" tape={BERRY}>
            <LetterLine size={56} color={G.clayDeep}>
              Black Friday list
            </LetterLine>
            <ListRow struck>a new TV</ListRow>
            <ListRow struck>an air fryer</ListRow>
            <ListRow struck>another login</ListRow>
            <ListRow done>my school&rsquo;s own app</ListRow>
            <LetterLine size={42} color={G.forest} style={{ marginTop: 10 }}>
              (free. no line. no call.)
            </LetterLine>
          </NotebookPaper>
        </Pin>
      </Scene>
      <Gap />
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- T8 in stock

function InStockAd() {
  const thumb = (node: ReactNode, active?: boolean) => (
    <span style={{ position: "relative", display: "block", width: 120, height: 120, overflow: "hidden", borderRadius: 16, border: `${active ? 4 : 3}px solid ${active ? G.ink : "#E4D8C8"}`, background: G.cream, boxSizing: "border-box" }}>
      <span style={{ position: "absolute", left: 8, top: 8 }}>{node}</span>
    </span>
  );
  return (
    <AdFrame background={G.cream} pattern="grid">
      <AdCopy
        title={
          <>
            In stock. <Accent>Ships in 2 business days.</Accent>
          </>
        }
        size={80}
      />
      <Scene>
        <Pin left={0} right={0} top={30} z={3}>
          <InkCard style={{ padding: 28, display: "flex", gap: 30 }}>
            <div style={{ width: 430, flexShrink: 0 }}>
              <div style={{ borderRadius: 20, background: YOUR.soft, padding: "26px 12px", display: "flex", justifyContent: "center" }}>
                <YourAdminWindow scale={0.42} />
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
                {thumb(<YourAdminWindow scale={0.11} />, true)}
                {thumb(<YourTeacherPhone scale={0.2} />)}
                {thumb(<YourParentPhone scale={0.2} />)}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0, fontFamily: FONT.body, color: G.ink }}>
              <SmallCaps>MudKitchen · free preview</SmallCaps>
              <p style={{ margin: "8px 0 0", fontFamily: FONT.display, fontWeight: 800, fontSize: 40, lineHeight: 1.05, letterSpacing: "-0.02em" }}>{YOUR.name}, built in MudKitchen</p>
              <p style={{ margin: "14px 0 0", fontFamily: FONT.display, fontWeight: 800, fontSize: 52, color: G.forest }}>Free</p>
              <p style={{ margin: "10px 0 0", display: "flex", alignItems: "center", gap: 10, fontWeight: 800, fontSize: 24, color: G.forest }}>
                <span style={{ width: 16, height: 16, borderRadius: 999, background: "#2E9E5B" }} /> In stock · limit 1 per school
              </p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
                {["Website", "Admin portal", "Teacher portal", "Parent app"].map((c) => (
                  <span key={c} style={{ padding: "8px 14px", borderRadius: 999, background: G.cream, border: "2px solid #E4D8C8", fontWeight: 800, fontSize: 20 }}>
                    {c}
                  </span>
                ))}
              </div>
              <div style={{ marginTop: 20, padding: "16px 20px", borderRadius: 999, background: G.clay, color: "#FFFFFF", textAlign: "center", fontWeight: 800, fontSize: 24 }}>Add to cart: send your website</div>
            </div>
          </InkCard>
        </Pin>
        <Pin right={0} bottom={0} z={5}>
          <Crew name="pip" view="point" width={190} flip />
        </Pin>
      </Scene>
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- T9 always free

function AlwaysFreeAd() {
  return (
    <AdFrame background={G.sky}>
      <AdCopy
        title={
          <>
            Our Black Friday sale? <Accent>It&rsquo;s always free.</Accent>
          </>
        }
        size={80}
      />
      <Scene>
        <Pin right={-20} top={250} z={2} rotate={6}>
          <YourParentPhone scale={0.6} />
        </Pin>
        <Pin left={0} top={20} z={4} rotate={-1.5}>
          <TextThread
            named
            width={680}
            messages={[
              { from: "you", text: "are you doing a Black Friday sale? 👀" },
              { from: "founder", text: "nope 😄" },
              { from: "founder", text: "the preview is free every day 🙂" },
              { from: "you", text: "wait, every day?" },
              { from: "founder", text: "every day." },
            ]}
          />
        </Pin>
      </Scene>
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- T10 Small Business Saturday

function SmallBusinessAd() {
  return (
    <AdFrame background="#EEF5E9">
      <AdCopy
        title={
          <>
            Small Business Saturday: <Accent>your school is one too.</Accent>
          </>
        }
        size={76}
      />
      <Scene>
        <Pin left={290} top={30} z={5} rotate={-1}>
          <InkCard style={{ padding: "14px 28px", borderRadius: 18 }}>
            <YourSchoolLockup size={52} fontSize={38} />
          </InkCard>
        </Pin>
        <Pin left={10} right={10} top={130} z={4}>
          <Awning height={110} />
        </Pin>
        <Pin left={80} top={270} z={2}>
          <YourAdminWindow scale={0.82} label={`${YOUR.name} · open`} />
        </Pin>
        <Pin left={20} top={630} z={5}>
          <Stamp color={BERRY} rotate={-8} size={40} style={{ background: "#FFFFFF" }}>
            Shop small
          </Stamp>
        </Pin>
        <Pin right={0} top={330} z={5} rotate={8}>
          <InkCard bg={G.butter} style={{ padding: "16px 26px", borderRadius: 16 }}>
            <span style={{ display: "block", fontFamily: FONT.display, fontWeight: 800, fontSize: 46, letterSpacing: "0.04em", color: G.ink }}>OPEN</span>
            <span style={{ display: "block", fontFamily: FONT.hand, fontSize: 28, color: G.clayDeep }}>free preview</span>
          </InkCard>
        </Pin>
      </Scene>
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- T10b–f more Small Business Saturday

/** Striped shop awning. */
function Awning({ height = 90, color = BERRY, light = "#FFFAF4", stripe = 64 }: { height?: number; color?: string; light?: string; stripe?: number }) {
  return (
    <div
      style={{
        height,
        boxSizing: "border-box",
        border: `5px solid ${G.ink}`,
        borderRadius: "16px 16px 44px 44px",
        background: `repeating-linear-gradient(90deg, ${color} 0 ${stripe}px, ${light} ${stripe}px ${stripe * 2}px)`,
        boxShadow: `0 10px 0 ${G.ink}`,
      }}
    />
  );
}

function ShopSmallBagAd() {
  const handle = { position: "absolute" as const, top: -112, width: 150, height: 130, boxSizing: "border-box" as const, border: `9px solid ${G.ink}`, borderBottom: "none", borderRadius: "80px 80px 0 0" };
  return (
    <AdFrame background={G.peach}>
      <AdCopy
        title={
          <>
            Shop small. <Accent>Get your school&rsquo;s own app.</Accent>
          </>
        }
        size={80}
      />
      <Scene>
        <Pin left={120} top={110} z={2} rotate={-9}>
          <YourAdminWindow scale={0.44} label="Admin portal" />
        </Pin>
        <Pin left={420} top={50} z={2} rotate={4}>
          <YourTeacherPhone scale={0.44} />
        </Pin>
        <Pin left={570} top={90} z={2} rotate={13}>
          <YourParentPhone scale={0.46} />
        </Pin>
        <Pin left={150} top={340} z={4}>
          <div style={{ position: "relative", width: 560, height: 420 }}>
            <span aria-hidden style={{ ...handle, left: 90 }} />
            <span aria-hidden style={{ ...handle, right: 90 }} />
            <div style={{ position: "absolute", inset: 0, boxSizing: "border-box", background: "#C9965F", border: `5px solid ${G.ink}`, borderRadius: "8px 8px 18px 18px", boxShadow: `0 12px 0 ${G.ink}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
              <span aria-hidden style={{ position: "absolute", left: 0, right: 0, top: 0, height: 26, background: "rgba(43,36,29,.14)" }} />
              <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 92, lineHeight: 0.95, letterSpacing: "-0.04em", color: "#FFFAF4", textAlign: "center" }}>
                Shop
                <br />
                small
              </span>
              <span style={{ padding: "8px 20px", borderRadius: 999, background: "#FFFAF4", border: `3px solid ${G.ink}`, fontFamily: FONT.body, fontWeight: 800, fontSize: 22, letterSpacing: "0.12em", textTransform: "uppercase", color: BERRY }}>
                Small Business Saturday
              </span>
            </div>
          </div>
        </Pin>
        <Pin right={-10} bottom={0} z={5}>
          <Crew name="pip" view="love" width={200} flip />
        </Pin>
      </Scene>
      <Footer />
    </AdFrame>
  );
}

function ChalkboardAd() {
  const chalk = (text: ReactNode, size = 38, color = "#F4F1EA") => (
    <Hand size={size} color={color} rotate={0} style={{ lineHeight: 1.2, textAlign: "center" }}>
      {text}
    </Hand>
  );
  return (
    <AdFrame background="#F6E4CF">
      <AdCopy
        title={
          <>
            Today&rsquo;s special: <Accent>your free preview.</Accent>
          </>
        }
        size={84}
      />
      <Scene>
        <Pin right={-20} top={150} z={2} rotate={6}>
          <YourParentPhone scale={0.66} />
        </Pin>
        {[70, 490].map((x, i) => (
          <Pin key={x} left={x} top={560} z={2} rotate={i ? -8 : 8}>
            <span style={{ display: "block", width: 22, height: 170, background: "#B07A4E", border: `4px solid ${G.ink}`, borderRadius: 6 }} />
          </Pin>
        ))}
        <Pin left={30} top={20} z={4} rotate={-1.5}>
          <div style={{ width: 580, boxSizing: "border-box", padding: "34px 36px 36px", background: "#2F3B34", border: `16px solid #B07A4E`, outline: `4px solid ${G.ink}`, borderRadius: 14, boxShadow: `0 12px 0 ${G.ink}`, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 30, letterSpacing: "0.16em", color: "#F4F1EA" }}>TODAY&rsquo;S SPECIAL</span>
            {chalk("1 free school preview", 54, G.butter)}
            <span aria-hidden style={{ width: "70%", borderTop: "3px dashed rgba(244,241,234,.5)", margin: "8px 0" }} />
            {chalk("admin portal")}
            {chalk("teacher portal")}
            {chalk("parent app")}
                        <span aria-hidden style={{ width: "70%", borderTop: "3px dashed rgba(244,241,234,.5)", margin: "8px 0" }} />
                        {chalk("ready in 2 business days", 32, G.mint)}
            {chalk("☆ shop small ☆", 30, "#F2B872")}
          </div>
        </Pin>
      </Scene>
      <Footer />
    </AdFrame>
  );
}

function Storefront({ name, width, height, wall, stripe, children }: { name: ReactNode; width: number; height: number; wall: string; stripe: string; children?: ReactNode }) {
  return (
    <div style={{ width, height, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <InkCard style={{ padding: "8px 20px", borderRadius: 14, boxShadow: `0 6px 0 ${G.ink}`, marginBottom: 10, whiteSpace: "nowrap" }}>{name}</InkCard>
      <div style={{ width: "100%" }}>
        <Awning height={64} color={stripe} stripe={40} />
      </div>
      <div style={{ position: "relative", flex: 1, width: "92%", marginTop: -6, boxSizing: "border-box", background: wall, border: `5px solid ${G.ink}`, borderTop: "none" }}>
        {children ?? (
          <>
            <span style={{ position: "absolute", left: "12%", top: 30, width: "40%", height: 120, background: "#E3EDFB", border: `4px solid ${G.ink}`, borderRadius: 8 }} />
            <span style={{ position: "absolute", right: "12%", bottom: 0, width: "26%", height: 170, background: "#8A5A3B", border: `4px solid ${G.ink}`, borderBottom: "none", borderRadius: "10px 10px 0 0" }} />
          </>
        )}
      </div>
    </div>
  );
}

function MainStreetAd() {
  const shopName = (text: string) => <span style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 28, color: G.ink }}>{text}</span>;
  return (
    <AdFrame background={G.sky}>
      <AdCopy
        title={
          <>
            You&rsquo;re on <Accent>Main Street too.</Accent>
          </>
        }
        hand="happy Small Business Saturday."
        size={86}
      />
      <Scene>
        <Pin left={-120} right={-120} top={600} z={1}>
          <div style={{ height: 300, background: "#D8D2C8", borderTop: `5px solid ${G.ink}` }} />
        </Pin>
        <Pin left={-20} top={160} z={2}>
          <Storefront name={shopName("Bakery")} width={300} height={440} wall="#F3D9B5" stripe="#E9897A" />
        </Pin>
        <Pin right={-20} top={160} z={2}>
          <Storefront name={shopName("Books")} width={300} height={440} wall="#DCE6D4" stripe={G.forest} />
        </Pin>
        <Pin left={286} top={60} z={3}>
          <Storefront name={<YourSchoolLockup size={40} fontSize={30} />} width={380} height={540} wall={YOUR.soft} stripe={YOUR.primary} />
        </Pin>
        <Pin left={376} top={300} z={4} rotate={-2}>
          <YourParentPhone scale={0.52} />
        </Pin>
      </Scene>
      <Footer />
    </AdFrame>
  );
}

function JuliusSmallBusinessAd() {
  return (
    <AdFrame background="#EEF5E9">
      <AdCopy
        title={
          <>
            From one small business <Accent>to another.</Accent>
          </>
        }
        size={80}
      />
      <Scene>
        <Pin right={-40} top={400} z={2} rotate={8}>
          <YourParentPhone scale={0.52} />
        </Pin>
        <Pin left={-6} top={60} z={4}>
          <NotebookPaper width={730} rotate={-2} lineGap={66} padding="38px 42px 32px 116px" tape={G.butter}>
            <LetterLine size={46} color={G.clayDeep}>
              Happy Small Business Saturday,
            </LetterLine>
            <LetterLine size={42}>We&rsquo;re a small team, so today is ours too.</LetterLine>
            <LetterLine size={42}>Send me your website for a free preview.</LetterLine>
            <LetterLine size={32} color={G.clayDeep} style={{ textAlign: "right", marginTop: 4 }}>
              {JULIUS_SIGNATURE}
            </LetterLine>
          </NotebookPaper>
        </Pin>
        <Pin right={-6} top={40} z={5}>
          <FounderPolaroid width={230} rotate={6} caption="Julius 🛍️" tape={G.peach} />
        </Pin>
        <Pin left={20} top={640} z={6}>
          <Stamp color={BERRY} rotate={-6} size={30} style={{ background: "#FFFFFF" }}>
            Shop small
          </Stamp>
        </Pin>
      </Scene>
      <Footer />
    </AdFrame>
  );
}

const SIGN_HOURS = ["Website", "Parent app", "Admin + teacher portals"];

function OpenSignAd() {
  return (
    <AdFrame background={G.lav}>
      <AdCopy
        title={
          <>
            Your school&rsquo;s doors, <Accent>open online.</Accent>
          </>
        }
        size={84}
      />
      <Scene>
        <Pin left={30} top={230} z={2} rotate={-1}>
          <YourAdminWindow scale={0.92} label={`${YOUR.name} · open`} />
        </Pin>
        {[330, 600].map((x) => (
          <Pin key={x} left={x} top={30} z={4}>
            <span style={{ display: "block", width: 4, height: 90, background: G.ink, borderRadius: 2 }} />
          </Pin>
        ))}
        <Pin left={226} top={110} z={5} rotate={-3}>
          <InkCard width={520} style={{ padding: "22px 34px 26px", textAlign: "center", borderRadius: 26 }}>
            <SmallCaps color={G.soft}>Small Business Saturday</SmallCaps>
            <p style={{ margin: "4px 0 0", fontFamily: FONT.display, fontWeight: 800, fontSize: 96, lineHeight: 1, letterSpacing: "0.04em", color: BERRY }}>OPEN</p>
            <div style={{ margin: "14px 0 0", padding: "12px 0 0", borderTop: "3px dashed #E4D8C8", display: "flex", flexDirection: "column", gap: 6 }}>
              {SIGN_HOURS.map((h) => (
                <div key={h} style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT.body, fontWeight: 800, fontSize: 24, color: G.ink }}>
                  <span>{h}</span>
                  <span style={{ color: G.forest }}>always</span>
                </div>
              ))}
            </div>
            <Hand size={32} color={G.clayDeep} rotate={0} style={{ marginTop: 12 }}>
              free preview · 2 business days
            </Hand>
          </InkCard>
        </Pin>
      </Scene>
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- T11 Cyber Monday order confirmed

function TrackStep({ label, sub, state }: { label: string; sub: string; state: "done" | "now" | "next" }) {
  const bg = state === "done" ? G.forest : state === "now" ? G.butter : "#FFFFFF";
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 8 }}>
      <span style={{ width: 56, height: 56, borderRadius: 999, background: bg, border: `4px solid ${G.ink}`, boxSizing: "border-box", display: "grid", placeItems: "center", color: "#FFFFFF", fontFamily: FONT.body, fontWeight: 900, fontSize: 28 }}>
        {state === "done" ? "✓" : ""}
      </span>
      <span style={{ fontFamily: FONT.body, fontWeight: 800, fontSize: 24, color: G.ink }}>{label}</span>
      <span style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: 19, color: G.soft, lineHeight: 1.25 }}>{sub}</span>
    </div>
  );
}

function OrderConfirmedAd() {
  return (
    <AdFrame background={G.lav}>
      <AdCopy
        title={
          <>
            Cyber Monday: <Accent>order confirmed.</Accent>
          </>
        }
        size={84}
      />
      <Scene style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 30 }}>
        <InboxEmail
          from="MudKitchen orders"
          width={940}
          style={{ transform: "rotate(-1deg)" }}
          subject="Order confirmed: 1 free preview 📦"
          body={`${YOUR.name} · free preview, with your logo. Total: $0.00.`}
          attachment={
            <div style={{ position: "relative", display: "flex", gap: 10, padding: "22px 10px 6px", borderTop: "2px solid #E4D8C8" }}>
              <span aria-hidden style={{ position: "absolute", left: "17%", right: "17%", top: 50, height: 5, background: G.ink, zIndex: 0 }} />
              <div style={{ position: "relative", zIndex: 1, display: "flex", gap: 10, width: "100%" }}>
                <TrackStep label="Ordered" sub="you sent your website" state="done" />
                <TrackStep label="Building" sub="your logo and colours" state="now" />
                <TrackStep label="In your inbox" sub="within 2 business days" state="next" />
              </div>
            </div>
          }
        />
        <Pin right={-10} bottom={0} z={5}>
          <Crew name="dot" view="excited" width={190} flip />
        </Pin>
      </Scene>
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- T12 no code needed

function NoCodeAd() {
  return (
    <AdFrame background={G.mint}>
      <AdCopy
        title={
          <>
            Cyber Monday code: <Accent>none needed.</Accent>
          </>
        }
        size={84}
      />
      <Scene>
        <Pin left={20} top={20} z={4} rotate={-3}>
          <div style={{ position: "relative", width: 800, boxSizing: "border-box", padding: "34px 60px 38px", background: G.butter, border: `5px dashed ${G.ink}`, borderRadius: 26, textAlign: "center", fontFamily: FONT.body, color: G.ink }}>
            {[{ left: -30 }, { right: -30 }].map((side, i) => (
              <span key={i} aria-hidden style={{ position: "absolute", top: "50%", marginTop: -30, width: 60, height: 60, borderRadius: 999, background: G.mint, border: `5px dashed ${G.ink}`, boxSizing: "border-box", ...side }} />
            ))}
            <span aria-hidden style={{ position: "absolute", left: 22, top: 6, fontSize: 36 }}>✂</span>
            <SmallCaps color={G.clayDeep}>Cyber Monday · free preview</SmallCaps>
            <p style={{ margin: "10px 0 0", fontFamily: FONT.display, fontWeight: 800, fontSize: 40, letterSpacing: "-0.02em" }}>Code:</p>
            <p style={{ margin: "2px 0 0", fontFamily: FONT.display, fontWeight: 800, fontSize: 96, lineHeight: 1, letterSpacing: "-0.04em", color: G.clay }}>(none)</p>
            <p style={{ margin: "14px 0 0", fontWeight: 800, fontSize: 30 }}>Your preview is already free.</p>
          </div>
        </Pin>
        <Pin left={120} top={390} z={2} rotate={-8}>
          <YourAdminPhone scale={0.46} />
        </Pin>
        <Pin left={380} top={370} z={3} rotate={-2}>
          <YourTeacherPhone scale={0.48} />
        </Pin>
        <Pin left={640} top={380} z={2} rotate={7}>
          <YourParentPhone scale={0.48} />
        </Pin>
      </Scene>
      <Footer />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- T13 close the tabs

const OLD_TABS: Array<{ label: string; x: number; y: number; r: number; tint: string }> = [
  { label: "Spreadsheet", x: 0, y: 0, r: -5, tint: "#E8F3E1" },
  { label: "Group text", x: 270, y: 24, r: 3, tint: "#F8DDCF" },
  { label: "Form builder", x: 540, y: 0, r: -2, tint: "#FFF7DA" },
  { label: "Venmo", x: 40, y: 104, r: 3, tint: "#E3EDFB" },
  { label: "Email", x: 300, y: 118, r: -3, tint: "#FFFFFF" },
  { label: "Shared calendar", x: 560, y: 100, r: 4, tint: "#ECE2F3" },
];

function CloseTheTabsAd() {
  return (
    <AdFrame background={G.peach}>
      <AdCopy
        title={
          <>
            Cyber Monday: close the tabs. <Accent>Open one.</Accent>
          </>
        }
        size={78}
      />
      <Scene>
        {OLD_TABS.map((t) => (
          <Pin key={t.label} left={t.x} top={t.y + 24} rotate={t.r} z={2} style={{ opacity: 0.55 }}>
            <BrowserTab label={t.label} tint={t.tint} />
          </Pin>
        ))}
        <Pin left={0} top={240} z={3} rotate={-1}>
          <YourWebsiteWindow scale={0.8} label={`${YOUR.name} · private preview`} />
        </Pin>
        <Pin left={150} top={680} z={5}>
          <RoleSwitch active="Admin" size={28} />
        </Pin>
        <Pin right={-20} top={260} z={4} rotate={6}>
          <YourParentPhone scale={0.52} />
        </Pin>
      </Scene>
      <Gap h={20} />
      <Footer />
    </AdFrame>
  );
}
