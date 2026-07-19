import type { SupabaseClient } from "@supabase/supabase-js";
import { familyPreviewBasePath } from "@/lib/admissions/family-preview-access";
import { extractStudentLabel } from "@/lib/admissions/application-submissions";
import {
  ACTIVITY_ACTIONS,
  getActivityDateRangeStart,
  type ActivityDatePreset,
} from "@/lib/activity-log";

export type FunnelMatchField = "entity_id" | "metadata.applicationId";

export type FunnelStageDefinition = {
  key: string;
  label: string;
  action: string;
  matchOn: FunnelMatchField;
};

export type ProductFunnelDefinition = {
  id: string;
  label: string;
  description: string;
  cohort: { action: string; entityType: string };
  stages: FunnelStageDefinition[];
};

export type FunnelStageMetrics = {
  key: string;
  label: string;
  count: number;
  percentOfCohort: number;
  conversionFromPrevious: number | null;
  dropOffFromPrevious: number | null;
};

export type ProductFunnelMetrics = {
  funnelId: string;
  cohortSize: number;
  stages: FunnelStageMetrics[];
  computedAt: string;
};

export type FunnelEventRow = {
  action: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
};

export type FunnelStageDetailRow = {
  applicationId: string;
  organizationId: string | null;
  organizationName: string | null;
  organizationSlug: string | null;
  actorEmail: string | null;
  studentLabel: string | null;
  applicationStatus: string | null;
  formTitle: string | null;
  reachedAt: string;
  previewHref: string | null;
};

export type FunnelStageDetails = {
  funnelId: string;
  stageKey: string;
  stageLabel: string;
  rows: FunnelStageDetailRow[];
};

export type FunnelStageEventRow = {
  applicationId: string;
  actorEmail: string | null;
  reachedAt: string;
  organizationId: string | null;
  organizationName: string | null;
  organizationSlug: string | null;
  formTitle: string | null;
};

export type FunnelStageApplicationEnrichment = {
  id: string;
  status: string | null;
  familyId: string | null;
  studentLabel: string | null;
  guardianEmail: string | null;
  familyEmail: string | null;
  organizationId: string | null;
  organizationName: string | null;
  organizationSlug: string | null;
  formTitle: string | null;
};

export const APPLICATION_FUNNEL_STAGES: FunnelStageDefinition[] = [
  {
    key: "started",
    label: "Application started",
    action: ACTIVITY_ACTIONS.APPLICATION_STARTED,
    matchOn: "entity_id",
  },
  {
    key: "submitted",
    label: "Application submitted",
    action: ACTIVITY_ACTIONS.APPLICATION_SUBMITTED,
    matchOn: "entity_id",
  },
  {
    key: "payment_started",
    label: "Payment started",
    action: ACTIVITY_ACTIONS.APPLICATION_PAYMENT_STARTED,
    matchOn: "entity_id",
  },
  {
    key: "payment_completed",
    label: "Payment completed",
    action: ACTIVITY_ACTIONS.APPLICATION_PAYMENT_COMPLETED,
    matchOn: "entity_id",
  },
];

export const ENROLLMENT_FUNNEL_STAGES: FunnelStageDefinition[] = [
  {
    key: "started",
    label: "Enrollment started",
    action: ACTIVITY_ACTIONS.ENROLLMENT_STARTED,
    matchOn: "entity_id",
  },
  {
    key: "completed",
    label: "Enrollment completed",
    action: ACTIVITY_ACTIONS.ENROLLMENT_COMPLETED,
    matchOn: "metadata.applicationId",
  },
];

export const PRODUCT_FUNNELS: ProductFunnelDefinition[] = [
  {
    id: "application",
    label: "Application",
    description: "Apply start through submission and payment",
    cohort: {
      action: ACTIVITY_ACTIONS.APPLICATION_STARTED,
      entityType: "application",
    },
    stages: APPLICATION_FUNNEL_STAGES,
  },
  {
    id: "enrollment",
    label: "Enrollment",
    description: "Enrollment checklist started through completion",
    cohort: {
      action: ACTIVITY_ACTIONS.ENROLLMENT_STARTED,
      entityType: "application",
    },
    stages: ENROLLMENT_FUNNEL_STAGES,
  },
];

