"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { CalendarDays, ChevronRight, ClipboardCheck, Megaphone, Sprout } from "lucide-react";
import StudentPhoto from "@/components/students/StudentPhoto";
import ParentChip from "@/components/school-parent/ui/ParentChip";
import ParentButtonLink from "@/components/school-parent/ui/ParentButtonLink";
import ParentTextLink from "@/components/school-parent/ui/ParentTextLink";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import PortalHomeSchoolBulletinLauncher from "@/components/portal-home/PortalHomeSchoolBulletinLauncher";
import PortalHomeSchoolUpdatesCard from "@/components/portal-home/PortalHomeSchoolUpdatesCard";
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
import type { ParentPortalAttentionItem } from "@/lib/parent-portal/parent-home-attention";
import type { FamilyChildOverview } from "@/lib/admissions/parent-portal-access";
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
  HomeLabProgressRing,
  HomeLabTick,
  QuickLinkGrid,
  SPRING,
  SPRINGY,
  ToyLink,
  eventWhenLabel,
  fadeProps,
  inViewProps,
  ringVars,
  useCelebrate,
} from "./home-lab-ui";

/* ------------------------------------------------------------------ */
/* Variant A — "Today, one thing at a time"                            */
/* One clear next step, the rest as a calm checklist, a useful rail.  */
/* ------------------------------------------------------------------ */

function AttentionIcon({
  item,
  theme,
  large = false,
}: {
  item: ParentPortalAttentionItem;
  theme: ParentThemeTokens;
  large?: boolean;
}) {
  const props = parentPortalAttentionIcon(item);
  if (props.iconIncludesWrapper) return <>{props.icon}</>;
  const bg = item.urgent ? `${theme.alert}1f` : (props.iconBg ?? item.iconBg ?? theme.primarySoft);
  return (
    <span
      className={`flex shrink-0 items-center justify-center ${large ? "h-14 w-14 rounded-[18px] [&_svg]:h-6 [&_svg]:w-6" : "h-10 w-10 rounded-[13px]"}`}
      style={{ backgroundColor: bg }}
      aria-hidden="true"
    >
      {props.icon}
    </span>
  );
}

