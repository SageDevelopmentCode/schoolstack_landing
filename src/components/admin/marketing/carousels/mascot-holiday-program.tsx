"use client";

import type { MarketingCarousel, MarketingSlide } from "@/components/admin/marketing/carousels/types";
import { GardenParentCalendarWindow, GardenTeacherFormsWindow } from "@/components/admin/marketing/screens/marketing-garden-demo-windows";
import {
  Accent,
  FONT,
  G,
  MascotHookSlide,
  MascotListSlide,
  MascotOutroSlide,
  MascotProductSlide,
  MascotTurnSlide,
  ReactionListSlide,
} from "@/components/admin/marketing/mascot/mascot-slide-kit";

// Product notes are word for word from the Dot and Bramble carousels. The sign-up sheet is an
// illustration (no Committees demo screen). Jokes are original.

const H = 920;

export const MASCOT_HOLIDAY_PROGRAM_CAROUSEL = {
  id: "mascot-holiday-program",
  title: "Holiday program survival guide (Calendar & Forms)",
  description: "Mascot carousel: Dot and Tansy prep the holiday program, then the calendar, forms and a volunteer sheet.",
  fileSlug: "mudkitchen-holiday-program",
  slides: [
    {
      id: "hook",
      fileName: "01-program-in-9-days.png",
      render: () => (
        <MascotHookSlide
          kicker="Holiday program season"
          headline={
            <>
              The holiday program is in 9 days. <Accent>Who has the costumes?</Accent>
            </>
          }
          name="dot"
          view="surprised"
          background="#FBE6E2"
          aside="dot checked the calendar. twice."
        />
      ),
      adCopy: {
        label: "Survival guide",
        primaryText:
          "The holiday program is in 9 days. Who has the costumes? 🎄\n\nA survival guide for school founders: dates, permission slips and volunteers, all in one place. Swipe →\n\n#microschool #holidayprogram #schoolfounder",
        headline: "Holiday program survival guide",
      },
      adCopyVariants: [
        {
          label: "Countdown",
          primaryText: "9 days to the holiday program. 🎄 Costumes: missing. Permission slips: half back. Volunteers: \"maybe.\"\n\nSwipe for the survival guide →\n\n#microschool #holidayprogram #schoolfounder",
          headline: "9 days. Costumes missing.",
        },
        {
          label: "Save it",
          primaryText: "Save this before the holiday program sneaks up on you. 📌 Dates, permission slips and volunteers, sorted. Swipe →\n\n#microschool #holidayprogram",
          headline: "Save before it sneaks up on you",
        },
      ],
    },
    {
      id: "ranked",
      fileName: "02-prep-ranked-by-chaos.png",
      render: () => (
        <ReactionListSlide
          title={
            <>
              Holiday program prep, <Accent>ranked by chaos</Accent>
            </>
          }
          name="dot"
          rows={[
            { label: "Picking a date", aside: "easy. famous last words.", view: "happy" },
            { label: "Finding 14 costumes", aside: "one is a lamp?", view: "thinking" },
            { label: "Volunteer sheet: 1 name", aside: "it’s yours", view: "tears" },
            { label: "Permission slips: “in the car”", aside: "classic", view: "oops" },
            { label: "Showtime", aside: "worth it. every time.", view: "celebrate" },
          ]}
        />
      ),
    },
    {
      id: "turn",
      fileName: "03-what-if-it-lived-in-one-place.png",
      render: () => (
        <MascotTurnSlide
          name="tansy"
          view="curious"
          background="#FFF3CF"
          bubble={
            <>
              what if the date, slips and sign-ups <Accent>lived in one place?</Accent>
            </>
          }
          aside="(tansy has a clipboard ready.)"
        />
      ),
    },
    {
      id: "calendar",
      fileName: "04-every-date-on-one-calendar.png",
      render: () => (
        <MascotProductSlide
          kicker="Calendar"
          title="Every date on one calendar."
          aside="rehearsals included."
          note="Every event and date in one shared calendar."
          noteAt={{ x: 620, y: 940, rotate: 3, width: 390 }}
          mascot={{ name: "dot", view: "point", width: 360, x: -30, y: 900 }}
          contentHeight={H}
          crop={{ zoom: 1.15, originX: 0, originY: 0 }}
        >
          <GardenParentCalendarWindow contentHeight={H} />
        </MascotProductSlide>
      ),
    },
    {
      id: "forms",
      fileName: "05-permission-slips-online.png",
      render: () => (
        <MascotProductSlide
          kicker="Forms"
          title="Every form and signature, online."
          aside="no slips left in the car."
          note="Families fill out forms, upload files, and sign online."
          background="#F3EEF8"
          noteAt={{ x: 60, y: 980, rotate: -3, width: 390 }}
          mascot={{ name: "bramble", view: "thumbs", width: 330, x: 730, y: 930 }}
          contentHeight={H}
          crop={{ zoom: 1.15, originX: 0, originY: 0 }}
        >
          <GardenTeacherFormsWindow contentHeight={H} />
        </MascotProductSlide>
      ),
    },
    {
      id: "volunteers",
      fileName: "06-volunteer-sheet-filled.png",
      render: () => (
        <MascotListSlide
          kicker="Volunteers"
          title={
            <>
              A volunteer sheet <Accent>families can find.</Accent>
            </>
          }
          body="Sign-ups live in the parent portal, not on the fridge."
          mascot={{ name: "tansy", view: "celebrate" }}
          tip="tansy filled it by lunch."
        >
          <VolunteerSheet />
        </MascotListSlide>
      ),
    },
    {
      id: "outro",
      fileName: "07-holiday-program-handled.png",
      render: () => <MascotOutroSlide name="dot" view="celebrate" lead="Holiday program?" accent="Handled." aside="now go find the lamp costume." />,
    },
  ] satisfies MarketingSlide[],
} satisfies MarketingCarousel;

const SLOTS: Array<{ job: string; who?: string }> = [
  { job: "Costume crew", who: "the Parks" },
  { job: "Cookie table", who: "Maya’s mom" },
  { job: "Photos", who: "Flicker (supervised)" },
  { job: "Clean-up" },
];

function VolunteerSheet() {
  return (
    <div style={{ background: "#FFFFFF", border: `4px solid ${G.ink}`, borderRadius: 26, boxShadow: `0 10px 0 ${G.ink}`, padding: "24px 30px", transform: "rotate(-1.5deg)" }}>
      <p style={{ margin: "0 0 12px", fontFamily: FONT.display, fontWeight: 800, fontSize: 36, color: G.ink }}>Holiday program volunteers</p>
      {SLOTS.map((slot) => (
        <div key={slot.job} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderTop: "2px dashed #E4D8C8" }}>
          <span style={{ fontFamily: FONT.body, fontWeight: 800, fontSize: 30, color: G.ink }}>{slot.job}</span>
          {slot.who ? (
            <span style={{ fontFamily: FONT.hand, fontSize: 30, color: G.forest }}>{slot.who} ✓</span>
          ) : (
            <span style={{ fontFamily: FONT.body, fontWeight: 800, fontSize: 24, color: G.clay, padding: "6px 14px", background: G.peach, borderRadius: 999 }}>open</span>
          )}
        </div>
      ))}
    </div>
  );
}
