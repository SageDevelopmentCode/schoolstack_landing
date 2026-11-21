"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import DemoSchoolParentStoryProvider from "@/components/demo/shared/DemoSchoolParentStoryProvider";
import ParentGardenFrame from "@/components/school-parent/garden/ParentGardenFrame";
import ParentGardenPageHeader from "@/components/school-parent/garden/ParentGardenPageHeader";
import { PORTAL_EASE } from "@/components/school-parent/garden/motion";
import {
  DateStamp,
  GCard,
  GChip,
  GProgress,
  GStatTile,
  GTabBar,
  gBtnOutlineSm,
  gBtnPopSm,
  gLinkSm,
} from "@/components/school-parent/garden/ui";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import { Tick } from "@/components/garden/ui";
import { PORTAL_HOME_CONTAINER_CLASS } from "@/lib/portal-home/layout";
import {
  DEMO_PARENT_VOLUNTEER_STARTING_HOURS,
  buildDemoParentVolunteerOpportunities,
  buildDemoParentVolunteerPastSignups,
  type DemoVolunteerCategory,
  type DemoVolunteerOpportunity,
} from "@/data/school-demos/demo-parent-volunteer-fixtures";

/*
 * Parent demo › Volunteer opportunities. Demo-only: fixtures plus local state,
 * no backend. Built from the parent portal Garden kit so it can move into the
 * live portal later (swap the fixtures for a model hook).
 */

type VolunteerFilter = "all" | DemoVolunteerCategory;

const FILTER_TABS: { key: VolunteerFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "classroom", label: "Classroom" },
  { key: "event", label: "School events" },
];

const CATEGORY_LABEL: Record<DemoVolunteerCategory, string> = {
  classroom: "Classroom",
  event: "School event",
};

