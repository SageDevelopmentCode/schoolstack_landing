"use client";

import type { MarketingCarousel, MarketingSlide } from "@/components/admin/marketing/carousels/types";
import { GardenHoursWindow } from "@/components/admin/marketing/screens/marketing-garden-demo-windows";
import {
  Accent,
  At,
  G,
  Hand,
  MascotHookSlide,
  MascotOutroSlide,
  MascotProductSlide,
  MascotTurnSlide,
  NotificationReactionSlide,
  ReactionListSlide,
  SAMPLE_NOTIFS,
  StickyNote,
} from "@/components/admin/marketing/mascot/mascot-slide-kit";

// Jokes are original; product facts are word for word from product-preview-tabs.ts,
// get-started-showcase-slides.ts and FloatingStickers.tsx.

const H = 920;

export const MASCOT_CLOVER_TIMECLOCK_CAROUSEL = {
  id: "mascot-clover-timeclock",
  title: "Clover's timesheet (Timeclock)",
  description: "Mascot carousel: Clover's creative timesheets, then the Garden My Hours page.",
  fileSlug: "mudkitchen-clover-timeclock",
  slides: [
    {
      id: "hook",
      fileName: "01-monday-worked-tuesday-also-worked.png",
      adCopy: {
        label: "Creative timesheets",
        primaryText: "Clover's timesheet, submitted with confidence: \"a lot.\" \"8ish (vibes).\" \"see attached\" (nothing was attached). 🐝\n\nSwipe for staff hours that add themselves up →\n\n#microschool #schooladmin #payroll",
        headline: "Clover's timesheet: \"8ish (vibes)\"",
      },
      adCopyVariants: [
        {
          label: "Which one",
          primaryText: "Which timesheet entry have you received? \"The usual\"? \"Ask the other bee\"? 👇 Swipe for Clover's glow-up →\n\n#microschool #schooladmin",
          headline: "\"The usual\" is not a number",
        },
        {
          label: "Payroll day",
          primaryText: "Payroll day shouldn't start with decoding \"a lot.\" 🧮 Swipe to see staff clock in, clock out and get weekly totals →\n\n#microschool #payroll #schoolfounder",
          headline: "Decoding \"a lot\" on payroll day",
        },
      ],
      render: () => (
        <MascotHookSlide
          kicker="Meet Clover, who logs staff hours"
          headline={
            <>
              Clover&rsquo;s timesheet, <Accent>submitted with confidence</Accent>
            </>
          }
          name="clover"
          view="cheeky"
          background="#FFF6D6"
          aside="clover stands by every word."
          mascot={{ x: 40, y: 640, width: 520 }}
        >
          <At x={560} y={470} z={6}>
            <StickyNote color="#FFFFFF" width={440} rotate={5}>
              <Hand size={26} color={G.soft} rotate={0}>
                timesheet · week 12
              </Hand>
              <Hand size={44} color={G.ink} rotate={0} style={{ marginTop: 10, lineHeight: 1.25 }}>
                Mon: worked
                <br />
                Tue: also worked
                <br />
                Wed: ???
                <br />
                Thu: see Wed
              </Hand>
            </StickyNote>
          </At>
        </MascotHookSlide>
      ),
    },
    {
      id: "hours-box",
      fileName: "02-things-written-in-the-hours-box.png",
      render: () => (
        <ReactionListSlide
          title={
            <>
              Things Clover has written in the <Accent>&ldquo;hours&rdquo; box</Accent>
            </>
          }
          name="clover"
          rows={[
            { label: "“a lot”", aside: "technically true", view: "laughing" },
            { label: "“8ish (vibes)”", aside: "the vibes were strong", view: "thinking" },
            { label: "“see attached”", aside: "nothing was attached", view: "oops" },
            { label: "“ask the other bee”", aside: "there is no other bee", view: "confused" },
          ]}
        />
      ),
    },
    {
      id: "turn",
      fileName: "03-what-if-hours-added-up.png",
      render: () => (
        <MascotTurnSlide
          name="clover"
          view="curious"
          background="#FDEBDD"
          bubble={
            <>
              what if the hours just&hellip; <Accent>added themselves up?</Accent>
            </>
          }
          aside="(no math. no vibes.)"
        />
      ),
    },
    {
      id: "clock",
      fileName: "04-on-the-clock-tracked.png",
      render: () => (
        <MascotProductSlide
          kicker="Timeclock"
          title="Staff clock in and out in the app."
          aside="clover is buzzing."
          note="Every shift is logged, so hours add up on their own."
          noteAt={{ x: 630, y: 950, rotate: 3, width: 390 }}
          mascot={{ name: "clover", view: "point", width: 380, x: -30, y: 900 }}
          contentHeight={H}
          crop={{ zoom: 1.15, originX: 0, originY: 0 }}
        >
          <GardenHoursWindow contentHeight={H} />
        </MascotProductSlide>
      ),
    },
    {
      id: "totals",
      fileName: "05-weekly-totals-no-calculator.png",
      render: () => (
        <MascotProductSlide
          kicker="Totals"
          title="Weekly totals, no calculator."
          aside="and monthly ones too."
          note="Payroll gets real numbers, not “8ish.”"
          background="#F3EEF8"
          noteAt={{ x: 60, y: 990, rotate: -3, width: 380 }}
          mascot={{ name: "clover", view: "thumbs", width: 360, x: 700, y: 910 }}
          contentHeight={H}
          crop={{ zoom: 1.35, originX: 0.26, originY: 0 }}
        >
          <GardenHoursWindow contentHeight={H} />
        </MascotProductSlide>
      ),
    },
    {
      id: "reaction",
      fileName: "06-payroll-day-nobody-cried.png",
      render: () => (
        <NotificationReactionSlide
          headline={
            <>
              payroll day, <Accent>but nobody cried</Accent>
            </>
          }
          aside="not even clover."
          name="clover"
          view="happy"
          background="#E9F4E2"
          notifs={[SAMPLE_NOTIFS.clockedIn, SAMPLE_NOTIFS.weeklyHours]}
        />
      ),
    },
    {
      id: "outro",
      fileName: "07-timesheets-officially-boring.png",
      render: () => <MascotOutroSlide name="clover" view="celebrate" lead="Timesheets" accent="that add themselves up." aside="clover has never been happier" />,
    },
  ] satisfies MarketingSlide[],
} satisfies MarketingCarousel;
