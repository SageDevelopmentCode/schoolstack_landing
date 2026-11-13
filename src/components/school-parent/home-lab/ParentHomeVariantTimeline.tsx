"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  BookOpen,
  CalendarDays,
  ChevronRight,
  FileText,
  Megaphone,
  MessageSquare,
  Sparkles,
  Sprout,
  Users,
} from "lucide-react";
import StudentPhoto from "@/components/students/StudentPhoto";
import ParentChip from "@/components/school-parent/ui/ParentChip";
import ParentTextLink from "@/components/school-parent/ui/ParentTextLink";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import PortalHomeSchoolBulletinLauncher from "@/components/portal-home/PortalHomeSchoolBulletinLauncher";
import ParentHomeFormsSnapshotSection from "@/components/school-parent/home/ParentHomeFormsSnapshotSection";
import ParentHomeFeatureAnnouncementsSection from "@/components/school-parent/home/ParentHomeFeatureAnnouncementsSection";
import ParentHomeHowToGuidesSection from "@/components/school-parent/home/ParentHomeHowToGuidesSection";
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
import { childAccentBg } from "@/lib/organization-settings/parent-theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
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
  EASE,
  EventDateTile,
  FOCUS,
  HomeLabBar,
  HomeLabHand,
  HomeLabOverlays,
  HomeLabProgramSections,
  HomeLabProgressRing,
  HomeLabTick,
  SPRING,
  SPRINGY,
  eventWhenLabel,
  fadeProps,
  inViewProps,
  ringVars,
  useCelebrate,
} from "./home-lab-ui";

/* ------------------------------------------------------------------ */
/* Variant C — "Your family's day"                                     */
/* One calm story, top to bottom, with a sticky map of where you are.  */
/* ------------------------------------------------------------------ */

type StopId = "now" | "week" | "children" | "forms" | "school" | "help";

type Stop = {
  id: StopId;
  label: string;
  icon: ReactNode;
  count?: number;
};

const anchor = (id: StopId) => `home-c-${id}`;

