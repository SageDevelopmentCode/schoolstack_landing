"use client";

import type { MarketingCarousel, MarketingSlide } from "@/components/admin/marketing/carousels/types";
import { GardenParentCalendarWindow } from "@/components/admin/marketing/screens/marketing-garden-demo-windows";
import {
  Accent,
  At,
  G,
  Hand,
  MascotHookSlide,
  MascotOutroSlide,
  MascotProductSlide,
  MascotTurnSlide,
  ReactionListSlide,
  StickyNote,
} from "@/components/admin/marketing/mascot/mascot-slide-kit";

// Jokes are original; product facts are word for word from download-app-slides.ts
// and microschool-monday-check.ts.

const H = 920;

export const MASCOT_DOT_CALENDAR_CAROUSEL = {
  id: "mascot-dot-calendar",
  title: "Dot finds out about picture day (Calendar)",
  description: "Mascot carousel: Dot's calendar surprises, then the Garden family calendar.",
  fileSlug: "mudkitchen-dot-calendar",
  slides: [
    {
      id: "hook",
      fileName: "01-picture-day-on-picture-day.png",
      render: () => (
        <MascotHookSlide
          kicker="Meet Dot, who keeps the calendar"
          headline={
            <>
              Dot finding out about picture day&hellip; <Accent>on picture day</Accent>
            </>
          }
          name="dot"
          view="surprised"
          background="#FBE6E2"
          aside="nobody told dot."
          mascot={{ x: 250, y: 650, width: 550 }}
        >
          <At x={640} y={500} z={6}>
            <StickyNote width={330} rotate={6} color={G.butter}>
              <Hand size={30} color={G.soft} rotate={0}>
                today
              </Hand>
              <p style={{ margin: "6px 0 0", fontFamily: "var(--font-sf-display), sans-serif", fontWeight: 800, fontSize: 52, lineHeight: 1, color: G.clay }}>
                PICTURE DAY
              </p>
            </StickyNote>
          </At>
        </MascotHookSlide>
      ),
    },
    {
      id: "crimes",
      fileName: "02-calendar-crimes-ranked.png",
      render: () => (
        <ReactionListSlide
          title={
            <>
              Calendar crimes, <Accent>ranked</Accent>
            </>
          }
          name="dot"
          tagPrefix="Crime"
          rows={[
            { label: "The event that lived in one email", view: "oops" },
            { label: "“See attached flyer”", aside: "no flyer was attached", view: "confused" },
            { label: "“The usual time”", aside: "there is no usual time", view: "thinking" },
            { label: "Two dates, one field trip", aside: "pick one. please.", view: "surprised" },
            { label: "The reminder, the morning of", view: "tears" },
          ]}
        />
      ),
    },
    {
      id: "turn",
      fileName: "03-what-if-every-date-lived-in-one-place.png",
      render: () => (
        <MascotTurnSlide
          name="dot"
          view="curious"
          background="#FFF6D6"
          bubble={
            <>
              what if every date lived <Accent>in one place?</Accent>
            </>
          }
          aside="(where everyone can see it.)"
        />
      ),
    },
    {
      id: "month",
      fileName: "04-every-date-one-calendar.png",
      render: () => (
        <MascotProductSlide
          kicker="Calendar & events"
          title="Every date on one calendar."
          aside="dot is never surprised again."
          note="Every event and date in one shared calendar."
          noteAt={{ x: 630, y: 960, rotate: 3, width: 390 }}
          mascot={{ name: "dot", view: "point", width: 380, x: -40, y: 900 }}
          contentHeight={H}
          crop={{ zoom: 1.15, originX: 0, originY: 0 }}
        >
          <GardenParentCalendarWindow contentHeight={H} />
        </MascotProductSlide>
      ),
    },
    {
      id: "families",
      fileName: "05-families-see-it-too.png",
      render: () => (
        <MascotProductSlide
          kicker="For families"
          title="Families see the same calendar."
          aside="yes, even picture day."
          note="Parents see dates, forms, bills, and updates in their own app."
          background="#F3EEF8"
          noteAt={{ x: 60, y: 960, rotate: -3, width: 400 }}
          mascot={{ name: "dot", view: "thumbs", width: 360, x: 700, y: 910 }}
          contentHeight={H}
          crop={{ zoom: 1.35, originX: 0.26, originY: 0 }}
        >
          <GardenParentCalendarWindow contentHeight={H} />
        </MascotProductSlide>
      ),
    },
    {
      id: "outro",
      fileName: "06-picture-day-on-the-calendar.png",
      render: () => <MascotOutroSlide name="dot" view="celebrate" lead="Picture day:" accent="on the calendar." aside="dot is ready this time" />,
    },
  ] satisfies MarketingSlide[],
} satisfies MarketingCarousel;