export function getProductFunnelDefinition(
  funnelId: string,
): ProductFunnelDefinition | undefined {
  return PRODUCT_FUNNELS.find((funnel) => funnel.id === funnelId);
}

function getMatchValue(
  row: FunnelEventRow,
  matchOn: FunnelMatchField,
): string | null {
  if (matchOn === "entity_id") {
    return row.entity_id;
  }

  const applicationId = row.metadata.applicationId;
  if (applicationId === null || applicationId === undefined) return null;
  return String(applicationId);
}

function rowFromDb(data: Record<string, unknown>): FunnelEventRow {
  return {
    action: String(data.action),
    entity_id:
      data.entity_id === null || data.entity_id === undefined
        ? null
        : String(data.entity_id),
    metadata:
      data.metadata &&
      typeof data.metadata === "object" &&
      !Array.isArray(data.metadata)
        ? (data.metadata as Record<string, unknown>)
        : {},
  };
}

export function getStageMembershipIds(
  cohortIds: Set<string>,
  events: FunnelEventRow[],
  stages: FunnelStageDefinition[],
  stageKey: string,
): Set<string> {
  const stage = stages.find((entry) => entry.key === stageKey);
  if (!stage || cohortIds.size === 0) return new Set();

  if (stages[0]?.key === stageKey) {
    return new Set(cohortIds);
  }

  const membership = new Set<string>();
  for (const row of events) {
    if (row.action !== stage.action) continue;
    const matchValue = getMatchValue(row, stage.matchOn);
    if (!matchValue || !cohortIds.has(matchValue)) continue;
    membership.add(matchValue);
  }

  return membership;
}

export function mergeStageDetailRows(
  events: FunnelStageEventRow[],
  applications: FunnelStageApplicationEnrichment[],
): FunnelStageDetailRow[] {
  const applicationById = new Map(
    applications.map((application) => [application.id, application]),
  );

  const earliestEventByApplication = new Map<string, FunnelStageEventRow>();
  for (const event of events) {
    const existing = earliestEventByApplication.get(event.applicationId);
    if (!existing || event.reachedAt < existing.reachedAt) {
      earliestEventByApplication.set(event.applicationId, event);
    }
  }

  const rows = Array.from(earliestEventByApplication.values()).map((event) => {
    const application = applicationById.get(event.applicationId);
    const organizationSlug =
      application?.organizationSlug ?? event.organizationSlug;
    const familyId = application?.familyId ?? null;

    return {
      applicationId: event.applicationId,
      organizationId: application?.organizationId ?? event.organizationId,
      organizationName: application?.organizationName ?? event.organizationName,
      organizationSlug,
      actorEmail:
        event.actorEmail ??
        application?.guardianEmail ??
        application?.familyEmail ??
        null,
      studentLabel: application?.studentLabel ?? null,
      applicationStatus: application?.status ?? null,
      formTitle: application?.formTitle ?? event.formTitle,
      reachedAt: event.reachedAt,
      previewHref:
        familyId && organizationSlug
          ? `${familyPreviewBasePath(organizationSlug, familyId)}/apply/${event.applicationId}`
          : null,
    };
  });

  rows.sort((left, right) => right.reachedAt.localeCompare(left.reachedAt));
  return rows;
}

export function computeFunnelFromEvents(
  cohortIds: Set<string>,
  events: FunnelEventRow[],
  stages: FunnelStageDefinition[],
): Record<string, number> {
  const counts = Object.fromEntries(stages.map((stage) => [stage.key, 0]));

  if (cohortIds.size === 0) return counts;

  const reachedByStage = Object.fromEntries(
    stages.map((stage) => [stage.key, new Set<string>()]),
  ) as Record<string, Set<string>>;

  for (const row of events) {
    for (const stage of stages) {
      if (row.action !== stage.action) continue;
      const matchValue = getMatchValue(row, stage.matchOn);
      if (!matchValue || !cohortIds.has(matchValue)) continue;
      reachedByStage[stage.key].add(matchValue);
    }
  }

  for (const stage of stages) {
    counts[stage.key] = reachedByStage[stage.key].size;
  }

  if (stages[0]) {
    counts[stages[0].key] = cohortIds.size;
  }

  return counts;
}

