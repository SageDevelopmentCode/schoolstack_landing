"use client";

import SlideCanvas, { displayStyle, SLIDE } from "@/components/admin/marketing/slide-frame";
import {
  CarouselProductSlide,
  DEMO_SLIDE_PAPER,
  type CarouselDemoCrop,
} from "@/components/admin/marketing/carousels/carousel-product-slide";
import type { MarketingCarousel, MarketingSlide } from "@/components/admin/marketing/carousels/types";
import {
  MarketingAdminBulletinDemoWindow,
  MarketingParentCalendarDemoWindow,
  MarketingParentCommunicationHomeDemoWindow,
  MarketingTeacherFormsDemoWindow,
  MarketingTeacherMessagesDemoWindow,
} from "@/components/admin/marketing/screens/marketing-demo-windows";
import { MarketingMobilePromoCluster } from "@/components/admin/marketing/screens/marketing-mobile-promo-cluster";

const DEMO_CONTENT_HEIGHT = 920;
const ROW_RULE = "1px solid #E7D9C6";

const HOME_CROP: CarouselDemoCrop = { zoom: 1.02, originX: 0, originY: 0 };
const BULLETIN_CROP: CarouselDemoCrop = { zoom: 1.08, originX: 0.074, originY: 0 };
const MESSAGES_CROP: CarouselDemoCrop = { zoom: 0.91, originX: 0, originY: 0 };
const FORMS_CROP: CarouselDemoCrop = { zoom: 1.08, originX: 0.074, originY: 0.11 };
const CALENDAR_CROP: CarouselDemoCrop = { zoom: 1.18, originX: 0, originY: 0 };

const CHECK_QUESTIONS = [
  "What is happening?",
  "When?",
  "Does the family need to do anything?",
];

export const WHERE_WAS_THAT_UPDATE_CAROUSEL = {
  id: "where-was-that-update",
  title: "Parents shouldn’t have to ask, “Where was that update?”",
  description: "LinkedIn carousel for bulletin, messages, forms, and the school calendar.",
  fileSlug: "mudkitchen-where-was-that-update",
  slides: [
    {
      id: "parent-home",
      fileName: "01-parents-shouldnt-have-to-ask.png",
      render: () => <ParentHomeSlide />,
    },
    {
      id: "bulletin",
      fileName: "02-use-an-announcement.png",
      render: () => <BulletinSlide />,
    },
    {
      id: "messages",
      fileName: "03-use-a-message.png",
      render: () => <MessagesSlide />,
    },
    {
      id: "forms",
      fileName: "04-use-a-form.png",
      render: () => <FormsSlide />,
    },
    {
      id: "calendar",
      fileName: "05-put-dates-where-families-can-find-them.png",
      render: () => <CalendarSlide />,
    },
    {
      id: "before-you-send",
      fileName: "06-before-you-send.png",
      render: () => <BeforeYouSendSlide />,
    },
    {
      id: "promo",
      fileName: "07-give-every-update-a-clear-home.png",
      render: () => <PromoSlide />,
    },
  ] satisfies MarketingSlide[],
} satisfies MarketingCarousel;

function ParentHomeSlide() {
  return (
    <CarouselProductSlide
      kicker="Parent home"
      title="Parents shouldn’t have to ask, “Where was that update?”"
      body="Give each message a clear home and a clear next step."
      contentHeight={DEMO_CONTENT_HEIGHT}
      crop={HOME_CROP}
    >
      <MarketingParentCommunicationHomeDemoWindow contentHeight={DEMO_CONTENT_HEIGHT} />
    </CarouselProductSlide>
  );
}

function BulletinSlide() {
  return (
    <CarouselProductSlide
      kicker="Bulletin"
      tone="forest"
      side="copyRight"
      title="Use an announcement for school-wide updates."
      body="Post news or flyers for families and staff in the school bulletin."
      contentHeight={DEMO_CONTENT_HEIGHT}
      crop={BULLETIN_CROP}
    >
      <MarketingAdminBulletinDemoWindow contentHeight={DEMO_CONTENT_HEIGHT} />
    </CarouselProductSlide>
  );
}

function MessagesSlide() {
  return (
    <CarouselProductSlide
      kicker="Messages"
      title="Use a message when someone needs to reply."
      body="Keep family, teacher, and office conversations in message threads."
      contentHeight={DEMO_CONTENT_HEIGHT}
      crop={MESSAGES_CROP}
      copyInsetLeft={300}
      logoTop={96}
    >
      <MarketingTeacherMessagesDemoWindow contentHeight={DEMO_CONTENT_HEIGHT} />
    </CarouselProductSlide>
  );
}

function FormsSlide() {
  return (
    <CarouselProductSlide
      kicker="Forms"
      tone="forest"
      side="copyRight"
      title="Use a form when you need an answer or signature."
      body="Publish a form to families or classrooms, then track who still needs to respond."
      contentHeight={DEMO_CONTENT_HEIGHT}
      crop={FORMS_CROP}
    >
      <MarketingTeacherFormsDemoWindow contentHeight={DEMO_CONTENT_HEIGHT} />
    </CarouselProductSlide>
  );
}

function CalendarSlide() {
  return (
    <CarouselProductSlide
      kicker="Calendar"
      title="Put dates where families can find them."
      body="Use the school calendar for events and schedule information."
      contentHeight={DEMO_CONTENT_HEIGHT}
      crop={CALENDAR_CROP}
    >
      <MarketingParentCalendarDemoWindow contentHeight={DEMO_CONTENT_HEIGHT} />
    </CarouselProductSlide>
  );
}

function BeforeYouSendSlide() {
  return (
    <SlideCanvas background={DEMO_SLIDE_PAPER}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 72, background: "#E7C2C2" }} />
      <div
        style={{
          height: "100%",
          boxSizing: "border-box",
          padding: "140px 80px 72px 120px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <p style={{ ...displayStyle(36, SLIDE.clay), letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Before you send
        </p>
        <h1 style={{ ...displayStyle(72), marginTop: 16, maxWidth: 860 }}>
          Before you send, check three things.
        </h1>
        <div style={{ marginTop: 40, display: "flex", flexDirection: "column" }}>
          {CHECK_QUESTIONS.map((question, index) => (
            <div
              key={question}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                height: 108,
                borderBottom: ROW_RULE,
              }}
            >
              <span style={{ ...displayStyle(36, SLIDE.forest), width: 52 }}>{index + 1}</span>
              <span style={{ ...displayStyle(42), fontWeight: 560 }}>{question}</span>
            </div>
          ))}
        </div>
        <p style={{ margin: "auto 0 0", fontSize: 32, lineHeight: 1.3, color: SLIDE.muted }}>
          What is happening? When? Does the family need to do anything?
        </p>
      </div>
    </SlideCanvas>
  );
}

function PromoSlide() {
  return (
    <CarouselProductSlide
      variant="promo"
      demoPresentation="phones"
      promoDensity="compact"
      promoSiteLabel="trymudkitchen.com"
      title="Give every update a clear home."
      body="Bulletin, messages, forms, and the calendar, so families know where to look."
      footer={
        <div style={{ marginTop: 22, display: "flex", justifyContent: "center" }}>
          <span
            style={{
              display: "inline-block",
              background: SLIDE.white,
              color: SLIDE.forest,
              borderRadius: 999,
              padding: "18px 40px",
              fontSize: 28,
              fontWeight: 750,
            }}
          >
            Book a demo
          </span>
        </div>
      }
    >
      <MarketingMobilePromoCluster variant="admissions" />
    </CarouselProductSlide>
  );
}
