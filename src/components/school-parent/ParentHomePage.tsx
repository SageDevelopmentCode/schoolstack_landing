"use client";

import Link from "next/link";
import StudentPhoto from "@/components/students/StudentPhoto";
import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ClipboardCheck,
  ClipboardList,
  FileText,
  MessageSquare,
} from "lucide-react";
import type { ParentSignupAttentionItem } from "@/lib/classroom-signups/types";
import type { ParentPortalHomeMeta } from "@/lib/parent-portal/parent-portal-home-meta";
import { parentClassroomSignupPath } from "@/lib/organization-settings/parent-routes";
import type {
  FamilyChildOverview,
  FamilyUserProfile,
} from "@/lib/admissions/parent-portal-access";
import type { ParentQuickAction } from "@/lib/organization-settings/parent-home";
import type { ResolvedParentOnboardingItem } from "@/lib/organization-settings/parent-onboarding";
import {
  buildParentThemeTokens,
  childAccentBg,
  parentThemeToAdminCompat,
} from "@/lib/organization-settings/parent-theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { schoolParentPath } from "@/lib/organization-settings/parent-routes";
import type { OrganizationEvent } from "@/lib/school-events/types";
import { parseEventDate } from "@/lib/committees/calendar-utils";
import ParentOnboardingSidebar from "@/components/school-parent/ParentOnboardingSidebar";
import EnrollmentAgreementAmendmentBanner from "@/components/admissions/EnrollmentAgreementAmendmentBanner";
import type { EnrollmentAgreementAmendmentBannerItem } from "@/lib/admissions/enrollment-agreement-amendment-banner";
import type { EnrollmentAgreementIncompleteBannerItem } from "@/lib/admissions/enrollment-agreement-incomplete-banner";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import ParentTextLink from "@/components/school-parent/ui/ParentTextLink";
import ParentAttentionItem from "@/components/school-parent/ui/ParentAttentionItem";
import ParentDatePill from "@/components/school-parent/ui/ParentDatePill";
import ParentChip from "@/components/school-parent/ui/ParentChip";
import ParentButtonLink from "@/components/school-parent/ui/ParentButtonLink";

type ParentHomePageProps = {
  branding: OrganizationBranding;
  schoolSlug: string;
  organizationId?: string;
  familyId?: string;
  userProfile: FamilyUserProfile;
  familyChildren: FamilyChildOverview[];
  quickActions: ParentQuickAction[];
  onboardingItems?: ResolvedParentOnboardingItem[];
  upcomingEvents?: OrganizationEvent[];
  enrollmentAmendmentBannerItems?: EnrollmentAgreementAmendmentBannerItem[];
  enrollmentIncompleteBannerItems?: EnrollmentAgreementIncompleteBannerItem[];
  classroomSignupAttentionItems?: ParentSignupAttentionItem[];
  homeMeta?: ParentPortalHomeMeta | null;
  contentDeferred?: boolean;
  deferSignupAttentionLoad?: boolean;
  previewMode?: boolean;
  previewBasePath?: string;
};

type AttentionItem = {
  key: string;
  title: string;
  subtitle: string;
  href?: string;
  icon: React.ReactNode;
  iconBg?: string;
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

function familyKickerLabel(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `The ${parts[parts.length - 1]} family`;
  }
  if (parts.length === 1) {
    return `The ${parts[0]} family`;
  }
  return "Your family";
}

function greetingParts(): { prefix: string; emoji: string } {
  const hour = new Date().getHours();
  if (hour < 12) return { prefix: "Good morning", emoji: "☀️" };
  if (hour < 17) return { prefix: "Good afternoon", emoji: "🌤️" };
  return { prefix: "Good evening", emoji: "🌙" };
}

