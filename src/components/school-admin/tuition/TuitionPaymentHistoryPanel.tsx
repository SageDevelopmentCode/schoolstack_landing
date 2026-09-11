"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import { SchoolAdminTableSkeleton } from "@/components/school-admin/skeletons";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import TuitionStudentBadge from "@/components/school-admin/tuition/TuitionStudentBadge";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import { parentThemeToAdminCompat } from "@/lib/organization-settings/parent-theme";
import type { AdminTuitionPaymentRecord } from "@/lib/tuition/payments";
import { formatCents } from "@/lib/tuition/pricing";
import { getStudentBadgeColors } from "@/lib/tuition/student-badge-colors";

const PAYMENTS_PAGE_SIZE = 50;

type TuitionPaymentHistoryPanelProps = {
  organizationId: string;
  onOpenFamily?: (familyId: string) => void;
};

async function fetchPaymentsPage(
  organizationId: string,
  offset: number,
): Promise<{
  payments: AdminTuitionPaymentRecord[];
  totalCount: number;
  hasMore: boolean;
}> {
  const params = new URLSearchParams({
    organizationId,
    limit: String(PAYMENTS_PAGE_SIZE),
    offset: String(offset),
  });
  const response = await fetch(`/api/school-admin/tuition/payments?${params}`);
  const payload = (await response.json()) as {
    payments?: AdminTuitionPaymentRecord[];
    totalCount?: number;
    hasMore?: boolean;
    error?: string;
  };
  if (!response.ok) {
    throw new Error(payload.error ?? "Failed to load payment history.");
  }
  return {
    payments: payload.payments ?? [],
    totalCount: payload.totalCount ?? 0,
    hasMore: payload.hasMore ?? false,
  };
}

function formatPaymentDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString();
}

export default function TuitionPaymentHistoryPanel({
  organizationId,
  onOpenFamily,
}: TuitionPaymentHistoryPanelProps) {
  const { theme } = useSchoolAdminStoryTheme();
  const C = useMemo(() => parentThemeToAdminCompat(theme), [theme]);
  const studentBadgeColors = useMemo(() => getStudentBadgeColors(C, 0), [C]);

  const [payments, setPayments] = useState<AdminTuitionPaymentRecord[]>([]);
  const paymentsLengthRef = useRef(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadPayments = useCallback(
    async ({ append = false }: { append?: boolean } = {}) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
      }

      try {
        const offset = append ? paymentsLengthRef.current : 0;
        const page = await fetchPaymentsPage(organizationId, offset);
        setTotalCount(page.totalCount);
        setPayments((current) => {
          const next = append ? [...current, ...page.payments] : page.payments;
          paymentsLengthRef.current = next.length;
          return next;
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load payment history.";
      void reportPortalOperationalError("school_admin", {
        organizationId,
        operation: "tuition.payment_history.load",
        error: "",
      }, err);
        if (append) {
          adminToast.error(message);
        } else {
          setError(message);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [organizationId],
  );

  useEffect(() => {
    queueMicrotask(() => {
      void loadPayments();
    });
  }, [loadPayments]);

  const handleRefund = async (paymentId: string) => {
    setActionLoading(paymentId);
    try {
      const response = await fetch(`/api/tuition/payments/${paymentId}/refund`, {
        method: "POST",
      });
      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Failed to process refund.");
      }
      adminToast.success("Refund processed");
      await loadPayments();
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to process refund."));
      void reportPortalOperationalError("school_admin", {
        organizationId,
        operation: "tuition.payment_history.refund",
        error: "",
      }, err);
    } finally {
      setActionLoading(null);
    }
  };

  const hasMorePayments = payments.length < totalCount;

  return (
    <AdminCard theme={theme} padding="none" data-testid="tuition-payment-history-panel">
      {loading ? (
        <SchoolAdminTableSkeleton
          C={C}
          rows={8}
          columns={6}
          showFilters={false}
          label="Loading payment history"
        />
      ) : error ? (
        <p className="px-4 py-8 text-sm sm:px-5" style={{ color: C.error }}>
          {error}
        </p>
      ) : payments.length === 0 ? (
        <p className="px-4 py-8 text-sm sm:px-5" style={{ color: theme.muted }}>
          No payments recorded yet.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead
                style={{
                  backgroundColor: C.surface,
                  borderBottom: `2px solid ${C.border}`,
                }}
              >
                <tr>
                  {["Date", "Family", "Student", "Description", "Amount", "Actions"].map(
                    (heading) => (
                      <th
                        key={heading}
                        className="px-3 py-2.5 font-medium sm:px-4"
                        style={{ color: theme.muted }}
                      >
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr
                    key={payment.id}
                    style={{ borderBottom: `1px solid ${C.border}` }}
                  >
                    <td className="px-3 py-3 sm:px-4" style={{ color: theme.ink }}>
                      {formatPaymentDate(payment.paidAt ?? payment.createdAt)}
                    </td>
                    <td className="px-3 py-3 sm:px-4">
                      {onOpenFamily && payment.familyId ? (
                        <button
                          type="button"
                          onClick={() => onOpenFamily(payment.familyId!)}
                          className="text-left font-medium underline-offset-2 hover:underline"
                          style={{ color: theme.primary }}
                        >
                          {payment.familyName}
                        </button>
                      ) : (
                        <span style={{ color: theme.ink }}>{payment.familyName}</span>
                      )}
                    </td>
                    <td className="px-3 py-3 sm:px-4">
                      {payment.studentFirstName ? (
                        <TuitionStudentBadge
                          firstName={payment.studentFirstName}
                          badgeColors={studentBadgeColors}
                        />
                      ) : (
                        <span style={{ color: theme.muted }}>—</span>
                      )}
                    </td>
                    <td className="px-3 py-3 sm:px-4" style={{ color: theme.ink }}>
                      {payment.label ?? "Tuition payment"}
                    </td>
                    <td
                      className="px-3 py-3 font-medium sm:px-4"
                      style={{ color: theme.ink }}
                    >
                      {formatCents(payment.amountCents)}
                    </td>
                    <td className="px-3 py-3 sm:px-4">
                      <AdminButton
                        theme={theme}
                        variant="outline"
                        size="compact"
                        disabled={actionLoading === payment.id}
                        onClick={() => void handleRefund(payment.id)}
                      >
                        Refund
                      </AdminButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {hasMorePayments ? (
            <div
              className="flex justify-center border-t px-4 py-3"
              style={{ borderTopColor: C.border }}
            >
              <button
                type="button"
                disabled={loadingMore}
                onClick={() => void loadPayments({ append: true })}
                className="text-[11px] font-extrabold disabled:opacity-60"
                style={{ color: theme.primary }}
              >
                {loadingMore
                  ? "Loading more..."
                  : `Show more (${totalCount - payments.length} remaining) →`}
              </button>
            </div>
          ) : null}
        </>
      )}
    </AdminCard>
  );
}