function parseLocalDate(date: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function shortDate(date: string): string {
  return parseLocalDate(date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function longDate(date: string): string {
  return parseLocalDate(date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

function spotsLabel(filled: number, total: number): string {
  return `${filled} of ${total} spots filled`;
}

type FocusTarget = { id: string; kind: "signup" | "undo" };

function DemoParentVolunteerContent() {
  const { theme } = useParentTheme();
  const reduce = useReducedMotion() === true;
  const opportunities = useMemo(() => buildDemoParentVolunteerOpportunities(), []);
  const pastSignups = useMemo(() => buildDemoParentVolunteerPastSignups(), []);

  const [filter, setFilter] = useState<VolunteerFilter>("all");
  /** Opportunity ids the parent signed up for in this demo session, in click order. */
  const [signedIds, setSignedIds] = useState<string[]>([]);
  const [announcement, setAnnouncement] = useState("");
  const pendingFocus = useRef<FocusTarget | null>(null);
  const actionRefs = useRef(new Map<string, HTMLButtonElement>());

  // Keep keyboard focus on the row when its action swaps (Sign up ⇄ Undo).
  useEffect(() => {
    const target = pendingFocus.current;
    if (!target) return;
    pendingFocus.current = null;
    actionRefs.current.get(`${target.id}:${target.kind}`)?.focus();
  }, [signedIds]);

  const signedSet = useMemo(() => new Set(signedIds), [signedIds]);
  const visible = useMemo(
    () => opportunities.filter((o) => filter === "all" || o.category === filter),
    [opportunities, filter],
  );
  const isFull = (o: DemoVolunteerOpportunity) => o.spotsFilled >= o.spotsTotal;
  /** The page's single toy button goes on the first open row in view. */
  const primaryId = visible.find((o) => !signedSet.has(o.id) && !isFull(o))?.id ?? null;

  const newSignups = useMemo(
    () =>
      opportunities
        .filter((o) => signedSet.has(o.id))
        .sort((a, b) => a.date.localeCompare(b.date)),
    [opportunities, signedSet],
  );
  const hours = DEMO_PARENT_VOLUNTEER_STARTING_HOURS + newSignups.reduce((sum, o) => sum + o.hours, 0);
  const totalSignups = pastSignups.length + newSignups.length;

  const signUp = (o: DemoVolunteerOpportunity) => {
    setSignedIds((ids) => (ids.includes(o.id) ? ids : [...ids, o.id]));
    setAnnouncement(`You're signed up for ${o.title} on ${longDate(o.date)}.`);
    pendingFocus.current = { id: o.id, kind: "undo" };
  };

  const undo = (o: DemoVolunteerOpportunity) => {
    setSignedIds((ids) => ids.filter((id) => id !== o.id));
    setAnnouncement(`Removed your sign-up for ${o.title}.`);
    pendingFocus.current = { id: o.id, kind: "signup" };
  };

  const setActionRef = (key: string) => (el: HTMLButtonElement | null) => {
    if (el) actionRefs.current.set(key, el);
    else actionRefs.current.delete(key);
  };

  const swap = reduce
    ? { initial: false as const, animate: { opacity: 1 } }
    : {
        initial: { opacity: 0, y: 4 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.25, ease: PORTAL_EASE },
      };

  return (
    <ParentGardenFrame theme={theme}>
      <div className={PORTAL_HOME_CONTAINER_CLASS} data-testid="demo-parent-volunteer-page">
        <ParentGardenPageHeader
          kicker="Get involved"
          title={
            <>
              Volunteer <span className="text-[var(--sf-clay)]">opportunities</span>
            </>
          }
          subtitle="Lend a hand in your children's classrooms and school events."
        />

        <p className="sr-only" role="status" aria-live="polite">
          {announcement}
        </p>

        <div className="grid items-start gap-5 lg:grid-cols-[1.55fr_1fr]">
          <GCard index={1} kicker="Coming up" title="Open sign-ups" data-testid="demo-parent-volunteer-open">
            <GTabBar
              items={FILTER_TABS}
              activeKey={filter}
              onChange={(key) => setFilter(key as VolunteerFilter)}
              ariaLabel="Filter volunteer opportunities"
              className="mb-4"
            />

            <div role="tabpanel" aria-label={FILTER_TABS.find((t) => t.key === filter)?.label}>
              <ul className="flex flex-col divide-y-[1.5px] divide-dashed divide-[var(--sf-ink)]/12">
                {visible.map((o, i) => {
                  const signed = signedSet.has(o.id);
                  const filled = o.spotsFilled + (signed ? 1 : 0);
                  const full = filled >= o.spotsTotal;
                  const label = spotsLabel(filled, o.spotsTotal);
                  return (
                    <motion.li
                      key={`${filter}-${o.id}`}
                      initial={reduce ? false : { opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={reduce ? { duration: 0 } : { duration: 0.3, ease: PORTAL_EASE, delay: i * 0.04 }}
                      className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:gap-4"
                      data-testid={`demo-parent-volunteer-row-${o.id}`}
                    >
                      <div className="flex min-w-0 flex-1 items-start gap-3.5">
                        <DateStamp date={o.date} size="sm" />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <h3 className="m-0 text-[16px] font-extrabold leading-tight text-[var(--sf-ink)]">{o.title}</h3>
                            {filter === "all" ? <GChip tone="neutral">{CATEGORY_LABEL[o.category]}</GChip> : null}
                          </div>
                          <p className="m-0 mt-1 text-[13px] font-semibold text-[var(--sf-soft)]">
                            <span className="sr-only">{longDate(o.date)} · </span>
                            {o.where} · {o.time}
                          </p>
                          <div className="mt-2.5 flex items-center gap-3">
                            <GProgress value={filled} total={o.spotsTotal} label={label} done={full} className="max-w-[180px]" />
                            <span className="shrink-0 text-[12px] font-bold text-[var(--sf-ink)]/65" aria-hidden="true">
                              {label}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-3 pl-[70px] sm:pl-0">
                        {signed ? (
                          <motion.div key="signed" {...swap} className="flex flex-wrap items-center gap-3">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--sf-mint)] py-1.5 pl-1.5 pr-3 text-[13px] font-extrabold text-[var(--sf-forest)]">
                              <Tick className="h-5 w-5" color="var(--sf-forest)" fill="#fff" />
                              You&rsquo;re signed up
                            </span>
                            <button
                              ref={setActionRef(`${o.id}:undo`)}
                              type="button"
                              onClick={() => undo(o)}
                              aria-label={`Undo sign-up for ${o.title}`}
                              className={gLinkSm}
                            >
                              Undo
                            </button>
                          </motion.div>
                        ) : full ? (
                          <GChip tone="neutral">Full</GChip>
                        ) : (
                          <motion.div key="open" {...swap}>
                            <button
                              ref={setActionRef(`${o.id}:signup`)}
                              type="button"
                              onClick={() => signUp(o)}
                              aria-label={`Sign up for ${o.title}`}
                              className={o.id === primaryId ? gBtnPopSm : gBtnOutlineSm}
                              data-testid={`demo-parent-volunteer-signup-${o.id}`}
                            >
                              Sign up
                            </button>
                          </motion.div>
                        )}
                      </div>
                    </motion.li>
                  );
                })}
              </ul>
            </div>
          </GCard>

          <div className="flex flex-col gap-5">
            <GCard index={2} kicker="Your sign-ups" title="On your calendar" data-testid="demo-parent-volunteer-mine">
              <div className="mb-3 flex flex-wrap gap-2">
                <GChip tone="success">Signed up · {totalSignups}</GChip>
              </div>
              <ul className="sf-paper -mx-1 flex flex-col rounded-xl px-1">
                <AnimatePresence initial={false}>
                  {newSignups.map((o) => (
                    <motion.li
                      key={o.id}
                      initial={reduce ? false : { opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, ease: PORTAL_EASE }}
                      className="overflow-hidden"
                    >
                      <SignupRow title={o.title} meta={`${shortDate(o.date)} · ${o.time}`} />
                    </motion.li>
                  ))}
                </AnimatePresence>
                {pastSignups.map((p) => (
                  <li key={p.id}>
                    <SignupRow title={p.title} meta={p.meta} />
                  </li>
                ))}
              </ul>
            </GCard>

            <GCard
              index={3}
              kicker="This school year"
              className="overflow-hidden"
              bodyClassName="-mx-5 -mb-5 sm:-mx-6 sm:-mb-6"
              data-testid="demo-parent-volunteer-hours"
            >
              <div className="border-t-[1.5px] border-[var(--sf-ink)]/10">
                <GStatTile value={hours} label="Your hours this year" accent />
              </div>
            </GCard>
          </div>
        </div>
      </div>
    </ParentGardenFrame>
  );
}

function SignupRow({ title, meta }: { title: string; meta: string }) {
  return (
    <div className="flex min-h-[52px] items-center gap-3 rounded-lg px-2 py-2">
      <Tick className="h-6 w-6" color="var(--sf-forest)" fill="var(--sf-mint)" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-extrabold text-[var(--sf-ink)]">{title}</span>
        <span className="block truncate text-xs font-semibold text-[var(--sf-soft)]">{meta}</span>
      </span>
    </div>
  );
}

export default function DemoParentVolunteerPage() {
  return (
    <DemoSchoolParentStoryProvider>
      <DemoParentVolunteerContent />
    </DemoSchoolParentStoryProvider>
  );
}
