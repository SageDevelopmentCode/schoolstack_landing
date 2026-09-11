"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";
import { ClipboardList, Loader2, Plus } from "lucide-react";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminMetricCard from "@/components/school-admin/ui/story/AdminMetricCard";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";
import SignupProgressBar from "@/components/classroom-signups/shared/SignupProgressBar";
import ClassroomSignupCreateWizard from "./ClassroomSignupCreateWizard";
import TeacherClassroomSignupSidebar from "./TeacherClassroomSignupSidebar";
import type {
  ClassroomSignup,
  ClassroomSignupResponse,
  ClassroomSignupStatus,
  TeacherClassroomOption,
} from "@/lib/classroom-signups/types";
import { SIGNUP_STATUS_LABELS, SIGNUP_TYPE_LABELS } from "@/lib/classroom-signups/types";
import {
  computeSignupMetrics,
  filterSignupsByStatus,
  formatAudienceLabel,
  formatSignupDeadline,
  getSignupProgress,
} from "@/lib/classroom-signups/utils";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type TeacherClassroomSignupsPageProps = {
  slug: string;
  organizationId: string;
  teacherName: string;
  staffMemberId: string | null;
  initialSignups: ClassroomSignup[];
  initialResponsesBySignupId: Record<string, ClassroomSignupResponse[]>;
  classroomOptions: TeacherClassroomOption[];
  assignedFamilyCount: number;
  teacherBasePath?: string;
  previewMode?: boolean;
  initialSignupId?: string;
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

function pageEnterVariants(reducedMotion: boolean): Variants {
  if (reducedMotion) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.2 } },
      exit: { opacity: 0, transition: { duration: 0.15 } },
    };
  }

  return {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
    },
    exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
  };
}

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
      className="cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors"
      style={
        active
          ? {
              backgroundColor: theme.primarySoft,
              color: theme.primary,
              borderColor: "#BCD4C1",
            }
          : {
              backgroundColor: theme.white,
              color: theme.muted,
              borderColor: theme.line,
            }
      }
    >
      {displayLabel}
    </button>
  );
}

export default function TeacherClassroomSignupsPage(
  props: TeacherClassroomSignupsPageProps,
) {
  const { theme } = useParentTheme();

  return (
    <Suspense
      fallback={
        <div
          className="flex items-center justify-center gap-2 py-12 text-sm"
          style={{ color: theme.muted }}
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading signups…
        </div>
      }
    >
      <TeacherClassroomSignupsPageContent {...props} />
    </Suspense>
  );
}