export function buildFunnelStages(
  stages: FunnelStageDefinition[],
  counts: Record<string, number>,
  cohortSize: number,
): FunnelStageMetrics[] {
  return stages.map((stage, index) => {
    const count = counts[stage.key] ?? 0;
    const percentOfCohort = cohortSize > 0 ? (count / cohortSize) * 100 : 0;
    const previousCount =
      index > 0 ? (counts[stages[index - 1].key] ?? 0) : cohortSize;
    const conversionFromPrevious =
      index === 0
        ? null
        : previousCount > 0
          ? (count / previousCount) * 100
          : null;
    const dropOffFromPrevious =
      conversionFromPrevious === null ? null : 100 - conversionFromPrevious;

    return {
      key: stage.key,
      label: stage.label,
      count,
      percentOfCohort,
      conversionFromPrevious,
      dropOffFromPrevious,
    };
  });
}

export type FetchProductFunnelMetricsFilters = {
  funnelId: string;
  datePreset?: ActivityDatePreset;
  organizationId?: string;
};

export type FetchFunnelStageDetailsFilters = FetchProductFunnelMetricsFilters & {
  stageKey: string;
};

function parseStringRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const result: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (typeof entry === "string") {
      result[key] = entry;
    } else if (entry != null) {
      result[key] = String(entry);
    }
  }
  return result;
}

function organizationFromDb(value: unknown): {
  id: string;
  name: string;
  slug: string;
} | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  if (!record.id || !record.name || !record.slug) return null;
  return {
    id: String(record.id),
    name: String(record.name),
    slug: String(record.slug),
  };
}

function stageEventFromDb(
  data: Record<string, unknown>,
  stage: FunnelStageDefinition,
): FunnelStageEventRow | null {
  const applicationId =
    stage.matchOn === "entity_id"
      ? data.entity_id === null || data.entity_id === undefined
        ? null
        : String(data.entity_id)
      : (() => {
          const metadata =
            data.metadata &&
            typeof data.metadata === "object" &&
            !Array.isArray(data.metadata)
              ? (data.metadata as Record<string, unknown>)
              : {};
          const applicationIdValue = metadata.applicationId;
          return applicationIdValue === null || applicationIdValue === undefined
            ? null
            : String(applicationIdValue);
        })();

  if (!applicationId) return null;

  const org = organizationFromDb(data.organizations);
  const metadata =
    data.metadata &&
    typeof data.metadata === "object" &&
    !Array.isArray(data.metadata)
      ? (data.metadata as Record<string, unknown>)
      : {};
  const metadataFormTitle =
    typeof metadata.formTitle === "string" ? metadata.formTitle : null;

  return {
    applicationId,
    actorEmail:
      data.actor_email === null || data.actor_email === undefined
        ? null
        : String(data.actor_email),
    reachedAt: String(data.created_at),
    organizationId:
      data.organization_id === null || data.organization_id === undefined
        ? org?.id ?? null
        : String(data.organization_id),
    organizationName: org?.name ?? null,
    organizationSlug: org?.slug ?? null,
    formTitle: metadataFormTitle,
  };
}

function applicationEnrichmentFromDb(
  data: Record<string, unknown>,
): FunnelStageApplicationEnrichment {
  const org = organizationFromDb(data.organizations);
  const guardian =
    data.guardians &&
    typeof data.guardians === "object" &&
    !Array.isArray(data.guardians)
      ? (data.guardians as Record<string, unknown>)
      : null;
  const family =
    data.families && typeof data.families === "object" && !Array.isArray(data.families)
      ? (data.families as Record<string, unknown>)
      : null;
  const formVersion =
    data.application_form_versions &&
    typeof data.application_form_versions === "object" &&
    !Array.isArray(data.application_form_versions)
      ? (data.application_form_versions as Record<string, unknown>)
      : null;

  const guardianEmail =
    guardian?.email === null || guardian?.email === undefined
      ? null
      : String(guardian.email);
  const familyEmail =
    family?.primary_email === null || family?.primary_email === undefined
      ? null
      : String(family.primary_email);
  const formTitle =
    formVersion?.title === null || formVersion?.title === undefined
      ? null
      : String(formVersion.title);

  return {
    id: String(data.id),
    status:
      data.status === null || data.status === undefined
        ? null
        : String(data.status),
    familyId:
      data.family_id === null || data.family_id === undefined
        ? null
        : String(data.family_id),
    studentLabel: extractStudentLabel(parseStringRecord(data.responses)),
    guardianEmail,
    familyEmail,
    organizationId: org?.id ?? null,
    organizationName: org?.name ?? null,
    organizationSlug: org?.slug ?? null,
    formTitle,
  };
}