function TodoRow({
  item,
  theme,
  index,
}: {
  item: ParentPortalAttentionItem;
  theme: ParentThemeTokens;
  index: number;
}) {
  const reduce = useReducedMotion() === true;
  const body = (
    <>
      <AttentionIcon item={item} theme={theme} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <strong className="block truncate text-[14.5px] font-semibold" style={{ color: theme.ink }}>
            {item.title}
          </strong>
          {item.urgent ? (
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: theme.alert }}
              aria-label="Needs action"
            />
          ) : null}
        </span>
        {item.subtitle ? (
          <span className="mt-0.5 block truncate text-xs" style={{ color: theme.muted }}>
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
  const cls = `group flex items-center gap-3.5 rounded-[16px] px-3 py-3 ${SPRINGY} ${FOCUS}`;
  return (
    <motion.li
      initial={reduce ? false : { opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.35 + index * 0.06, duration: 0.35 }}
    >
      {item.href ? (
        <Link
          href={item.href}
          className={`${cls} hover:bg-[var(--lift)]`}
          style={ringVars(theme)}
        >
          {body}
        </Link>
      ) : (
        <div className={cls}>{body}</div>
      )}
    </motion.li>
  );
}

function NextUpCard({
  model,
  props,
}: {
  model: ParentHomeModel;
  props: ParentHomeVariantProps;
}) {
  const { theme } = model;
  const onboardingItems = props.onboardingItems ?? [];
  const contentDeferred = props.contentDeferred ?? false;
  const [lead, ...rest] = model.attentionItems;
  const onboardingAllDone =
    onboardingItems.length === 0 || onboardingItems.every((item) => item.completed);
  const caughtUp = !contentDeferred && !lead && onboardingAllDone;
  useCelebrate(caughtUp, theme);

  return (
    <div
      className="relative h-full overflow-hidden rounded-[28px] border p-6 sm:p-8"
      style={{
        backgroundColor: theme.white,
        borderColor: theme.line,
        boxShadow: "0 1px 0 rgba(40,57,67,0.04), 0 18px 40px -28px rgba(40,57,67,0.35)",
        backgroundImage: `radial-gradient(120% 80% at 100% 0%, ${theme.primarySoft} 0%, transparent 55%)`,
      }}
    >
      {contentDeferred ? (
        <>
          <ParentSectionKicker theme={theme}>Next up</ParentSectionKicker>
          <ParentHomeStartHereSkeleton theme={theme} />
        </>
      ) : lead ? (
        <>
          <div className="flex items-center justify-between gap-3">
            <ParentSectionKicker theme={theme} className="!mb-0">
              Next up
            </ParentSectionKicker>
            <span
              className="rounded-full px-2.5 py-1 text-[11px] font-extrabold"
              style={{ backgroundColor: theme.paper, color: theme.muted }}
            >
              {model.attentionItems.length} thing
              {model.attentionItems.length === 1 ? "" : "s"} need your attention
            </span>
          </div>

          <div className="mt-5 flex items-start gap-4">
            <AttentionIcon item={lead} theme={theme} large />
            <div className="min-w-0">
              <h2
                className="m-0 text-[clamp(1.35rem,2.6vw,1.75rem)] font-semibold leading-tight tracking-[-0.03em]"
                style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
              >
                {lead.title}
              </h2>
              {lead.subtitle ? (
                <p className="mt-1.5 text-[15px]" style={{ color: theme.muted }}>
                  {lead.subtitle}
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            {lead.href ? (
              <ToyLink theme={theme} href={lead.href}>
                Start now
              </ToyLink>
            ) : (
              <ParentTextLink theme={theme} onClick={model.openTodos}>
                Review today&apos;s to-dos
              </ParentTextLink>
            )}
          </div>

          {rest.length > 0 ? (
            <div className="mt-7 border-t border-dashed pt-5" style={{ borderColor: theme.line }}>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: theme.muted }}>
                Also on your list
              </p>
              <ul className="-mx-3 flex flex-col">
                {rest.slice(0, 4).map((item, index) => (
                  <TodoRow key={item.key} item={item} theme={theme} index={index} />
                ))}
              </ul>
            </div>
          ) : null}

          <SetupFooter model={model} />
        </>
      ) : onboardingItems.length > 0 && !onboardingAllDone ? (
        <>
          <ParentSectionKicker theme={theme}>Next up</ParentSectionKicker>
          <div className="mt-3 flex items-start gap-4">
            <span
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px]"
              style={{ backgroundColor: theme.primarySoft }}
              aria-hidden="true"
            >
              <ClipboardCheck className="h-6 w-6" style={{ color: theme.primary }} />
            </span>
            <div>
              <h2
                className="m-0 text-[clamp(1.35rem,2.6vw,1.75rem)] font-semibold leading-tight tracking-[-0.03em]"
                style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
              >
                Finish setting up your account
              </h2>
              <p className="mt-1.5 text-[15px]" style={{ color: theme.muted }}>
                A few quick steps to get the most from your portal
              </p>
            </div>
          </div>
          <SetupFooter model={model} />
        </>
      ) : (
        <div className="flex flex-col items-center py-6 text-center sm:py-10">
          <motion.span
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={SPRING}
            className="flex h-20 w-20 items-center justify-center rounded-full"
            style={{ backgroundColor: theme.successBg }}
          >
            <HomeLabTick color={theme.success} size={40} strokeWidth={2.6} delay={0.25} />
          </motion.span>
          <h2
            className="mt-5 text-[clamp(1.5rem,3vw,2rem)] font-semibold tracking-[-0.03em]"
            style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
          >
            You&apos;re all caught up
          </h2>
          <p className="mt-2 max-w-sm text-[15px]" style={{ color: theme.muted }}>
            No urgent tasks right now. Check back for updates from school.
          </p>
          <HomeLabHand color={theme.primary} className="mt-4 -rotate-2">
            enjoy the quiet ✿
          </HomeLabHand>
        </div>
      )}
    </div>
  );
}

function SetupFooter({ model }: { model: ParentHomeModel }) {
  const { theme } = model;
  if (!model.showTodosLink && model.onboardingTotal === 0) return null;
  return (
    <div
      className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-[18px] px-4 py-3"
      style={{ backgroundColor: theme.paper }}
    >
      {model.onboardingTotal > 0 ? (
        <div className="flex items-center gap-3">
          <HomeLabProgressRing
            done={model.onboardingDone}
            total={model.onboardingTotal}
            color={theme.primary}
            track={theme.line}
            size={44}
          >
            <span className="text-[11px] font-extrabold" style={{ color: theme.ink }}>
              {model.onboardingDone}/{model.onboardingTotal}
            </span>
          </HomeLabProgressRing>
          <div>
            <p className="m-0 text-[13px] font-bold" style={{ color: theme.ink }}>
              Account setup
            </p>
            <p className="m-0 text-xs" style={{ color: theme.muted }}>
              {model.onboardingDone} of {model.onboardingTotal} complete
            </p>
          </div>
        </div>
      ) : (
        <span />
      )}
      {model.showTodosLink ? (
        <ParentTextLink theme={theme} onClick={model.openTodos}>
          Review today&apos;s to-dos
        </ParentTextLink>
      ) : null}
    </div>
  );
}

