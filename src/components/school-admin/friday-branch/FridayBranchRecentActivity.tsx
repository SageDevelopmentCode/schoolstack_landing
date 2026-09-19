"use client";

import { useCallback, useEffect, useState } from "react";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import AdminSectionKicker from "@/components/school-admin/ui/story/AdminSectionKicker";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { formatRelativeTime } from "@/lib/school-admin/activity-notifications";
import type { FridayBranchRecentSignupRow } from "@/lib/school-admin/friday-branch/friday-branch-recent-activity";
import FridayBranchStatusTag from "./FridayBranchStatusTag";

type FridayBranchRecentActivityProps = {
  C: AdminThemeTokens;
  theme: ParentThemeTokens;
  organizationId: string;
  onOpenClass: (classId: string, blockId: string) => void;
};

function statusTagForSignup(status: FridayBranchRecentSignupRow["status"]) {
  if (status === "waitlisted") {
    return <FridayBranchStatusTag label="Waitlisted" variant="amber" />;
  }
  return <FridayBranchStatusTag label="Signed up" variant="green" />;
}

export default function FridayBranchRecentActivity({
  C,
  theme,
  organizationId,
  onOpenClass,
}: FridayBranchRecentActivityProps) {
  const [signups, setSignups] = useState<FridayBranchRecentSignupRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSignups = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/school-admin/friday-branch/recent-activity?organizationId=${encodeURIComponent(organizationId)}`,
      );
      if (!response.ok) return;
      const payload = (await response.json()) as {
        signups?: FridayBranchRecentSignupRow[];
      };
      setSignups(payload.signups ?? []);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    void loadSignups();
  }, [loadSignups]);

  return (
    <section className="mt-8">
      <AdminSectionKicker theme={theme}>Recent sign-ups</AdminSectionKicker>

      <AdminCard theme={theme} className="mt-3" padding="none">
        {loading ? (
          <div className="px-4 py-6 text-sm" style={{ color: theme.muted }}>
            Loading recent sign-ups…
          </div>
        ) : signups.length === 0 ? (
          <div className="px-4 py-6 text-sm" style={{ color: theme.muted }}>
            No sign-ups yet. Families will appear here when they enroll in Friday Branch
            classes.
          </div>
        ) : (
          <ul className="divide-y" style={{ borderColor: C.border }}>
            {signups.map((signup) => (
              <li key={signup.enrollmentId}>
                <button
                  type="button"
                  onClick={() => onOpenClass(signup.classId, signup.blockId)}
                  className="flex w-full flex-col gap-2 px-4 py-3 text-left transition hover:bg-[#F8FAF8] sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold" style={{ color: theme.text }}>
                      {signup.familyName} · {signup.studentName}
                    </p>
                    <p className="mt-0.5 text-[12px]" style={{ color: theme.muted }}>
                      {signup.className} @ {signup.slotTime} · {signup.blockLabel}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 self-start sm:self-center">
                    {statusTagForSignup(signup.status)}
                    <span className="text-[11px]" style={{ color: theme.muted }}>
                      {formatRelativeTime(signup.updatedAt)}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </AdminCard>
    </section>
  );
}