function childSubtitleLine(child: FamilyChildOverview): string {
  const gradePart = child.grade ? `Grade ${child.grade}` : "Grade not listed";
  if (child.checklistProgress && child.checklistProgress.total > 0) {
    return `${gradePart} · Enrollment checklist: ${child.checklistProgress.completed} of ${child.checklistProgress.total} complete`;
  }
  return gradePart;
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

function childDetailsHref(
  schoolSlug: string,
  applicationId: string,
  previewBasePath?: string,
): string {
  const base = previewBasePath
    ? `${previewBasePath}/parent/children`
    : schoolParentPath(schoolSlug, "children");
  return `${base}?applicationId=${encodeURIComponent(applicationId)}`;
}

function buildAttentionItems(input: {
  onboardingItems: ResolvedParentOnboardingItem[];
  enrollmentAmendmentBannerItems: EnrollmentAgreementAmendmentBannerItem[];
  enrollmentIncompleteBannerItems: EnrollmentAgreementIncompleteBannerItem[];
  classroomSignupAttentionItems: ParentSignupAttentionItem[];
  schoolSlug: string;
  previewBasePath?: string;
}): AttentionItem[] {
  const items: AttentionItem[] = [];

  for (const signup of input.classroomSignupAttentionItems) {
    items.push({
      key: `signup-${signup.signupId}`,
      title: "Help in the classroom",
      subtitle: `${signup.teacherName} needs help with ${signup.title}${
        signup.classroomName ? ` (${signup.classroomName})` : ""
      }`,
      href: parentClassroomSignupPath(
        input.schoolSlug,
        signup.signupId,
        input.previewBasePath,
      ),
      icon: <ClipboardList className="h-4 w-4" style={{ color: "#3D6B4F" }} />,
      iconBg: "#E9F2EA",
    });
  }

  for (const item of input.enrollmentIncompleteBannerItems) {
    items.push({
      key: `incomplete-${item.applicationId}`,
      title: `Sign ${item.studentName.split(" ")[0]}'s enrollment agreement`,
      subtitle: item.checklistItemLabel,
      href: item.enrollmentHref,
      icon: <FileText className="h-4 w-4" style={{ color: "#B5594A" }} />,
      iconBg: "#F7E5DE",
    });
  }

  for (const item of input.enrollmentAmendmentBannerItems) {
    items.push({
      key: `amendment-${item.applicationId}`,
      title: `Review ${item.studentName.split(" ")[0]}'s agreement update`,
      subtitle: item.checklistItemLabel,
      href: item.enrollmentHref,
      icon: <FileText className="h-4 w-4" style={{ color: "#B5594A" }} />,
      iconBg: "#F7E5DE",
    });
  }

  for (const item of input.onboardingItems) {
    if (item.completed || !item.autoTracked) continue;
    items.push({
      key: `onboarding-${item.id}`,
      title: item.label,
      subtitle: "Complete your account setup",
      href: item.href,
      icon: <ClipboardCheck className="h-4 w-4" style={{ color: "#986F14" }} />,
      iconBg: "#FFF4D9",
    });
  }

  return items;
}

function ChildStoryCard({
  child,
  schoolSlug,
  theme,
  adminCompat,
  index,
  previewBasePath,
}: {
  child: FamilyChildOverview;
  schoolSlug: string;
  theme: ReturnType<typeof buildParentThemeTokens>;
  adminCompat: ReturnType<typeof parentThemeToAdminCompat>;
  index: number;
  previewBasePath?: string;
}) {
  const childFirstName = child.studentName.split(" ")[0];
  const detailsHref = childDetailsHref(
    schoolSlug,
    child.applicationId,
    previewBasePath,
  );
  const applicationHref = childApplicationHref(
    schoolSlug,
    child,
    previewBasePath,
  );
  const accentBg = childAccentBg(index);
  const statusTone = child.isEnrolled ? "success" : "info";
  const showEnrollmentLink =
    child.isEnrolled || child.status === "enrolling";

  return (
    <motion.div custom={index + 4} initial="hidden" animate="visible" variants={fadeUp}>
      <ParentCard theme={theme} className="relative flex flex-col !p-6">
        <div className="mb-4 flex items-start gap-3">
          <div
            className="shrink-0 overflow-hidden rounded-[18px]"
            style={{ backgroundColor: accentBg }}
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
                className="m-0 text-base font-semibold"
                style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
              >
                {childFirstName}
              </h3>
              <ParentChip
                theme={theme}
                tone={statusTone}
                className="!shrink-0 !normal-case !tracking-normal"
              >
                ● {child.statusLabel}
              </ParentChip>
            </div>
            <p className="m-0 mt-1 text-xs leading-relaxed" style={{ color: "#7B878D" }}>
              {childSubtitleLine(child)}
            </p>
          </div>
        </div>
        <div className="mt-auto flex flex-col gap-2 pt-2">
          <ParentButtonLink
            theme={theme}
            href={detailsHref}
            variant="outline"
            showArrow
          >
            See {childFirstName}&apos;s details
          </ParentButtonLink>
          {showEnrollmentLink ? (
            <ParentTextLink theme={theme} href={applicationHref}>
              Enrollment checklist
            </ParentTextLink>
          ) : null}
        </div>
      </ParentCard>
    </motion.div>
  );
}

export default function ParentHomePage({
  branding,
  schoolSlug,
  organizationId,
  familyId,
  userProfile,
  familyChildren,
  quickActions,
  onboardingItems = [],
  upcomingEvents = [],
  enrollmentAmendmentBannerItems = [],
  enrollmentIncompleteBannerItems = [],
  classroomSignupAttentionItems: initialSignupAttentionItems = [],
  homeMeta = null,
  contentDeferred = false,
  deferSignupAttentionLoad = false,
  previewBasePath,
}: ParentHomePageProps) {
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [classroomSignupAttentionItems, setClassroomSignupAttentionItems] = useState(
    initialSignupAttentionItems,
  );

  useEffect(() => {
    if (!deferSignupAttentionLoad || !organizationId || !familyId) return;

    let cancelled = false;
    (async () => {
      try {
        const params = new URLSearchParams({ organizationId, familyId });
        const res = await fetch(`/api/parent-portal/signups/attention?${params}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok || cancelled) return;
        setClassroomSignupAttentionItems(data.items ?? []);
      } catch {
        // Signup attention is non-blocking.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [deferSignupAttentionLoad, familyId, organizationId]);
  const theme = useMemo(() => buildParentThemeTokens(branding), [branding]);
  const adminCompat = useMemo(
    () => parentThemeToAdminCompat(theme),
    [theme],
  );
  const name = firstName(userProfile.displayName);
  const { prefix: greetingPrefix, emoji: greetingEmoji } = greetingParts();
  const calendarHref = previewBasePath
    ? `${previewBasePath}/parent/calendar`
    : schoolParentPath(schoolSlug, "calendar");
  const applyDashboardHref =
    previewBasePath ?? `/school/${schoolSlug}/apply`;
  const messagesAction = quickActions.find((a) => a.key === "messages");
  const messagesHref = messagesAction?.href;
  const attentionItems = buildAttentionItems({
    onboardingItems,
    enrollmentAmendmentBannerItems,
    enrollmentIncompleteBannerItems,
    classroomSignupAttentionItems,
    schoolSlug,
    previewBasePath,
  });
  const enrolledCount =
    homeMeta?.enrolledChildrenCount ??
    familyChildren.filter((c) => c.isEnrolled).length;
  const nextEvent = upcomingEvents[0] ?? null;
  const dayName = new Date().toLocaleDateString("en-US", { weekday: "long" });

  const familySnapshotTitle =
    enrolledCount === familyChildren.length && familyChildren.length > 0
      ? "Everyone is set for today"
      : familyChildren.length > 0
        ? "Your family at a glance"
        : "Welcome to your family portal";

  const familySnapshotBody =
    familyChildren.length > 0
      ? enrolledCount > 0
        ? `${enrolledCount} of ${familyChildren.length} learner${familyChildren.length === 1 ? "" : "s"} enrolled.`
        : `${familyChildren.length} learner${familyChildren.length === 1 ? "" : "s"} on file.`
      : "Student records will appear here once applications are linked to your account.";

  return (
    <div className="min-h-full w-full" style={{ backgroundColor: theme.paper }}>
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-7 px-4 py-6 sm:px-8 sm:py-8 lg:px-[68px] lg:py-10">
        <motion.header
          custom={0}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end sm:gap-5"
        >
          <div>
            <ParentSectionKicker theme={theme}>
              {familyKickerLabel(userProfile.displayName)}
            </ParentSectionKicker>
            <ParentDisplayHeading theme={theme} as="h1">
              {greetingPrefix}, {name}.{" "}
              <span aria-hidden="true">{greetingEmoji}</span>
            </ParentDisplayHeading>
            <p className="mt-2 text-[15px]" style={{ color: theme.muted }}>
              Here&apos;s what your family needs for {dayName}.
            </p>
          </div>
          <div className="w-full sm:w-auto">
            <ParentDatePill theme={theme} />
          </div>
        </motion.header>

        {enrollmentAmendmentBannerItems.length > 0 ||
        enrollmentIncompleteBannerItems.length > 0 ? (
          <EnrollmentAgreementAmendmentBanner
            C={adminCompat}
            items={enrollmentAmendmentBannerItems}
            incompleteItems={enrollmentIncompleteBannerItems}
          />
        ) : null}

        <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-[1.45fr_0.85fr]">
          <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp}>
            <ParentCard theme={theme} variant="today" className="relative">
              <ParentSectionKicker theme={theme}>Start here</ParentSectionKicker>
              <h3
                className="mb-4 text-base font-semibold"
                style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
              >
                {attentionItems.length > 0
                  ? `${attentionItems.length} thing${attentionItems.length === 1 ? "" : "s"} need your attention`
                  : onboardingItems.length > 0
                    ? "Finish setting up your account"
                    : "You're all caught up"}
              </h3>
              {attentionItems.length > 0 ? (
                attentionItems.slice(0, 4).map((item) => (
                  <div key={item.key}>
                    {item.href ? (
                      <Link href={item.href} className="block hover:opacity-90">
                        <ParentAttentionItem
                          theme={theme}
                          icon={item.icon}
                          title={item.title}
                          subtitle={item.subtitle}
                          iconBg={item.iconBg}
                        />
                      </Link>
                    ) : (
                      <ParentAttentionItem
                        theme={theme}
                        icon={item.icon}
                        title={item.title}
                        subtitle={item.subtitle}
                        iconBg={item.iconBg}
                      />
                    )}
                  </div>
                ))
              ) : onboardingItems.length > 0 ? (
                <ParentAttentionItem
                  theme={theme}
                  icon={
                    <ClipboardCheck
                      className="h-4 w-4"
                      style={{ color: theme.primary }}
                    />
                  }
                  iconBg={theme.primarySoft}
                  title="Complete your onboarding"
                  subtitle="A few quick steps to get the most from your portal"
                />
              ) : (
                <p className="text-sm" style={{ color: theme.muted }}>
                  No urgent tasks right now. Check back for updates from school.
                </p>
              )}
              {onboardingItems.length > 0 ? (
                <div className="mt-3">
                  <ParentTextLink
                    theme={theme}
                    onClick={() => setOnboardingOpen(true)}
                  >
                    Review today&apos;s to-dos
                  </ParentTextLink>
                </div>
              ) : null}
            </ParentCard>
          </motion.div>

          <motion.aside custom={2} initial="hidden" animate="visible" variants={fadeUp}>
            <ParentCard theme={theme} variant="primary" className="h-full">
              <ParentSectionKicker theme={theme} light>
                Family snapshot
              </ParentSectionKicker>
              <h3
                className="mb-3 text-base font-semibold text-white"
                style={{ fontFamily: theme.fontDisplay }}
              >
                {familySnapshotTitle}
              </h3>
              <p className="text-[13px] leading-relaxed" style={{ color: "#D5E3D9" }}>
                {familySnapshotBody}
              </p>
              {nextEvent ? (
                <div
                  className="mt-3 rounded-[14px] p-3"
                  style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                >
                  <b className="block text-[13px] text-white">{nextEvent.title}</b>
                  <span className="text-xs" style={{ color: "#D4E0D7" }}>
                    {parseEventDate(nextEvent.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    })}
                    {!nextEvent.isAllDay && nextEvent.time
                      ? ` · ${nextEvent.time}`
                      : ""}
                  </span>
                </div>
              ) : null}
              <div className="mt-4">
                <ParentTextLink theme={theme} href={calendarHref} light>
                  View family calendar
                </ParentTextLink>
              </div>
            </ParentCard>
          </motion.aside>
        </div>

        <motion.section
          custom={3}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <h3
            className="mb-3.5 font-heading text-2xl font-semibold tracking-[-0.03em]"
            style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
          >
            Your children
          </h3>
          {familyChildren.length === 0 ? (
            <ParentCard theme={theme}>
              <p className="text-sm leading-relaxed" style={{ color: theme.muted }}>
                We don&apos;t have any student records from your applications yet.
                Visit your{" "}
                <Link
                  href={applyDashboardHref}
                  className="font-bold"
                  style={{ color: theme.primary }}
                >
                  application dashboard
                </Link>{" "}
                to get started.
              </p>
            </ParentCard>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {familyChildren.map((child, index) => (
                <ChildStoryCard
                  key={child.applicationId}
                  child={child}
                  schoolSlug={schoolSlug}
                  theme={theme}
                  adminCompat={adminCompat}
                  index={index}
                  previewBasePath={previewBasePath}
                />
              ))}
            </div>
          )}
        </motion.section>

        <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-[1fr_1.15fr]">
          <motion.div custom={5} initial="hidden" animate="visible" variants={fadeUp}>
            <ParentCard theme={theme}>
              <ParentSectionKicker theme={theme}>School updates</ParentSectionKicker>
              <h3
                className="mb-4 text-base font-semibold"
                style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
              >
                From your school
              </h3>
              {messagesHref ? (
                <>
                  <div className="flex items-center gap-3.5">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-full"
                      style={{ backgroundColor: theme.infoBg }}
                    >
                      <MessageSquare
                        className="h-4 w-4"
                        style={{ color: theme.info }}
                      />
                    </div>
                    <div>
                      <strong
                        className="block text-sm"
                        style={{ color: theme.ink }}
                      >
                        Messages from teachers and staff
                      </strong>
                      <p className="m-0 text-xs" style={{ color: "#78858A" }}>
                        Check your inbox for school communications.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <ParentTextLink theme={theme} href={messagesHref}>
                      Open messages
                    </ParentTextLink>
                  </div>
                </>
              ) : (
                <p className="text-sm" style={{ color: theme.muted }}>
                  School announcements and updates will appear here when available.
                </p>
              )}
            </ParentCard>
          </motion.div>

          <motion.div custom={6} initial="hidden" animate="visible" variants={fadeUp}>
            <ParentCard theme={theme}>
              <ParentSectionKicker theme={theme}>Coming up</ParentSectionKicker>
              <h3
                className="mb-4 text-base font-semibold"
                style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
              >
                At a glance
              </h3>
              {upcomingEvents.length === 0 ? (
                <p
                  className="mb-0 text-[13px] leading-relaxed"
                  style={{ color: "#65747A" }}
                >
                  No upcoming events yet. School events will show up here.
                </p>
              ) : (
                <p
                  className="mb-0 text-[13px] leading-relaxed"
                  style={{ color: "#65747A" }}
                >
                  {upcomingEvents.slice(0, 3).map((event, index) => {
                    const dateLabel = parseEventDate(event.date).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric" },
                    );
                    return (
                      <span key={event.id}>
                        {index > 0 ? <br /> : null}
                        {dateLabel} · {event.title}
                      </span>
                    );
                  })}
                </p>
              )}
              <div className="mt-4">
                <ParentTextLink theme={theme} href={calendarHref}>
                  View full calendar
                </ParentTextLink>
              </div>
            </ParentCard>
          </motion.div>
        </div>
      </div>

      <ParentOnboardingSidebar
        C={adminCompat}
        open={onboardingOpen}
        items={onboardingItems}
        onClose={() => setOnboardingOpen(false)}
      />
    </div>
  );
}
