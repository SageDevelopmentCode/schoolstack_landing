"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ClipboardList, Plus } from "lucide-react";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminMetricCard from "@/components/school-admin/ui/story/AdminMetricCard";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import ParentDatePill from "@/components/school-parent/ui/ParentDatePill";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";
import SignupProgressBar from "@/components/classroom-signups/shared/SignupProgressBar";
import {
  SignupStatusChip,
  SignupTypeChip,
} from "@/components/classroom-signups/shared/SignupTypeChip";
import ClassroomSignupCreateWizard from "./ClassroomSignupCreateWizard";
import {
  getMockResponsesBySignupId,
  getMockSignupsForTeacher,
} from "@/lib/classroom-signups/mock-data";
import type { ClassroomSignup, ClassroomSignupStatus } from "@/lib/classroom-signups/types";
import {
  computeSignupMetrics,
  filterSignupsByStatus,
  formatAudienceLabel,
  formatSignupDeadline,
  getSignupProgress,
} from "@/lib/classroom-signups/utils";
import { schoolTeacherPath } from "@/lib/organization-settings/teacher-routes";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type TeacherClassroomSignupsPageProps = {
  slug: string;
  teacherName: string;
  staffMemberId: string | null;
  teacherBasePath?: string;
  previewMode?: boolean;
};

type FilterStatus = ClassroomSignupStatus | "all";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.35,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  }),
};

function StoryFilterPill({
  active,
  label,
  count,
  onClick,
  theme,
}: {
  active: boolean;
  label: string;
  count?: number;
  onClick: () => void;
  theme: ParentThemeTokens;
}) {
  const displayLabel = count != null ? `${label} · ${count}` : label;

  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer rounded-[9px] border px-2.5 py-2 text-[11px] font-medium transition-colors"
      style={
        active
          ? {
              backgroundColor: "#E9F2EA",
              color: theme.primary,
              borderColor: "#BCD4C1",
              fontWeight: 700,
            }
          : {
              backgroundColor: theme.white,
              color: "#5D6D73",
              borderColor: "#DCE4DC",
            }
      }
    >
      {displayLabel}
    </button>
  );
}

function signupDetailHref(
  slug: string,
  signupId: string,
  teacherBasePath?: string,
): string {
  const base = teacherBasePath
    ? `${teacherBasePath}/classroom_signups`
    : schoolTeacherPath(slug, "classroom_signups");
  return `${base}/${signupId}`;
}

export default function TeacherClassroomSignupsPage({
  slug,
  teacherName,
  staffMemberId,
  teacherBasePath,
  previewMode = false,
}: TeacherClassroomSignupsPageProps) {
  const { theme } = useParentTheme();
  const [signups, setSignups] = useState<ClassroomSignup[]>(() =>
    getMockSignupsForTeacher(staffMemberId),
  );
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [creating, setCreating] = useState(false);

  const responsesBySignupId = useMemo(() => getMockResponsesBySignupId(), []);

  const metrics = useMemo(
    () => computeSignupMetrics(signups, responsesBySignupId),
    [signups, responsesBySignupId],
  );

  const filteredSignups = useMemo(
    () => filterSignupsByStatus(signups, filter),
    [signups, filter],
  );

  const statusCounts = useMemo(() => {
    return {
      all: signups.length,
      open: signups.filter((s) => s.status === "open").length,
      draft: signups.filter((s) => s.status === "draft").length,
      closed: signups.filter((s) => s.status === "closed").length,
    };
  }, [signups]);

  if (creating) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <ClassroomSignupCreateWizard
          teacherName={teacherName}
          onCancel={() => setCreating(false)}
          onPublished={(signup) => {
            setSignups((current) => [signup, ...current]);
            setCreating(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <ParentSectionKicker theme={theme}>Your classroom</ParentSectionKicker>
          <ParentDisplayHeading theme={theme}>Classroom signups</ParentDisplayHeading>
          <p className="mt-1 text-sm" style={{ color: "#76828A" }}>
            Create requests for parent volunteers and track responses.
          </p>
        </div>
        {!previewMode ? (
          <AdminButton
            theme={theme}
            variant="primary"
            onClick={() => setCreating(true)}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Create signup
          </AdminButton>
        ) : null}
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <AdminMetricCard
          theme={theme}
          label="Open signups"
          value={String(metrics.openCount)}
          accent="forest"
        />
        <AdminMetricCard
          theme={theme}
          label="Responses this week"
          value={String(metrics.responsesThisWeek)}
          accent="sky"
        />
        <AdminMetricCard
          theme={theme}
          label="Needs attention"
          value={String(metrics.needsAttentionCount)}
          accent="gold"
        />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {(
          [
            ["all", "All"],
            ["open", "Open"],
            ["draft", "Draft"],
            ["closed", "Closed"],
          ] as const
        ).map(([key, label]) => (
          <StoryFilterPill
            key={key}
            theme={theme}
            active={filter === key}
            label={label}
            count={statusCounts[key]}
            onClick={() => setFilter(key)}
          />
        ))}
      </div>

      {filteredSignups.length === 0 ? (
        <ParentCard theme={theme} className="text-center !py-12">
          <div
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[18px]"
            style={{ backgroundColor: "#E9F2EA", color: theme.primary }}
          >
            <ClipboardList className="h-7 w-7" />
          </div>
          <h3 className="text-base font-semibold" style={{ color: theme.ink }}>
            {filter === "all"
              ? "Create your first signup"
              : `No ${filter} signups`}
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-sm" style={{ color: "#76828A" }}>
            Ask parents to help with reading buddies, class events, field trips, and more.
          </p>
          {!previewMode && filter === "all" ? (
            <div className="mt-6">
              <AdminButton
                theme={theme}
                variant="primary"
                onClick={() => setCreating(true)}
              >
                Create signup
              </AdminButton>
            </div>
          ) : null}
        </ParentCard>
      ) : (
        <div className="space-y-3">
          {filteredSignups.map((signup, index) => {
            const responses = responsesBySignupId[signup.id] ?? [];
            const progress = getSignupProgress(signup, responses);
            const deadline = formatSignupDeadline(signup.responseDeadline);
            const href = signupDetailHref(slug, signup.id, teacherBasePath);

            return (
              <motion.div
                key={signup.id}
                custom={index}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
              >
                <Link href={href} className="block">
                  <ParentCard
                    theme={theme}
                    className="transition-shadow hover:shadow-md"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <SignupTypeChip theme={theme} type={signup.signupType} />
                          <SignupStatusChip theme={theme} status={signup.status} />
                        </div>
                        <h3
                          className="mt-2 font-serif text-lg font-semibold"
                          style={{ color: theme.ink }}
                        >
                          {signup.title}
                        </h3>
                        <p className="mt-1 text-xs" style={{ color: "#76828A" }}>
                          {formatAudienceLabel(signup)}
                        </p>
                      </div>
                      {deadline ? (
                        <ParentDatePill theme={theme} label={`Due ${deadline}`} />
                      ) : null}
                    </div>
                    <div className="mt-4">
                      <SignupProgressBar
                        theme={theme}
                        filled={progress.filled}
                        total={progress.total}
                        label={progress.label}
                        highlightIncomplete={signup.status === "open"}
                      />
                    </div>
                  </ParentCard>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
