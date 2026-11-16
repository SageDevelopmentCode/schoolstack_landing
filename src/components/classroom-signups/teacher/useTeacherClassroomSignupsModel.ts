"use client";

import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import { useAdminAction } from "@/components/school-admin/garden/useAdminAction";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import {
  buildSignupResponsesCsv,
  signupResponsesCsvFilename,
} from "@/lib/classroom-signups/export-responses-csv";
import {
  closeTeacherSignup,
  sendTeacherSignupReminder,
  SignupApiError,
  type SignupReminderResult,
} from "@/lib/classroom-signups/teacher-signups-client";
import type {
  ClassroomSignup,
  ClassroomSignupResponse,
  ClassroomSignupStatus,
  TeacherClassroomOption,
} from "@/lib/classroom-signups/types";
import {
  computeSignupMetrics,
  filterSignupsByStatus,
  getSignupProgress,
} from "@/lib/classroom-signups/utils";

export type TeacherClassroomSignupsPageProps = {
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

export type SignupFilter = ClassroomSignupStatus | "all";

export type ReminderOutcome =
  | { ok: true; result: SignupReminderResult }
  | { ok: false; cooldown: string | null };

function plural(count: number, one: string, many = `${one}s`) {
  return `${count} ${count === 1 ? one : many}`;
}

/**
 * Classroom signups view-model: list + filter, `?signup=` drawer, create
 * wizard, close (confirmed), reminders (real email + push) and CSV export,
 * each with the Garden feedback contract (busy button, toast, Retry, flash).
 */
export function useTeacherClassroomSignupsModel({
  organizationId,
  initialSignups,
  initialResponsesBySignupId,
  previewMode = false,
  initialSignupId,
}: TeacherClassroomSignupsPageProps) {
  const { theme } = useParentTheme();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const action = useAdminAction();

  const [signups, setSignups] = useState<ClassroomSignup[]>(initialSignups);
  const [responsesBySignupId, setResponsesBySignupId] = useState(initialResponsesBySignupId);
  const [filter, setFilter] = useState<SignupFilter>("all");
  const [creating, setCreating] = useState(false);
  const [closeTarget, setCloseTarget] = useState<ClassroomSignup | null>(null);
  const [reminderTarget, setReminderTarget] = useState<ClassroomSignup | null>(null);
  const [sendingReminder, setSendingReminder] = useState(false);

  /* ---- URL-backed drawer (?signup=) ---- */
  const signupParam = searchParams.get("signup") ?? initialSignupId ?? null;
  const selectedSignupId = useMemo(
    () => (signupParam && signups.some((signup) => signup.id === signupParam) ? signupParam : null),
    [signupParam, signups],
  );
  const selectedSignup = useMemo(
    () => signups.find((signup) => signup.id === selectedSignupId) ?? null,
    [signups, selectedSignupId],
  );

  const setSignupParam = useCallback(
    (signupId: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (signupId) params.set("signup", signupId);
      else params.delete("signup");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );
  const openSidebar = useCallback((signupId: string) => setSignupParam(signupId), [setSignupParam]);
  const closeSidebar = useCallback(() => setSignupParam(null), [setSignupParam]);

  /* ---- derived ---- */
  const metrics = useMemo(() => computeSignupMetrics(signups, responsesBySignupId), [signups, responsesBySignupId]);
  const filteredSignups = useMemo(() => filterSignupsByStatus(signups, filter), [signups, filter]);
  const statusCounts = useMemo(
    () => ({
      all: signups.length,
      open: signups.filter((s) => s.status === "open").length,
      draft: signups.filter((s) => s.status === "draft").length,
      closed: signups.filter((s) => s.status === "closed").length,
    }),
    [signups],
  );
  const drafts = useMemo(() => signups.filter((s) => s.status === "draft"), [signups]);
  /** Open signups that aren't full yet or are past their deadline (same rule as the figure). */
  const needsAttention = useMemo(() => {
    const now = new Date();
    return signups.filter((signup) => {
      if (signup.status !== "open") return false;
      const progress = getSignupProgress(signup, responsesBySignupId[signup.id] ?? []);
      const pastDue = signup.responseDeadline != null && new Date(signup.responseDeadline) < now;
      return !progress.isComplete || pastDue;
    });
  }, [responsesBySignupId, signups]);

  const confirmedResponses = useCallback(
    (signupId: string) => (responsesBySignupId[signupId] ?? []).filter((r) => r.status === "confirmed"),
    [responsesBySignupId],
  );

  /* ---- list updates ---- */
  const upsertSignup = useCallback((signup: ClassroomSignup) => {
    setSignups((current) =>
      current.some((entry) => entry.id === signup.id)
        ? current.map((entry) => (entry.id === signup.id ? signup : entry))
        : [signup, ...current],
    );
    setResponsesBySignupId((current) => (current[signup.id] ? current : { ...current, [signup.id]: [] }));
  }, []);

  const handleSignupUpdated = useCallback(
    (signup: ClassroomSignup) => {
      upsertSignup(signup);
      action.flash(signup.id);
    },
    [action, upsertSignup],
  );

  /* ---- create wizard ---- */
  const startCreate = () => {
    if (!previewMode) setCreating(true);
  };
  const cancelCreate = () => setCreating(false);

  const handlePublished = useCallback(
    (signup: ClassroomSignup, options: { remindNow: boolean }) => {
      upsertSignup(signup);
      setCreating(false);
      setFilter("all");
      action.flash(signup.id);
      adminToast.success(`“${signup.title}” is open.`, {
        id: `signup-published-${signup.id}`,
        description: `${plural(signup.familyCount, "family", "families")} can sign up from the parent portal now.`,
      });
      if (options.remindNow) setReminderTarget(signup);
    },
    [action, upsertSignup],
  );

  const handleDraftSaved = useCallback(
    (signup: ClassroomSignup) => {
      upsertSignup(signup);
      setCreating(false);
      setFilter("all");
      action.flash(signup.id);
      adminToast.success(`“${signup.title}” saved as a draft.`, {
        id: `signup-draft-${signup.id}`,
        description: "Families can't see it yet. Open it any time to finish and publish.",
      });
    },
    [action, upsertSignup],
  );

  /* ---- close ---- */
  const requestClose = (signup: ClassroomSignup) => {
    if (!previewMode) setCloseTarget(signup);
  };
  const confirmClose = useCallback(async () => {
    const signup = closeTarget;
    if (!signup) return;
    const kept = confirmedResponses(signup.id).length;
    await action.run(
      async () => {
        try {
          const next = await closeTeacherSignup(organizationId, signup.id);
          upsertSignup(next);
          setCloseTarget(null);
          return next;
        } catch (error) {
          void reportPortalOperationalError(
            "teacher_portal",
            { organizationId, operation: "classroom_signups.close", error: "" },
            error,
          );
          throw error;
        }
      },
      {
        key: `signup-close-${signup.id}`,
        id: `signup-close-${signup.id}`,
        flashKey: signup.id,
        success: {
          title: `“${signup.title}” closed.`,
          description: `Families can't sign up anymore. ${plural(kept, "response")} kept.`,
        },
        error: {
          title: "Couldn't close the signup.",
          description: "It's still open for families.",
          fallback: "Failed to close signup.",
        },
      },
    );
  }, [action, closeTarget, confirmedResponses, organizationId, upsertSignup]);

  /* ---- reminders ---- */
  const openReminder = (signup: ClassroomSignup) => {
    if (!previewMode) setReminderTarget(signup);
  };
  const closeReminder = () => {
    if (!sendingReminder) setReminderTarget(null);
  };

  const sendReminder = useCallback(
    async function send(signup: ClassroomSignup, message: string): Promise<ReminderOutcome> {
      setSendingReminder(true);
      const errorId = `signup-remind-${signup.id}-error`;
      try {
        const result = await sendTeacherSignupReminder(organizationId, signup.id, message);
        adminToast.dismiss(errorId);
        if (result.familiesNotified === 0) {
          adminToast.info("Everyone has already signed up.", {
            id: `signup-remind-${signup.id}`,
            description: "No reminder was needed, so nothing was sent.",
          });
        } else {
          adminToast.success(`Reminder sent to ${plural(result.familiesNotified, "family", "families")}.`, {
            id: `signup-remind-${signup.id}`,
            description:
              result.emailsSent < result.emailsAttempted
                ? `${result.emailsSent} of ${result.emailsAttempted} emails went out; the rest will show in your activity log.`
                : `They'll get an email${result.pushRecipients > 0 ? " and a phone notification" : ""} with a link to sign up.`,
          });
        }
        action.flash(signup.id);
        setReminderTarget(null);
        return { ok: true, result };
      } catch (error) {
        if (error instanceof SignupApiError && error.status === 429) {
          return { ok: false, cooldown: error.message };
        }
        void reportPortalOperationalError(
          "teacher_portal",
          { organizationId, operation: "classroom_signups.remind", error: "" },
          error,
        );
        adminToast.error("Reminder not sent.", {
          id: errorId,
          description: `${formatActionError(error, "Failed to send the reminder.")} No families were contacted.`,
          action: { label: "Retry", onClick: () => void send(signup, message) },
        });
        return { ok: false, cooldown: null };
      } finally {
        setSendingReminder(false);
      }
    },
    [action, organizationId],
  );

  /* ---- CSV ---- */
  const exportCsv = useCallback(
    (signup: ClassroomSignup) => {
      const responses = confirmedResponses(signup.id);
      const csv = buildSignupResponsesCsv(signup, responses);
      const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = signupResponsesCsvFilename(signup);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      adminToast.success("CSV downloaded.", {
        id: `signup-csv-${signup.id}`,
        description: `${plural(responses.length, "response")} from “${signup.title}”.`,
      });
    },
    [confirmedResponses],
  );

  return {
    theme,
    previewMode,
    signups,
    filteredSignups,
    responsesBySignupId,
    confirmedResponses,
    metrics,
    statusCounts,
    drafts,
    needsAttention,
    filter,
    setFilter,
    creating,
    startCreate,
    cancelCreate,
    handlePublished,
    handleDraftSaved,
    selectedSignupId,
    selectedSignup,
    openSidebar,
    closeSidebar,
    handleSignupUpdated,
    flashId: action.lastSavedKey,
    closeTarget,
    requestClose,
    cancelClose: () => setCloseTarget(null),
    confirmClose,
    closing: action.pendingKey?.startsWith("signup-close-") ?? false,
    reminderTarget,
    openReminder,
    closeReminder,
    sendReminder,
    sendingReminder,
    exportCsv,
  };
}

export type TeacherClassroomSignupsModel = ReturnType<typeof useTeacherClassroomSignupsModel>;
