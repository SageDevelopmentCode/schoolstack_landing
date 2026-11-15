"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronRight, Users } from "lucide-react";
import { GardenEmptyState, GardenLoadError } from "@/components/school-admin/garden/kit";
import { GardenAvatar } from "@/components/school-admin/garden/blocks";
import { GCard, GChip, GSkeleton, G_FOCUS } from "@/components/school-parent/garden/ui";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { formatRelativeTime } from "@/lib/school-admin/activity-notifications";
import type { FridayBranchRecentSignupRow } from "@/lib/school-admin/friday-branch/friday-branch-recent-activity";

type FridayBranchRecentActivityProps = {
  C?: AdminThemeTokens;
  theme?: ParentThemeTokens;
  organizationId: string;
  onOpenClass: (classId: string, blockId: string) => void;
};

/** Latest Friday Branch sign-ups (Garden). Rows open the class. */
export default function FridayBranchRecentActivity({ organizationId, onOpenClass }: FridayBranchRecentActivityProps) {
  const [signups, setSignups] = useState<FridayBranchRecentSignupRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSignups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/school-admin/friday-branch/recent-activity?organizationId=${encodeURIComponent(organizationId)}`,
      );
      if (!response.ok) throw new Error("Recent sign-ups didn't load.");
      const payload = (await response.json()) as { signups?: FridayBranchRecentSignupRow[] };
      setSignups(payload.signups ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Recent sign-ups didn't load.");
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadSignups();
    });
  }, [loadSignups]);

  return (
    <GCard
      index={3}
      kicker="Across all blocks"
      title="Recent sign-ups"
      action={signups.length > 0 ? <GChip tone="neutral">{signups.length}</GChip> : undefined}
      data-testid="friday-branch-recent"
    >
      {loading ? (
        <div className="flex flex-col gap-2" role="status" aria-live="polite">
          <span className="sr-only">Loading recent sign-ups</span>
          {Array.from({ length: 3 }).map((_, i) => (
            <GSkeleton key={i} className="h-[56px] !rounded-[14px]" />
          ))}
        </div>
      ) : error ? (
        <GardenLoadError title="Recent sign-ups didn't load" description={error} onRetry={() => void loadSignups()} />
      ) : signups.length === 0 ? (
        <GardenEmptyState
          icon={Users}
          title="No sign-ups yet"
          description="Families will appear here when they enroll in Friday Branch classes."
        />
      ) : (
        <ul className="m-0 flex list-none flex-col gap-1 p-0">
          {signups.map((signup) => (
            <li key={signup.enrollmentId}>
              <button
                type="button"
                onClick={() => onOpenClass(signup.classId, signup.blockId)}
                className={`flex w-full items-center gap-3 rounded-[14px] px-2.5 py-2.5 text-left transition-colors hover:bg-[var(--sf-accent-wash)] ${G_FOCUS} focus-visible:ring-inset`}
                aria-label={`${signup.studentName} in ${signup.className}. Open class`}
              >
                <GardenAvatar name={signup.studentName} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-extrabold text-[var(--sf-ink)]">
                    {signup.studentName}
                    <span className="font-semibold text-[var(--sf-soft)]"> · {signup.familyName}</span>
                  </span>
                  <span className="block truncate text-[12.5px] font-semibold text-[var(--sf-soft)]">
                    {signup.className} · {signup.blockLabel} · {signup.slotTime || "—"}
                  </span>
                </span>
                <GChip tone={signup.status === "waitlisted" ? "warning" : "success"}>
                  {signup.status === "waitlisted" ? "Waitlisted" : "Signed up"}
                </GChip>
                <span className="hidden whitespace-nowrap text-[12px] font-semibold text-[var(--sf-soft)] sm:inline">
                  {formatRelativeTime(signup.updatedAt)}
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-[var(--sf-ink)]/35" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </GCard>
  );
}
