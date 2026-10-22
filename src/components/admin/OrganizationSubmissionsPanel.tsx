"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, Eye, Loader2, Mail } from "lucide-react";
import OrganizationContactEmailHistoryPanel from "@/components/admin/OrganizationContactEmailHistoryPanel";
import ParentPortalLoginBadge from "@/components/admissions/ParentPortalLoginBadge";
import OrganizationFamilyNotificationsPanel from "@/components/admin/OrganizationFamilyNotificationsPanel";
import OrganizationGuardianAccessTable from "@/components/admin/OrganizationGuardianAccessTable";
import {
  AdminSkeletonBlock,
  OrganizationGuardianAccessTableSkeleton,
  OrganizationSubmissionsTableSkeleton,
} from "@/components/admin/ui/AdminSkeleton";
import {
  applicationStatusLabel,
} from "@/lib/admissions/application-status-ui";
import {
  listOrgApplicationSubmissionsPage,
  ORG_SUBMISSIONS_PAGE_DEFAULT_SIZE,
  resolveApplicationFamilyIds,
  type AdminApplicationSubmission,
} from "@/lib/admissions/application-submissions";
import {
  findOwnerLinkedFamilyId,
  familyIdsWithEnrolledAccess,
} from "@/lib/admissions/family-preview-access";
import {
  familyPreviewBasePath,
  schoolAdminPreviewBasePath,
} from "@/lib/admissions/preview-portal-options";
import type {
  ParentPortalLoginStatus,
  ParentPortalLoginSummary,
} from "@/lib/admissions/parent-portal-login-status";
import { createClient } from "@/utils/supabase/client";

type OrganizationSubmissionsPanelProps = {
  organizationId: string;
  organizationSlug: string;
  parentPortalEnabled: boolean;
};

