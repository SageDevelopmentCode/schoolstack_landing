"use client";

import type { MarketingCarousel, MarketingSlide } from "@/components/admin/marketing/carousels/types";
import {
  GardenEnrollmentChecklistWindow,
  GardenParentApplyWindow,
  GardenParentBillingWindow,
  GardenParentCalendarWindow,
} from "@/components/admin/marketing/screens/marketing-garden-demo-windows";
import {
  Accent,
  MascotHookSlide,
  MascotOutroSlide,
  MascotProductSlide,
  MascotTurnSlide,
  ReactionListSlide,
} from "@/components/admin/marketing/mascot/mascot-slide-kit";

// Product notes are word for word from the Pip, Nutmeg and Dot carousels. Jokes are original.

const H = 920;

export const MASCOT_FAMILY_FIRST_WEEK_CAROUSEL = {
  id: "mascot-family-first-week",
  title: "A family’s first week (Parent experience)",
  description: "Mascot carousel: a new family's questions, then apply, checklist, billing and calendar from the family's side.",
  fileSlug: "mudkitchen-family-first-week",
  slides: [
    {
      id: "hook",
      fileName: "01-a-family-finds-your-school.png",
      render: () => (
        <MascotHookSlide
          kicker="A family’s first week"
          headline={
            <>
              A family finds your school. <Accent>They have 11 questions.</Accent>
            </>
          }
          name="pip"
          view="curious"
          background="#E9F4E2"
          aside="pip has answers."
        />
      ),
      adCopy: {
        primaryText:
          "What a new family's first week looks like when everything lives in one place: apply, enroll, pay, plan. Swipe →. #microschool #enrollment",
        headline: "A family's first week, organized",
      },
    },
    {
      id: "old-way",
      fileName: "02-the-old-way.png",
      render: () => (
        <ReactionListSlide
          title={
            <>
              Their first week, <Accent>the old way</Accent>
            </>
          }
          name="pip"
          rows={[
            { tag: "Monday", label: "“Which form do we print?”", view: "confused" },
            { tag: "Tuesday", label: "“Venmo or check?”", view: "thinking" },
            { tag: "Wednesday", label: "“Is there a calendar?”", view: "surprised" },
            { tag: "Thursday", label: "“Did you get our email?”", view: "oops" },
            { tag: "Friday", label: "“Who do we even ask?”", view: "tears" },
          ]}
        />
      ),
    },
    {
      id: "turn",
      fileName: "03-what-if-it-all-lived-in-one-place.png",
      render: () => (
        <MascotTurnSlide
          name="nutmeg"
          view="curious"
          background="#FFF3CF"
          bubble={
            <>
              what if it all lived <Accent>in one place?</Accent>
            </>
          }
          aside="(for families, and for you.)"
        />
      ),
    },
    {
      id: "apply",
      fileName: "04-day-one-apply.png",
      render: () => (
        <MascotProductSlide
          kicker="Day 1 · Apply"
          title="Families apply online, in one place."
          aside="no printer required."
          note="Families add health info, emergency contacts, documents, and signatures."
          noteAt={{ x: 620, y: 940, rotate: 3, width: 400 }}
          mascot={{ name: "pip", view: "point", width: 360, x: -30, y: 900 }}
          contentHeight={H}
          crop={{ zoom: 1.2, originX: 0, originY: 0 }}
        >
          <GardenParentApplyWindow contentHeight={H} />
        </MascotProductSlide>
      ),
    },
    {
      id: "checklist",
      fileName: "05-day-two-checklist.png",
      render: () => (
        <MascotProductSlide
          kicker="Day 2 · Enroll"
          title="Families can see what’s left to do."
          aside="the checklist checks itself."
          note="Families see forms, agreements, and payments still due."
          background="#F3EEF8"
          noteAt={{ x: 60, y: 980, rotate: -3, width: 390 }}
          mascot={{ name: "pip", view: "thumbs", width: 340, x: 720, y: 930 }}
          contentHeight={H}
          crop={{ zoom: 1.22, originX: 0, originY: 0 }}
        >
          <GardenEnrollmentChecklistWindow contentHeight={H} />
        </MascotProductSlide>
      ),
    },
    {
      id: "billing",
      fileName: "06-day-three-billing.png",
      render: () => (
        <MascotProductSlide
          kicker="Day 3 · Pay"
          title="Families see every bill in one place."
          aside="nutmeg approves."
          note="Invoices, payments, and tuition history, all on one page."
          noteAt={{ x: 620, y: 930, rotate: 3, width: 400 }}
          mascot={{ name: "nutmeg", view: "point", width: 380, x: -30, y: 880 }}
          contentHeight={H}
          crop={{ zoom: 1.15, originX: 0, originY: 0 }}
        >
          <GardenParentBillingWindow contentHeight={H} />
        </MascotProductSlide>
      ),
    },
    {
      id: "calendar",
      fileName: "07-day-four-calendar.png",
      render: () => (
        <MascotProductSlide
          kicker="Day 4 · Plan"
          title="Families see the same calendar."
          aside="picture day: not a surprise."
          note="Parents see dates, forms, bills, and updates in their own app."
          background="#E3EDFB"
          noteAt={{ x: 60, y: 980, rotate: -3, width: 390 }}
          mascot={{ name: "dot", view: "happy", width: 330, x: 730, y: 940 }}
          contentHeight={H}
          crop={{ zoom: 1.15, originX: 0, originY: 0 }}
        >
          <GardenParentCalendarWindow contentHeight={H} />
        </MascotProductSlide>
      ),
    },
    {
      id: "outro",
      fileName: "08-already-organized.png",
      render: () => <MascotOutroSlide name="pip" view="celebrate" lead="Their first week," accent="already organized." aside="(and yours, too.)" />,
    },
  ] satisfies MarketingSlide[],
} satisfies MarketingCarousel;
