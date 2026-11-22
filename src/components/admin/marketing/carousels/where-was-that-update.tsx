"use client";

import type { CarouselDemoCrop } from "@/components/admin/marketing/carousels/carousel-product-slide";
import type { MarketingCarousel, MarketingSlide } from "@/components/admin/marketing/carousels/types";
import {
  MarketingAdminBulletinDemoWindow,
  MarketingParentCalendarDemoWindow,
  MarketingParentCommunicationHomeDemoWindow,
  MarketingTeacherFormsDemoWindow,
  MarketingTeacherMessagesDemoWindow,
} from "@/components/admin/marketing/screens/marketing-demo-windows";
import { GardenParentHomeWindow } from "@/components/admin/marketing/screens/marketing-garden-demo-windows";
import { Accent, MascotListSlide, MascotProductSlide, MascotPromoSlide } from "@/components/admin/marketing/mascot/mascot-slide-kit";

// Loam (messages) hosts; each channel is shown by its own crew member: Marigold (announcements),
// Bramble (forms) and Dot (calendar).

const DEMO_HEIGHT = 920;

const HOME_CROP: CarouselDemoCrop = { zoom: 1.02, originX: 0, originY: 0 };
const BULLETIN_CROP: CarouselDemoCrop = { zoom: 1.08, originX: 0.074, originY: 0 };
const MESSAGES_CROP: CarouselDemoCrop = { zoom: 1, originX: 0, originY: 0 };
const FORMS_CROP: CarouselDemoCrop = { zoom: 1.12, originX: 0, originY: 0 };
const CALENDAR_CROP: CarouselDemoCrop = { zoom: 1.18, originX: 0, originY: 0 };

const CHECKS = [
  { label: "What’s happening?", detail: "Say it in the first line." },
  { label: "When?", detail: "Date, time and place." },
  { label: "What should families do?", detail: "Reply, sign, pay, or nothing." },
];

export const WHERE_WAS_THAT_UPDATE_CAROUSEL = {
  id: "where-was-that-update",
  title: "Parents at your Microschool shouldn’t have to ask, “Where was that update?”",
  description: "LinkedIn carousel for bulletin, messages, forms and the school calendar, guided by Loam.",
  fileSlug: "mudkitchen-where-was-that-update",
  slides: [
    { id: "parent-home", fileName: "01-parents-shouldnt-have-to-ask.png",
      adCopy: {
        label: "Right place",
        primaryText: "Parents shouldn't have to ask, \"Where was that update?\" 📬\n\nGive every kind of update one right place. Loam explains. Swipe →\n\n#microschool #parentcommunication",
        headline: "Families always know where to look",
      },
      adCopyVariants: [
        {
          label: "Cheat sheet",
          primaryText: "A cheat sheet for school updates:\nNews for everyone → bulletin\nNeed a reply → message\nNeed a signature → form\nGot a date → calendar\nSave it for your staff. Swipe →\n\n#microschool #schoolcommunication",
          headline: "Where each school update goes",
        },
        {
          label: "Question",
          primaryText: "How many times this month has a parent asked where an update was? 🙃 Swipe for the simple fix: one right place for every kind of update →\n\n#microschool #parentcommunication",
          headline: "\"Where was that update?\" Never again.",
        },
      ], render: () => <ParentHomeSlide /> },
    { id: "bulletin", fileName: "02-use-an-announcement.png", render: () => <BulletinSlide /> },
    { id: "messages", fileName: "03-use-a-message.png", render: () => <MessagesSlide /> },
    { id: "forms", fileName: "04-use-a-form.png", render: () => <FormsSlide /> },
    { id: "calendar", fileName: "05-put-dates-where-families-can-find-them.png", render: () => <CalendarSlide /> },
    { id: "before-you-send", fileName: "06-before-you-send.png", render: () => <BeforeYouSendSlide /> },
    { id: "promo", fileName: "07-give-every-update-a-clear-home.png", render: () => <PromoSlide /> },
  ] satisfies MarketingSlide[],
} satisfies MarketingCarousel;

