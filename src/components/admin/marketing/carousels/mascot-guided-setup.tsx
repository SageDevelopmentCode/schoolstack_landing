"use client";

import type { MarketingCarousel, MarketingSlide } from "@/components/admin/marketing/carousels/types";
import { GardenAdminDashboardWindow } from "@/components/admin/marketing/screens/marketing-garden-demo-windows";
import {
  Accent,
  MascotHookSlide,
  MascotListSlide,
  MascotOutroSlide,
  MascotProductSlide,
  MascotTurnSlide,
  NotificationReactionSlide,
  ReactionListSlide,
  SAMPLE_NOTIFS,
} from "@/components/admin/marketing/mascot/mascot-slide-kit";
import { WORKFLOW_COPY } from "@/components/home/home-copy";

// Setup step titles are word for word from WORKFLOW_COPY (home page); details are shortened from
// its step bodies so they fit the rows. Jokes are original.

const STEP_DETAILS = [
  "We review your forms, spreadsheets and payments.",
  "We set it up with you and help migrate what matters.",
  "We walk you through it and answer questions.",
];

const H = 920;

export const MASCOT_GUIDED_SETUP_CAROUSEL = {
  id: "mascot-guided-setup",
  title: "How switching actually works (Guided setup)",
  description: "Mascot carousel: Dig dreads switching software, then the 3-step guided setup.",
  fileSlug: "mudkitchen-guided-setup",
  slides: [
    {
      id: "hook",
      fileName: "01-switching-sounds-like-pain.png",
      render: () => (
        <MascotHookSlide
          kicker="Meet Dig, who runs the admin"
          headline={
            <>
              Switching systems sounds like <Accent>a whole semester of pain.</Accent>
            </>
          }
          name="dig"
          view="tears"
          background="#F3EEF8"
          aside="it doesn’t have to be."
        />
      ),
      adCopy: {
        primaryText:
          "Switching your school's software sounds like a whole semester of pain. Here's how guided setup actually works, in 3 steps (swipe →). #microschool #schooladmin",
        headline: "How switching actually works",
      },
    },
    {
      id: "stages",
      fileName: "02-five-stages-of-new-software.png",
      render: () => (
        <ReactionListSlide
          title={
            <>
              The 5 stages of thinking about <Accent>new software</Accent>
            </>
          }
          name="dig"
          tagPrefix="Stage"
          rows={[
            { label: "“Our spreadsheet is fine.”", aside: "denial", view: "neutral" },
            { label: "“Maybe one more Google Form.”", aside: "bargaining", view: "thinking" },
            { label: "Re-type 40 families? No.", aside: "dread", view: "oops" },
            { label: "“Next semester. Definitely.”", aside: "avoidance", view: "sleepy" },
            { label: "“Okay. Show me.”", aside: "acceptance", view: "determined" },
          ]}
        />
      ),
    },
    {
      id: "turn",
      fileName: "03-what-if-someone-moved-it-with-you.png",
      render: () => (
        <MascotTurnSlide
          name="terra"
          view="curious"
          bubble={
            <>
              what if someone <Accent>moved it over with you?</Accent>
            </>
          }
          aside="(you keep your data. and your weekends.)"
        />
      ),
    },
    {
      id: "steps",
      fileName: "04-three-steps.png",
      render: () => (
        <MascotListSlide
          kicker={WORKFLOW_COPY.badge}
          title={
            <>
              {WORKFLOW_COPY.headlineLead} <Accent>{WORKFLOW_COPY.headlineAccent}</Accent>
            </>
          }
          headlineSize={58}
          rows={WORKFLOW_COPY.steps.map((step, i) => ({ label: step.title, detail: STEP_DETAILS[i] }))}
          mascot={{ name: "bramble", view: "thumbs" }}
          tip="bramble checks every form."
        />
      ),
    },
    {
      id: "day-one",
      fileName: "05-day-one.png",
      render: () => (
        <MascotProductSlide
          kicker="Day one"
          title="Your whole school, set up and waiting."
          aside="dig’s new favorite tab."
          note="Enrollment, billing, and daily tasks in one workspace."
          noteAt={{ x: 630, y: 930, rotate: 3, width: 390 }}
          mascot={{ name: "dig", view: "point", width: 380, x: -30, y: 880 }}
          windowTop={340}
          contentHeight={H}
          crop={{ zoom: 1.15, originX: 0, originY: 0 }}
        >
          <GardenAdminDashboardWindow contentHeight={H} />
        </MascotProductSlide>
      ),
    },
    {
      id: "week-one",
      fileName: "06-week-one-after-the-switch.png",
      render: () => (
        <NotificationReactionSlide
          headline={
            <>
              Week one, <Accent>after the switch</Accent>
            </>
          }
          aside="terra is not crying. you are."
          name="terra"
          view="celebrate"
          background="#E9F4E2"
          notifs={[SAMPLE_NOTIFS.packetSigned, SAMPLE_NOTIFS.tuitionPaid, SAMPLE_NOTIFS.tourBooked]}
        />
      ),
    },
    {
      id: "outro",
      fileName: "07-without-starting-over.png",
      render: () => <MascotOutroSlide name="dig" view="celebrate" lead="New system?" accent="Without starting over." aside="we help move the important pieces." />,
    },
  ] satisfies MarketingSlide[],
} satisfies MarketingCarousel;
