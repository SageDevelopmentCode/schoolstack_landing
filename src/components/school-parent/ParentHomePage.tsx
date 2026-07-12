"use client";

import Link from "next/link";
import { useMemo, type ReactNode } from "react";
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
import {
  buildAdminThemeTokens,
  type AdminThemeTokens,
} from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type ParentHomePageProps = {
  branding: OrganizationBranding;
  schoolSlug: string;
  userProfile: FamilyUserProfile;
  children: FamilyChildOverview[];
  quickActions: ParentQuickAction[];
};

const QUICK_ACTION_STYLES: Record<
  string,
  { iconBg: string; iconColor: string }
> = {
  "dollar-sign": { iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
  "message-square": { iconBg: "bg-blue-100", iconColor: "text-blue-600" },
  "calendar-days": { iconBg: "bg-violet-100", iconColor: "text-violet-600" },
  "clipboard-list": { iconBg: "bg-amber-100", iconColor: "text-amber-600" },
  megaphone: { iconBg: "bg-sky-100", iconColor: "text-sky-600" },
  users: { iconBg: "bg-rose-100", iconColor: "text-rose-600" },
  heart: { iconBg: "bg-pink-100", iconColor: "text-pink-600" },
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

function studentInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return "?";
}

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
  return (
    QUICK_ACTION_STYLES[iconSlug] ?? {
      iconBg: "bg-gray-100",
      iconColor: "",
    }
  );
}

function childApplicationHref(
  schoolSlug: string,
  child: FamilyChildOverview,
): string {
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
}: {
  child: FamilyChildOverview;
  schoolSlug: string;
  C: AdminThemeTokens;
  index: number;
}) {
  const badgeStyle = applicationStatusBadgeStyle(child.status, C);
  const childFirstName = child.studentName.split(" ")[0];
  const href = childApplicationHref(schoolSlug, child);

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
        <div
          className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl text-base font-semibold transition-transform duration-200 group-hover:scale-105"
          style={{
            backgroundColor: C.accentGlow,
            color: C.accentDark,
          }}
        >
          {studentInitials(child.studentName)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate font-heading text-sm font-semibold text-gray-800">
              {childFirstName}
            </p>
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
          </div>
          <p className="mt-0.5 text-xs" style={{ color: C.textTertiary }}>
            {child.grade ? `Grade ${child.grade}` : "Grade not listed"}
          </p>
          <p
            className="mt-2 flex items-center gap-1 text-xs font-medium opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            style={{ color: C.accent }}
          >
            View details
            <ArrowRight className="h-3 w-3" />
          </p>
        </div>
      </Link>
    </motion.div>
  );
}

export default function ParentHomePage({
  branding,
  schoolSlug,
  userProfile,
  children,
  quickActions,
}: ParentHomePageProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const name = firstName(userProfile.displayName);

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
              {children.length === 0 ? (
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
                      href={`/school/${schoolSlug}/apply`}
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
                  {children.map((child, index) => (
                    <ChildProfileCard
                      key={child.applicationId}
                      child={child}
                      schoolSlug={schoolSlug}
                      C={C}
                      index={index}
                    />
                  ))}
                </div>
              )}
            </motion.section>

            {quickActions.length > 0 ? (
              <motion.section
                custom={children.length + 2}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="space-y-4"
              >
                <SectionTitle>Quick Actions</SectionTitle>
                <div className="-mx-1 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
                  {quickActions.map((action, index) => {
                    const { iconBg, iconColor } = quickActionStyle(
                      action.iconSlug,
                    );
                    const Icon = getFeatureIcon(action.iconSlug);

                    return (
                      <motion.div
                        key={action.key}
                        custom={index}
                        initial="hidden"
                        animate="visible"
                        variants={fadeUp}
                        className="flex-shrink-0"
                      >
                        <motion.div whileTap={{ scale: 0.98 }}>
                          <Link
                            href={action.href}
                            className="group flex items-center gap-2.5 rounded-2xl border bg-white px-4 py-3 transition-colors duration-200 hover:bg-gray-50/80"
                            style={{
                              borderColor: C.border,
                              boxShadow: C.shadowCard,
                            }}
                          >
                            <div
                              className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110 ${iconBg}`}
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
                          </Link>
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.section>
            ) : null}
          </div>

          <div className="flex flex-col gap-8 lg:sticky lg:top-[65px] lg:self-start">
            <motion.section
              custom={2}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="space-y-4"
            >
              <SectionTitle>Get started</SectionTitle>
              <div
                className="flex w-full cursor-default items-center gap-3 rounded-2xl border px-4 py-4 transition-all duration-200 hover:shadow-md"
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
                    Finish setting up your account
                  </p>
                </div>
                <ArrowRight
                  className="h-4 w-4 flex-shrink-0"
                  style={{ color: `${C.accent}99` }}
                />
              </div>
            </motion.section>

            <motion.section
              custom={3}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="space-y-4"
            >
              <SectionTitle>Upcoming events</SectionTitle>
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
            </motion.section>
          </div>
        </div>
      </div>
    </div>
  );
}