function ParentHomeSlide() {
  return (
    <MascotProductSlide
      kicker="School updates"
      title={
        <>
          Parents shouldn’t have to ask, <Accent>“Where was that update?”</Accent>
        </>
      }
      body="One right place for each kind of update."
      lane="right"
      mascot={{ name: "loam", view: "confused", flip: true }}
      tip="I'm Loam. I deliver the school's news."
      background="#ECE2F3"
      contentHeight={DEMO_HEIGHT}
      crop={HOME_CROP}
    >
      <MarketingParentCommunicationHomeDemoWindow contentHeight={DEMO_HEIGHT} />
    </MascotProductSlide>
  );
}

function BulletinSlide() {
  return (
    <MascotProductSlide
      kicker="Bulletin"
      title="News for everyone? Post it on the bulletin."
      body="School-wide news and flyers for families and staff."
      lane="left"
      mascot={{ name: "marigold", view: "hold" }}
      tip="Marigold here. Big news goes here."
      background="#FFF3CF"
      contentHeight={DEMO_HEIGHT}
      crop={BULLETIN_CROP}
    >
      <MarketingAdminBulletinDemoWindow contentHeight={DEMO_HEIGHT} />
    </MascotProductSlide>
  );
}

function MessagesSlide() {
  return (
    <MascotProductSlide
      kicker="Messages"
      title="Need a reply? Send a message."
      body="Family conversations stay in one thread."
      lane="right"
      mascot={{ name: "loam", view: "point", flip: true }}
      tip="One family, one thread."
      background="#E3EDFB"
      contentHeight={DEMO_HEIGHT}
      crop={MESSAGES_CROP}
    >
      <MarketingTeacherMessagesDemoWindow contentHeight={DEMO_HEIGHT} />
    </MascotProductSlide>
  );
}

function FormsSlide() {
  return (
    <MascotProductSlide
      kicker="Forms"
      title="Need an answer or a signature? Send a form."
      body="See who’s done and who still needs to respond."
      lane="left"
      mascot={{ name: "bramble", view: "hold" }}
      tip="Bramble here. I track who's signed."
      background="#EEF5E9"
      contentHeight={DEMO_HEIGHT}
      crop={FORMS_CROP}
    >
      <MarketingTeacherFormsDemoWindow contentHeight={DEMO_HEIGHT} />
    </MascotProductSlide>
  );
}

function CalendarSlide() {
  return (
    <MascotProductSlide
      kicker="Calendar"
      title="Got a date? Put it on the calendar."
      body="Events and schedule changes, where families already look."
      lane="right"
      mascot={{ name: "dot", view: "point", flip: true }}
      tip="Dot here. Every date, one calendar."
      background="#FBE6E2"
      contentHeight={DEMO_HEIGHT}
      crop={CALENDAR_CROP}
    >
      <MarketingParentCalendarDemoWindow contentHeight={DEMO_HEIGHT} />
    </MascotProductSlide>
  );
}

function BeforeYouSendSlide() {
  return (
    <MascotListSlide
      kicker="Save this"
      title="Before you send, check 3 things."
      rows={CHECKS}
      aside="if a parent has to ask, it isn’t clear yet"
      mascot={{ name: "loam", view: "thinking", flip: true }}
      tip="Then pick the right place for it."
      background="#ECE2F3"
    />
  );
}

function PromoSlide() {
  return (
    <MascotPromoSlide
      title="Give every update a home."
      body="So families always know where to look."
      cast={[{ name: "loam", view: "celebrate" }, { name: "dot", view: "wave", flip: true }]}
      contentHeight={DEMO_HEIGHT}
    >
      <GardenParentHomeWindow contentHeight={DEMO_HEIGHT} />
    </MascotPromoSlide>
  );
}
