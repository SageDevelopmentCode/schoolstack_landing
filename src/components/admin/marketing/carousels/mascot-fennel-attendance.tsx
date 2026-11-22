"use client";

import type { MarketingCarousel, MarketingSlide } from "@/components/admin/marketing/carousels/types";
import { GardenAttendanceWindow } from "@/components/admin/marketing/screens/marketing-garden-demo-windows";
import {
  Accent,
  At,
  MascotHookSlide,
  MascotOutroSlide,
  MascotProductSlide,
  MascotTurnSlide,
  NotificationReactionSlide,
  ReactionListSlide,
  SAMPLE_NOTIFS,
  SpeechBubble,
} from "@/components/admin/marketing/mascot/mascot-slide-kit";

// Jokes are original; product facts are word for word from product-preview-tabs.ts,
// get-started-showcase-slides.ts and FloatingStickers.tsx.

const H = 920;

export const MASCOT_FENNEL_ATTENDANCE_CAROUSEL = {
  id: "mascot-fennel-attendance",
  title: "Fennel takes roll call (Attendance)",
  description: "Mascot carousel: Fennel's clipboard chaos, then the Garden attendance roster.",
  fileSlug: "mudkitchen-fennel-attendance",
  slides: [
    {
      id: "hook",
      fileName: "01-roll-call-three-kids-said-here.png",
      adCopy: {
        label: "Roll call",
        primaryText: "Fennel takes roll call. The clipboard has a coffee ring, a mystery student named \"Mxx\" and a goldfish smell. 🐸\n\nSwipe for the attendance roster teachers can use in about a minute →\n\n#microschool #attendance #teacherlife",
        headline: "Fennel takes roll call",
      },
      adCopyVariants: [
        {
          label: "Clipboard review",
          primaryText: "An honest review of the attendance clipboard: ⭐ Found in the snack bin. Smells like goldfish. Swipe for what replaced it →\n\n#microschool #teacherlife",
          headline: "Clipboard: found in the snack bin",
        },
        {
          label: "Question",
          primaryText: "Where's your school's attendance clipboard right now? Wrong answers only. 👇 Swipe →\n\n#microschool #attendance #teacherlife",
          headline: "Clipboard location? Wrong answers only.",
        },
      ],
      render: () => (
        <MascotHookSlide
          kicker="Meet Fennel, who takes attendance"
          headline={
            <>
              3 kids answered <Accent>&ldquo;here&rdquo;</Accent> for their friend who is very much not here
            </>
          }
          name="fennel"
          view="surprised"
          background="#E9F4E2"
          aside="fennel is onto them."
          mascot={{ x: 250, y: 660, width: 540 }}
        >
          {[
            { x: 60, y: 520, r: -4 },
            { x: 700, y: 560, r: 5 },
            { x: 90, y: 760, r: 3 },
          ].map((p, i) => (
            <At key={i} x={p.x} y={p.y} rotate={p.r} z={5}>
              <SpeechBubble size={44} tail={i === 1 ? "bottom-left" : "bottom-right"}>
                here!
              </SpeechBubble>
            </At>
          ))}
        </MascotHookSlide>
      ),
    },
    {
      id: "clipboard",
      fileName: "02-the-clipboard-an-honest-review.png",
      render: () => (
        <ReactionListSlide
          title={
            <>
              Fennel&rsquo;s attendance clipboard, <Accent>an honest review</Accent>
            </>
          }
          name="fennel"
          rows={[
            { tag: "Monday", label: "Perfect. Pristine.", aside: "a work of art", view: "happy" },
            { tag: "Tuesday", label: "Coffee ring on row 3", aside: "it’s fine", view: "thinking" },
            { tag: "Wednesday", label: "Who is “Mxx”?", aside: "nobody knows", view: "confused" },
            { tag: "Thursday", label: "Clipboard: missing", aside: "a search party forms", view: "oops" },
            { tag: "Friday", label: "Found in the snack bin", aside: "it smells like goldfish", view: "tears" },
          ]}
        />
      ),
    },
    {
      id: "turn",
      fileName: "03-what-if-roll-call-was-calm.png",
      render: () => (
        <MascotTurnSlide
          name="fennel"
          view="curious"
          background="#E3EDFB"
          bubble={
            <>
              what if roll call was&hellip; <Accent>calm?</Accent>
            </>
          }
          aside="(no clipboard. no guessing.)"
        />
      ),
    },
    {
      id: "roster",
      fileName: "04-todays-roster.png",
      render: () => (
        <MascotProductSlide
          kicker="Attendance"
          title="Today’s roster, counted for you."
          aside="fennel is thrilled."
          note="Mark every student in a few taps and look back week by week."
          noteAt={{ x: 630, y: 940, rotate: 3, width: 390 }}
          mascot={{ name: "fennel", view: "point", width: 380, x: -40, y: 900 }}
          contentHeight={H}
          crop={{ zoom: 1.15, originX: 0, originY: 0 }}
        >
          <GardenAttendanceWindow contentHeight={H} />
        </MascotProductSlide>
      ),
    },
    {
      id: "marked",
      fileName: "05-present-absent-picked-up.png",
      render: () => (
        <MascotProductSlide
          kicker="By class"
          title="Mark present, absent, or picked up."
          aside="no clipboard required."
          note="Each teacher marks their own class."
          background="#F3EEF8"
          noteAt={{ x: 60, y: 990, rotate: -3, width: 380 }}
          mascot={{ name: "fennel", view: "thumbs", width: 360, x: 700, y: 910 }}
          contentHeight={H}
          crop={{ zoom: 1.35, originX: 0, originY: 0.22 }}
        >
          <GardenAttendanceWindow contentHeight={H} />
        </MascotProductSlide>
      ),
    },
    {
      id: "reaction",
      fileName: "06-clipboard-retired-with-honors.png",
      render: () => (
        <NotificationReactionSlide
          headline={
            <>
              the clipboard has been <Accent>retired with honors</Accent>
            </>
          }
          aside="it’s in the snack bin. where it belongs."
          name="fennel"
          view="wink"
          background="#FFF6D6"
          notifs={[SAMPLE_NOTIFS.attendanceLogged, SAMPLE_NOTIFS.pickupConfirmed]}
        />
      ),
    },
    {
      id: "outro",
      fileName: "07-roll-call-but-calm.png",
      render: () => <MascotOutroSlide name="fennel" view="celebrate" lead="Roll call," accent="done in a minute." aside="the snack bin is just for snacks now" />,
    },
  ] satisfies MarketingSlide[],
} satisfies MarketingCarousel;
