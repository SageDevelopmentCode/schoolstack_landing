"use client";

import type { MarketingCarousel, MarketingSlide } from "@/components/admin/marketing/carousels/types";
import {
  GardenEnrollmentChecklistWindow,
  GardenTeacherFormsWindow,
} from "@/components/admin/marketing/screens/marketing-garden-demo-windows";
import {
  Accent,
  At,
  MascotHookSlide,
  MascotOutroSlide,
  MascotProductSlide,
  MascotTurnSlide,
  NotificationReactionSlide,
  PaperSheet,
  ReactionListSlide,
  SAMPLE_NOTIFS,
} from "@/components/admin/marketing/mascot/mascot-slide-kit";

// Jokes are original; product facts are word for word from get-started-showcase-slides.ts
// and FloatingStickers.tsx.

const H = 920;

const SLIPS = [
  { x: 40, y: 520, r: -14, label: "Permission" },
  { x: 820, y: 500, r: 12, label: "Slip #23" },
  { x: 60, y: 820, r: 9 },
  { x: 860, y: 820, r: -10, label: "Photo OK?" },
  { x: 230, y: 470, r: 6 },
  { x: 690, y: 430, r: -6, label: "Allergy" },
];

export const MASCOT_BRAMBLE_FORMS_CAROUSEL = {
  id: "mascot-bramble-forms",
  title: "Bramble's backpack (Forms)",
  description: "Mascot carousel: Bramble's backpack of lost forms, then Garden forms and the family checklist.",
  fileSlug: "mudkitchen-bramble-forms",
  slides: [
    {
      id: "hook",
      fileName: "01-41-unsigned-permission-slips.png",
      render: () => (
        <MascotHookSlide
          kicker="Meet Bramble, who handles the forms"
          headline={
            <>
              Bramble&rsquo;s backpack contains <Accent>41 unsigned permission slips</Accent>
            </>
          }
          name="bramble"
          view="oops"
          background="#F6ECE0"
          aside="and a banana. from october."
          mascot={{ x: 260, y: 640, width: 540 }}
        >
          {SLIPS.map((s, i) => (
            <At key={i} x={s.x} y={s.y} z={2}>
              <PaperSheet width={150} rotate={s.r} label={s.label} />
            </At>
          ))}
        </MascotHookSlide>
      ),
    },
    {
      id: "ranked",
      fileName: "02-forms-ranked-by-how-fast-they-get-lost.png",
      render: () => (
        <ReactionListSlide
          title={
            <>
              Forms, ranked by <Accent>how fast they get lost</Accent>
            </>
          }
          name="bramble"
          rows={[
            { label: "Permission slips", aside: "instantly", view: "laughing" },
            { label: "Allergy forms", aside: "by lunch", view: "surprised" },
            { label: "Photo releases", aside: "never seen again", view: "confused" },
            { label: "Medical forms", aside: "in the car door, probably", view: "oops" },
            { label: "Signed forms", aside: "a myth. a legend.", view: "tears" },
          ]}
        />
      ),
    },
    {
      id: "turn",
      fileName: "03-what-if-forms-couldnt-get-lost.png",
      render: () => (
        <MascotTurnSlide
          name="bramble"
          view="curious"
          background="#E9F4E2"
          bubble={
            <>
              what if forms <Accent>couldn&rsquo;t</Accent> get lost?
            </>
          }
          aside="(or end up in a backpack.)"
        />
      ),
    },
    {
      id: "forms",
      fileName: "04-every-form-every-signature.png",
      render: () => (
        <MascotProductSlide
          kicker="Forms"
          title="Every form and signature, online."
          aside="bramble can see the bottom of the backpack."
          note="Families fill out forms, upload files, and sign online."
          noteAt={{ x: 630, y: 960, rotate: 3, width: 390 }}
          mascot={{ name: "bramble", view: "point", width: 380, x: -40, y: 900 }}
          windowTop={450}
          contentHeight={H}
          crop={{ zoom: 1.15, originX: 0, originY: 0 }}
        >
          <GardenTeacherFormsWindow contentHeight={H} />
        </MascotProductSlide>
      ),
    },
    {
      id: "checklist",
      fileName: "05-families-finish-forms-from-home.png",
      render: () => (
        <MascotProductSlide
          kicker="For families"
          title="Families finish forms from home."
          aside="bramble finally eats lunch."
          note="Families see forms, agreements, and payments still due."
          background="#F3EEF8"
          noteAt={{ x: 60, y: 990, rotate: -3, width: 380 }}
          mascot={{ name: "bramble", view: "thumbs", width: 360, x: 700, y: 910 }}
          contentHeight={H}
          crop={{ zoom: 1.2, originX: 0, originY: 0 }}
        >
          <GardenEnrollmentChecklistWindow contentHeight={H} />
        </MascotProductSlide>
      ),
    },
    {
      id: "reaction",
      fileName: "06-the-pencils-are-for-doodling-now.png",
      render: () => (
        <NotificationReactionSlide
          headline={
            <>
              the pencils are for <Accent>doodling now</Accent>
            </>
          }
          aside="bramble drew a banana instead."
          name="bramble"
          view="love"
          background="#FFF6D6"
          notifs={[SAMPLE_NOTIFS.packetSigned, SAMPLE_NOTIFS.checklistDone]}
        />
      ),
    },
    {
      id: "outro",
      fileName: "07-41-slips-to-0.png",
      render: () => <MascotOutroSlide name="bramble" view="celebrate" lead="41 slips → 0." accent="Every form signed." aside="(the banana was found too)" />,
    },
  ] satisfies MarketingSlide[],
} satisfies MarketingCarousel;
