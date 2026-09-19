"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { SkeletonBlock } from "@/components/school-admin/skeletons";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
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
      <AdminCard theme={theme} padding="none">
        <header
          className="border-b px-[18px] py-[17px]"
          style={{ borderColor: "#EDF1ED" }}
        >
          <h2
            className="font-heading text-xl font-semibold"
            style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
          >
            Recent sign-ups
          </h2>
          <p className="mt-0.5 text-[11px]" style={{ color: "#7B898D" }}>
            Latest family enrollments across all blocks.
          </p>
        </header>

        {loading ? (
          <div className="divide-y" style={{ borderColor: "#EDF1ED" }}>
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="grid gap-3 px-[17px] py-[13px] sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1.4fr)_auto_auto_auto]"
              >
                <div className="space-y-1.5">
                  <SkeletonBlock C={C} className="h-3.5 w-28" />
                  <SkeletonBlock C={C} className="h-2.5 w-20" />
                </div>
                <div className="space-y-1.5">
                  <SkeletonBlock C={C} className="h-3.5 w-36" />
                  <SkeletonBlock C={C} className="h-2.5 w-16" />
                </div>
                <SkeletonBlock C={C} className="h-7 w-14 rounded-[9px]" />
                <SkeletonBlock C={C} className="h-5 w-16 rounded-full" />
                <SkeletonBlock C={C} className="h-3 w-10" />
              </div>
            ))}
          </div>
        ) : signups.length === 0 ? (
          <div className="px-[18px] py-6 text-sm" style={{ color: theme.muted }}>
            No sign-ups yet. Families will appear here when they enroll in Friday Branch
            classes.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse">
              <thead>
                <tr style={{ backgroundColor: "#FBFCFB" }}>
                  {["Student", "Class", "Time", "Status", ""].map((label) => (
                    <th
                      key={label || "meta"}
                      className="px-[17px] py-2.5 text-left text-[10px] font-extrabold uppercase tracking-[0.08em]"
                      style={{ color: "#8B9699" }}
                    >
                      {label || <span className="sr-only">When</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {signups.map((signup) => (
                  <tr
                    key={signup.enrollmentId}
                    className="cursor-pointer transition-colors hover:bg-[#F8FCF8]"
                    onClick={() => onOpenClass(signup.classId, signup.blockId)}
                  >
                    <td
                      className="border-t px-[17px] py-[13px] align-top"
                      style={{ borderColor: "#EDF1ED" }}
                    >
                      <b className="block text-xs" style={{ color: theme.ink }}>
                        {signup.studentName}
                      </b>
                      <span className="mt-0.5 block text-[11px]" style={{ color: theme.muted }}>
                        {signup.familyName}
                      </span>
                    </td>
                    <td
                      className="border-t px-[17px] py-[13px] align-top"
                      style={{ borderColor: "#EDF1ED" }}
                    >
                      <b className="block text-xs" style={{ color: theme.ink }}>
                        {signup.className}
                      </b>
                      <span className="mt-0.5 block text-[11px]" style={{ color: theme.muted }}>
                        {signup.blockLabel}
                      </span>
                    </td>
                    <td
                      className="border-t px-[17px] py-[13px] align-top"
                      style={{ borderColor: "#EDF1ED" }}
                    >
                      <span
                        className="inline-block rounded-[9px] px-2 py-1.5 text-[11px] font-extrabold"
                        style={{ backgroundColor: "#EDF4EE", color: "#315E4F" }}
                      >
                        {signup.slotTime || "—"}
                      </span>
                    </td>
                    <td
                      className="border-t px-[17px] py-[13px] align-top"
                      style={{ borderColor: "#EDF1ED" }}
                    >
                      {statusTagForSignup(signup.status)}
                    </td>
                    <td
                      className="border-t px-[17px] py-[13px] align-top"
                      style={{ borderColor: "#EDF1ED" }}
                    >
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-[11px] whitespace-nowrap" style={{ color: theme.muted }}>
                          {formatRelativeTime(signup.updatedAt)}
                        </span>
                        <ChevronRight
                          className="h-3.5 w-3.5 shrink-0"
                          style={{ color: theme.muted }}
                          aria-hidden="true"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </section>
  );
}