function formatUpdatedAt(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function PreviewColumnSkeleton() {
  return (
    <div className="flex flex-col items-end gap-1.5">
      <AdminSkeletonBlock className="h-7 w-[5.5rem]" />
      <AdminSkeletonBlock className="h-7 w-[6.5rem]" />
    </div>
  );
}

export default function OrganizationSubmissionsPanel({
  organizationId,
  organizationSlug,
  parentPortalEnabled,
}: OrganizationSubmissionsPanelProps) {
  const supabase = createClient();
  const [listLoading, setListLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loginLoading, setLoginLoading] = useState(true);
  const [previewMetaLoading, setPreviewMetaLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<AdminApplicationSubmission[]>(
    [],
  );
  const [totalCount, setTotalCount] = useState(0);
  const [listOffset, setListOffset] = useState(0);
  const [familyIdByApplicationId, setFamilyIdByApplicationId] = useState<
    Record<string, string | null>
  >({});
  const [guardianStatuses, setGuardianStatuses] = useState<
    ParentPortalLoginStatus[]
  >([]);
  const [loginStatusByGuardianId, setLoginStatusByGuardianId] = useState<
    Record<string, ParentPortalLoginStatus>
  >({});
  const [guardianSummary, setGuardianSummary] =
    useState<ParentPortalLoginSummary | null>(null);
  const [ownerLinkedFamilyId, setOwnerLinkedFamilyId] = useState<string | null>(
    null,
  );
  const [enrolledFamilyIds, setEnrolledFamilyIds] = useState<Set<string>>(
    new Set(),
  );
  const [notificationsPreview, setNotificationsPreview] = useState<{
    familyId: string;
    familyLabel: string;
  } | null>(null);
  const [emailHistoryPreview, setEmailHistoryPreview] = useState<{
    contactEmail: string;
    contactLabel: string;
  } | null>(null);

  const previewMetaRequestIdRef = useRef(0);

  const loadPreviewMeta = useCallback(
    async (rows: AdminApplicationSubmission[]) => {
      const requestId = previewMetaRequestIdRef.current + 1;
      previewMetaRequestIdRef.current = requestId;
      setPreviewMetaLoading(true);

      try {
        const ownerFamilyId = await findOwnerLinkedFamilyId(
          supabase,
          organizationId,
        );
        if (previewMetaRequestIdRef.current !== requestId) return;
        setOwnerLinkedFamilyId(ownerFamilyId);

        const familyMap = await resolveApplicationFamilyIds(
          supabase,
          organizationId,
          rows.map((submission) => ({
            applicationId: submission.id,
            familyId: submission.familyId,
            primaryGuardianId: submission.primaryGuardianId,
          })),
        );
        if (previewMetaRequestIdRef.current !== requestId) return;
        setFamilyIdByApplicationId(familyMap);

        const uniqueFamilyIds = [
          ...new Set(
            Object.values(familyMap).filter(
              (familyId): familyId is string => Boolean(familyId),
            ),
          ),
        ];
        const enrolled = await familyIdsWithEnrolledAccess(
          supabase,
          organizationId,
          uniqueFamilyIds,
        );
        if (previewMetaRequestIdRef.current !== requestId) return;
        setEnrolledFamilyIds(enrolled);
      } catch {
        if (previewMetaRequestIdRef.current !== requestId) return;
        setOwnerLinkedFamilyId(null);
        setFamilyIdByApplicationId({});
        setEnrolledFamilyIds(new Set());
      } finally {
        if (previewMetaRequestIdRef.current === requestId) {
          setPreviewMetaLoading(false);
        }
      }
    },
    [organizationId, supabase],
  );

  const loadLoginStatus = useCallback(async () => {
    setLoginLoading(true);
    setLoginError(null);

    try {
      const loginResponse = await fetch(
        `/api/admin/organizations/${organizationId}/parent-login-status`,
      );
      if (loginResponse.ok) {
        const loginBody = (await loginResponse.json()) as {
          statuses?: ParentPortalLoginStatus[];
          summary?: ParentPortalLoginSummary;
        };
        const statuses = loginBody.statuses ?? [];
        setGuardianStatuses(statuses);
        setGuardianSummary(loginBody.summary ?? null);
        setLoginStatusByGuardianId(
          Object.fromEntries(
            statuses.map((status) => [status.guardianId, status]),
          ),
        );
      } else {
        setGuardianStatuses([]);
        setGuardianSummary(null);
        setLoginStatusByGuardianId({});
        setLoginError("Failed to load parent sign-in status.");
      }
    } catch {
      setGuardianStatuses([]);
      setGuardianSummary(null);
      setLoginStatusByGuardianId({});
      setLoginError("Failed to load parent sign-in status.");
    } finally {
      setLoginLoading(false);
    }
  }, [organizationId]);

  const fetchSubmissionsPage = useCallback(
    async (offset: number, append: boolean) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setListLoading(true);
      }
      setListError(null);

      try {
        const page = await listOrgApplicationSubmissionsPage(
          supabase,
          organizationId,
          {
            limit: ORG_SUBMISSIONS_PAGE_DEFAULT_SIZE,
            offset,
            enrichment: "minimal",
          },
        );

        setTotalCount(page.totalCount);
        setListOffset(offset + page.submissions.length);
        setSubmissions((prev) => {
          const merged = append
            ? [...prev, ...page.submissions]
            : page.submissions;
          void loadPreviewMeta(merged);
          return merged;
        });
      } catch (loadError) {
        setListError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load submissions",
        );
        if (!append) {
          setSubmissions([]);
          setTotalCount(0);
          setListOffset(0);
          setFamilyIdByApplicationId({});
          setEnrolledFamilyIds(new Set());
          setOwnerLinkedFamilyId(null);
        }
      } finally {
        if (append) {
          setLoadingMore(false);
        } else {
          setListLoading(false);
        }
      }
    },
    [loadPreviewMeta, organizationId, supabase],
  );

  const loadInitial = useCallback(async () => {
    previewMetaRequestIdRef.current += 1;
    setSubmissions([]);
    setTotalCount(0);
    setListOffset(0);
    setFamilyIdByApplicationId({});
    setEnrolledFamilyIds(new Set());
    setOwnerLinkedFamilyId(null);

    void loadLoginStatus();
    await fetchSubmissionsPage(0, false);
  }, [fetchSubmissionsPage, loadLoginStatus]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadInitial();
    });
  }, [loadInitial]);

  const hasMore = submissions.length < totalCount;

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || listLoading) return;
    await fetchSubmissionsPage(listOffset, true);
  }, [fetchSubmissionsPage, hasMore, listLoading, listOffset, loadingMore]);

  const showTableSkeleton = listLoading && submissions.length === 0;

  return (
    <div className="space-y-6">
      <section className="bg-admin-surface border border-admin-border rounded-admin-md p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xs font-semibold text-admin-faint uppercase tracking-wide font-secondary">
            Submissions
          </h2>
          {!showTableSkeleton ? (
            <span className="text-xs text-admin-muted font-secondary">
              {totalCount > 0 && submissions.length < totalCount
                ? `Showing ${submissions.length} of ${totalCount}`
                : `${totalCount} total`}
            </span>
          ) : null}
        </div>

        {showTableSkeleton ? (
          <OrganizationSubmissionsTableSkeleton />
        ) : listError ? (
          <p className="text-sm text-admin-accent font-secondary">{listError}</p>
        ) : submissions.length === 0 ? (
          <p className="text-sm text-admin-faint py-4">
            No submissions for this school yet.
          </p>
        ) : (
          <div>
            <table className="w-full text-sm font-secondary">
              <thead>
                <tr className="text-left text-xs text-admin-faint border-b border-admin-border">
                  <th className="px-2 py-2 font-semibold">Student</th>
                  <th className="px-2 py-2 font-semibold">Contact</th>
                  <th className="px-2 py-2 font-semibold">Status</th>
                  <th className="px-2 py-2 font-semibold">Parent sign-in</th>
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

                  const showAdminPreview =
                    familyId != null && familyId === ownerLinkedFamilyId;
                  const showNotificationsPreview =
                    familyId != null &&
                    parentPortalEnabled &&
                    enrolledFamilyIds.has(familyId);

                  return (
                    <tr
                      key={submission.id}
                      className="border-b border-admin-border/70 last:border-b-0"
                    >
                      <td className="px-2 py-2.5 align-top">
                        <p className="font-medium text-admin-text">
                          {submission.studentLabel ?? "—"}
                        </p>
                        <p className="text-xs text-admin-muted mt-0.5 truncate">
                          {submission.formTitle}
                        </p>
                      </td>
                      <td className="px-2 py-2.5 align-top">
                        <p className="text-admin-text truncate">
                          {submission.guardianName ?? "—"}
                        </p>
                        <p className="text-xs text-admin-muted mt-0.5 truncate">
                          {submission.contactEmail ?? "—"}
                        </p>
                      </td>
                      <td className="px-2 py-2.5 align-top">
                        <span className="text-xs text-admin-muted">
                          {applicationStatusLabel(submission.status)}
                        </span>
                      </td>
                      <td className="px-2 py-2.5 align-top">
                        {loginLoading ? (
                          <AdminSkeletonBlock className="h-6 w-20 rounded-full" />
                        ) : (
                          <ParentPortalLoginBadge
                            compact
                            status={
                              submission.primaryGuardianId
                                ? loginStatusByGuardianId[
                                    submission.primaryGuardianId
                                  ]
                                : null
                            }
                          />
                        )}
                      </td>
                      <td className="px-2 py-2.5 align-top text-xs text-admin-muted whitespace-nowrap">
                        {formatUpdatedAt(submission.updatedAt)}
                      </td>
                      <td className="px-2 py-2.5 align-top text-right whitespace-nowrap">
                        {previewMetaLoading ? (
                          <PreviewColumnSkeleton />
                        ) : (
                          <div className="flex flex-col items-end gap-1.5">
                            {previewHref && familyId ? (
                              <>
                                <a
                                  href={previewHref}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 rounded-admin-sm border border-admin-border px-2.5 py-1.5 text-xs font-medium text-admin-accent hover:bg-admin-bg transition-colors"
                                  title="Open read-only family apply preview in a new tab"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  Family
                                </a>
                                {showAdminPreview ? (
                                  <a
                                    href={schoolAdminPreviewBasePath(
                                      organizationSlug,
                                      familyId,
                                    )}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 rounded-admin-sm border border-admin-border px-2.5 py-1.5 text-xs font-medium text-admin-accent hover:bg-admin-bg transition-colors"
                                    title="Open read-only school admin preview with portal switcher"
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                    Admin
                                  </a>
                                ) : null}
                                {showNotificationsPreview ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setNotificationsPreview({
                                        familyId,
                                        familyLabel:
                                          submission.guardianName ??
                                          submission.contactEmail ??
                                          "Family",
                                      })
                                    }
                                    className="inline-flex items-center gap-1.5 rounded-admin-sm border border-admin-border px-2.5 py-1.5 text-xs font-medium text-admin-accent hover:bg-admin-bg transition-colors"
                                    title="Preview this family's parent notifications without marking them read"
                                  >
                                    <Bell className="h-3.5 w-3.5" />
                                    Notifications
                                  </button>
                                ) : null}
                              </>
                            ) : (
                              <span
                                className="inline-flex items-center gap-1.5 rounded-admin-sm border border-admin-border px-2.5 py-1.5 text-xs text-admin-faint opacity-60 cursor-not-allowed"
                                title="No linked family yet — preview unavailable for unlinked drafts"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                Preview
                              </span>
                            )}
                            {submission.contactEmail ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setEmailHistoryPreview({
                                    contactEmail: submission.contactEmail!,
                                    contactLabel:
                                      submission.guardianName ??
                                      submission.contactEmail ??
                                      "Contact",
                                  })
                                }
                                className="inline-flex items-center gap-1.5 rounded-admin-sm border border-admin-border px-2.5 py-1.5 text-xs font-medium text-admin-accent hover:bg-admin-bg transition-colors"
                                title="View Zoho Mail history for this contact email"
                              >
                                <Mail className="h-3.5 w-3.5" />
                                Email history
                              </button>
                            ) : (
                              <span
                                className="inline-flex items-center gap-1.5 rounded-admin-sm border border-admin-border px-2.5 py-1.5 text-xs text-admin-faint opacity-60 cursor-not-allowed"
                                title="No contact email on submission"
                              >
                                <Mail className="h-3.5 w-3.5" />
                                Email history
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {hasMore ? (
              <div className="flex justify-center pt-4">
                <button
                  type="button"
                  onClick={() => void loadMore()}
                  disabled={loadingMore || listLoading}
                  className="inline-flex items-center gap-2 rounded-admin-md border border-admin-border bg-admin-surface px-3 py-1.5 text-xs font-semibold text-admin-text hover:bg-admin-bg disabled:opacity-60"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      Loading…
                    </>
                  ) : (
                    "Load more"
                  )}
                </button>
              </div>
            ) : null}
          </div>
        )}
      </section>

      {loginLoading ? (
        <OrganizationGuardianAccessTableSkeleton />
      ) : loginError ? (
        <section className="bg-admin-surface border border-admin-border rounded-admin-md p-4">
          <p className="text-sm text-admin-accent font-secondary">{loginError}</p>
        </section>
      ) : (
        <OrganizationGuardianAccessTable
          statuses={guardianStatuses}
          summary={guardianSummary}
        />
      )}

      {notificationsPreview ? (
        <OrganizationFamilyNotificationsPanel
          organizationId={organizationId}
          organizationSlug={organizationSlug}
          familyId={notificationsPreview.familyId}
          familyLabel={notificationsPreview.familyLabel}
          open
          onClose={() => setNotificationsPreview(null)}
        />
      ) : null}

      {emailHistoryPreview ? (
        <OrganizationContactEmailHistoryPanel
          contactEmail={emailHistoryPreview.contactEmail}
          contactLabel={emailHistoryPreview.contactLabel}
          open
          onClose={() => setEmailHistoryPreview(null)}
        />
      ) : null}
    </div>
  );
}
