"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { formatFeeAmount } from "@/lib/admissions/application-form-schema";
import {
  listAllPayments,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_TYPE_LABELS,
  type PaymentRecordDisplayRow,
} from "@/lib/admissions/payment-records";
import type { PaymentStatus, PaymentType } from "@/lib/stripe/application-payments";
import { createClient } from "@/utils/supabase/client";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { AdminSelect } from "@/components/admin/ui/AdminSelect";
import {
  AdminDataTable,
  AdminDataTableBody,
  AdminDataTableCell,
  AdminDataTableHead,
  AdminDataTableHeaderCell,
  AdminDataTableRow,
} from "@/components/admin/ui/AdminDataTable";

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
        ((data as OrganizationOption[]) ?? []).map((row) => ({
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
    queueMicrotask(() => {
      void loadPayments();
    });
  }, [loadPayments]);

  return (
    <div className="h-[calc(100vh-3rem)] overflow-y-auto">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <AdminPageHeader
          title="Payments"
          description="Cross-school admissions payment ledger for application and enrollment charges."
        />

        <div className="mb-4 flex flex-wrap gap-3">
          <AdminSelect
            value={organizationId}
            onChange={(event) => setOrganizationId(event.target.value)}
          >
            <option value="">All schools</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </AdminSelect>
          <AdminSelect
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as "" | PaymentStatus)
            }
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="succeeded">Succeeded</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </AdminSelect>
          <AdminSelect
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(event.target.value as "" | PaymentType)
            }
          >
            <option value="">All types</option>
            <option value="application_fee">Application fee</option>
            <option value="enrollment_checklist">Enrollment</option>
          </AdminSelect>
        </div>

        {error ? (
          <p className="mb-4 text-sm text-admin-error">{error}</p>
        ) : null}

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-admin-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading payments…
          </div>
        ) : rows.length === 0 ? (
          <p className="text-sm text-admin-muted">No payments recorded yet.</p>
        ) : (
          <div className="rounded-admin-md border border-admin-border overflow-hidden">
            <AdminDataTable>
              <AdminDataTableHead>
                <AdminDataTableHeaderCell>Date</AdminDataTableHeaderCell>
                <AdminDataTableHeaderCell>School</AdminDataTableHeaderCell>
                <AdminDataTableHeaderCell>Label</AdminDataTableHeaderCell>
                <AdminDataTableHeaderCell>Type</AdminDataTableHeaderCell>
                <AdminDataTableHeaderCell>School amount</AdminDataTableHeaderCell>
                <AdminDataTableHeaderCell>Charged</AdminDataTableHeaderCell>
                <AdminDataTableHeaderCell>Method</AdminDataTableHeaderCell>
                <AdminDataTableHeaderCell>Status</AdminDataTableHeaderCell>
                <AdminDataTableHeaderCell>Payer</AdminDataTableHeaderCell>
              </AdminDataTableHead>
              <AdminDataTableBody>
                {rows.map((row) => (
                  <AdminDataTableRow key={row.id}>
                    <AdminDataTableCell className="whitespace-nowrap">
                      {formatDateTime(row.paidAt ?? row.createdAt)}
                    </AdminDataTableCell>
                    <AdminDataTableCell>
                      {row.organizationName ?? "—"}
                    </AdminDataTableCell>
                    <AdminDataTableCell>{row.label ?? "Payment"}</AdminDataTableCell>
                    <AdminDataTableCell>
                      {PAYMENT_TYPE_LABELS[row.paymentType]}
                    </AdminDataTableCell>
                    <AdminDataTableCell className="font-medium">
                      {formatFeeAmount(row.amountCents)}
                    </AdminDataTableCell>
                    <AdminDataTableCell>
                      {formatFeeAmount(row.chargedAmountCents ?? row.amountCents)}
                    </AdminDataTableCell>
                    <AdminDataTableCell>
                      {row.paymentMethodType
                        ? PAYMENT_METHOD_LABELS[row.paymentMethodType]
                        : "—"}
                    </AdminDataTableCell>
                    <AdminDataTableCell>
                      {PAYMENT_STATUS_LABELS[row.status]}
                    </AdminDataTableCell>
                    <AdminDataTableCell className="text-admin-muted">
                      {row.payerEmail ?? row.applicantLabel ?? "—"}
                    </AdminDataTableCell>
                  </AdminDataTableRow>
                ))}
              </AdminDataTableBody>
            </AdminDataTable>
          </div>
        )}
      </div>
    </div>
  );
}
