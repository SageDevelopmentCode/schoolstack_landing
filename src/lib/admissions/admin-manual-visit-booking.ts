import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildAdminPostSubmitSteps,
  type AdminPostSubmitStep,
} from "./admin-post-submit-steps";
import {
  getBookableAvailabilityForAction,
  listScheduledVisitsForApplications,
  loadPostSubmitActionForApplication,
  type BookableAvailabilityResult,
} from "./admissions-booking";
import {
  parseApplicationFormPostSubmitConfig,
  type PostSubmitActionType,
} from "./application-form-schema";
import {
  defaultFamilyCampusTourAction,
  familyHasScheduledCampusTour,
  hasPendingPostSubmitCampusTour,
  type TourBookingApplicationSummary,
} from "./family-tour-booking";

export type AdminManualBookingContext = "tours" | "shadow";

export type AdminManualBookingPendingStep = {
  actionId: string;
  type: PostSubmitActionType;
  title: string;
};

export type AdminManualBookingApplicationTarget = {
  id: string;
  studentLabel: string;
  familyName: string | null;
  guardianEmail: string | null;
  pendingSteps: AdminManualBookingPendingStep[];
};

export type AdminManualBookingFamilyTarget = {
  id: string;
  name: string;
  primaryEmail: string | null;
};

export type AdminManualVisitBookingTargets = {
  applications: AdminManualBookingApplicationTarget[];
  families: AdminManualBookingFamilyTarget[];
};

const TOURS_ACTION_TYPES: ReadonlySet<PostSubmitActionType> = new Set([
  "schedule_campus_tour",
  "schedule_family_interview",
]);

const SHADOW_ACTION_TYPES: ReadonlySet<PostSubmitActionType> = new Set([
  "schedule_observation_day",
]);

const APPLICATION_SEARCH_PAGE_SIZE = 100;
const APPLICATION_SEARCH_MAX_SCANNED = 500;
const FAMILY_SEARCH_PAGE_SIZE = 50;
const SUBSIDIARY_SEARCH_MATCH_LIMIT = 100;

