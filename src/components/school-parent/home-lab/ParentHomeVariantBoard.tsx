"use client";

import Link from "next/link";
import { useMemo, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, BookOpen, ChevronRight, FileText, Megaphone, Sprout } from "lucide-react";
import StudentPhoto from "@/components/students/StudentPhoto";
import ParentChip from "@/components/school-parent/ui/ParentChip";
import ParentTextLink from "@/components/school-parent/ui/ParentTextLink";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import PortalHomeSchoolBulletinLauncher from "@/components/portal-home/PortalHomeSchoolBulletinLauncher";
import ParentHomeFeatureAnnouncementsSection from "@/components/school-parent/home/ParentHomeFeatureAnnouncementsSection";
import {
  ParentHomeChildCardsSkeleton,
  ParentHomeFormsSnapshotSkeleton,
  ParentHomeStartHereSkeleton,
} from "@/components/school-parent/home/ParentHomeDeferredSkeleton";
import { parentPortalAttentionIcon } from "@/components/school-parent/parent-portal-attention-icons";
import {
  childIsolatedPortalHref,
  childIsolatedPortalLabel,
  programPortalChildrenEmptyMessage,
} from "@/components/school-parent/children/parent-children-utils";
import { parseEventDate } from "@/lib/committees/calendar-utils";
import { childAccentBg } from "@/lib/organization-settings/parent-theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { FamilyChildOverview } from "@/lib/admissions/parent-portal-access";
import type { OrganizationEvent } from "@/lib/school-events/types";
import { PORTAL_HOME_CONTAINER_CLASS } from "@/lib/portal-home/layout";
import {
  childApplicationHref,
  childDetailsHref,
  childMetaLine,
  useParentHomeModel,
  type ParentHomeModel,
  type ParentHomeVariantProps,
} from "./useParentHomeModel";
import {
  DOT_GRID,
  EventDateTile,
  FOCUS,
  HomeLabBar,
  HomeLabHand,
  HomeLabOverlays,
  HomeLabProgramSections,
  HomeLabTick,
  QuickLinkGrid,
  SPRING,
  SPRINGY,
  eventWhenLabel,
  fadeProps,
  inViewProps,
  ringVars,
  useCelebrate,
} from "./home-lab-ui";

/* ------------------------------------------------------------------ */
/* Variant B — "Family bulletin board"                                 */
/* An at-a-glance bento: every tile is one clear job.                  */
/* ------------------------------------------------------------------ */

const TILE_LIFT = `hover:-translate-y-1 hover:shadow-[0_26px_46px_-30px_rgba(40,57,67,0.55)] ${SPRINGY}`;

function Tile({
  theme,
  className = "",
  children,
  index,
  tint,
  labelledBy,
}: {
  theme: ParentThemeTokens;
  className?: string;
  children: ReactNode;
  index: number;
  tint?: string;
  labelledBy?: string;
}) {
  const reduce = useReducedMotion() === true;
  return (
    <motion.section
      {...fadeProps(index, reduce)}
      aria-labelledby={labelledBy}
      className={`relative flex flex-col overflow-hidden rounded-[26px] border p-5 sm:p-6 ${TILE_LIFT} ${className}`}
      style={{
        backgroundColor: tint ?? theme.white,
        borderColor: theme.line,
        boxShadow: "0 1px 0 rgba(40,57,67,0.04)",
      }}
    >
      {children}
    </motion.section>
  );
}

function TileLabel({
  id,
  children,
  icon,
  theme,
}: {
  id: string;
  children: ReactNode;
  icon?: ReactNode;
  theme: ParentThemeTokens;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <h2
        id={id}
        className="m-0 text-[11px] font-bold uppercase tracking-[0.12em]"
        style={{ color: "#759077" }}
      >
        {children}
      </h2>
      {icon ? (
        <span style={{ color: theme.primary }} aria-hidden="true">
          {icon}
        </span>
      ) : null}
    </div>
  );
}

