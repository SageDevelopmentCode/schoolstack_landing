"use client";

import { useCallback, useEffect, useState } from "react";
import { Eye, Loader2 } from "lucide-react";
import {
  applicationStatusLabel,
} from "@/lib/admissions/application-status-ui";
import {
  listOrgApplicationSubmissions,
  resolveApplicationFamilyId,
  type AdminApplicationSubmission,
} from "@/lib/admissions/application-submissions";
import { familyPreviewBasePath } from "@/lib/admissions/family-preview-access";
import { createClient } from "@/utils/supabase/client";

type OrganizationSubmissionsPanelProps = {
  organizationId: string;
  organizationSlug: string;
};

function formatUpdatedAt(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function OrganizationSubmissionsPanel({
  organizationId,
  organizationSlug,
}: OrganizationSubmissionsPanelProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<AdminApplicationSubmission[]>([]);
  const [familyIdByApplicationId, setFamilyIdByApplicationId] = useState<
    Record<string, string | null>
  >({});

  const loadSubmissions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const rows = await listOrgApplicationSubmissions(supabase, organizationId);
      setSubmissions(rows);

      const familyEntries = await Promise.all(
        rows.map(async (submission) => {
          const familyId = await resolveApplicationFamilyId(
            supabase,
            organizationId,
            submission.id,
          );
          return [submission.id, familyId] as const;
        }),
      );

      setFamilyIdByApplicationId(Object.fromEntries(familyEntries));
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Failed to load submissions",
      );
      setSubmissions([]);
      setFamilyIdByApplicationId({});
    } finally {
      setLoading(false);
    }
  }, [organizationId, supabase]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadSubmissions();
    });
  }, [loadSubmissions]);

  return (
    <section className="bg-surface border border-border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xs font-semibold text-text-faint uppercase tracking-wide font-secondary">
          Submissions
        </h2>
        {!loading ? (
          <span className="text-xs text-text-muted font-secondary">
            {submissions.length} total
          </span>
        ) : null}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-6 text-sm text-text-faint font-secondary">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading submissions…
        </div>
      ) : error ? (
        <p className="text-sm text-clay font-secondary">{error}</p>
      ) : submissions.length === 0 ? (
        <p className="text-sm text-text-faint font-secondary py-4">
          No submissions for this school yet.
        </p>
      ) : (
        <div className="overflow-x-auto -mx-1">
          <table className="w-full min-w-[520px] text-sm font-secondary">
            <thead>
              <tr className="text-left text-xs text-text-faint border-b border-border">
                <th className="px-2 py-2 font-semibold">Student</th>
                <th className="px-2 py-2 font-semibold">Contact</th>
                <th className="px-2 py-2 font-semibold">Status</th>
                <th className="px-2 py-2 font-semibold">Updated</th>
                <th className="px-2 py-2 font-semibold text-right">Preview</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission) => {
                const familyId = familyIdByApplicationId[submission.id] ?? null;
                const previewHref = familyId
                  ? `${familyPreviewBasePath(organizationSlug, familyId)}?focus=${submission.id}`
                  : null;

                return (
                  <tr
                    key={submission.id}
                    className="border-b border-border/70 last:border-b-0"
                  >
                    <td className="px-2 py-2.5 align-top">
                      <p className="font-medium text-text">
                        {submission.studentLabel ?? "—"}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5 truncate max-w-[180px]">
                        {submission.formTitle}
                      </p>
                    </td>
                    <td className="px-2 py-2.5 align-top">
                      <p className="text-text truncate max-w-[160px]">
                        {submission.guardianName ?? "—"}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5 truncate max-w-[160px]">
                        {submission.contactEmail ?? "—"}
                      </p>
                    </td>
                    <td className="px-2 py-2.5 align-top">
                      <span className="text-xs text-text-muted">
                        {applicationStatusLabel(submission.status)}
                      </span>
                    </td>
                    <td className="px-2 py-2.5 align-top text-xs text-text-muted whitespace-nowrap">
                      {formatUpdatedAt(submission.updatedAt)}
                    </td>
                    <td className="px-2 py-2.5 align-top text-right">
                      {previewHref ? (
                        <a
                          href={previewHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-clay hover:bg-bg transition-colors"
                          title="Open read-only family preview in a new tab"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Preview
                        </a>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs text-text-faint opacity-60 cursor-not-allowed"
                          title="No linked family yet — preview unavailable for unlinked drafts"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Preview
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