/** Escape `%`, `_`, and `\` for use inside a PostgREST `ilike` pattern. */
export function escapeIlikePatternTerm(term: string): string {
  return term.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

function postgrestIlikeFilterValue(rawTerm: string): string {
  const pattern = `%${escapeIlikePatternTerm(rawTerm)}%`;
  if (/[(),.]/.test(pattern) || pattern.includes(",")) {
    return `"${pattern.replace(/"/g, '""')}"`;
  }
  return pattern;
}

function postgrestOrIlikeClauses(columns: string[], rawTerm: string): string {
  const value = postgrestIlikeFilterValue(rawTerm);
  return columns.map((column) => `${column}.ilike.${value}`).join(",");
}

export function buildFamilyManualVisitBookingSearchOrFilter(query: string): string {
  return postgrestOrIlikeClauses(["name", "primary_email"], query);
}

export function buildStudentManualVisitBookingSearchOrFilter(query: string): string {
  return postgrestOrIlikeClauses(["first_name", "last_name"], query);
}

export function buildGuardianManualVisitBookingSearchOrFilter(query: string): string {
  return postgrestOrIlikeClauses(["first_name", "last_name", "email"], query);
}

export function buildApplicationManualVisitBookingFkOrFilter(params: {
  studentIds: string[];
  guardianIds: string[];
  familyIds: string[];
}): string | null {
  const parts: string[] = [];
  if (params.studentIds.length > 0) {
    parts.push(`student_id.in.(${params.studentIds.join(",")})`);
  }
  if (params.guardianIds.length > 0) {
    parts.push(`primary_guardian_id.in.(${params.guardianIds.join(",")})`);
  }
  if (params.familyIds.length > 0) {
    parts.push(`family_id.in.(${params.familyIds.join(",")})`);
  }
  if (parts.length === 0) return null;
  return parts.join(",");
}

export async function resolveApplicationManualVisitBookingSearchOrFilter(
  supabase: SupabaseClient,
  organizationId: string,
  query: string,
): Promise<string | null> {
  const studentOr = buildStudentManualVisitBookingSearchOrFilter(query);
  const guardianOr = buildGuardianManualVisitBookingSearchOrFilter(query);
  const familyOr = buildFamilyManualVisitBookingSearchOrFilter(query);

  const [studentsResult, guardiansResult, familiesResult] = await Promise.all([
    supabase
      .from("students")
      .select("id")
      .eq("organization_id", organizationId)
      .or(studentOr)
      .limit(SUBSIDIARY_SEARCH_MATCH_LIMIT),
    supabase
      .from("guardians")
      .select("id, family_id")
      .eq("organization_id", organizationId)
      .or(guardianOr)
      .limit(SUBSIDIARY_SEARCH_MATCH_LIMIT),
    supabase
      .from("families")
      .select("id")
      .eq("organization_id", organizationId)
      .or(familyOr)
      .limit(SUBSIDIARY_SEARCH_MATCH_LIMIT),
  ]);

  if (studentsResult.error) throw studentsResult.error;
  if (guardiansResult.error) throw guardiansResult.error;
  if (familiesResult.error) throw familiesResult.error;

  const studentIds = (studentsResult.data ?? []).map((row) => String(row.id));
  const guardianIds = (guardiansResult.data ?? []).map((row) => String(row.id));
  const familyIds = [
    ...new Set([
      ...(guardiansResult.data ?? []).map((row) => String(row.family_id)),
      ...(familiesResult.data ?? []).map((row) => String(row.id)),
    ]),
  ];

  return buildApplicationManualVisitBookingFkOrFilter({
    studentIds,
    guardianIds,
    familyIds,
  });
}

export function actionTypeMatchesManualBookingContext(
  type: PostSubmitActionType,
  context: AdminManualBookingContext,
): boolean {
  if (context === "tours") {
    return TOURS_ACTION_TYPES.has(type);
  }
  return SHADOW_ACTION_TYPES.has(type);
}

export function filterPendingStepsForContext(
  steps: AdminPostSubmitStep[],
  context: AdminManualBookingContext,
): AdminManualBookingPendingStep[] {
  return steps
    .filter(
      (step) =>
        step.status === "pending" &&
        actionTypeMatchesManualBookingContext(step.type, context),
    )
    .map((step) => ({
      actionId: step.actionId,
      type: step.type,
      title: step.title,
    }));
}

export function isFamilyEligibleForPreAppCampusTour(
  applications: TourBookingApplicationSummary[],
  hasScheduledCampusTour: boolean,
): boolean {
  if (hasScheduledCampusTour) return false;
  if (hasPendingPostSubmitCampusTour(applications)) return false;
  return true;
}

function applicationSearchHaystack(row: Record<string, unknown>): string {
  const guardian = row.guardians as
    | { first_name?: string; last_name?: string; email?: string | null }
    | { first_name?: string; last_name?: string; email?: string | null }[]
    | null;
  const guardianRow = Array.isArray(guardian) ? guardian[0] : guardian;

  const family = row.families as
    | { name?: string; primary_email?: string | null }
    | { name?: string; primary_email?: string | null }[]
    | null;
  const familyRow = Array.isArray(family) ? family[0] : family;

  const student = row.students as
    | { first_name?: string; last_name?: string }
    | { first_name?: string; last_name?: string }[]
    | null;
  const studentRow = Array.isArray(student) ? student[0] : student;

  const studentLabel = studentRow
    ? [studentRow.first_name, studentRow.last_name].filter(Boolean).join(" ")
    : "";

  return [
    studentLabel,
    guardianRow
      ? [guardianRow.first_name, guardianRow.last_name, guardianRow.email]
          .filter(Boolean)
          .join(" ")
      : "",
    familyRow?.name,
    familyRow?.primary_email,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function studentLabelFromRow(row: Record<string, unknown>): string {
  const student = row.students as
    | { first_name?: string; last_name?: string }
    | { first_name?: string; last_name?: string }[]
    | null;
  const studentRow = Array.isArray(student) ? student[0] : student;
  const label = studentRow
    ? [studentRow.first_name, studentRow.last_name].filter(Boolean).join(" ")
    : "";
  return label.trim() || "Student";
}

const APPLICATION_SEARCH_SELECT = `
  id,
  family_id,
  status,
  application_form_versions!inner (
    post_submit_config
  ),
  guardians:primary_guardian_id (
    first_name,
    last_name,
    email
  ),
  families (
    name,
    primary_email
  ),
  students:student_id (
    first_name,
    last_name
  )
`;

export async function searchAdminManualVisitBookingTargets(
  supabase: SupabaseClient,
  organizationId: string,
  context: AdminManualBookingContext,
  options?: { query?: string; limit?: number },
): Promise<AdminManualVisitBookingTargets> {
  const query = options?.query?.trim().toLowerCase() ?? "";
  const limit = Math.min(Math.max(options?.limit ?? 25, 1), 50);

  if (query.length < 2) {
    return { applications: [], families: [] };
  }

  const applicationSearchOr = await resolveApplicationManualVisitBookingSearchOrFilter(
    supabase,
    organizationId,
    query,
  );
  const applications: AdminManualBookingApplicationTarget[] = [];

  if (applicationSearchOr) {
    let applicationOffset = 0;
    let applicationsScanned = 0;

    while (
      applications.length < limit &&
      applicationsScanned < APPLICATION_SEARCH_MAX_SCANNED
    ) {
      const pageEnd = applicationOffset + APPLICATION_SEARCH_PAGE_SIZE - 1;
      const { data: applicationRows, error: applicationsError } = await supabase
        .from("applications")
        .select(APPLICATION_SEARCH_SELECT)
        .eq("organization_id", organizationId)
        .neq("status", "draft")
        .or(applicationSearchOr)
        .order("updated_at", { ascending: false })
        .range(applicationOffset, pageEnd);

      if (applicationsError) throw applicationsError;

      const page = applicationRows ?? [];
      if (page.length === 0) break;

      applicationsScanned += page.length;
      applicationOffset += APPLICATION_SEARCH_PAGE_SIZE;

      const matchingRows = page.filter((row) =>
        applicationSearchHaystack(row as Record<string, unknown>).includes(query),
      );

      const applicationIds = matchingRows.map((row) => String(row.id));
      const visits = await listScheduledVisitsForApplications(supabase, applicationIds);
      const visitsByApplicationId = new Map<string, typeof visits>();
      for (const visit of visits) {
        const bucket = visitsByApplicationId.get(visit.applicationId) ?? [];
        bucket.push(visit);
        visitsByApplicationId.set(visit.applicationId, bucket);
      }

      for (const row of matchingRows) {
        const record = row as Record<string, unknown>;
        const formVersion = record.application_form_versions as
          | { post_submit_config?: unknown }
          | { post_submit_config?: unknown }[]
          | null;
        const form = Array.isArray(formVersion) ? formVersion[0] : formVersion;
        const applicationId = String(record.id);
        const postSubmitConfig = parseApplicationFormPostSubmitConfig(form?.post_submit_config);
        const steps = buildAdminPostSubmitSteps(
          postSubmitConfig,
          visitsByApplicationId.get(applicationId) ?? [],
          String(record.status),
        );
        const pendingSteps = filterPendingStepsForContext(steps, context);
        if (pendingSteps.length === 0) continue;

        const family = record.families as
          | { name?: string; primary_email?: string | null }
          | { name?: string; primary_email?: string | null }[]
          | null;
        const familyRow = Array.isArray(family) ? family[0] : family;
        const guardian = record.guardians as
          | { email?: string | null }
          | { email?: string | null }[]
          | null;
        const guardianRow = Array.isArray(guardian) ? guardian[0] : guardian;

        applications.push({
          id: applicationId,
          studentLabel: studentLabelFromRow(record),
          familyName: familyRow?.name ? String(familyRow.name) : null,
          guardianEmail: guardianRow?.email ? String(guardianRow.email) : null,
          pendingSteps,
        });

        if (applications.length >= limit) break;
      }

      if (applications.length >= limit) break;
      if (page.length < APPLICATION_SEARCH_PAGE_SIZE) break;
    }
  }

  let families: AdminManualBookingFamilyTarget[] = [];
  if (context === "tours") {
    families = await searchEligiblePreAppCampusTourFamilies(
      supabase,
      organizationId,
      query,
      limit,
    );
  }

  return { applications, families };
}

function tourBookingSummariesForApplications(
  applicationRows: Record<string, unknown>[],
  visitsByApplicationId: Map<string, Awaited<ReturnType<typeof listScheduledVisitsForApplications>>>,
): TourBookingApplicationSummary[] {
  return applicationRows.map((app) => {
    const formVersion = app.application_form_versions as
      | { post_submit_config?: unknown }
      | { post_submit_config?: unknown }[]
      | null;
    const form = Array.isArray(formVersion) ? formVersion[0] : formVersion;
    const applicationId = String(app.id);
    const status = String(app.status);
    const postSubmitConfig = parseApplicationFormPostSubmitConfig(form?.post_submit_config);
    const visits = visitsByApplicationId.get(applicationId) ?? [];
    const visitsByActionId = new Map(visits.map((visit) => [visit.postSubmitActionId, visit]));

    return {
      id: applicationId,
      status,
      submittedAt: app.submitted_at ? String(app.submitted_at) : null,
      createdAt: String(app.created_at),
      postSubmitTasks: status === "draft"
        ? []
        : postSubmitConfig.actions
            .filter((action) => action.enabled)
            .map((action) => ({
              type: action.type,
              status: visitsByActionId.has(action.id) ? "scheduled" : "pending",
              title: action.type,
            })),
    };
  });
}

async function searchEligiblePreAppCampusTourFamilies(
  supabase: SupabaseClient,
  organizationId: string,
  query: string,
  limit: number,
): Promise<AdminManualBookingFamilyTarget[]> {
  const familySearchOr = buildFamilyManualVisitBookingSearchOrFilter(query);
  const results: AdminManualBookingFamilyTarget[] = [];
  let offset = 0;

  while (results.length < limit) {
    const pageEnd = offset + FAMILY_SEARCH_PAGE_SIZE - 1;
    const { data: familyRows, error } = await supabase
      .from("families")
      .select("id, name, primary_email")
      .eq("organization_id", organizationId)
      .or(familySearchOr)
      .order("name", { ascending: true })
      .range(offset, pageEnd);

    if (error) throw error;

    const page = familyRows ?? [];
    if (page.length === 0) break;

    for (const row of page) {
      const familyId = String(row.id);
      const { data: applicationData, error: applicationError } = await supabase
        .from("applications")
        .select(
          "id, status, submitted_at, created_at, application_form_versions!inner (post_submit_config)",
        )
        .eq("organization_id", organizationId)
        .eq("family_id", familyId);

      if (applicationError) throw applicationError;

      const applicationRows = (applicationData ?? []) as Record<string, unknown>[];
      const applicationIds = applicationRows.map((app) => String(app.id));
      const submittedIds = applicationRows
        .filter((app) => String(app.status) !== "draft")
        .map((app) => String(app.id));
      const visits = await listScheduledVisitsForApplications(supabase, submittedIds);
      const visitsByApplicationId = new Map<string, typeof visits>();
      for (const visit of visits) {
        const bucket = visitsByApplicationId.get(visit.applicationId) ?? [];
        bucket.push(visit);
        visitsByApplicationId.set(visit.applicationId, bucket);
      }

      const summaries = tourBookingSummariesForApplications(
        applicationRows,
        visitsByApplicationId,
      );

      const hasTour = await familyHasScheduledCampusTour(
        supabase,
        organizationId,
        familyId,
        applicationIds,
      );

      if (!isFamilyEligibleForPreAppCampusTour(summaries, hasTour)) {
        continue;
      }

      results.push({
        id: familyId,
        name: row.name ? String(row.name) : "Family",
        primaryEmail: row.primary_email ? String(row.primary_email) : null,
      });

      if (results.length >= limit) break;
    }

    if (results.length >= limit) break;
    offset += FAMILY_SEARCH_PAGE_SIZE;
    if (page.length < FAMILY_SEARCH_PAGE_SIZE) break;
  }

  return results;
}

export async function loadAdminManualVisitAvailability(
  supabase: SupabaseClient,
  params: {
    organizationId: string;
    startDate: string;
    endDate: string;
    applicationId?: string;
    actionId?: string;
    familyCampusTour?: boolean;
  },
): Promise<BookableAvailabilityResult> {
  if (params.familyCampusTour) {
    const action = defaultFamilyCampusTourAction();
    return getBookableAvailabilityForAction(
      supabase,
      params.organizationId,
      action,
      params.startDate,
      params.endDate,
    );
  }

  if (!params.applicationId || !params.actionId) {
    throw new Error("applicationId and actionId are required.");
  }

  const contextRow = await loadPostSubmitActionForApplication(
    supabase,
    params.applicationId,
    params.actionId,
  );

  if (!contextRow) {
    throw new Error("Scheduling step not found.");
  }

  if (contextRow.applicationStatus === "draft") {
    throw new Error("Submit the application before scheduling visits.");
  }

  if (contextRow.organizationId !== params.organizationId) {
    throw new Error("Application not found.");
  }

  return getBookableAvailabilityForAction(
    supabase,
    params.organizationId,
    contextRow.action,
    params.startDate,
    params.endDate,
    params.applicationId,
  );
}