async function fetchCohortStageEvents(
  supabase: SupabaseClient,
  funnel: ProductFunnelDefinition,
  filters: FetchProductFunnelMetricsFilters,
  membershipIds: Set<string>,
  stage: FunnelStageDefinition,
): Promise<FunnelStageEventRow[]> {
  const membershipArray = Array.from(membershipIds);
  if (!membershipArray.length) return [];

  let query = supabase
    .from("activity_events")
    .select(
      "entity_id, actor_email, created_at, metadata, organization_id, organizations(id, name, slug)",
    )
    .eq("action", stage.action)
    .eq("entity_type", funnel.cohort.entityType)
    .in("entity_id", membershipArray);

  if (filters.organizationId) {
    query = query.eq("organization_id", filters.organizationId);
  }

  const rangeStart = getActivityDateRangeStart(filters.datePreset ?? "7d");
  if (rangeStart) {
    query = query.gte("created_at", rangeStart);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? [])
    .map((row) => stageEventFromDb(row as Record<string, unknown>, stage))
    .filter((row): row is FunnelStageEventRow => row !== null);
}

async function fetchStageEvents(
  supabase: SupabaseClient,
  stage: FunnelStageDefinition,
  membershipIds: Set<string>,
): Promise<FunnelStageEventRow[]> {
  const membershipArray = Array.from(membershipIds);
  if (!membershipArray.length) return [];

  let query = supabase
    .from("activity_events")
    .select(
      "entity_id, actor_email, created_at, metadata, organization_id, organizations(id, name, slug)",
    )
    .eq("action", stage.action);

  if (stage.matchOn === "entity_id") {
    query = query.in("entity_id", membershipArray);
  } else {
    const orFilter = membershipArray
      .map((id) => `metadata->>applicationId.eq.${id}`)
      .join(",");
    query = query.or(orFilter);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? [])
    .map((row) => stageEventFromDb(row as Record<string, unknown>, stage))
    .filter((row): row is FunnelStageEventRow => row !== null);
}

async function fetchApplicationEnrichments(
  supabase: SupabaseClient,
  applicationIds: string[],
): Promise<FunnelStageApplicationEnrichment[]> {
  if (!applicationIds.length) return [];

  const { data, error } = await supabase
    .from("applications")
    .select(
      `
      id,
      status,
      family_id,
      responses,
      organizations(id, name, slug),
      guardians:primary_guardian_id(first_name, last_name, email),
      families(primary_email),
      application_form_versions(title)
    `,
    )
    .in("id", applicationIds);

  if (error) throw error;

  return (data ?? []).map((row) =>
    applicationEnrichmentFromDb(row as Record<string, unknown>),
  );
}

export async function fetchFunnelStageDetails(
  supabase: SupabaseClient,
  filters: FetchFunnelStageDetailsFilters,
): Promise<FunnelStageDetails> {
  const funnel = getProductFunnelDefinition(filters.funnelId);
  if (!funnel) {
    throw new Error(`Unknown funnel: ${filters.funnelId}`);
  }

  const stage = funnel.stages.find((entry) => entry.key === filters.stageKey);
  if (!stage) {
    throw new Error(`Unknown funnel stage: ${filters.stageKey}`);
  }

  const cohortIds = await fetchCohortIds(supabase, funnel, filters);
  if (cohortIds.size === 0) {
    return {
      funnelId: funnel.id,
      stageKey: stage.key,
      stageLabel: stage.label,
      rows: [],
    };
  }

  const milestoneEvents = await fetchMilestoneEvents(supabase, funnel, cohortIds);
  const membershipIds = getStageMembershipIds(
    cohortIds,
    milestoneEvents,
    funnel.stages,
    stage.key,
  );

  if (membershipIds.size === 0) {
    return {
      funnelId: funnel.id,
      stageKey: stage.key,
      stageLabel: stage.label,
      rows: [],
    };
  }

  const stageEvents =
    funnel.stages[0]?.key === stage.key
      ? await fetchCohortStageEvents(
          supabase,
          funnel,
          filters,
          membershipIds,
          stage,
        )
      : await fetchStageEvents(supabase, stage, membershipIds);

  const applications = await fetchApplicationEnrichments(
    supabase,
    Array.from(membershipIds),
  );

  return {
    funnelId: funnel.id,
    stageKey: stage.key,
    stageLabel: stage.label,
    rows: mergeStageDetailRows(stageEvents, applications),
  };
}

