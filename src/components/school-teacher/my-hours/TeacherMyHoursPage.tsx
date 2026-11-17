"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import ParentGardenFrame from "@/components/school-parent/garden/ParentGardenFrame";
import ParentGardenPageHeader from "@/components/school-parent/garden/ParentGardenPageHeader";
import { PORTAL_EASE } from "@/components/school-parent/garden/motion";
import MyHoursAdjustPanel from "@/components/school-teacher/my-hours/garden/MyHoursAdjustPanel";
import MyHoursRail from "@/components/school-teacher/my-hours/garden/MyHoursRail";
import MyHoursTimeClockCard from "@/components/school-teacher/my-hours/garden/MyHoursTimeClockCard";
import {
  MyHoursAdjustView,
  MyHoursDayView,
  MyHoursMonthView,
  MyHoursToolbar,
  MyHoursWeekView,
} from "@/components/school-teacher/my-hours/garden/MyHoursViews";
import {
  useTeacherMyHoursModel,
  type TeacherMyHoursPageProps,
} from "@/components/school-teacher/my-hours/useTeacherMyHoursModel";
import { PORTAL_HOME_CONTAINER_CLASS } from "@/lib/portal-home/layout";

/**
 * Staff My Hours (Garden): the time clock (one dark card, one toy button),
 * Day / Week / Month / Adjust views with a date pager, linked totals and
 * pending changes in the rail, and the adjust drawer. Same data, API calls and
 * rules as before through `useTeacherMyHoursModel`.
 * Rules: `.claude/skills/teacher-portal-garden-design/SKILL.md`.
 */
export default function TeacherMyHoursPage(props: TeacherMyHoursPageProps) {
  const model = useTeacherMyHoursModel(props);
  const reduce = useReducedMotion() === true;
  const { view } = model;

  return (
    <div data-testid="teacher-my-hours-page" className="flex min-h-0 flex-1 flex-col">
      <ParentGardenFrame theme={model.theme} className="bg-[var(--sf-cream)]">
        <div className={PORTAL_HOME_CONTAINER_CLASS}>
          <ParentGardenPageHeader
            title="My Hours"
            subtitle={
              <>
                {view === "adjust"
                  ? "Add hours you missed, or correct a day you already logged."
                  : "Clock in and out to track your daily work time."}
                <span className="mt-1 block text-[14px] font-extrabold text-[var(--sf-ink)]/75" data-testid="teacher-my-hours-status">
                  {model.statusLine}
                </span>
              </>
            }
          />

          <div className="grid items-start gap-5 lg:grid-cols-[1.55fr_1fr]">
            <div className="flex min-w-0 flex-col gap-5">
              <MyHoursTimeClockCard model={model} />
              <MyHoursToolbar model={model} />
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={view}
                  className="min-w-0"
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
                  transition={{ duration: reduce ? 0.12 : 0.24, ease: PORTAL_EASE }}
                  role="tabpanel"
                  aria-label={`${view[0].toUpperCase()}${view.slice(1)} view`}
                >
                  {view === "day" ? <MyHoursDayView model={model} /> : null}
                  {view === "week" ? <MyHoursWeekView model={model} /> : null}
                  {view === "month" ? <MyHoursMonthView model={model} /> : null}
                  {view === "adjust" ? <MyHoursAdjustView model={model} /> : null}
                </motion.div>
              </AnimatePresence>
            </div>
            <MyHoursRail model={model} />
          </div>
        </div>
      </ParentGardenFrame>

      {/* Overlays stay outside the frame. */}
      <MyHoursAdjustPanel model={model} />
    </div>
  );
}
