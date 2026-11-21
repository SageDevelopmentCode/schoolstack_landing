"use client";

import type { ReactNode } from "react";
import type { MarketingCarousel, MarketingSlide } from "@/components/admin/marketing/carousels/types";
import { Accent, At, FONT, G, Hand, Headline, MascotSlide, PlacedMascot, SwipeHint } from "@/components/admin/marketing/mascot/mascot-slide-kit";
import {
  FREE_PREVIEW_UTM,
  FreePreviewCtaSlide,
  ROLE_COLOR,
  RoleBadge,
  RoleSwitch,
  YOUR,
  YourAdminWindow,
  YourParentPhone,
  YourTeacherPhone,
  YourTeacherWindow,
  YourWebsiteWindow,
  groundedY,
} from "@/components/admin/marketing/carousels/free-preview-mocks";

// Swipe carousel: a tour of the full free-preview bundle, one "seat" per slide (admin, teacher,
// parent), then the website as a bonus and the CTA. Real "Your School" screens throughout.

export const MASCOT_PREVIEW_EVERY_SEAT_CAROUSEL = {
  id: "mascot-preview-every-seat",
  title: "The three-seat tour (Free preview)",
  description: `Swipe carousel touring the whole free-preview bundle: the founder's desk (admin portal), the teacher's phone (teacher portal), the parent's app, then the website and the CTA. Link: ${FREE_PREVIEW_UTM}`,
  fileSlug: "mudkitchen-free-preview-every-seat",
  audienceBanner: "Built for microschool owners",
  slides: [
    {
      id: "three-seats",
      fileName: "01-your-preview-has-three-seats.png",
      render: () => (
        <MascotSlide background={G.cream} pattern="grid">
          <div style={{ position: "absolute", left: 72, right: 72, top: 128, zIndex: 5 }}>
            <Headline size={84}>
              Your free preview has <Accent>three seats.</Accent>
            </Headline>
            <Hand size={44} color={G.forest} rotate={-2} style={{ marginTop: 16 }}>
              take the tour, one seat at a time.
            </Hand>
          </div>
          <At x={56} y={470} z={3}>
            <RoleBadge role="Admin" line="the founder's desk" rotate={-6} />
          </At>
          <At x={395} y={450} z={4}>
            <RoleBadge role="Teacher" line="the teacher's phone" strap={150} />
          </At>
          <At x={734} y={470} z={3}>
            <RoleBadge role="Parent" line="the parent's app" rotate={6} />
          </At>
          <SwipeHint />
        </MascotSlide>
      ),
      adCopy: {
        primaryText:
          "Microschool owners: your free MudKitchen preview isn't just an admin demo. Sit in every seat: your admin portal, teacher portal and parent app, plus your website. Swipe for the tour →",
        headline: "Take the three-seat tour",
        description: "Free, private, within 2 business days.",
      },
    },
    {
      id: "seat-admin",
      fileName: "02-seat-1-the-founders-desk.png",
      render: () => (
        <SeatSlide n="Seat 1" color={ROLE_COLOR.Admin} title="The founder's desk." body="Your admin portal: the whole school at a glance, with your logo and colours." background={G.sky}>
          <At x={66} y={540} z={2} rotate={-1}>
            <YourAdminWindow scale={0.98} label="Your admin portal" />
          </At>
        </SeatSlide>
      ),
    },
    {
      id: "seat-teacher",
      fileName: "03-seat-2-the-teachers-phone.png",
      render: () => (
        <SeatSlide n="Seat 2" color={ROLE_COLOR.Teacher} title="The teacher's phone." body="Your teachers get their own portal: roll call and their class day." background="#EEF5E9">
          <At x={450} y={600} z={2} rotate={3}>
            <YourTeacherWindow scale={0.6} label="Your teacher portal" />
          </At>
          <At x={90} y={520} z={3} rotate={-3}>
            <YourTeacherPhone scale={0.84} />
          </At>
          <PlacedMascot name="fennel" view="thumbs" width={230} x={790} y={groundedY(230)} z={4} flip />
        </SeatSlide>
      ),
    },
    {
      id: "seat-parent",
      fileName: "04-seat-3-the-parents-app.png",
      render: () => (
        <SeatSlide n="Seat 3" color={ROLE_COLOR.Parent} title="The parent's app." body="What your families see: tuition, forms, messages and the calendar." background={YOUR.tint}>
          <At x={80} y={520} z={4} rotate={-3}>
            <YourParentPhone scale={0.8} />
          </At>
          <At x={400} y={590} z={3} rotate={2}>
            <YourParentPhone scale={0.66} screen="messages" />
          </At>
          <At x={690} y={560} z={2} rotate={6}>
            <YourParentPhone scale={0.66} screen="calendar" />
          </At>
        </SeatSlide>
      ),
    },
    {
      id: "bonus-website",
      fileName: "05-bonus-your-website.png",
      render: () => (
        <SeatSlide n="Bonus" color={G.clay} title="Your website, made over." body="With your logo, colours and programs, linked to all three seats." background={G.peach}>
          <At x={66} y={540} z={2} rotate={1}>
            <YourWebsiteWindow scale={0.98} label="Your website" />
          </At>
        </SeatSlide>
      ),
    },
    {
      id: "cta",
      fileName: "06-get-your-free-preview.png",
      render: () => (
        <FreePreviewCtaSlide
          lead="Three seats."
          accent="One free preview."
          aside="free · private · within 2 business days"
          cast={[
            { name: "terra", view: "wave", width: 300, x: 530, y: groundedY(300) },
            { name: "loam", view: "thumbs", width: 300, x: 770, y: groundedY(300), flip: true },
          ]}
        >
          <At x={80} y={560} z={4}>
            <RoleSwitch active="Admin" size={28} />
          </At>
        </FreePreviewCtaSlide>
      ),
    },
  ] satisfies MarketingSlide[],
} satisfies MarketingCarousel;

/** One seat of the tour: a coloured "Seat n" pill, the headline and body, art below, swipe hint. */
function SeatSlide({ n, color, title, body, background, children }: { n: string; color: string; title: string; body: string; background: string; children: ReactNode }) {
  return (
    <MascotSlide background={background}>
      <div style={{ position: "absolute", left: 72, right: 72, top: 128, zIndex: 6 }}>
        <span style={{ display: "inline-block", padding: "10px 24px", borderRadius: 999, background: color, border: `4px solid ${G.ink}`, fontFamily: FONT.display, fontWeight: 800, fontSize: 30, color: "#FFFFFF" }}>{n}</span>
        <Headline size={80} style={{ marginTop: 20 }}>
          <Accent>{title}</Accent>
        </Headline>
        <p style={{ margin: "16px 0 0", maxWidth: 900, fontFamily: FONT.body, fontWeight: 600, fontSize: 32, lineHeight: 1.3, color: G.soft, textWrap: "pretty" }}>{body}</p>
      </div>
      {children}
      <SwipeHint style={{ left: 72, right: "auto" }} />
    </MascotSlide>
  );
}
