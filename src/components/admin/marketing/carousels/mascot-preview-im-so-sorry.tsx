"use client";

import type { ReactNode } from "react";
import type { MarketingCarousel, MarketingSlide } from "@/components/admin/marketing/carousels/types";
import { Accent, At, BrowserTab, FONT, G, Hand, Headline, MascotSlide, NotificationCard, PlacedMascot, SwipeHint } from "@/components/admin/marketing/mascot/mascot-slide-kit";
import {
  FREE_PREVIEW_UTM,
  FreePreviewCtaSlide,
  RoleSwitch,
  YourAdminWindow,
  YourParentPhone,
  YourTeacherPhone,
  YourWebsiteWindow,
  groundedY,
} from "@/components/admin/marketing/carousels/free-preview-mocks";

// Swipe carousel on the "I'm so sorry" slideshow trend: the polished first slide, then each slide
// "peels back" to the real version (a Monday, the 9pm inbox), then the free preview as the real fix.
// The tools and messages are illustrative, not customer quotes or statistics.

const MONDAY_TABS: Array<{ label: string; x: number; y: number; r: number; tint: string }> = [
  { label: "Spreadsheet", x: 50, y: 500, r: -5, tint: "#E8F3E1" },
  { label: "Group text", x: 720, y: 480, r: 4, tint: "#F8DDCF" },
  { label: "Google Forms", x: 380, y: 450, r: 2, tint: "#FFF7DA" },
  { label: "Venmo", x: 40, y: 660, r: 4, tint: "#E3EDFB" },
  { label: "Email", x: 790, y: 650, r: -4, tint: "#FFFFFF" },
  { label: "Paper binder", x: 30, y: 830, r: -3, tint: "#FFF7DA" },
  { label: "Shared calendar", x: 690, y: 810, r: 3, tint: "#ECE2F3" },
  { label: "Sign-up sheet", x: 60, y: 990, r: 4, tint: "#E8F3E1" },
];

const NINE_PM = [
  { title: "Quick question 🙂", sub: "a parent · 9:02 PM", color: "#7FB3D5", x: 72, y: 470, r: -2 },
  { title: "Is tuition due Friday?", sub: "a parent · 9:14 PM", color: "#C2563F", x: 220, y: 610, r: 2 },
  { title: "Lost the field trip form", sub: "a parent · 9:31 PM", color: "#E3A64A", x: 72, y: 750, r: -1.5 },
  { title: "Can we switch days?", sub: "a parent · 9:47 PM", color: "#3F6B4F", x: 200, y: 890, r: 2.5 },
];

