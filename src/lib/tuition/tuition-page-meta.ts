import type { SupabaseClient } from "@supabase/supabase-js";
import { getTuitionKpis } from "./charges";
import {
  buildTuitionReadinessStatus,
  fetchTuitionReadinessRawData,
  type TuitionReadinessStatus,
} from "./tuition-readiness";
import type { OutstandingPeriod, SchoolYearBounds } from "./outstanding-period";

export type TuitionPageKpis = {
  collectedYtdCents: number;
  outstandingCents: number;
  familiesAtRisk: number;
  activeAssignments: number;
};

export type TuitionPageMeta = {
  kpis: TuitionPageKpis;
  readiness: TuitionReadinessStatus;
};

type AdminTuitionPageMetaRow = {
  collected_ytd_cents?: number | string | null;
  outstanding_cents?: number | string | null;
  families_at_risk?: number | string | null;
  active_assignments?: number | string | null;
  readiness?: {
    has_active_rate_plan?: boolean | null;
    enrolled_count?: number | string | null;
    unassigned_enrollment_count?: number | string | null;
    pending_payment_plan_count?: number | string | null;
    assignments_without_charges_count?: number | string | null;
  } | null;
};

function parseTuitionPageKpis(row: AdminTuitionPageMetaRow): TuitionPageKpis {
  return {
    collectedYtdCents: Number(row.collected_ytd_cents ?? 0),
    outstandingCents: Number(row.outstanding_cents ?? 0),
    familiesAtRisk: Number(row.families_at_risk ?? 0),
    activeAssignments: Number(row.active_assignments ?? 0),
  };
}

function parseTuitionReadinessFromRow(
  value: AdminTuitionPageMetaRow["readiness"],
): TuitionReadinessStatus | null {
  if (!value) return null;

  return buildTuitionReadinessStatus({
    hasActiveRatePlan: Boolean(value.has_active_rate_plan),
    enrolledCount: Number(value.enrolled_count ?? 0),
    unassignedEnrollmentCount: Number(value.unassigned_enrollment_count ?? 0),
    pendingPaymentPlanCount: Number(value.pending_payment_plan_count ?? 0),
    assignmentsWithoutChargesCount: Number(
      value.assignments_without_charges_count ?? 0,
    ),
  });
}

export function parseAdminTuitionPageMetaRow(
  row: AdminTuitionPageMetaRow | null,
): TuitionPageMeta | null {
  if (!row) return null;

  const readiness = parseTuitionReadinessFromRow(row.readiness);
  if (!readiness) return null;

  return {
    kpis: parseTuitionPageKpis(row),
    readiness,
  };
}

export async function fetchTuitionPageMetaFromRpc(
  supabase: SupabaseClient,
  organizationId: string,
  options: {
    outstandingPeriod?: OutstandingPeriod;
    schoolYearBounds?: SchoolYearBounds;
  } = {},
): Promise<TuitionPageMeta | null> {
  const outstandingPeriod = options.outstandingPeriod ?? "current_month";
  const schoolYearBounds = options.schoolYearBounds ?? {
    effectiveStart: null,
    effectiveEnd: null,
  };

  const { data, error } = await supabase.rpc("admin_tuition_page_meta", {
    p_organization_id: organizationId,
    p_outstanding_period: outstandingPeriod,
    p_school_year_start: schoolYearBounds.effectiveStart,
    p_school_year_end: schoolYearBounds.effectiveEnd,
  });

  if (error) return null;

  return parseAdminTuitionPageMetaRow((data ?? null) as AdminTuitionPageMetaRow | null);
}

async function fetchTuitionPageMetaFallback(
  supabase: SupabaseClient,
  organizationId: string,
  options: {
    outstandingPeriod?: OutstandingPeriod;
    schoolYearBounds?: SchoolYearBounds;
  } = {},
): Promise<TuitionPageMeta> {
  const [kpis, rawReadiness] = await Promise.all([
    getTuitionKpis(supabase, organizationId, options),
    fetchTuitionReadinessRawData(supabase, organizationId),
  ]);

  return {
    kpis,
    readiness: buildTuitionReadinessStatus(rawReadiness),
  };
}

export async function fetchTuitionPageMeta(
  supabase: SupabaseClient,
  organizationId: string,
  options: {
    outstandingPeriod?: OutstandingPeriod;
    schoolYearBounds?: SchoolYearBounds;
  } = {},
): Promise<TuitionPageMeta> {
  const fromRpc = await fetchTuitionPageMetaFromRpc(
    supabase,
    organizationId,
    options,
  );
  if (fromRpc) return fromRpc;

  return fetchTuitionPageMetaFallback(supabase, organizationId, options);
}
