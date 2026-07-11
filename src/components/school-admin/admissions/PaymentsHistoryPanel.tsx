"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { formatFeeAmount } from "@/lib/admissions/application-form-schema";
import {
  listApplicationPayments,
  listOrganizationPayments,
  PAYMENT_STATUS_LABELS,
  PAYMENT_TYPE_LABELS,
  type PaymentRecordDisplayRow,
} from "@/lib/admissions/payment-records";
import type { PaymentStatus, PaymentType } from "@/lib/stripe/application-payments";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { createClient } from "@/utils/supabase/client";

type PaymentsHistoryPanelProps = {
  organizationId?: string;
  applicationId?: string;
  orgSlug?: string;
  branding: OrganizationBranding;
  showOrganizationColumn?: boolean;
};

function formatDateTime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function statusStyle(status: PaymentStatus, C: ReturnType<typeof buildAdminThemeTokens>) {
  switch (status) {
    case "succeeded":
      return { color: "#16A34A", backgroundColor: "#ECFDF3" };
    case "pending":
      return { color: C.warning, backgroundColor: "#FFFBEB" };
    case "failed":
      return { color: C.error, backgroundColor: C.errorBg };
    case "refunded":
      return { color: C.textSecondary, backgroundColor: C.elevated };
    default:
      return { color: C.textSecondary, backgroundColor: C.elevated };
  }
}

export default function PaymentsHistoryPanel({
  organizationId,
  applicationId,
  orgSlug,
  branding,
  showOrganizationColumn = false,
}: PaymentsHistoryPanelProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const supabase = createClient();
  const [rows, setRows] = useState<PaymentRecordDisplayRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"" | PaymentStatus>("");
  const [typeFilter, setTypeFilter] = useState<"" | PaymentType>("");

  const loadRows = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let data: PaymentRecordDisplayRow[];
      if (applicationId) {
        data = await listApplicationPayments(supabase, applicationId);
      } else if (organizationId) {
        data = await listOrganizationPayments(supabase, organizationId, {
          status: statusFilter || undefined,
          paymentType: typeFilter || undefined,
        });
      } else {
        data = [];
      }
      setRows(data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load payment history.",
      );
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [applicationId, organizationId, statusFilter, supabase, typeFilter]);

  useEffect(() => {
    void loadRows();
  }, [loadRows]);

  const filteredRows = useMemo(() => {
    if (applicationId) {
      return rows.filter((row) => {
        if (statusFilter && row.status !== statusFilter) return false;
        if (typeFilter && row.paymentType !== typeFilter) return false;
        return true;
      });
    }
    return rows;
  }, [applicationId, rows, statusFilter, typeFilter]);

  return (
    <div className="space-y-4">
      {!applicationId ? (
        <div className="flex flex-wrap gap-3">
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as "" | PaymentStatus)
            }
            className="rounded-md border px-3 py-2 text-sm"
            style={{ borderColor: C.border, color: C.textPrimary }}
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="succeeded">Succeeded</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          <select
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(event.target.value as "" | PaymentType)
            }
            className="rounded-md border px-3 py-2 text-sm"
            style={{ borderColor: C.border, color: C.textPrimary }}
          >
            <option value="">All types</option>
            <option value="application_fee">Application fee</option>
            <option value="enrollment_checklist">Enrollment</option>
          </select>
        </div>
      ) : null}

      {error ? (
        <p className="text-sm" style={{ color: C.error }}>
          {error}
        </p>
      ) : null}

      {loading ? (
        <div
          className="flex items-center gap-2 text-sm"
          style={{ color: C.textTertiary }}
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading payment history…
        </div>
      ) : filteredRows.length === 0 ? (
        <p className="text-sm" style={{ color: C.textSecondary }}>
          No payments recorded yet.
        </p>
      ) : (
        <div
          className="overflow-x-auto rounded-lg border"
          style={{ borderColor: C.border }}
        >
          <table className="min-w-full text-sm">
            <thead style={{ backgroundColor: C.elevated }}>
              <tr>
                <th className="px-3 py-2 text-left font-medium" style={{ color: C.textSecondary }}>
                  Date
                </th>
                <th className="px-3 py-2 text-left font-medium" style={{ color: C.textSecondary }}>
                  Label
                </th>
                <th className="px-3 py-2 text-left font-medium" style={{ color: C.textSecondary }}>
                  Type
                </th>
                <th className="px-3 py-2 text-left font-medium" style={{ color: C.textSecondary }}>
                  Amount
                </th>
                <th className="px-3 py-2 text-left font-medium" style={{ color: C.textSecondary }}>
                  Status
                </th>
                <th className="px-3 py-2 text-left font-medium" style={{ color: C.textSecondary }}>
                  Payer
                </th>
                {showOrganizationColumn ? (
                  <th className="px-3 py-2 text-left font-medium" style={{ color: C.textSecondary }}>
                    School
                  </th>
                ) : null}
                {!applicationId ? (
                  <th className="px-3 py-2 text-left font-medium" style={{ color: C.textSecondary }}>
                    Application
                  </th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={row.id} style={{ borderTop: `1px solid ${C.border}` }}>
                  <td className="px-3 py-2 whitespace-nowrap" style={{ color: C.textPrimary }}>
                    {formatDateTime(row.paidAt ?? row.createdAt)}
                  </td>
                  <td className="px-3 py-2" style={{ color: C.textPrimary }}>
                    {row.label ?? "Payment"}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap" style={{ color: C.textSecondary }}>
                    {PAYMENT_TYPE_LABELS[row.paymentType]}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap font-medium" style={{ color: C.textPrimary }}>
                    {formatFeeAmount(row.amountCents)}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-medium"
                      style={statusStyle(row.status, C)}
                    >
                      {PAYMENT_STATUS_LABELS[row.status]}
                    </span>
                  </td>
                  <td className="px-3 py-2" style={{ color: C.textSecondary }}>
                    {row.payerEmail ?? row.applicantLabel ?? "—"}
                  </td>
                  {showOrganizationColumn ? (
                    <td className="px-3 py-2" style={{ color: C.textSecondary }}>
                      {row.organizationName ?? "—"}
                    </td>
                  ) : null}
                  {!applicationId && orgSlug ? (
                    <td className="px-3 py-2">
                      <Link
                        href={`/school/${orgSlug}/admin/admissions/submissions?application=${row.applicationId}`}
                        className="underline-offset-2 hover:underline"
                        style={{ color: C.accent }}
                      >
                        {row.applicantLabel ?? "View application"}
                      </Link>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
