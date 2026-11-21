"use client";

import { useMemo } from "react";
import { ArrowRight, School } from "lucide-react";
import DemoSchoolTeacherStoryProvider from "@/components/demo/shared/DemoSchoolTeacherStoryProvider";
import DemoGardenFeed from "@/components/demo/shared/garden-feed/DemoGardenFeed";
import { StudentFace, plural } from "@/components/school-teacher/home/garden/parts";
import { GCard, GStatTile, NOTE_TINTS, gBtnOutlineSm } from "@/components/school-parent/garden/ui";
import {
  buildDemoTeacherClassrooms,
  buildDemoTeacherStudents,
} from "@/data/school-demos/demo-teacher-portal-fixtures";
import {
  DEMO_TEACHER_FEED_NEW_COUNT,
  buildDemoTeacherFeedItems,
  buildDemoTeacherFeedWeekStats,
  type DemoTeacherFeedTab,
} from "@/data/school-demos/demo-teacher-feed-fixtures";

/*
 * Teacher demo › Feed: the shared demo Garden feed (`DemoGardenFeed`) with
 * staff copy, fixtures and rail. Teacher rule: no kicker on tab pages.
 * Every number in the rail leads to the matching tab.
 */

export type DemoTeacherFeedPageProps = {
  onNavigate?: (tab: DemoTeacherFeedTab) => void;
};

function DemoTeacherFeedRail({ onNavigate }: DemoTeacherFeedPageProps) {
  const stats = useMemo(() => buildDemoTeacherFeedWeekStats(), []);
  const classrooms = useMemo(() => buildDemoTeacherClassrooms(), []);
  const students = useMemo(() => buildDemoTeacherStudents(), []);
  const go = (tab: DemoTeacherFeedTab) => (onNavigate ? () => onNavigate(tab) : undefined);

  return (
    <>
      <GCard index={2} kicker="This week" title="At a glance">
        <div className="grid grid-cols-1 divide-y-[1.5px] divide-[var(--sf-ink)]/10 overflow-hidden rounded-[18px] border-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-paper)] [&>*>*]:!flex-row [&>*>*]:!items-center [&>*>*]:!gap-4 [&>*>*]:!py-3 [&>*>*>span:first-child]:min-w-[2.75rem]">
          <div aria-label={`Unread family messages: ${stats.familyReplies}. Open Messages`}>
            <GStatTile value={stats.familyReplies} label="Unread family messages" accent onClick={go("messages")} />
          </div>
          <div aria-label={`Form signatures: ${stats.formsSigned}. Open Forms & Docs`}>
            <GStatTile value={stats.formsSigned} label="Form signatures in" onClick={go("forms")} />
          </div>
          <div>
            <GStatTile value={stats.photos} label="Photos shared" />
          </div>
        </div>
      </GCard>

      <GCard index={3} kicker="Your classrooms" title="Where updates come from">
        <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
          {classrooms.map((classroom, index) => {
            const roster = students.filter((student) => student.classroomNames.includes(classroom.name));
            const shown = roster.slice(0, 4);
            const extra = roster.length - shown.length;
            return (
              <li
                key={classroom.id}
                className="flex items-center gap-3 rounded-[18px] border-[1.5px] border-[var(--sf-ink)]/10 bg-white px-3.5 py-3"
              >
                <span
                  aria-hidden="true"
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] ${NOTE_TINTS[index % NOTE_TINTS.length]}`}
                >
                  <School className="h-5 w-5 text-[var(--sf-ink)]/80" strokeWidth={2.3} />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="sf-display m-0 truncate text-[1.1rem] leading-tight text-[var(--sf-ink)]">{classroom.name}</h3>
                  <div className="mt-1 flex items-center gap-2">
                    {shown.length > 0 ? (
                      <span className="flex items-center" aria-hidden="true">
                        {shown.map((student, i) => (
                          <StudentFace key={student.id} student={student} index={i} size="xs" className={i > 0 ? "-ml-2" : ""} />
                        ))}
                        {extra > 0 ? (
                          <span className="-ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--sf-paper)] text-[11px] font-extrabold text-[var(--sf-ink)]/65 ring-2 ring-white">
                            +{extra}
                          </span>
                        ) : null}
                      </span>
                    ) : null}
                    <span className="text-[13px] font-semibold tabular-nums text-[var(--sf-soft)]">
                      {plural(classroom.studentCount, "student")}
                    </span>
                  </div>
                </div>
                {onNavigate ? (
                  <button
                    type="button"
                    onClick={() => onNavigate("students")}
                    className={`${gBtnOutlineSm} !px-3 !py-2 !text-[13px]`}
                    aria-label={`View students in ${classroom.name}`}
                  >
                    View <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      </GCard>
    </>
  );
}

export default function DemoTeacherFeedPage({ onNavigate }: DemoTeacherFeedPageProps) {
  const items = useMemo(() => buildDemoTeacherFeedItems(), []);
  return (
    <DemoSchoolTeacherStoryProvider className="flex min-h-0 flex-1 flex-col">
      <DemoGardenFeed
        items={items}
        newCount={DEMO_TEACHER_FEED_NEW_COUNT}
        header={{
          title: (
            <>
              School <span className="text-[var(--sf-clay)]">feed</span>
            </>
          ),
          subtitle: "Photos, announcements and family replies from across the school, newest first.",
        }}
        onNavigate={onNavigate}
        rail={<DemoTeacherFeedRail onNavigate={onNavigate} />}
        testId="demo-teacher-feed"
      />
    </DemoSchoolTeacherStoryProvider>
  );
}
