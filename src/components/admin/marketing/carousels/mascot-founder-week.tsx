"use client";

import type { MarketingCarousel, MarketingSlide } from "@/components/admin/marketing/carousels/types";
import {
  GardenAdmissionsWindow,
  GardenAttendanceWindow,
  GardenHoursWindow,
  GardenMessagesWindow,
} from "@/components/admin/marketing/screens/marketing-garden-demo-windows";
import {
  Accent,
  At,
  BrowserTab,
  MascotHookSlide,
  MascotOutroSlide,
  MascotProductSlide,
  MascotTurnSlide,
  ReactionListSlide,
} from "@/components/admin/marketing/mascot/mascot-slide-kit";

// Product notes are word for word from the Dig, Fennel, Loam and Clover carousels. Jokes are original.

const H = 920;

const MONDAY_TABS = ["Applications", "Tuition (FINAL)", "Venmo", "Group text", "Email", "Timesheet"];

export const MASCOT_FOUNDER_WEEK_CAROUSEL = {
  id: "mascot-founder-week",
  title: "A founder’s week, Mon–Fri (Admin)",
  description: "Mascot carousel: Dig's five jobs in one week, then one screen per day.",
  fileSlug: "mudkitchen-founder-week",
  slides: [
    {
      id: "hook",
      fileName: "01-monday-8am-14-tabs.png",
      render: () => (
        <MascotHookSlide
          kicker="A microschool founder’s week"
          headline={
            <>
              Monday, 8:02am. <Accent>14 tabs open.</Accent>
            </>
          }
          name="dig"
          view="confused"
          background="#FFF3CF"
          aside="dig has a system. sort of."
          mascot={{ x: 300, y: 700, width: 500 }}
        >
          {MONDAY_TABS.map((tab, i) => (
            <At key={tab} x={60 + (i % 3) * 330} y={420 + Math.floor(i / 3) * 96} rotate={((i * 5) % 7) - 3} z={3}>
              <BrowserTab label={tab} />
            </At>
          ))}
        </MascotHookSlide>
      ),
      adCopy: {
        primaryText:
          "A microschool founder's week: admissions officer on Monday, payroll on Friday. Here's the same week with one screen per day. Swipe →. #microschool #founder",
        headline: "Five jobs. One place.",
      },
    },
    {
      id: "job-titles",
      fileName: "02-the-week-by-job-title.png",
      render: () => (
        <ReactionListSlide
          title={
            <>
              The founder&rsquo;s week, <Accent>by job title</Accent>
            </>
          }
          name="dig"
          rows={[
            { tag: "Monday", label: "Admissions officer", aside: "6 new inquiries", view: "thinking" },
            { tag: "Tuesday", label: "Teacher", aside: "the actual job", view: "happy" },
            { tag: "Wednesday", label: "Billing department", aside: "who paid??", view: "tears" },
            { tag: "Thursday", label: "Parent hotline", aside: "“quick question”", view: "surprised" },
            { tag: "Friday", label: "Payroll", aside: "math, unfortunately", view: "oops" },
          ]}
        />
      ),
    },
    {
      id: "turn",
      fileName: "03-what-if-each-day-had-one-screen.png",
      render: () => (
        <MascotTurnSlide
          name="dig"
          view="curious"
          bubble={
            <>
              what if each day had <Accent>one screen?</Accent>
            </>
          }
          aside="(one. not fourteen.)"
        />
      ),
    },
    {
      id: "monday",
      fileName: "04-monday-admissions.png",
      render: () => (
        <MascotProductSlide
          kicker="Monday · Admissions"
          title="Applications sorted by stage, automatically."
          aside="dig found every family."
          note="See every family, from first inquiry to enrolled."
          noteAt={{ x: 620, y: 940, rotate: 3, width: 390 }}
          mascot={{ name: "dig", view: "point", width: 370, x: -30, y: 890 }}
          contentHeight={H}
          crop={{ zoom: 1.15, originX: 0, originY: 0 }}
        >
          <GardenAdmissionsWindow contentHeight={H} />
        </MascotProductSlide>
      ),
    },
    {
      id: "tuesday",
      fileName: "05-tuesday-attendance.png",
      render: () => (
        <MascotProductSlide
          kicker="Tuesday · Attendance"
          title="Today’s roster, counted for you."
          aside="back to teaching, fast."
          note="Mark every student in a few taps and look back week by week."
          background="#E9F4E2"
          noteAt={{ x: 60, y: 980, rotate: -3, width: 390 }}
          mascot={{ name: "fennel", view: "thumbs", width: 330, x: 730, y: 940 }}
          contentHeight={H}
          crop={{ zoom: 1.15, originX: 0, originY: 0 }}
        >
          <GardenAttendanceWindow contentHeight={H} />
        </MascotProductSlide>
      ),
    },
    {
      id: "thursday",
      fileName: "06-thursday-messages.png",
      render: () => (
        <MascotProductSlide
          kicker="Thursday · Messages"
          title="One inbox for every family."
          aside="the hotline is closed."
          note="Families message teachers directly. Nothing gets lost in email."
          background="#E3EDFB"
          noteAt={{ x: 620, y: 940, rotate: 3, width: 390 }}
          mascot={{ name: "loam", view: "happy", width: 340, x: -20, y: 920 }}
          contentHeight={H}
          crop={{ zoom: 1.15, originX: 0, originY: 0 }}
        >
          <GardenMessagesWindow contentHeight={H} />
        </MascotProductSlide>
      ),
    },
    {
      id: "friday",
      fileName: "07-friday-hours.png",
      render: () => (
        <MascotProductSlide
          kicker="Friday · Staff hours"
          title="Weekly totals, no calculator."
          aside="payroll, minus the math."
          note="Every shift is logged, so hours add up on their own."
          background="#FFF3CF"
          noteAt={{ x: 60, y: 980, rotate: -3, width: 390 }}
          mascot={{ name: "clover", view: "celebrate", width: 330, x: 730, y: 930 }}
          contentHeight={H}
          crop={{ zoom: 1.15, originX: 0, originY: 0 }}
        >
          <GardenHoursWindow contentHeight={H} />
        </MascotProductSlide>
      ),
    },
    {
      id: "outro",
      fileName: "08-five-jobs-one-place.png",
      render: () => <MascotOutroSlide name="dig" view="celebrate" lead="Five jobs." accent="One place." aside="dig took friday afternoon off." />,
    },
  ] satisfies MarketingSlide[],
} satisfies MarketingCarousel;
