"use client";

import { motion } from "framer-motion";
import NavigationLink from "@/components/school/shared/NavigationLink";
import StudentPhoto from "@/components/students/StudentPhoto";
import ParentChip from "@/components/school-parent/ui/ParentChip";
import {
  applicationStatusChipTone,
  applicationStatusLabel,
} from "@/lib/admissions/application-status-ui";
import type { FamilyApplication } from "@/lib/admissions/parent-portal-access";
import type { EnrollmentProgressSummary } from "@/lib/admissions/enrollment-checklist-materialization";
import {
  childAccentBg,
  type ParentThemeTokens,
} from "@/lib/organization-settings/parent-theme";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { applyDashboardFadeUp } from "./apply-dashboard-motion";

type ApplicationAction = {
  label: string;
  href: string;
};

type ApplyApplicationStoryCardProps = {
  theme: ParentThemeTokens;
  adminCompat: AdminThemeTokens;
  application: FamilyApplication;
  action: ApplicationAction;
  statusForDisplay: string;
  dateLabel: string | null;
  sideStatusText: string;
  index: number;
  isFocused?: boolean;
};

function statusChipPrefix(status: string): string {
  if (status === "enrolled" || status === "accepted") return "✓ ";
  return "";
}

export default function ApplyApplicationStoryCard({
  theme,
  adminCompat,
  application,
  action,
  statusForDisplay,
  dateLabel,
  sideStatusText,
  index,
  isFocused = false,
}: ApplyApplicationStoryCardProps) {
  const accentBg = childAccentBg(index);
  const studentName = application.studentName ?? application.formTitle;
  const chipTone = applicationStatusChipTone(statusForDisplay);

  return (
    <motion.div
      custom={index + 3}
      initial="hidden"
      animate="visible"
      variants={applyDashboardFadeUp}
      id={isFocused ? "preview-focus" : undefined}
    >
      <NavigationLink
        href={action.href}
        className="group block transition-transform hover:-translate-y-0.5"
      >
        <article
          className="grid grid-cols-[auto_1fr] items-start gap-3 rounded-[20px] border p-5 transition-shadow hover:shadow-[0_10px_23px_rgba(43,76,56,0.09)] sm:grid-cols-[auto_1fr_auto] sm:gap-4"
          style={{
            borderColor: isFocused ? theme.primary : "rgba(74, 97, 82, 0.1)",
            backgroundColor: theme.white,
            boxShadow: isFocused
              ? `0 0 0 1px color-mix(in srgb, ${theme.primary} 20%, transparent), ${theme.shadowCard}`
              : theme.shadowCard,
          }}
        >
          <div
            className="w-fit shrink-0 overflow-hidden rounded-2xl"
            style={{ backgroundColor: accentBg }}
          >
            <StudentPhoto
              name={studentName}
              photoUrl={null}
              size="xl"
              shape="square"
              theme={adminCompat}
            />
          </div>

          <div className="min-w-0">
            <h3
              className="m-0 text-[17px] font-semibold"
              style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
            >
              {studentName}
            </h3>
            <p className="m-0 mt-1 text-xs" style={{ color: theme.muted }}>
              {application.formTitle}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <ParentChip
                theme={theme}
                tone={chipTone}
                className="!normal-case !tracking-normal"
              >
                {statusChipPrefix(statusForDisplay)}
                {applicationStatusLabel(statusForDisplay)}
              </ParentChip>
              {dateLabel ? (
                <span className="text-[11px]" style={{ color: theme.muted }}>
                  {dateLabel}
                </span>
              ) : null}
            </div>
            {application.status === "accepted" ? (
              <p className="m-0 mt-2 text-xs leading-relaxed" style={{ color: theme.muted }}>
                Congratulations — your application was accepted. The school will
                start your enrollment checklist soon.
              </p>
            ) : null}
          </div>

          <div className="col-start-2 sm:col-start-auto sm:text-right">
            <span className="mb-2 block text-[11px]" style={{ color: theme.muted }}>
              {sideStatusText}
            </span>
            <span
              className="text-xs font-extrabold transition-opacity group-hover:opacity-80"
              style={{ color: theme.primary }}
            >
              {action.label} →
            </span>
          </div>
        </article>
      </NavigationLink>
    </motion.div>
  );
}