function TeacherClassroomSignupsPageContent({
  organizationId,
  teacherName,
  initialSignups,
  initialResponsesBySignupId,
  classroomOptions,
  assignedFamilyCount,
  previewMode = false,
  initialSignupId,
}: TeacherClassroomSignupsPageProps) {
  const { theme } = useParentTheme();
  const reducedMotion = useReducedMotion();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [signups, setSignups] = useState<ClassroomSignup[]>(initialSignups);
  const [responsesBySignupId, setResponsesBySignupId] = useState(
    initialResponsesBySignupId,
  );
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [creating, setCreating] = useState(false);
  const [selectedSignupId, setSelectedSignupId] = useState<string | null>(null);

  const signupParam =
    searchParams.get("signup") ?? initialSignupId ?? null;

  const setSignupParam = useCallback(
    (signupId: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (signupId) params.set("signup", signupId);
      else params.delete("signup");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    },
    [pathname, router, searchParams],
  );

  const openSidebar = useCallback(
    (signupId: string) => {
      setSelectedSignupId(signupId);
      setSignupParam(signupId);
    },
    [setSignupParam],
  );

  const closeSidebar = useCallback(() => {
    setSelectedSignupId(null);
    setSignupParam(null);
  }, [setSignupParam]);

  useEffect(() => {
    if (!signupParam) {
      setSelectedSignupId(null);
      return;
    }
    const visible = signups.some((signup) => signup.id === signupParam);
    if (visible) {
      setSelectedSignupId(signupParam);
    }
  }, [signupParam, signups]);

  const selectedSignup = useMemo(
    () => signups.find((signup) => signup.id === selectedSignupId) ?? null,
    [signups, selectedSignupId],
  );

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

  const pageVariants = pageEnterVariants(reducedMotion ?? false);

  const handleSignupUpdated = useCallback((signup: ClassroomSignup) => {
    setSignups((current) =>
      current.some((entry) => entry.id === signup.id)
        ? current.map((entry) => (entry.id === signup.id ? signup : entry))
        : [signup, ...current],
    );
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <AnimatePresence mode="wait" initial={false}>
        {creating ? (
          <motion.div
            key="create-wizard"
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <ClassroomSignupCreateWizard
              organizationId={organizationId}
              teacherName={teacherName}
              classroomOptions={classroomOptions}
              assignedFamilyCount={assignedFamilyCount}
              onCancel={() => setCreating(false)}
              onPublished={(signup) => {
                setSignups((current) =>
                  current.some((entry) => entry.id === signup.id)
                    ? current
                    : [signup, ...current],
                );
                setResponsesBySignupId((current) => ({
                  ...current,
                  [signup.id]: current[signup.id] ?? [],
                }));
                setCreating(false);
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="signup-list"
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <ParentSectionKicker
                  theme={theme}
                  className="normal-case tracking-normal font-semibold"
                >
                  Your classroom
                </ParentSectionKicker>
                <ParentDisplayHeading theme={theme}>
                  Classroom signups
                </ParentDisplayHeading>
                <p className="mt-1 text-sm" style={{ color: theme.muted }}>
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
                  style={{ backgroundColor: theme.primarySoft, color: theme.primary }}
                >
                  <ClipboardList className="h-7 w-7" />
                </div>
                <h3 className="text-base font-semibold" style={{ color: theme.ink }}>
                  {filter === "all"
                    ? "Create your first signup"
                    : `No ${filter} signups`}
                </h3>
                <p
                  className="mx-auto mt-2 max-w-sm text-sm"
                  style={{ color: theme.muted }}
                >
                  Ask parents to help with reading buddies, class events, field
                  trips, and more.
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
                  const actionLabel =
                    signup.status === "draft" ? "Continue draft" : "Manage";

                  const card = (
                    <ParentCard
                      theme={theme}
                      variant={signup.status === "open" ? "today" : "default"}
                      className="transition-shadow hover:shadow-md"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex min-w-0 flex-1 items-start gap-3">
                          <div
                            className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[13px]"
                            style={{
                              backgroundColor: theme.primarySoft,
                              color: theme.primary,
                            }}
                          >
                            <ClipboardList className="h-4 w-4" aria-hidden />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p
                              className="text-base font-semibold leading-snug"
                              style={{
                                color: theme.ink,
                                fontFamily: theme.fontDisplay,
                              }}
                            >
                              {signup.title}
                            </p>
                            <p className="mt-1 text-sm" style={{ color: theme.muted }}>
                              {formatAudienceLabel(signup)}
                            </p>
                            <div
                              className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs"
                              style={{ color: theme.muted }}
                            >
                              <span>{SIGNUP_TYPE_LABELS[signup.signupType]}</span>
                              <span>{SIGNUP_STATUS_LABELS[signup.status]}</span>
                              {deadline ? <span>Due {deadline}</span> : null}
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
                          </div>
                        </div>
                        <AdminButton
                          theme={theme}
                          variant={signup.status === "draft" ? "primary" : "soft"}
                          onClick={() => openSidebar(signup.id)}
                          className="w-full shrink-0 sm:w-auto"
                        >
                          {actionLabel}
                        </AdminButton>
                      </div>
                    </ParentCard>
                  );

                  if (reducedMotion) {
                    return <div key={signup.id}>{card}</div>;
                  }

                  return (
                    <motion.div
                      key={signup.id}
                      custom={index}
                      initial="hidden"
                      animate="visible"
                      variants={fadeUp}
                    >
                      {card}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <TeacherClassroomSignupSidebar
        theme={theme}
        open={selectedSignupId != null && selectedSignup != null}
        organizationId={organizationId}
        signup={selectedSignup}
        responses={
          selectedSignupId
            ? (responsesBySignupId[selectedSignupId] ?? [])
            : []
        }
        teacherName={teacherName}
        classroomOptions={classroomOptions}
        previewMode={previewMode}
        onClose={closeSidebar}
        onSignupUpdated={handleSignupUpdated}
      />
    </div>
  );
}