function StopNav({
  stops,
  active,
  theme,
}: {
  stops: Stop[];
  active: StopId;
  theme: ParentThemeTokens;
}) {
  const reduce = useReducedMotion() === true;
  return (
    <nav
      aria-label="Sections on this page"
      className="sticky top-0 z-20 -mx-5 px-5 py-3 sm:-mx-10 sm:px-10 md:-mx-12 md:px-12"
      style={{
        backgroundColor: `${theme.paper}e6`,
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      <ul className="flex gap-1.5 overflow-x-auto [scrollbar-width:none]">
        {stops.map((stop) => {
          const isActive = stop.id === active;
          return (
            <li key={stop.id} className="shrink-0">
              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById(anchor(stop.id))
                    ?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" })
                }
                aria-current={isActive ? "true" : undefined}
                className={`relative flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-bold ${FOCUS}`}
                style={{ ...ringVars(theme), color: isActive ? theme.white : theme.ink }}
              >
                {isActive ? (
                  <motion.span
                    layoutId="home-c-stop-pill"
                    className="absolute inset-0 rounded-full"
                    style={{ backgroundColor: theme.primary }}
                    transition={reduce ? { duration: 0 } : SPRING}
                    aria-hidden="true"
                  />
                ) : null}
                <span className="relative">{stop.label}</span>
                {stop.count ? (
                  <span
                    className="relative rounded-full px-1.5 text-[11px] font-extrabold"
                    style={{
                      backgroundColor: isActive ? "rgba(255,255,255,0.25)" : theme.primarySoft,
                      color: isActive ? theme.white : theme.primary,
                    }}
                  >
                    {stop.count}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** A stop on the timeline: node on the spine + its content. */
function TimelineStop({
  stop,
  theme,
  last,
  children,
}: {
  stop: Stop;
  theme: ParentThemeTokens;
  last: boolean;
  children: ReactNode;
}) {
  const reduce = useReducedMotion() === true;
  return (
    <li
      id={anchor(stop.id)}
      className="relative grid scroll-mt-20 grid-cols-[36px_1fr] gap-3 pb-10 sm:grid-cols-[52px_1fr] sm:gap-5 sm:pb-14"
      aria-labelledby={`${anchor(stop.id)}-title`}
    >
      <div className="relative flex justify-center" aria-hidden="true">
        {!last ? (
          <>
            <span
              className="absolute bottom-0 top-11 w-[2px] rounded-full sm:top-14"
              style={{ backgroundColor: theme.line }}
            />
            <motion.span
              className="absolute bottom-0 top-11 w-[2px] origin-top rounded-full sm:top-14"
              style={{ backgroundColor: theme.primary }}
              initial={reduce ? false : { scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, margin: "-30% 0px -30% 0px" }}
              transition={{ duration: 0.9, ease: EASE }}
            />
          </>
        ) : null}
        <motion.span
          className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 sm:h-12 sm:w-12 [&_svg]:h-4 [&_svg]:w-4 sm:[&_svg]:h-5 sm:[&_svg]:w-5"
          style={{ backgroundColor: theme.white, borderColor: theme.primary, color: theme.primary }}
          initial={reduce ? false : { scale: 0.5, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={SPRING}
        >
          {stop.icon}
        </motion.span>
      </div>
      <motion.div {...inViewProps(reduce)} className="min-w-0 pt-1 sm:pt-2.5">
        <h2
          id={`${anchor(stop.id)}-title`}
          className="m-0 mb-4 text-[clamp(1.35rem,2.4vw,1.65rem)] font-semibold tracking-[-0.03em]"
          style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
        >
          {stop.label}
        </h2>
        {children}
      </motion.div>
    </li>
  );
}

function NowStop({ model, props }: { model: ParentHomeModel; props: ParentHomeVariantProps }) {
  const { theme } = model;
  const deferred = props.contentDeferred ?? false;
  const onboardingItems = props.onboardingItems ?? [];
  const items = model.attentionItems;
  const caughtUp = !deferred && items.length === 0 && onboardingItems.every((i) => i.completed);
  useCelebrate(caughtUp, theme);

  if (deferred) return <ParentHomeStartHereSkeleton theme={theme} />;

  if (caughtUp) {
    return (
      <div
        className="flex items-center gap-4 rounded-[22px] border p-5"
        style={{ backgroundColor: theme.white, borderColor: theme.line }}
      >
        <span
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: theme.successBg }}
        >
          <HomeLabTick color={theme.success} size={28} delay={0.2} />
        </span>
        <div>
          <p className="m-0 text-lg font-semibold" style={{ color: theme.ink, fontFamily: theme.fontDisplay }}>
            You&apos;re all caught up
          </p>
          <p className="m-0 text-sm" style={{ color: theme.muted }}>
            No urgent tasks right now. Check back for updates from school.
          </p>
          <HomeLabHand color={theme.primary} className="mt-2 -rotate-1 !text-lg">
            enjoy the quiet ✿
          </HomeLabHand>
        </div>
      </div>
    );
  }

  return (
    <>
      {items.length > 0 ? (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {items.slice(0, 6).map((item, index) => {
            const icon = parentPortalAttentionIcon(item);
            const iconNode = icon.iconIncludesWrapper ? (
              icon.icon
            ) : (
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px]"
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
            const body = (
              <>
                {iconNode}
                <span className="min-w-0 flex-1">
                  <b className="block text-[14.5px] font-semibold leading-snug" style={{ color: theme.ink }}>
                    {item.title}
                  </b>
                  {item.subtitle ? (
                    <span className="mt-0.5 block text-xs leading-relaxed" style={{ color: theme.muted }}>
                      {item.subtitle}
                    </span>
                  ) : null}
                </span>
                {item.href ? (
                  <ChevronRight
                    className="mt-0.5 h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1"
                    style={{ color: theme.muted }}
                    aria-hidden="true"
                  />
                ) : null}
              </>
            );
            const cls = `group flex h-full items-start gap-3.5 rounded-[20px] border p-4 ${SPRINGY} ${FOCUS}`;
            const style = {
              ...ringVars(theme),
              backgroundColor: item.urgent ? theme.alertBg : theme.white,
              borderColor: item.urgent ? `${theme.alert}33` : theme.line,
            };
            return (
              <motion.li
                key={item.key}
                initial={false}
                whileHover={{ y: -3 }}
                transition={{ ...SPRING, delay: index * 0.02 }}
              >
                {item.href ? (
                  <Link href={item.href} className={`${cls} hover:shadow-[0_18px_34px_-24px_rgba(40,57,67,0.5)]`} style={style}>
                    {body}
                  </Link>
                ) : (
                  <div className={cls} style={style}>
                    {body}
                  </div>
                )}
              </motion.li>
            );
          })}
        </ul>
      ) : (
        <p className="m-0 text-base font-semibold" style={{ color: theme.ink }}>
          Finish setting up your account
        </p>
      )}
      {model.showTodosLink || model.onboardingTotal > 0 ? (
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
          {model.onboardingTotal > 0 ? (
            <div className="flex items-center gap-2.5">
              <HomeLabProgressRing
                done={model.onboardingDone}
                total={model.onboardingTotal}
                color={theme.primary}
                track={theme.line}
                size={34}
              />
              <span className="text-xs font-bold" style={{ color: theme.muted }}>
                Account setup · {model.onboardingDone} of {model.onboardingTotal} complete
              </span>
            </div>
          ) : null}
          {model.showTodosLink ? (
            <ParentTextLink theme={theme} onClick={model.openTodos}>
              Review today&apos;s to-dos
            </ParentTextLink>
          ) : null}
        </div>
      ) : null}
    </>
  );
}

function WeekStop({ model, props }: { model: ParentHomeModel; props: ParentHomeVariantProps }) {
  const { theme } = model;
  const events = props.upcomingEvents ?? [];
  return (
    <>
      {events.length > 0 ? (
        <ul className="flex flex-col gap-2.5">
          {events.map((event) => (
            <li
              key={event.id}
              className="flex items-center gap-4 rounded-[20px] border p-3.5"
              style={{ backgroundColor: theme.white, borderColor: theme.line }}
            >
              <EventDateTile theme={theme} event={event} />
              <div className="min-w-0">
                <b className="block text-[15px]" style={{ color: theme.ink }}>
                  {event.title}
                </b>
                <span className="block text-xs" style={{ color: theme.muted }}>
                  {eventWhenLabel(event)}
                  {event.location ? ` · ${event.location}` : ""}
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="m-0 text-sm" style={{ color: theme.muted }}>
          No upcoming events right now.
        </p>
      )}
      <div className="mt-3">
        <ParentTextLink theme={theme} href={model.calendarHref}>
          View family calendar
        </ParentTextLink>
      </div>
    </>
  );
}

function ChildrenStop({ model, props }: { model: ParentHomeModel; props: ParentHomeVariantProps }) {
  const { theme, adminCompat } = model;
  const { familyChildren, contentDeferred = false, programPortalLabel } = props;
  if (contentDeferred) return <ParentHomeChildCardsSkeleton theme={theme} />;
  if (familyChildren.length === 0) {
    return (
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
    );
  }
  return (
    <ul className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2 [scroll-padding-inline:0.25rem] md:grid md:grid-cols-2 md:overflow-visible xl:grid-cols-3">
      {familyChildren.map((child, index) => {
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
        return (
          <li
            key={child.applicationId}
            className="flex w-[82%] shrink-0 snap-start flex-col rounded-[22px] border p-4 md:w-auto"
            style={{ backgroundColor: theme.white, borderColor: theme.line }}
          >
            <div className="flex items-center gap-3">
              <div className="shrink-0 overflow-hidden rounded-[16px]" style={{ backgroundColor: childAccentBg(index) }}>
                <StudentPhoto
                  name={child.studentName}
                  photoUrl={child.profilePhotoUrl}
                  size="lg"
                  shape="square"
                  theme={adminCompat}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3
                    className="m-0 text-lg font-semibold"
                    style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
                  >
                    {first}
                  </h3>
                  <ParentChip theme={theme} tone={child.isEnrolled ? "success" : "info"} className="!normal-case !tracking-normal">
                    ● {child.statusLabel}
                  </ParentChip>
                </div>
                <p className="m-0 truncate text-xs" style={{ color: theme.muted }}>
                  {childMetaLine(child)}
                </p>
              </div>
            </div>
            {progress && progress.total > 0 ? (
              <div className="mt-3.5">
                <div className="mb-1 flex justify-between text-[11px] font-bold" style={{ color: theme.muted }}>
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
            <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-3.5">
              <ParentTextLink theme={theme} href={childDetailsHref(props.schoolSlug, child.applicationId, props.previewBasePath)}>
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
          </li>
        );
      })}
    </ul>
  );
}

function SchoolStop({ model, props }: { model: ParentHomeModel; props: ParentHomeVariantProps }) {
  const { theme } = model;
  const posts = props.bulletinPosts ?? [];
  const announcements = props.featureAnnouncements ?? [];
  const cardCls = `group flex w-full items-center gap-3.5 rounded-[20px] border p-4 text-left hover:-translate-y-0.5 ${SPRINGY} ${FOCUS}`;
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <PortalHomeSchoolBulletinLauncher
          theme={theme}
          bulletinEnabled={props.bulletinEnabled ?? false}
          bulletinPosts={posts}
          renderTrigger={(open) => (
            <button
              type="button"
              onClick={open}
              className={cardCls}
              style={{ ...ringVars(theme), backgroundColor: theme.infoBg, borderColor: `${theme.info}33` }}
            >
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]"
                style={{ backgroundColor: theme.info }}
                aria-hidden="true"
              >
                <Megaphone className="h-5 w-5 text-white" />
              </span>
              <span className="min-w-0 flex-1">
                <b className="block text-[14.5px]" style={{ color: theme.ink }}>
                  School Bulletin
                </b>
                {posts[0] ? (
                  <span className="block truncate text-xs" style={{ color: theme.muted }}>
                    {posts[0].title}
                  </span>
                ) : null}
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1" style={{ color: theme.info }} aria-hidden="true" />
            </button>
          )}
        />
        {model.messagesHref ? (
          <Link
            href={model.messagesHref}
            className={cardCls}
            style={{ ...ringVars(theme), backgroundColor: theme.white, borderColor: theme.line }}
          >
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]"
              style={{ backgroundColor: theme.primarySoft }}
              aria-hidden="true"
            >
              <MessageSquare className="h-5 w-5" style={{ color: theme.primary }} />
            </span>
            <span className="min-w-0 flex-1">
              <b className="block text-[14.5px]" style={{ color: theme.ink }}>
                Messages from teachers and staff
              </b>
              <span className="block truncate text-xs" style={{ color: theme.muted }}>
                Check your inbox for school communications.
              </span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1" style={{ color: theme.muted }} aria-hidden="true" />
          </Link>
        ) : null}
      </div>
      {announcements.length > 0 ? (
        <ParentHomeFeatureAnnouncementsSection theme={theme} announcements={announcements} />
      ) : null}
      <HomeLabProgramSections model={model} props={props} />
    </div>
  );
}

export default function ParentHomeVariantTimeline(props: ParentHomeVariantProps) {
  const model = useParentHomeModel(props);
  const { theme } = model;
  const reduce = useReducedMotion() === true;
  const {
    familyChildren,
    contentDeferred = false,
    upcomingEvents = [],
    formSnapshot = null,
    coopModeEnabled = false,
    programPortalLabel,
  } = props;

  const showForms = Boolean(formSnapshot) || (contentDeferred && model.formsFeatureEnabled);

  const stops = useMemo<Stop[]>(() => {
    const list: Stop[] = [
      {
        id: "now",
        label: "Now",
        icon: <Sparkles />,
        count: contentDeferred ? undefined : model.attentionItems.length || undefined,
      },
      { id: "week", label: "Coming up", icon: <CalendarDays />, count: upcomingEvents.length || undefined },
      {
        id: "children",
        label: "Your children",
        icon: <Users />,
        count: contentDeferred ? undefined : familyChildren.length || undefined,
      },
    ];
    if (showForms) {
      list.push({
        id: "forms",
        label: "Forms",
        icon: <FileText />,
        count: formSnapshot?.counts.needsAction || undefined,
      });
    }
    list.push({ id: "school", label: "From school", icon: <Megaphone /> });
    if (model.howToGuides.length > 0) {
      list.push({ id: "help", label: "Help", icon: <BookOpen /> });
    }
    return list;
  }, [
    contentDeferred,
    model.attentionItems.length,
    upcomingEvents.length,
    familyChildren.length,
    showForms,
    formSnapshot,
    model.howToGuides.length,
  ]);

  const [active, setActive] = useState<StopId>("now");
  useEffect(() => {
    const els = stops
      .map((s) => document.getElementById(anchor(s.id)))
      .filter((el): el is HTMLElement => Boolean(el));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        const top = visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        setActive(top.target.id.replace("home-c-", "") as StopId);
      },
      { rootMargin: "-25% 0px -65% 0px" },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [stops]);

  return (
    <div className="min-h-full w-full" style={{ backgroundColor: theme.paper }}>
      <div className={PORTAL_HOME_CONTAINER_CLASS}>
        <motion.header {...fadeProps(0, reduce)}>
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
        </motion.header>

        <div className="-mt-2">
          <StopNav stops={stops} active={active} theme={theme} />
          <ol className="mt-6 max-w-[980px]">
            {stops.map((stop, i) => (
              <TimelineStop key={stop.id} stop={stop} theme={theme} last={i === stops.length - 1}>
                {stop.id === "now" ? (
                  <NowStop model={model} props={props} />
                ) : stop.id === "week" ? (
                  <WeekStop model={model} props={props} />
                ) : stop.id === "children" ? (
                  <ChildrenStop model={model} props={props} />
                ) : stop.id === "forms" ? (
                  formSnapshot ? (
                    <ParentHomeFormsSnapshotSection theme={theme} snapshot={formSnapshot} />
                  ) : (
                    <ParentHomeFormsSnapshotSkeleton theme={theme} />
                  )
                ) : stop.id === "school" ? (
                  <SchoolStop model={model} props={props} />
                ) : (
                  <ParentHomeHowToGuidesSection
                    theme={theme}
                    documentationHref={model.documentationHref}
                    groupedGuides={model.groupedHowToGuides}
                    onOpenGuide={model.openGuide}
                  />
                )}
              </TimelineStop>
            ))}
          </ol>
        </div>
      </div>

      <HomeLabOverlays model={model} onboardingItems={props.onboardingItems} />
    </div>
  );
}
