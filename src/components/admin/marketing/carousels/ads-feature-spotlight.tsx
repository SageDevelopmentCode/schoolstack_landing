"use client";

import type { ReactNode } from "react";
import type { MarketingCarousel, MarketingSlide } from "@/components/admin/marketing/carousels/types";
import type { CarouselDemoCrop } from "@/components/admin/marketing/carousels/carousel-product-slide";
import { Accent, AdCopy, AdFooter, AdFrame, Crew, G, Pin, ProductWindow, Scene } from "@/components/admin/marketing/ads/ad-kit";
import type { MascotName, MascotView } from "@/components/admin/marketing/mascot/Mascot";
import {
  GardenAdmissionsWindow,
  GardenAttendanceWindow,
  GardenHoursWindow,
  GardenMarketingWindow,
  GardenMessagesWindow,
  GardenParentBillingWindow,
} from "@/components/admin/marketing/screens/marketing-garden-demo-windows";

// Set E: one feature, one crew member, one real product screen. Evergreen; good for retargeting.

export const ADS_FEATURE_SPOTLIGHT_CAROUSEL = {
  id: "ads-feature-spotlight",
  title: "Ads: Feature spotlight (6)",
  description: "Evergreen single ads: one feature, its crew member and the real screen. Offer chip can be switched off. Feed + story.",
  fileSlug: "mudkitchen-ads-feature-spotlight",
  kind: "ad",
  offerToggle: true,
  sizes: ["feed", "story"],
  slides: [
    {
      id: "enrollment",
      fileName: "ad-e1-pip-enrollment.png",
      render: () => <EnrollmentAd />,
      adCopy: {
        primaryText:
          "Microschool directors: see every family from first inquiry to enrolled, sorted by stage, without digging through one email chain. Book a MudKitchen demo, start a paid plan within 30 days, and get a $200 Amazon gift card. Terms apply.",
        headline: "Applied → enrolled, in one place",
        description: "Admissions for microschools.",
      },
    },
    {
      id: "tuition",
      fileName: "ad-e2-nutmeg-tuition.png",
      render: () => <TuitionAd />,
      adCopy: {
        primaryText:
          "School owners: families see every bill in one place and set up autopay once, so tuition arrives on time without the reminder texts. Book a MudKitchen demo, start a paid plan within 30 days, and get a $200 Amazon gift card. Terms apply.",
        headline: "Tuition on autopay",
        description: "Billing and payments for microschools.",
      },
    },
    {
      id: "messages",
      fileName: "ad-e3-loam-messages.png",
      render: () => <MessagesAd />,
      adCopy: {
        primaryText:
          "Microschool directors: every parent message in one inbox, threaded by family, instead of across texts, email and three group chats. Book a MudKitchen demo, start a paid plan within 30 days, and get a $200 Amazon gift card. Terms apply.",
        headline: "One inbox for every family",
        description: "Messages for microschools.",
      },
    },
    {
      id: "attendance",
      fileName: "ad-e4-fennel-attendance.png",
      render: () => <AttendanceAd />,
      adCopy: {
        primaryText:
          "Microschool owners: roll call in about a minute: present, absent and picked up, on one screen your teachers can use. Book a MudKitchen demo, start a paid plan within 30 days, and get a $200 Amazon gift card. Terms apply.",
        headline: "Roll call, done in a minute",
        description: "Attendance for microschools.",
      },
    },
    {
      id: "hours",
      fileName: "ad-e5-clover-hours.png",
      render: () => <HoursAd />,
      adCopy: {
        primaryText:
          "Microschool founders: staff clock in and out, and the weekly totals add themselves up before payroll day. Book a MudKitchen demo, start a paid plan within 30 days, and get a $200 Amazon gift card. Terms apply.",
        headline: "Timesheets that add themselves up",
        description: "Staff hours for microschools.",
      },
    },
    {
      id: "marketing",
      fileName: "ad-e6-marigold-marketing.png",
      render: () => <MarketingAd />,
      adCopy: {
        primaryText:
          "Microschool admins: open-house invites and follow-up emails that send themselves, so interested families hear from you while they're still deciding. Book a MudKitchen demo, start a paid plan within 30 days, and get a $200 Amazon gift card. Terms apply.",
        headline: "Follow-ups that send themselves",
        description: "Marketing automations for microschools.",
      },
    },
  ] satisfies MarketingSlide[],
} satisfies MarketingCarousel;

