"use client";

import Link from "next/link";
import StudentPhoto from "@/components/students/StudentPhoto";
import { useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle,
  ClipboardCheck,
  Clock,
} from "lucide-react";
import type {
  FamilyChildOverview,
  FamilyUserProfile,
} from "@/lib/admissions/parent-portal-access";
import { applicationStatusBadgeStyle } from "@/lib/admissions/application-status-ui";
import type { ParentQuickAction } from "@/lib/organization-settings/parent-home";
import { getFeatureIcon } from "@/lib/organization-settings/icon-registry";
import { getParentFeatureIconStyle } from "@/lib/organization-settings/parent-feature-icon-styles";
import type { ResolvedParentOnboardingItem } from "@/lib/organization-settings/parent-onboarding";
import {
  buildAdminThemeTokens,
  type AdminThemeTokens,
} from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { schoolParentPath } from "@/lib/organization-settings/parent-routes";
import {
  SCHOOL_EVENT_TYPE_CHIP_STYLE,
  SCHOOL_EVENT_TYPE_LABELS,
} from "@/lib/school-events/event-labels";
import type { OrganizationEvent } from "@/lib/school-events/types";
import { parseEventDate } from "@/lib/committees/calendar-utils";
import ParentOnboardingSidebar from "@/components/school-parent/ParentOnboardingSidebar";

type ParentHomePageProps = {
  branding: OrganizationBranding;
  schoolSlug: string;
  userProfile: FamilyUserProfile;
  familyChildren: FamilyChildOverview[];
  quickActions: ParentQuickAction[];
  onboardingItems?: ResolvedParentOnboardingItem[];
  upcomingEvents?: OrganizationEvent[];
  previewMode?: boolean;
  previewBasePath?: string;
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.06,
      duration: 0.35,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  }),
};

function firstName(displayName: string): string {
  const part = displayName.trim().split(/\s+/).filter(Boolean)[0];
  return part ?? displayName;
}

function greetingPrefix(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function quickActionStyle(iconSlug: string) {
  return getParentFeatureIconStyle(iconSlug);
}

function childApplicationHref(
  schoolSlug: string,
  child: FamilyChildOverview,
  previewBasePath?: string,
): string {
  if (previewBasePath) {
    if (child.isEnrolled || child.status === "enrolling") {
      return `${previewBasePath}/apply/${child.applicationId}/enrollment`;
    }
    return `${previewBasePath}/apply/${child.applicationId}`;
  }
  if (child.isEnrolled || child.status === "enrolling") {
    return `/school/${schoolSlug}/apply/${child.applicationId}/enrollment`;
  }
  return `/school/${schoolSlug}/apply/${child.applicationId}`;
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-heading text-base font-semibold text-gray-800">
      {children}
    </h2>
  );
}

function ChildProfileCard({
  child,
  schoolSlug,
  C,
  index,
  previewBasePath,
}: {
  child: FamilyChildOverview;
  schoolSlug: string;
  C: AdminThemeTokens;
  index: number;
  previewBasePath?: string;
}) {
  const badgeStyle = applicationStatusBadgeStyle(child.status, C);
  const childFirstName = child.studentName.split(" ")[0];
  const href = childApplicationHref(schoolSlug, child, previewBasePath);

  return (
    <motion.div custom={index + 2} initial="hidden" animate="visible" variants={fadeUp}>
      <Link
        href={href}
        className="group flex items-center gap-4 rounded-2xl border bg-white p-4 transition-all duration-200 hover:-translate-y-0.5"
        style={{
          borderColor: C.border,
          boxShadow: C.shadowCard,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = `${C.accent}55`;
          e.currentTarget.style.boxShadow = C.shadowMedium;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = C.border;
          e.currentTarget.style.boxShadow = C.shadowCard;
        }}
      >
        <StudentPhoto
          name={child.studentName}
          photoUrl={child.profilePhotoUrl}
          size="xl"
          shape="square"
          theme={C}
          className="transition-transform duration-200 group-hover:scale-105"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-heading text-sm font-semibold text-gray-800">
            {childFirstName}
          </p>
          <p className="mt-0.5 text-xs" style={{ color: C.textTertiary }}>
            {child.grade ? `Grade ${child.grade}` : "Grade not listed"}
          </p>
          <p
            className="mt-2 flex items-center gap-1 text-xs font-medium"
            style={{ color: C.accent }}
          >
            View details
            <ArrowRight className="h-3 w-3" />
          </p>
        </div>
        <span
          className="inline-flex flex-shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
          style={{
            backgroundColor: badgeStyle.backgroundColor,
            color: badgeStyle.color,
          }}
        >
          {child.isEnrolled ? (
            <CheckCircle className="h-2.5 w-2.5" />
          ) : (
            <Clock className="h-2.5 w-2.5" />
          )}
          {child.statusLabel}
        </span>
      </Link>
    </motion.div>
  );
}