async function fetchCohortIds(
  supabase: SupabaseClient,
  funnel: ProductFunnelDefinition,
  filters: FetchProductFunnelMetricsFilters,
): Promise<Set<string>> {
  let query = supabase
    .from("activity_events")
    .select("entity_id")
    .eq("action", funnel.cohort.action)
    .eq("entity_type", funnel.cohort.entityType)
    .not("entity_id", "is", null);

  if (filters.organizationId) {
    query = query.eq("organization_id", filters.organizationId);
  }

  const rangeStart = getActivityDateRangeStart(filters.datePreset ?? "7d");
  if (rangeStart) {
    query = query.gte("created_at", rangeStart);
  }

  const { data, error } = await query;
  if (error) throw error;

  const cohortIds = new Set<string>();
  for (const row of data ?? []) {
    if (row.entity_id) cohortIds.add(String(row.entity_id));
  }

  return cohortIds;
}

async function fetchMilestoneEvents(
  supabase: SupabaseClient,
  funnel: ProductFunnelDefinition,
  cohortIds: Set<string>,
): Promise<FunnelEventRow[]> {
  const cohortArray = Array.from(cohortIds);
  const milestoneStages = funnel.stages.slice(1);
  if (!milestoneStages.length) return [];

  const entityIdActions = [
    ...new Set(
      milestoneStages
        .filter((stage) => stage.matchOn === "entity_id")
        .map((stage) => stage.action),
    ),
  ];
  const metadataActions = [
    ...new Set(
      milestoneStages
        .filter((stage) => stage.matchOn === "metadata.applicationId")
        .map((stage) => stage.action),
    ),
  ];

  const events: FunnelEventRow[] = [];

  if (entityIdActions.length > 0) {
    const { data, error } = await supabase
      .from("activity_events")
      .select("action, entity_id, metadata")
      .in("action", entityIdActions)
      .in("entity_id", cohortArray);

    if (error) throw error;
    events.push(
      ...(data ?? []).map((row) =>
        rowFromDb(row as Record<string, unknown>),
      ),
    );
  }

  if (metadataActions.length > 0) {
    const orFilter = cohortArray
      .map((id) => `metadata->>applicationId.eq.${id}`)
      .join(",");

    const { data, error } = await supabase
      .from("activity_events")
      .select("action, entity_id, metadata")
      .in("action", metadataActions)
      .or(orFilter);

    if (error) throw error;
    events.push(
      ...(data ?? []).map((row) =>
        rowFromDb(row as Record<string, unknown>),
      ),
    );
  }

  return events;
}

export async function fetchProductFunnelMetrics(
  supabase: SupabaseClient,
  filters: FetchProductFunnelMetricsFilters,
): Promise<ProductFunnelMetrics> {
  const funnel = getProductFunnelDefinition(filters.funnelId);
  if (!funnel) {
    throw new Error(`Unknown funnel: ${filters.funnelId}`);
  }

  const cohortIds = await fetchCohortIds(supabase, funnel, filters);
  const cohortSize = cohortIds.size;

  let counts: Record<string, number>;
  if (cohortSize === 0) {
    counts = Object.fromEntries(funnel.stages.map((stage) => [stage.key, 0]));
  } else {
    const events = await fetchMilestoneEvents(supabase, funnel, cohortIds);
    counts = computeFunnelFromEvents(cohortIds, events, funnel.stages);
  }

  return {
    funnelId: funnel.id,
    cohortSize,
    stages: buildFunnelStages(funnel.stages, counts, cohortSize),
    computedAt: new Date().toISOString(),
  };
}