export const MASCOT_PREVIEW_IM_SO_SORRY_CAROUSEL = {
  id: "mascot-preview-im-so-sorry",
  title: "I'm so sorry, this is my school (Free preview)",
  description: `Swipe carousel on the "I'm so sorry" slideshow trend: my school on the website, then (sorry) on a Monday, then the 9pm inbox, then the real version in the free preview with admin, teacher and parent views. Link: ${FREE_PREVIEW_UTM}`,
  fileSlug: "mudkitchen-free-preview-im-so-sorry",
  slides: [
    {
      id: "this-is-my-school",
      fileName: "01-this-is-my-school.png",
      render: () => (
        <MascotSlide background={G.cream}>
          <div style={{ position: "absolute", left: 72, right: 72, top: 128, zIndex: 5 }}>
            <Headline size={92}>
              This is <Accent>my school.</Accent> 😌
            </Headline>
          </div>
          <At x={66} y={360} z={2} rotate={-1}>
            <YourWebsiteWindow scale={0.98} label="Your School · website" />
          </At>
          <Hand size={46} color={G.forest} rotate={-3} style={{ position: "absolute", left: 72, top: 1040, zIndex: 5 }}>
            calm. organized. beautiful.
          </Hand>
          <PlacedMascot name="terra" view="happy" width={230} x={790} y={groundedY(230)} z={4} flip />
          <SwipeHint style={{ left: 72, right: "auto" }} />
        </MascotSlide>
      ),
      adCopy: {
        label: "I'm so sorry",
        primaryText:
          "This is my school. 😌 I'm so sorry, this is my school on a Monday. 😅 Swipe for the version with everything in one place, as a free preview.",
        headline: "My school vs. my school on a Monday",
        description: "Free in 2 business days.",
      },
      adCopyVariants: [
        {
          label: "The trend",
          primaryText: "This is my school. ✨\nI'm so sorry, this is my school at 9pm. 📱\nSwipe for the real fix: a free MudKitchen preview with your admin, teacher and parent views in one place →",
          headline: "This is my school. (I'm so sorry.)",
          description: "Free in 2 business days.",
        },
        {
          label: "Relatable",
          primaryText: "Every microschool founder has two versions of their school: the website version and the Monday version. 😅 Swipe to see how a free MudKitchen preview brings them together →",
          headline: "The website version vs. Monday",
          description: "Free and private.",
        },
      ],
    },
    {
      id: "on-a-monday",
      fileName: "02-im-so-sorry-on-a-monday.png",
      render: () => (
        <SorrySlide line="This is my school on a Monday." background={G.peach}>
          {MONDAY_TABS.map((tab) => (
            <At key={tab.label} x={tab.x} y={tab.y} rotate={tab.r} z={3}>
              <BrowserTab label={tab.label} tint={tab.tint} />
            </At>
          ))}
          <PlacedMascot name="dig" view="oops" width={380} x={350} y={groundedY(380)} z={4} />
        </SorrySlide>
      ),
    },
    {
      id: "inbox-at-9pm",
      fileName: "03-im-so-sorry-my-inbox-at-9pm.png",
      render: () => (
        <SorrySlide line="This is my inbox at 9pm." background={G.lav}>
          {NINE_PM.map((n) => (
            <At key={n.title} x={n.x} y={n.y} rotate={n.r} z={3}>
              <NotificationCard title={n.title} sub={n.sub} color={n.color} style={{ width: 540 }} />
            </At>
          ))}
          <PlacedMascot name="fennel" view="tears" width={290} x={760} y={groundedY(290)} z={4} flip />
        </SorrySlide>
      ),
    },
    {
      id: "really-my-school",
      fileName: "04-okay-this-is-really-my-school.png",
      render: () => (
        <MascotSlide background="#EEF5E9">
          <div style={{ position: "absolute", left: 72, right: 72, top: 128, zIndex: 6 }}>
            <Headline size={74}>
              Okay, this is really my school. <Accent>In my free preview.</Accent>
            </Headline>
            <p style={{ margin: "18px 0 0", maxWidth: 900, fontFamily: FONT.body, fontWeight: 600, fontSize: 32, lineHeight: 1.3, color: G.soft }}>
              Admin, teacher and parent views, with my logo, in one private link.
            </p>
          </div>
          <At x={56} y={540} z={2} rotate={-2}>
            <YourAdminWindow scale={0.62} />
          </At>
          <At x={640} y={500} z={3} rotate={4}>
            <YourTeacherPhone scale={0.48} />
          </At>
          <At x={810} y={590} z={4} rotate={8}>
            <YourParentPhone scale={0.5} />
          </At>
          <At x={72} y={1000} z={5}>
            <RoleSwitch active="Admin" size={28} />
          </At>
          <SwipeHint style={{ left: 72, right: "auto" }} />
        </MascotSlide>
      ),
    },
    {
      id: "cta",
      fileName: "05-get-your-free-preview.png",
      render: () => (
        <FreePreviewCtaSlide
          lead="No more sorry."
          accent="See yours, free."
          aside="admin, teacher and parent views · within 2 business days"
          cast={[
            { name: "pip", view: "excited", width: 300, x: 530, y: groundedY(300) },
            { name: "dig", view: "happy", width: 300, x: 770, y: groundedY(300), flip: true },
          ]}
        >
          <At x={80} y={600} z={4}>
            <RoleSwitch active="Parent" size={28} />
          </At>
        </FreePreviewCtaSlide>
      ),
    },
  ] satisfies MarketingSlide[],
} satisfies MarketingCarousel;

/** "I'm so sorry." + the reveal line at the top, art below, swipe hint bottom-left. */
function SorrySlide({ line, background, children }: { line: string; background: string; children: ReactNode }) {
  return (
    <MascotSlide background={background}>
      <div style={{ position: "absolute", left: 72, right: 72, top: 128, zIndex: 6 }}>
        <Headline size={86}>
          I&rsquo;m so sorry. <Accent>{line}</Accent>
        </Headline>
      </div>
      {children}
      <SwipeHint style={{ left: 72, right: "auto" }} />
    </MascotSlide>
  );
}