function NeedsYouTile({ model, props }: { model: ParentHomeModel; props: ParentHomeVariantProps }) {
  const { theme } = model;
  const items = model.attentionItems;
  const onboardingItems = props.onboardingItems ?? [];
  const deferred = props.contentDeferred ?? false;
  const caughtUp =
    !deferred && items.length === 0 && onboardingItems.every((item) => item.completed);
  useCelebrate(caughtUp, theme);

  return (
    <Tile
      theme={theme}
      index={1}
      labelledBy="home-b-needs"
      className="lg:col-span-7 lg:row-span-2"
      tint={theme.cream}
    >
      <TileLabel id="home-b-needs" theme={theme}>
        Start here
      </TileLabel>
      {deferred ? (
        <ParentHomeStartHereSkeleton theme={theme} />
      ) : items.length > 0 ? (
        <>
          <div className="flex items-end gap-3">
            <span
              className="text-[clamp(3.5rem,7vw,5rem)] font-semibold leading-[0.85] tracking-[-0.05em]"
              style={{ color: theme.primary, fontFamily: theme.fontDisplay }}
            >
              {items.length}
            </span>
            <p
              className="m-0 pb-1.5 text-lg font-semibold leading-tight"
              style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
            >
              thing{items.length === 1 ? "" : "s"} need
              <br />
              your attention
            </p>
          </div>
          <ul className="mt-5 flex flex-col gap-2">
            {items.slice(0, 4).map((item) => {
              const icon = parentPortalAttentionIcon(item);
              const iconNode = icon.iconIncludesWrapper ? (
                icon.icon
              ) : (
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px]"
                  style={{
                    backgroundColor: item.urgent
                      ? `${theme.alert}1f`
                      : (icon.iconBg ?? item.iconBg ?? theme.primarySoft),
                  }}
                  aria-hidden="true"
                >
                  {icon.icon}
                </span>
              );
              const row = (
                <>
                  {iconNode}
                  <span className="min-w-0 flex-1">
                    <b className="block truncate text-[14px] font-semibold" style={{ color: theme.ink }}>
                      {item.title}
                    </b>
                    {item.subtitle ? (
                      <span className="block truncate text-xs" style={{ color: theme.muted }}>
                        {item.subtitle}
                      </span>
                    ) : null}
                  </span>
                  {item.href ? (
                    <ChevronRight
                      className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1"
                      style={{ color: theme.muted }}
                      aria-hidden="true"
                    />
                  ) : null}
                </>
              );
              const rowClass = `group flex items-center gap-3 rounded-[16px] border px-3 py-2.5 ${SPRINGY} ${FOCUS}`;
              const rowStyle = {
                ...ringVars(theme),
                backgroundColor: item.urgent ? theme.alertBg : theme.white,
                borderColor: item.urgent ? `${theme.alert}33` : theme.line,
              };
              return (
                <li key={item.key}>
                  {item.href ? (
                    <Link href={item.href} className={`${rowClass} hover:-translate-y-0.5`} style={rowStyle}>
                      {row}
                    </Link>
                  ) : (
                    <div className={rowClass} style={rowStyle}>
                      {row}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          {model.showTodosLink ? (
            <div className="mt-auto pt-5">
              <ParentTextLink theme={theme} onClick={model.openTodos}>
                Review today&apos;s to-dos
              </ParentTextLink>
            </div>
          ) : null}
        </>
      ) : !caughtUp ? (
        <>
          <p className="m-0 text-xl font-semibold" style={{ color: theme.ink, fontFamily: theme.fontDisplay }}>
            Finish setting up your account
          </p>
          <p className="mt-1 text-sm" style={{ color: theme.muted }}>
            A few quick steps to get the most from your portal
          </p>
          <div className="mt-4">
            <ParentTextLink theme={theme} onClick={model.openTodos}>
              Review today&apos;s to-dos
            </ParentTextLink>
          </div>
        </>
      ) : (
        <div className="flex flex-1 flex-col items-start justify-center gap-3 py-4">
          <span
            className="flex h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: theme.successBg }}
          >
            <HomeLabTick color={theme.success} size={32} delay={0.2} />
          </span>
          <p
            className="m-0 text-2xl font-semibold tracking-[-0.03em]"
            style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
          >
            You&apos;re all caught up
          </p>
          <p className="m-0 text-sm" style={{ color: theme.muted }}>
            No urgent tasks right now. Check back for updates from school.
          </p>
          <HomeLabHand color={theme.primary} className="-rotate-2">
            enjoy the quiet ✿
          </HomeLabHand>
        </div>
      )}
    </Tile>
  );
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function WeekTile({
  model,
  events,
}: {
  model: ParentHomeModel;
  events: OrganizationEvent[];
}) {
  const { theme } = model;
  const reduce = useReducedMotion() === true;
  const days = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, []);
  const eventDays = useMemo(
    () => new Set(events.map((event) => dayKey(parseEventDate(event.date)))),
    [events],
  );
  const next = events[0];

  return (
    <Tile theme={theme} index={2} labelledBy="home-b-week" className="lg:col-span-5">
      <TileLabel id="home-b-week" theme={theme}>
        Upcoming events
      </TileLabel>
      <ol className="grid grid-cols-7 gap-1" aria-label="The next seven days">
        {days.map((d, i) => {
          const today = i === 0;
          const has = eventDays.has(dayKey(d));
          return (
            <motion.li
              key={d.toISOString()}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.04, ...SPRING }}
              className="flex flex-col items-center gap-1 rounded-[12px] py-2"
              style={{
                backgroundColor: today ? theme.primary : "transparent",
                color: today ? theme.white : theme.ink,
              }}
              aria-label={`${d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}${has ? ", has an event" : ""}`}
            >
              <span
                className="text-[10px] font-bold uppercase"
                style={{ color: today ? theme.white : theme.muted }}
                aria-hidden="true"
              >
                {d.toLocaleDateString("en-US", { weekday: "narrow" })}
              </span>
              <span className="text-[15px] font-semibold leading-none" aria-hidden="true">
                {d.getDate()}
              </span>
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  backgroundColor: has ? (today ? theme.white : theme.primary) : "transparent",
                }}
                aria-hidden="true"
              />
            </motion.li>
          );
        })}
      </ol>
      <div className="mt-4 border-t pt-4" style={{ borderColor: theme.line }}>
        {next ? (
          <div className="flex items-center gap-3">
            <EventDateTile theme={theme} event={next} size="sm" />
            <div className="min-w-0">
              <b className="block truncate text-[13.5px]" style={{ color: theme.ink }}>
                {next.title}
              </b>
              <span className="block truncate text-xs" style={{ color: theme.muted }}>
                {eventWhenLabel(next)}
              </span>
            </div>
          </div>
        ) : (
          <p className="m-0 text-[13px]" style={{ color: theme.muted }}>
            No upcoming events right now.
          </p>
        )}
        <div className="mt-3">
          <ParentTextLink theme={theme} href={model.calendarHref}>
            View family calendar
          </ParentTextLink>
        </div>
      </div>
    </Tile>
  );
}

function BulletinTile({ model, props }: { model: ParentHomeModel; props: ParentHomeVariantProps }) {
  const { theme } = model;
  const posts = props.bulletinPosts ?? [];
  const reduce = useReducedMotion() === true;
  return (
    <PortalHomeSchoolBulletinLauncher
      theme={theme}
      bulletinEnabled={props.bulletinEnabled ?? false}
      bulletinPosts={posts}
      renderTrigger={(open) => (
        <motion.button
          type="button"
          onClick={open}
          {...fadeProps(3, reduce)}
          className={`group relative flex flex-col overflow-hidden rounded-[26px] border p-5 text-left sm:p-6 lg:col-span-5 ${TILE_LIFT} ${FOCUS}`}
          style={{ ...ringVars(theme), backgroundColor: theme.infoBg, borderColor: `${theme.info}33` }}
        >
          <div className="flex items-center justify-between">
            <span
              className="flex h-11 w-11 items-center justify-center rounded-[14px]"
              style={{ backgroundColor: theme.info }}
              aria-hidden="true"
            >
              <Megaphone className="h-5 w-5 text-white" />
            </span>
            <ArrowUpRight
              className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              style={{ color: theme.info }}
              aria-hidden="true"
            />
          </div>
          <span
            className="mt-4 block text-xl font-semibold tracking-[-0.02em]"
            style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
          >
            School Bulletin
          </span>
          {posts[0] ? (
            <span className="mt-1 line-clamp-2 block text-[13px]" style={{ color: theme.muted }}>
              {posts[0].title}
            </span>
          ) : null}
        </motion.button>
      )}
    />
  );
}

function ChildTile({
  child,
  index,
  model,
  props,
  span,
}: {
  child: FamilyChildOverview;
  index: number;
  model: ParentHomeModel;
  props: ParentHomeVariantProps;
  span: string;
}) {
  const { theme, adminCompat } = model;
  const first = child.studentName.split(" ")[0];
  const progress = child.checklistProgress;
  const complete = progress ? progress.completed >= progress.total : false;
  const showEnrollmentLink = child.isEnrolled || child.status === "enrolling";
  const isolatedHref = childIsolatedPortalHref(
    props.schoolSlug,
    child,
    props.previewBasePath ? `${props.previewBasePath}/parent` : undefined,
  );
  const isolatedLabel = childIsolatedPortalLabel(child);
  const detailsHref = childDetailsHref(props.schoolSlug, child.applicationId, props.previewBasePath);

  return (
    <Tile theme={theme} index={4 + index} className={`!p-0 ${span}`}>
      <div className="h-16" style={{ backgroundColor: childAccentBg(index) }} aria-hidden="true" />
      <div className="-mt-10 flex flex-1 flex-col px-5 pb-5 sm:px-6 sm:pb-6">
        <div className="flex items-end justify-between gap-2">
          <div className="overflow-hidden rounded-[20px] ring-4 ring-white" style={{ backgroundColor: childAccentBg(index) }}>
            <StudentPhoto
              name={child.studentName}
              photoUrl={child.profilePhotoUrl}
              size="xl"
              shape="square"
              theme={adminCompat}
            />
          </div>
          <ParentChip
            theme={theme}
            tone={child.isEnrolled ? "success" : "info"}
            className="!normal-case !tracking-normal"
          >
            ● {child.statusLabel}
          </ParentChip>
        </div>
        <h3
          className="mt-3 text-xl font-semibold tracking-[-0.02em]"
          style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
        >
          <Link
            href={detailsHref}
            className={`rounded-md after:absolute after:inset-0 after:content-[''] ${FOCUS}`}
            style={ringVars(theme)}
          >
            {first}
          </Link>
        </h3>
        <p className="m-0 mt-0.5 text-xs leading-relaxed" style={{ color: theme.muted }}>
          {childMetaLine(child)}
        </p>
        {progress && progress.total > 0 ? (
          <div className="mt-4">
            <div className="mb-1.5 flex justify-between text-[11px] font-bold" style={{ color: theme.muted }}>
              <span>Enrollment checklist</span>
              <span style={{ color: complete ? theme.success : theme.muted }}>
                {progress.completed} of {progress.total} complete
              </span>
            </div>
            <HomeLabBar
              value={progress.completed}
              total={progress.total}
              color={complete ? theme.success : theme.primary}
              track={theme.paper}
              label={`${first}'s enrollment checklist`}
            />
          </div>
        ) : null}
        <div className="relative z-10 mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-4">
          <ParentTextLink theme={theme} href={detailsHref}>
            See {first}&apos;s details
          </ParentTextLink>
          {showEnrollmentLink ? (
            <ParentTextLink theme={theme} href={childApplicationHref(props.schoolSlug, child, props.previewBasePath)}>
              Enrollment checklist
            </ParentTextLink>
          ) : null}
          {isolatedHref && isolatedLabel ? (
            <ParentTextLink theme={theme} href={isolatedHref}>
              Open {isolatedLabel} portal
            </ParentTextLink>
          ) : null}
        </div>
      </div>
    </Tile>
  );
}

function FormsTile({ model, props }: { model: ParentHomeModel; props: ParentHomeVariantProps }) {
  const { theme } = model;
  const snapshot = props.formSnapshot;
  if (!snapshot) {
    return props.contentDeferred && model.formsFeatureEnabled ? (
      <div className="lg:col-span-7">
        <ParentHomeFormsSnapshotSkeleton theme={theme} />
      </div>
    ) : null;
  }
  const { needsAction, signed } = snapshot.counts;
  const total = Math.max(1, needsAction + signed);
  return (
    <Tile theme={theme} index={7} labelledBy="home-b-forms" className="lg:col-span-7">
      <TileLabel id="home-b-forms" theme={theme} icon={<FileText className="h-4 w-4" />}>
        Forms &amp; documents
      </TileLabel>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: theme.paper }} aria-hidden="true">
        <span style={{ width: `${(needsAction / total) * 100}%`, backgroundColor: theme.warning }} />
        <span style={{ width: `${(signed / total) * 100}%`, backgroundColor: theme.success }} />
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {needsAction > 0 ? (
          <ParentChip theme={theme} tone="warning">
            Needs action · {needsAction}
          </ParentChip>
        ) : null}
        {signed > 0 ? (
          <ParentChip theme={theme} tone="success">
            Signed · {signed}
          </ParentChip>
        ) : null}
      </div>
      <ul className="mt-3 flex flex-col">
        {snapshot.items.slice(0, 3).map((item) => (
          <li key={item.formId} className="border-t first:border-t-0" style={{ borderColor: theme.line }}>
            <Link
              href={item.formsHref}
              data-testid={`parent-home-form-card-${item.formId}`}
              className={`group flex items-center justify-between gap-3 rounded-md py-2.5 ${FOCUS}`}
              style={ringVars(theme)}
            >
              <span className="min-w-0">
                <b className="block truncate text-[13.5px]" style={{ color: theme.ink }}>
                  {item.formTitle}
                </b>
                {item.studentNames.length > 0 ? (
                  <span className="block truncate text-xs" style={{ color: theme.muted }}>
                    {item.studentNames.join(", ")}
                  </span>
                ) : null}
              </span>
              {item.listStatus === "signed" ? (
                <HomeLabTick color={theme.success} size={16} />
              ) : (
                <ChevronRight
                  className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1"
                  style={{ color: theme.muted }}
                  aria-hidden="true"
                />
              )}
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-3">
        <ParentTextLink theme={theme} href={snapshot.formsPageHref}>
          View all forms
        </ParentTextLink>
      </div>
    </Tile>
  );
}

export default function ParentHomeVariantBoard(props: ParentHomeVariantProps) {
  const model = useParentHomeModel(props);
  const { theme } = model;
  const reduce = useReducedMotion() === true;
  const {
    familyChildren,
    contentDeferred = false,
    quickActions,
    upcomingEvents = [],
    featureAnnouncements = [],
    coopModeEnabled = false,
    programPortalLabel,
  } = props;

  const childSpan =
    familyChildren.length === 1
      ? "lg:col-span-12"
      : familyChildren.length === 2
        ? "lg:col-span-6"
        : "lg:col-span-4";

  const glance = [
    !contentDeferred && model.attentionItems.length > 0
      ? `${model.attentionItems.length} to-do${model.attentionItems.length === 1 ? "" : "s"}`
      : null,
    upcomingEvents.length > 0
      ? `${upcomingEvents.length} upcoming event${upcomingEvents.length === 1 ? "" : "s"}`
      : null,
    !contentDeferred && familyChildren.length > 0
      ? `${familyChildren.length} child${familyChildren.length === 1 ? "" : "ren"}`
      : null,
  ].filter(Boolean) as string[];

  return (
    <div className="min-h-full w-full" style={{ backgroundColor: theme.paper, ...DOT_GRID }}>
      <div className={PORTAL_HOME_CONTAINER_CLASS}>
        <motion.header
          {...fadeProps(0, reduce)}
          className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <div className="mb-2 flex items-center gap-2">
              <ParentSectionKicker theme={theme} className="!mb-0">
                {model.familyLabel}
              </ParentSectionKicker>
              {coopModeEnabled && programPortalLabel ? (
                <Sprout
                  className="h-4 w-4"
                  style={{ color: theme.primary }}
                  aria-label={`Co-op mode · ${programPortalLabel}`}
                />
              ) : null}
            </div>
            <ParentDisplayHeading theme={theme} as="h1">
              {model.greetingPrefix}, {model.name}. <span aria-hidden="true">{model.greetingEmoji}</span>
            </ParentDisplayHeading>
            <p className="mt-2 text-[15px]" style={{ color: theme.muted }}>
              Here&apos;s what your family needs for {model.todayLabel}.
            </p>
          </div>
          {glance.length > 0 ? (
            <ul className="flex flex-wrap gap-2" aria-label="At a glance">
              {glance.map((label, i) => (
                <motion.li
                  key={label}
                  initial={reduce ? false : { scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ ...SPRING, delay: 0.3 + i * 0.08 }}
                  className="rounded-full border px-3 py-1.5 text-xs font-bold"
                  style={{ backgroundColor: theme.white, borderColor: theme.line, color: theme.ink }}
                >
                  {label}
                </motion.li>
              ))}
            </ul>
          ) : null}
        </motion.header>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
          <NeedsYouTile model={model} props={props} />
          <WeekTile model={model} events={upcomingEvents} />
          <BulletinTile model={model} props={props} />
        </div>

        <section aria-labelledby="home-b-children">
          <h2
            id="home-b-children"
            className="mb-4 text-2xl font-semibold tracking-[-0.03em]"
            style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
          >
            Your children
          </h2>
          {contentDeferred ? (
            <ParentHomeChildCardsSkeleton theme={theme} />
          ) : familyChildren.length === 0 ? (
            <div className="rounded-[26px] border p-6" style={{ backgroundColor: theme.white, borderColor: theme.line }}>
              <p className="m-0 text-sm leading-relaxed" style={{ color: theme.muted }}>
                {programPortalLabel ? (
                  programPortalChildrenEmptyMessage(programPortalLabel)
                ) : (
                  <>
                    We don&apos;t have any student records from your applications yet. Visit your{" "}
                    <Link href={model.applyDashboardHref} className="font-bold" style={{ color: theme.primary }}>
                      application dashboard
                    </Link>{" "}
                    to get started.
                  </>
                )}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-12 lg:gap-5">
              {familyChildren.map((child, index) => (
                <ChildTile
                  key={child.applicationId}
                  child={child}
                  index={index}
                  model={model}
                  props={props}
                  span={childSpan}
                />
              ))}
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
          <FormsTile model={model} props={props} />
          {quickActions.length > 0 ? (
            <Tile
              theme={theme}
              index={8}
              labelledBy="home-b-jump"
              className={props.formSnapshot || (contentDeferred && model.formsFeatureEnabled) ? "lg:col-span-5" : "lg:col-span-12"}
            >
              <TileLabel id="home-b-jump" theme={theme}>
                Jump to
              </TileLabel>
              <QuickLinkGrid
                theme={theme}
                actions={quickActions}
                max={props.formSnapshot ? 6 : 8}
                columns={props.formSnapshot ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4"}
              />
            </Tile>
          ) : null}
        </div>

        {model.howToGuides.length > 0 ? (
          <motion.section
            {...inViewProps(reduce)}
            aria-labelledby="home-b-guides"
            className="rounded-[26px] border p-5 sm:p-6"
            style={{ backgroundColor: theme.white, borderColor: theme.line }}
          >
            <TileLabel id="home-b-guides" theme={theme} icon={<BookOpen className="h-4 w-4" />}>
              How-to guides
            </TileLabel>
            <ul className="flex flex-wrap gap-2">
              {model.howToGuides.slice(0, 10).map((guide) => (
                <li key={guide.id}>
                  <motion.button
                    type="button"
                    onClick={() => model.openGuide(guide)}
                    whileHover={reduce ? undefined : { y: -2 }}
                    whileTap={reduce ? undefined : { scale: 0.97 }}
                    transition={SPRING}
                    className={`rounded-full border px-3.5 py-2 text-[12.5px] font-semibold ${FOCUS}`}
                    style={{ ...ringVars(theme), backgroundColor: theme.paper, borderColor: theme.line, color: theme.ink }}
                  >
                    {guide.title}
                  </motion.button>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <ParentTextLink theme={theme} href={model.documentationHref}>
                View full how-to guides
              </ParentTextLink>
            </div>
          </motion.section>
        ) : null}

        <HomeLabProgramSections model={model} props={props} />

        {featureAnnouncements.length > 0 ? (
          <motion.section {...inViewProps(reduce)}>
            <ParentHomeFeatureAnnouncementsSection theme={theme} announcements={featureAnnouncements} />
          </motion.section>
        ) : null}
      </div>

      <HomeLabOverlays model={model} onboardingItems={props.onboardingItems} />
    </div>
  );
}