export default function ParentHomePage({
  branding,
  schoolSlug,
  userProfile,
  familyChildren,
  quickActions,
  onboardingItems = [],
  upcomingEvents = [],
  previewMode = false,
  previewBasePath,
}: ParentHomePageProps) {
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const name = firstName(userProfile.displayName);
  const calendarHref = previewBasePath
    ? `${previewBasePath}/parent/calendar`
    : schoolParentPath(schoolSlug, "calendar");
  const applyDashboardHref =
    previewBasePath ?? `/school/${schoolSlug}/apply`;
  const visibleQuickActions = quickActions;
  const trackedOnboardingItems = onboardingItems.filter((item) => item.autoTracked);
  const completedOnboardingCount = trackedOnboardingItems.filter(
    (item) => item.completed,
  ).length;
  const onboardingSubtitle =
    trackedOnboardingItems.length > 0
      ? completedOnboardingCount === trackedOnboardingItems.length
        ? "You're all set"
        : `${completedOnboardingCount} of ${trackedOnboardingItems.length} complete`
      : "Finish setting up your account";

  return (
    <div
      className="min-h-full w-full"
      style={{ backgroundColor: C.bg }}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-8">
        <motion.header
          custom={0}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="space-y-3"
        >
          <p className="text-sm" style={{ color: C.textSecondary }}>
            {greetingPrefix()},
          </p>
          <h1
            className="font-heading text-4xl font-bold leading-tight sm:text-5xl"
            style={{ color: C.accentDark }}
          >
            {name}.
          </h1>
        </motion.header>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_340px] lg:items-stretch">
          <div className="flex flex-col gap-8">
            <motion.section
              custom={1}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="space-y-4"
            >
              <SectionTitle>My Children</SectionTitle>
              {familyChildren.length === 0 ? (
                <div
                  className="rounded-2xl border px-6 py-10 text-center"
                  style={{
                    borderColor: C.border,
                    backgroundColor: C.surface,
                    boxShadow: C.shadowCard,
                  }}
                >
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: C.textSecondary }}
                  >
                    We don&apos;t have any student records from your applications
                    yet. Visit your{" "}
                    <Link
                      href={applyDashboardHref}
                      className="font-medium underline underline-offset-2"
                      style={{ color: C.accent }}
                    >
                      application dashboard
                    </Link>{" "}
                    to get started.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {familyChildren.map((child, index) => (
                    <ChildProfileCard
                      key={child.applicationId}
                      child={child}
                      schoolSlug={schoolSlug}
                      C={C}
                      index={index}
                      previewBasePath={previewBasePath}
                    />
                  ))}
                </div>
              )}
            </motion.section>

            {visibleQuickActions.length > 0 ? (
              <motion.section
                custom={familyChildren.length + 2}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="space-y-4"
              >
                <SectionTitle>Quick Actions</SectionTitle>
                <div className="-mx-1 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
                  {visibleQuickActions.map((action, index) => {
                    const { iconBg, iconColor } = quickActionStyle(
                      action.iconSlug,
                    );
                    const Icon = getFeatureIcon(action.iconSlug);
                    const chipStyle = {
                      borderColor: C.border,
                      boxShadow: C.shadowCard,
                    };
                    const chipContent = (
                      <>
                        <div
                          className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${action.enabled ? "transition-transform duration-200 group-hover:scale-110" : ""} ${iconBg}`}
                        >
                          <Icon
                            className={`h-4 w-4 ${iconColor}`}
                            style={
                              iconColor ? undefined : { color: C.accent }
                            }
                            strokeWidth={1.5}
                          />
                        </div>
                        <span className="whitespace-nowrap text-sm font-semibold text-gray-700">
                          {action.label}
                        </span>
                      </>
                    );

                    return (
                      <motion.div
                        key={action.key}
                        custom={index}
                        initial="hidden"
                        animate="visible"
                        variants={fadeUp}
                        className="flex-shrink-0"
                      >
                        {action.enabled ? (
                          <motion.div whileTap={{ scale: 0.98 }}>
                            <Link
                              href={action.href}
                              className="group flex items-center gap-2.5 rounded-2xl border bg-white px-4 py-3 transition-colors duration-200 hover:bg-gray-50/80"
                              style={chipStyle}
                            >
                              {chipContent}
                            </Link>
                          </motion.div>
                        ) : (
                          <div
                            aria-disabled="true"
                            className="flex cursor-not-allowed items-center gap-2.5 rounded-2xl border bg-white px-4 py-3 opacity-50"
                            style={chipStyle}
                          >
                            {chipContent}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.section>
            ) : null}
          </div>

          <div className="flex flex-col gap-8 lg:sticky lg:top-[65px] lg:self-start">
            {onboardingItems.length > 0 ? (
              <motion.section
                custom={2}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="space-y-4"
              >
                <SectionTitle>Get started</SectionTitle>
                <button
                  type="button"
                  onClick={() => setOnboardingOpen(true)}
                  className="flex w-full items-center gap-3 rounded-2xl border px-4 py-4 text-left transition-all duration-200 hover:shadow-md cursor-pointer"
                  style={{
                    backgroundColor: `${C.accent}1a`,
                    borderColor: `${C.accent}33`,
                    boxShadow: C.shadowCard,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${C.accent}55`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = `${C.accent}33`;
                  }}
                >
                  <div
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${C.accent}26` }}
                  >
                    <ClipboardCheck
                      className="h-4 w-4"
                      style={{ color: C.accent }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-sm font-semibold leading-snug"
                      style={{ color: C.accent }}
                    >
                      Complete your onboarding
                    </p>
                    <p
                      className="mt-0.5 text-xs"
                      style={{ color: `${C.accent}b3` }}
                    >
                      {onboardingSubtitle}
                    </p>
                  </div>
                  <ArrowRight
                    className="h-4 w-4 flex-shrink-0"
                    style={{ color: `${C.accent}99` }}
                  />
                </button>
              </motion.section>
            ) : null}

            <motion.section
              custom={3}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="space-y-4"
            >
              <div className="flex items-center justify-between gap-3">
                <SectionTitle>Upcoming events</SectionTitle>
                {upcomingEvents.length > 0 ? (
                  <Link
                    href={calendarHref}
                    className="text-xs font-medium"
                    style={{ color: C.accent }}
                  >
                    View calendar
                  </Link>
                ) : null}
              </div>
              {upcomingEvents.length === 0 ? (
                <div
                  className="rounded-2xl border px-4 py-8 text-center"
                  style={{
                    borderColor: C.border,
                    backgroundColor: C.surface,
                    boxShadow: C.shadowCard,
                  }}
                >
                  <div
                    className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full"
                    style={{ backgroundColor: C.accentGlow }}
                  >
                    <CalendarDays
                      className="h-5 w-5"
                      style={{ color: C.accent }}
                    />
                  </div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: C.textPrimary }}
                  >
                    No events for now
                  </p>
                  <p className="mt-1 text-xs" style={{ color: C.textTertiary }}>
                    School events will show up here.
                  </p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {upcomingEvents.map((event) => {
                    const colors = SCHOOL_EVENT_TYPE_CHIP_STYLE[event.type];
                    const dateLabel = parseEventDate(event.date).toLocaleDateString(
                      "en-US",
                      { weekday: "short", month: "short", day: "numeric" },
                    );
                    return (
                      <li key={event.id}>
                        <Link
                          href={calendarHref}
                          className="flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition-colors hover:bg-black/[0.02]"
                          style={{
                            borderColor: C.border,
                            backgroundColor: C.surface,
                            boxShadow: C.shadowCard,
                          }}
                        >
                          <div className="min-w-0">
                            <p
                              className="truncate text-sm font-medium"
                              style={{ color: C.textPrimary }}
                            >
                              {event.title}
                            </p>
                            <p className="mt-0.5 text-xs" style={{ color: C.textTertiary }}>
                              {dateLabel}
                              {!event.isAllDay && event.time ? ` · ${event.time}` : ""}
                            </p>
                          </div>
                          <span
                            className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
                            style={{ backgroundColor: colors.bg, color: colors.text }}
                          >
                            {SCHOOL_EVENT_TYPE_LABELS[event.type]}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </motion.section>
          </div>
        </div>
      </div>

      <ParentOnboardingSidebar
        C={C}
        open={onboardingOpen}
        items={onboardingItems}
        onClose={() => setOnboardingOpen(false)}
      />
    </div>
  );
}