// ---------------------------------------------------------------- layout

type SpotlightProps = {
  background: string;
  title: ReactNode;
  hand: string;
  mascot: { name: MascotName; view: MascotView };
  /** Which bottom corner of the window the character stands on (as a sticker, on top of it). */
  side: "left" | "right";
  crop?: CarouselDemoCrop;
  children: ReactNode;
};

function SpotlightAd({ background, title, hand, mascot, side, crop = { zoom: 1.15, originX: 0, originY: 0 }, children }: SpotlightProps) {
  return (
    <AdFrame background={background}>
      <AdCopy title={title} hand={hand} size={80} />
      <Scene style={{ marginTop: 30 }}>
        <ProductWindow crop={crop}>{children}</ProductWindow>
        <Pin left={side === "left" ? -30 : undefined} right={side === "right" ? -30 : undefined} bottom={-20} z={8}>
          <Crew name={mascot.name} view={mascot.view} width={300} flip={side === "right"} />
        </Pin>
      </Scene>
      <div style={{ height: 30, flexShrink: 0 }} />
      <AdFooter />
    </AdFrame>
  );
}

// ---------------------------------------------------------------- E1–E6

function EnrollmentAd() {
  return (
    <SpotlightAd
      background={G.mint}
      title={
        <>
          From &ldquo;applied&rdquo; to &ldquo;enrolled&rdquo; <Accent>without one email chain.</Accent>
        </>
      }
      hand="pip sorts every family by stage."
      mascot={{ name: "pip", view: "point" }}
      side="left"
      crop={{ zoom: 1.2, originX: 0, originY: 0 }}
    >
      <GardenAdmissionsWindow contentHeight={920} />
    </SpotlightAd>
  );
}

function TuitionAd() {
  return (
    <SpotlightAd
      background="#F3EEF8"
      title={
        <>
          Tuition on autopay. <Accent>Nutmeg can finally rest.</Accent>
        </>
      }
      hand="no more “friendly reminder” texts."
      mascot={{ name: "nutmeg", view: "sleepy" }}
      side="right"
    >
      <GardenParentBillingWindow contentHeight={920} />
    </SpotlightAd>
  );
}

function MessagesAd() {
  return (
    <SpotlightAd
      background={G.sky}
      title={
        <>
          Every parent message <Accent>in one inbox.</Accent>
        </>
      }
      hand="the group chat can retire now."
      mascot={{ name: "loam", view: "happy" }}
      side="left"
      crop={{ zoom: 1.15, originX: 0.13, originY: 0 }}
    >
      <GardenMessagesWindow contentHeight={920} />
    </SpotlightAd>
  );
}

function AttendanceAd() {
  return (
    <SpotlightAd
      background={G.cream}
      title={
        <>
          Roll call <Accent>in one minute.</Accent>
        </>
      }
      hand="present, absent, picked up. done."
      mascot={{ name: "fennel", view: "thumbs" }}
      side="right"
    >
      <GardenAttendanceWindow contentHeight={920} />
    </SpotlightAd>
  );
}

function HoursAd() {
  return (
    <SpotlightAd
      background={G.butter}
      title={
        <>
          Timesheets that <Accent>add themselves up.</Accent>
        </>
      }
      hand="payroll day, but nobody cried."
      mascot={{ name: "clover", view: "celebrate" }}
      side="right"
    >
      <GardenHoursWindow contentHeight={920} />
    </SpotlightAd>
  );
}

function MarketingAd() {
  return (
    <SpotlightAd
      background={G.peach}
      title={
        <>
          Open-house invites that <Accent>send themselves.</Accent>
        </>
      }
      hand="marigold is finally getting results."
      mascot={{ name: "marigold", view: "excited" }}
      side="right"
    >
      <GardenMarketingWindow contentHeight={920} />
    </SpotlightAd>
  );
}
