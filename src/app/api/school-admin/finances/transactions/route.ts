import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  listOrganizationPaymentsPaginated,
  TRANSACTIONS_PAGE_DEFAULT_SIZE,
  TRANSACTIONS_PAGE_MAX_SIZE,
} from "@/lib/admissions/payment-records";
import type { PaymentRecordDisplayRow } from "@/lib/admissions/payment-records";
import type { PaymentStatus, PaymentType } from "@/lib/stripe/application-payments";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { fetchTransactionsPageMeta } from "@/lib/school-admin/transactions-page-meta";
import type { TransactionsPageMeta } from "@/lib/school-admin/transactions-page-meta";
import { createClientFromRequest } from "@/lib/supabase/request-client";

const ROUTE = "/api/school-admin/finances/transactions";

const PAYMENT_STATUSES = new Set<PaymentStatus>([
  "pending",
  "succeeded",
  "failed",
  "refunded",
]);

const PAYMENT_TYPES = new Set<PaymentType>([
  "application_fee",
  "enrollment_checklist",
  "tuition",
]);

export type FinancesTransactionsApiResponse = {
  rows: PaymentRecordDisplayRow[];
  totalCount: number;
  limit: number;
  offset: number;
  hasMore: boolean;
  meta?: TransactionsPageMeta;
};

export async function GET(request: Request) {
  const supabase = await createClientFromRequest(request);
  const url = new URL(request.url);
  const organizationId = url.searchParams.get("organizationId")?.trim() ?? "";
  const statusParam = url.searchParams.get("status")?.trim() ?? "";
  const paymentTypeParam = url.searchParams.get("paymentType")?.trim() ?? "";
  const includeMeta = url.searchParams.get("includeMeta") === "1";
  const offset = Math.max(
    Number.parseInt(url.searchParams.get("offset") ?? "0", 10) || 0,
    0,
  );
  const limit = Math.min(
    Math.max(
      Number.parseInt(
        url.searchParams.get("limit") ?? String(TRANSACTIONS_PAGE_DEFAULT_SIZE),
        10,
      ) || TRANSACTIONS_PAGE_DEFAULT_SIZE,
      1,
    ),
    TRANSACTIONS_PAGE_MAX_SIZE,
  );

  if (!organizationId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId is required.",
      code: "missing_fields",
    });
  }

  const status = PAYMENT_STATUSES.has(statusParam as PaymentStatus)
    ? (statusParam as PaymentStatus)
    : undefined;
  const paymentType = PAYMENT_TYPES.has(paymentTypeParam as PaymentType)
    ? (paymentTypeParam as PaymentType)
    : undefined;

  try {
    await requireSchoolAdminUser(supabase, organizationId, request);

    const [page, meta] = await Promise.all([
      listOrganizationPaymentsPaginated(supabase, organizationId, {
        limit,
        offset,
        status,
        paymentType,
      }),
      includeMeta ? fetchTransactionsPageMeta(supabase, organizationId) : null,
    ]);

    const body: FinancesTransactionsApiResponse = {
      rows: page.rows,
      totalCount: page.totalCount,
      limit: page.limit,
      offset: page.offset,
      hasMore: page.hasMore,
      ...(meta ? { meta } : {}),
    };

    return NextResponse.json(body);
  } catch (err) {
    if (err instanceof SchoolAdminAuthError) {
      return apiError(ROUTE, {
        request,
        status: err.status,
        error: err.message,
        code: err.code,
        cause: err,
      });
    }

    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to load transactions.",
      cause: err,
      code: "internal_error",
    });
  }
}
