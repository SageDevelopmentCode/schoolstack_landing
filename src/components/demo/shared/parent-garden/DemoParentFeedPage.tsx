"use client";

import { useMemo } from "react";
import { ArrowRight } from "lucide-react";
import DemoSchoolParentStoryProvider from "@/components/demo/shared/DemoSchoolParentStoryProvider";
import DemoGardenFeed from "@/components/demo/shared/garden-feed/DemoGardenFeed";
import { PARENT_DEMO_COPY } from "@/components/demo/shared/parent-demo-runtime";
import { ChildThumb, GCard, GStatTile, gLinkSm } from "@/components/school-parent/garden/ui";
import { buildDemoParentChildren } from "@/data/school-demos/demo-parent-portal-fixtures";
import {
  DEMO_PARENT_FEED_CLASSROOMS,
  DEMO_PARENT_FEED_NEW_COUNT,
  buildDemoParentFeedItems,
  buildDemoParentFeedWeekStats,
  type DemoParentFeedTab,
} from "@/data/school-demos/demo-parent-feed-fixtures";

/*
 * Parent demo › School feed: the shared demo Garden feed (`DemoGardenFeed`)
 * with the parent's header copy, rail ("At a glance", classrooms) and fixtures.
 */

export type DemoParentFeedPageProps = {
  onNavigate?: (tab: DemoParentFeedTab) => void;
};

function DemoParentFeedRail({ onNavigate }: DemoParentFeedPageProps) {
  const items = useMemo(() => buildDemoParentFeedItems(), []);
  const stats = useMemo(() => buildDemoParentFeedWeekStats(items), [items]);
  const children = useMemo(() => buildDemoParentChildren(), []);
  const classrooms = DEMO_PARENT_FEED_CLASSROOMS.map((room) => {
    const index = children.findIndex((child) => child.studentName.split(" ")[0] === room.childFirstName);
    return { ...room, child: index >= 0 ? children[index] : null, childIndex: Math.max(index, 0) };
  });

  return (
    <>
      <GCard index={2} kicker="This week" title="At a glance">
        {/* 3 across when the card is wide enough; stacked in a narrow rail or on phones. */}
        <div className="@container">
          <div className="grid grid-cols-1 divide-y-[1.5px] divide-[var(--sf-ink)]/10 overflow-hidden rounded-[18px] border-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-paper)] [&>*>*]:!flex-row [&>*>*]:!items-center [&>*>*]:!gap-4 [&>*>*]:!py-3 [&>*>*>span:first-child]:min-w-[2.75rem] @[25rem]:grid-cols-3 @[25rem]:divide-x-[1.5px] @[25rem]:divide-y-0 @[25rem]:[&>*>*]:!flex-col @[25rem]:[&>*>*]:!items-start @[25rem]:[&>*>*]:!gap-1 @[25rem]:[&>*>*]:!px-4 @[25rem]:[&>*>*]:!py-4">
            <div>
              <GStatTile value={stats.photos} label="Photos shared" />
            </div>
            <div>
              <GStatTile value={stats.announcements} label="Announcements" />
            </div>
            <div>
              <GStatTile
                value={stats.formsToSign}
                label="Forms to sign"
                accent
                onClick={onNavigate ? () => onNavigate("forms") : undefined}
              />
            </div>
          </div>
        </div>
      </GCard>

      <GCard index={3} kicker="Your classrooms" title="Where updates come from">
        <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
          {classrooms.map((room, i) => (
            <li
              key={room.id}
              className="flex items-center gap-3.5 rounded-[18px] border-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-paper)] px-3.5 py-3"
            >
              {room.child ? <ChildThumb child={room.child} index={room.childIndex} size="sm" tilt={i % 2 === 0 ? -3 : 3} /> : null}
              <div className="min-w-0 flex-1">
                <h3 className="sf-display m-0 text-[1.15rem] leading-tight text-[var(--sf-ink)]">{room.room}</h3>
                <p className="m-0 mt-0.5 text-[13px] font-semibold text-[var(--sf-soft)]">
                  {room.teacher} <span aria-hidden="true">·</span> {room.childFirstName}
                </p>
              </div>
              {onNavigate ? (
                <button
                  type="button"
                  onClick={() => onNavigate("messages")}
                  aria-label={`Message ${room.teacher}`}
                  className={`${gLinkSm} group`}
                >
                  Message
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      </GCard>
    </>
  );
}

export default function DemoParentFeedPage({ onNavigate }: DemoParentFeedPageProps) {
  const items = useMemo(() => buildDemoParentFeedItems(), []);
  return (
    <DemoSchoolParentStoryProvider>
      <DemoGardenFeed
        items={items}
        newCount={DEMO_PARENT_FEED_NEW_COUNT}
        header={{
          kicker: "School feed",
          title: (
            <>
              What&apos;s new at <span className="text-[var(--sf-clay)]">{PARENT_DEMO_COPY.schoolShortName}</span>
            </>
          ),
          subtitle: "Photos, announcements and updates from your school, newest first.",
        }}
        onNavigate={onNavigate}
        rail={<DemoParentFeedRail onNavigate={onNavigate} />}
        testId="demo-parent-feed"
      />
    </DemoSchoolParentStoryProvider>
  );
}
