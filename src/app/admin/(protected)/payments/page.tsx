"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { formatFeeAmount } from "@/lib/admissions/application-form-schema";
import {
  listAllPayments,
  PAYMENT_STATUS_LABELS,
  PAYMENT_TYPE_LABELS,
  type PaymentRecordDisplayRow,
} from "@/lib/admissions/payment-records";
import type { PaymentStatus, PaymentType } from "@/lib/stripe/application-payments";
import { createClient } from "@/utils/supabase/client";

type OrganizationOption = {
  id: string;
  name: string;
  slug: string;
};

function formatDateTime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function AdminPaymentsPage() {
  const supabase = createClient();
  const [organizations, setOrganizations] = useState<OrganizationOption[]>([]);
  const [organizationId, setOrganizationId] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | PaymentStatus>("");
  const [typeFilter, setTypeFilter] = useState<"" | PaymentType>("");
  const [rows, setRows] = useState<PaymentRecordDisplayRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrganizations() {
      const { data, error: orgError } = await supabase
        .from("organizations")
        .select("id, name, slug")
        .order("name", { ascending: true });

      if (orgError) {
        setError(orgError.message);
        return;
      }

      setOrganizations(
        (data ?? []).map((row) => ({
          id: String(row.id),
          name: String(row.name),
          slug: String(row.slug),
        })),
      );
    }

    void loadOrganizations();
  }, [supabase]);

  const loadPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listAllPayments(supabase, {
        organizationId: organizationId || undefined,
        status: statusFilter || undefined,
        paymentType: typeFilter || undefined,
      });
      setRows(data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load payments.",
      );
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [organizationId, statusFilter, supabase, typeFilter]);

  useEffect(() => {
    void loadPayments();
  }, [loadPayments]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-text">Payments</h1>
        <p className="mt-1 text-sm text-text-muted">
          Cross-school admissions payment ledger for application and enrollment
          charges.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <select
          value={organizationId}
          onChange={(event) => setOrganizationId(event.target.value)}
          className="rounded-md border border-border px-3 py-2 text-sm"
        >
          <option value="">All schools</option>
          {organizations.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as "" | PaymentStatus)
          }
          className="rounded-md border border-border px-3 py-2 text-sm"
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
          className="rounded-md border border-border px-3 py-2 text-sm"
        >
          <option value="">All types</option>
          <option value="application_fee">Application fee</option>
          <option value="enrollment_checklist">Enrollment</option>
        </select>
      </div>

      {error ? (
        <p className="mb-4 text-sm text-red-600">{error}</p>
      ) : null}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading payments…
        </div>
      ) : rows.length === 0 ? (
        <p className="text-sm text-text-muted">No payments recorded yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="min-w-full text-sm">
            <thead className="bg-surface-soft">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-text-muted">
                  Date
                </th>
                <th className="px-3 py-2 text-left font-medium text-text-muted">
                  School
                </th>
                <th className="px-3 py-2 text-left font-medium text-text-muted">
                  Label
                </th>
                <th className="px-3 py-2 text-left font-medium text-text-muted">
                  Type
                </th>
                <th className="px-3 py-2 text-left font-medium text-text-muted">
                  Amount
                </th>
                <th className="px-3 py-2 text-left font-medium text-text-muted">
                  Status
                </th>
                <th className="px-3 py-2 text-left font-medium text-text-muted">
                  Payer
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-border">
                  <td className="px-3 py-2 whitespace-nowrap">
                    {formatDateTime(row.paidAt ?? row.createdAt)}
                  </td>
                  <td className="px-3 py-2">{row.organizationName ?? "—"}</td>
                  <td className="px-3 py-2">{row.label ?? "Payment"}</td>
                  <td className="px-3 py-2">
                    {PAYMENT_TYPE_LABELS[row.paymentType]}
                  </td>
                  <td className="px-3 py-2 font-medium">
                    {formatFeeAmount(row.amountCents)}
                  </td>
                  <td className="px-3 py-2">
                    {PAYMENT_STATUS_LABELS[row.status]}
                  </td>
                  <td className="px-3 py-2 text-text-muted">
                    {row.payerEmail ?? row.applicantLabel ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
