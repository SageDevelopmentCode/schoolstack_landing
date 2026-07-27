"use client";

import { useCallback, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { MUDKITCHEN_PORTAL_THEME } from "@/lib/mudkitchen-portal/theme";
import {
  parseSupportRequestStatus,
  SUPPORT_REQUEST_STATUS_META,
  formatSupportRequestTopic,
  type AdminSupportRequestRow,
} from "@/lib/school-admin/support-request-types";
import MudKitchenSupportRequestForm from "@/components/mudkitchen-portal/MudKitchenSupportRequestForm";

type MudKitchenSupportRequestsPageProps = {
  organizationId: string;
  initialRequests: AdminSupportRequestRow[];
  userEmail?: string | null;
};

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function MudKitchenSupportRequestsPage({
  organizationId,
  initialRequests,
  userEmail,
}: MudKitchenSupportRequestsPageProps) {
  const T = MUDKITCHEN_PORTAL_THEME;
  const pathname = usePathname();
  const router = useRouter();
  const [requests, setRequests] = useState(initialRequests);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refreshRequests = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    const supabase = createClient();
    const { data, error } = await supabase
      .from("admin_support_requests")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false });

    if (error) {
      setLoadError(error.message);
      setLoading(false);
      return;
    }

    setRequests(
      (data ?? []).map((row) => ({
        ...row,
        status: parseSupportRequestStatus(row.status) ?? "open",
        attachments: Array.isArray(row.attachments) ? row.attachments : [],
        updated_at: row.updated_at ?? row.created_at,
      })) as AdminSupportRequestRow[],
    );
    setLoading(false);
    router.refresh();
  }, [organizationId, router]);

  return (
    <div className="space-y-10">
      <div>
        <p
          className="font-secondary text-[11px] font-semibold uppercase tracking-widest"
          style={{ color: T.textSecondary }}
        >
          Support
        </p>
        <h1
          className="font-heading mt-2 text-[clamp(1.75rem,3vw,2.25rem)] font-medium leading-tight"
          style={{ color: T.textPrimary }}
        >
          Requests
        </h1>
        <p
          className="font-secondary mt-3 max-w-[640px] text-[15px] leading-relaxed"
          style={{ color: T.textSecondary }}
        >
          Your history with the MudKitchen team — and a place to send new requests.
        </p>
      </div>

      <MudKitchenSupportRequestForm
        organizationId={organizationId}
        userEmail={userEmail}
        currentPath={pathname}
        onSubmitted={() => void refreshRequests()}
      />

      <div>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2
            className="font-heading text-xl font-medium"
            style={{ color: T.textPrimary }}
          >
            Your requests
          </h2>
          {loading ? (
            <span className="text-sm" style={{ color: T.textSecondary }}>
              Refreshing…
            </span>
          ) : null}
        </div>

        {loadError ? (
          <p className="text-sm" style={{ color: T.clay }} role="alert">
            {loadError}
          </p>
        ) : null}

        {requests.length === 0 ? (
          <div
            className="rounded-2xl border px-6 py-10 text-center"
            style={{ backgroundColor: T.surface, borderColor: T.border }}
          >
            <p className="font-secondary text-[15px]" style={{ color: T.textSecondary }}>
              No requests yet. Use the form above to reach the MudKitchen team.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {requests.map((request) => {
              const statusMeta = SUPPORT_REQUEST_STATUS_META[request.status];

              return (
                <li
                  key={request.id}
                  className="rounded-2xl border p-5 sm:p-6"
                  style={{ backgroundColor: T.surface, borderColor: T.border }}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p
                        className="font-secondary text-xs font-semibold uppercase tracking-widest"
                        style={{ color: T.textSecondary }}
                      >
                        {formatSupportRequestTopic(request.topic)}
                      </p>
                      <p
                        className="font-heading mt-1 text-lg font-medium"
                        style={{ color: T.textPrimary }}
                      >
                        {request.subject?.trim() ||
                          formatSupportRequestTopic(request.topic)}
                      </p>
                      <p
                        className="font-secondary mt-1 text-sm"
                        style={{ color: T.textFaint }}
                      >
                        {formatTimestamp(request.created_at)}
                      </p>
                    </div>
                    <span
                      className="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
                      style={{
                        backgroundColor: T.accentSoft,
                        color: T.accent,
                      }}
                    >
                      {statusMeta.label}
                    </span>
                  </div>
                  <p
                    className="font-secondary mt-4 whitespace-pre-wrap text-[15px] leading-relaxed"
                    style={{ color: T.textSecondary }}
                  >
                    {request.description}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