function ComingUpCard({
  model,
  events,
}: {
  model: ParentHomeModel;
  events: NonNullable<ParentHomeVariantProps["upcomingEvents"]>;
}) {
  const { theme } = model;
  return (
    <section
      aria-labelledby="home-a-events"
      className="rounded-[24px] border p-5"
      style={{ backgroundColor: theme.white, borderColor: theme.line }}
    >
      <div className="flex items-center justify-between">
        <h2
          id="home-a-events"
          className="m-0 text-[11px] font-bold uppercase tracking-[0.12em]"
          style={{ color: "#759077" }}
        >
          Upcoming events
        </h2>
        <CalendarDays className="h-4 w-4" style={{ color: theme.primary }} aria-hidden="true" />
      </div>
      {events.length > 0 ? (
        <ul className="mt-3 flex flex-col gap-2.5">
          {events.slice(0, 3).map((event) => (
            <li key={event.id} className="flex items-center gap-3">
              <EventDateTile theme={theme} event={event} size="sm" />
              <div className="min-w-0">
                <b className="block truncate text-[13.5px]" style={{ color: theme.ink }}>
                  {event.title}
                </b>
                <span className="block truncate text-xs" style={{ color: theme.muted }}>
                  {eventWhenLabel(event)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-[13px]" style={{ color: theme.muted }}>
          No upcoming events right now.
        </p>
      )}
      <div className="mt-4">
        <ParentTextLink theme={theme} href={model.calendarHref}>
          View family calendar
        </ParentTextLink>
      </div>
    </section>
  );
}

function BulletinCard({
  model,
  props,
}: {
  model: ParentHomeModel;
  props: ParentHomeVariantProps;
}) {
  const { theme } = model;
  const posts = props.bulletinPosts ?? [];
  const latest = posts[0];
  return (
    <PortalHomeSchoolBulletinLauncher
      theme={theme}
      bulletinEnabled={props.bulletinEnabled ?? false}
      bulletinPosts={posts}
      renderTrigger={(open) => (
        <motion.button
          type="button"
          onClick={open}
          whileHover={{ y: -2 }}
          transition={SPRING}
          className={`group flex w-full items-center gap-3.5 rounded-[24px] border p-4 text-left ${FOCUS}`}
          style={{
            ...ringVars(theme),
            backgroundColor: theme.infoBg,
            borderColor: `${theme.info}33`,
          }}
        >
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]"
            style={{ backgroundColor: theme.info }}
            aria-hidden="true"
          >
            <Megaphone className="h-5 w-5 text-white" />
          </span>
          <span className="min-w-0 flex-1">
            <b className="block text-[14px]" style={{ color: theme.ink }}>
              School Bulletin
            </b>
            {latest ? (
              <span className="block truncate text-xs" style={{ color: theme.muted }}>
                {latest.title}
              </span>
            ) : null}
          </span>
          <ChevronRight
            className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1"
            style={{ color: theme.info }}
            aria-hidden="true"
          />
        </motion.button>
      )}
    />
  );
}

function ChildCard({
  child,
  index,
  model,
  props,
}: {
  child: FamilyChildOverview;
  index: number;
  model: ParentHomeModel;
  props: ParentHomeVariantProps;
}) {
  const { theme, adminCompat } = model;
  const reduce = useReducedMotion() === true;
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
    <motion.li
      {...fadeProps(index + 3, reduce)}
      whileHover={reduce ? undefined : { y: -4 }}
      className="flex h-full flex-col rounded-[24px] border p-5 transition-shadow duration-300 hover:shadow-[0_22px_40px_-26px_rgba(40,57,67,0.45)]"
      style={{ backgroundColor: theme.white, borderColor: theme.line }}
    >
      <div className="flex items-start gap-3.5">
        <div
          className="shrink-0 overflow-hidden rounded-[20px]"
          style={{ backgroundColor: childAccentBg(index) }}
        >
          <StudentPhoto
            name={child.studentName}
            photoUrl={child.profilePhotoUrl}
            size="xl"
            shape="square"
            theme={adminCompat}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3
              className="m-0 text-xl font-semibold tracking-[-0.02em]"
              style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
            >
              {first}
            </h3>
            <ParentChip
              theme={theme}
              tone={child.isEnrolled ? "success" : "info"}
              className="!shrink-0 !normal-case !tracking-normal"
            >
              ● {child.statusLabel}
            </ParentChip>
          </div>
          <p className="m-0 mt-1 text-xs leading-relaxed" style={{ color: theme.muted }}>
            {childMetaLine(child)}
          </p>
        </div>
      </div>

      {progress && progress.total > 0 ? (
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="font-semibold" style={{ color: theme.ink }}>
              Enrollment checklist
            </span>
            <span className="flex items-center gap-1 font-bold" style={{ color: complete ? theme.success : theme.muted }}>
              {complete ? <HomeLabTick color={theme.success} size={14} delay={0.6} /> : null}
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

      <div className="mt-auto flex flex-col gap-2 pt-5">
        <ParentButtonLink
          theme={theme}
          href={childDetailsHref(props.schoolSlug, child.applicationId, props.previewBasePath)}
          variant="outline"
          showArrow
        >
          See {first}&apos;s details
        </ParentButtonLink>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {showEnrollmentLink ? (
            <ParentTextLink
              theme={theme}
              href={childApplicationHref(props.schoolSlug, child, props.previewBasePath)}
            >
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
    </motion.li>
  );
}

export default function ParentHomeVariantToday(props: ParentHomeVariantProps) {
  const model = useParentHomeModel(props);
  const { theme } = model;
  const reduce = useReducedMotion() === true;
  const {
    familyChildren,
    contentDeferred = false,
    quickActions,
    upcomingEvents = [],
    formSnapshot = null,
    featureAnnouncements = [],
    coopModeEnabled = false,
    bulletinEnabled = false,
    bulletinPosts = [],
    programPortalLabel,
  } = props;

  return (
    <div className="min-h-full w-full" style={{ backgroundColor: theme.paper, ...DOT_GRID }}>
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
            {model.greetingPrefix}, {model.name}.{" "}
            <motion.span
              aria-hidden="true"
              className="inline-block origin-bottom"
              initial={reduce ? false : { rotate: -20, scale: 0.6 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ ...SPRING, delay: 0.25 }}
            >
              {model.greetingEmoji}
            </motion.span>
          </ParentDisplayHeading>
          <p className="mt-2 text-[15px]" style={{ color: theme.muted }}>
            Here&apos;s what your family needs for {model.todayLabel}.
          </p>
        </motion.header>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.6fr_1fr]">
          <motion.div {...fadeProps(1, reduce)}>
            <NextUpCard model={model} props={props} />
          </motion.div>

          <motion.aside {...fadeProps(2, reduce)} className="flex flex-col gap-4">
            <ComingUpCard model={model} events={upcomingEvents} />
            <BulletinCard model={model} props={props} />
            {quickActions.length > 0 ? (
              <section aria-labelledby="home-a-jump">
                <h2
                  id="home-a-jump"
                  className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.12em]"
                  style={{ color: "#759077" }}
                >
                  Jump to
                </h2>
                <QuickLinkGrid theme={theme} actions={quickActions} />
              </section>
            ) : null}
          </motion.aside>
        </div>

        {coopModeEnabled && !bulletinEnabled && model.messagesHref ? (
          <PortalHomeSchoolUpdatesCard
            theme={theme}
            bulletinEnabled={false}
            bulletinPosts={bulletinPosts}
            messagesHref={model.messagesHref}
            messagesPromo={{
              title: "Messages from teachers and staff",
              subtitle: "Check your inbox for school communications.",
            }}
          />
        ) : null}

        <section aria-labelledby="home-a-children">
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <h2
              id="home-a-children"
              className="m-0 text-2xl font-semibold tracking-[-0.03em]"
              style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
            >
              Your children
            </h2>
          </div>
          {contentDeferred ? (
            <ParentHomeChildCardsSkeleton theme={theme} />
          ) : familyChildren.length === 0 ? (
            <ParentCard theme={theme}>
              <p className="text-sm leading-relaxed" style={{ color: theme.muted }}>
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
            </ParentCard>
          ) : (
            <ul className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
              {familyChildren.map((child, index) => (
                <ChildCard
                  key={child.applicationId}
                  child={child}
                  index={index}
                  model={model}
                  props={props}
                />
              ))}
            </ul>
          )}
        </section>

        {formSnapshot ? (
          <motion.section {...inViewProps(reduce)}>
            <ParentHomeFormsSnapshotSection theme={theme} snapshot={formSnapshot} />
          </motion.section>
        ) : contentDeferred && model.formsFeatureEnabled ? (
          <ParentHomeFormsSnapshotSkeleton theme={theme} />
        ) : null}

        <HomeLabProgramSections model={model} props={props} />

        {featureAnnouncements.length > 0 ? (
          <motion.section {...inViewProps(reduce)}>
            <ParentHomeFeatureAnnouncementsSection theme={theme} announcements={featureAnnouncements} />
          </motion.section>
        ) : null}

        {model.howToGuides.length > 0 ? (
          <motion.section {...inViewProps(reduce)}>
            <ParentHomeHowToGuidesSection
              theme={theme}
              documentationHref={model.documentationHref}
              groupedGuides={model.groupedHowToGuides}
              onOpenGuide={model.openGuide}
            />
          </motion.section>
        ) : null}
      </div>

      <HomeLabOverlays model={model} onboardingItems={props.onboardingItems} />
    </div>
  );
}
