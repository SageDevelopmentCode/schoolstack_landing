"use client";

import { useCallback, useEffect, useMemo, useRef, type ComponentProps } from "react";
import { useReducedMotion } from "framer-motion";
import DemoAdminGardenShell from "@/components/demo/shared/DemoAdminGardenShell";
import {
  computeDemoSubmissionMetrics,
  getDemoFormOptions,
  getLatestSubmittedRow,
  mapDemoLeadToSubmission,
  mapDemoLeadsToSubmissions,
  type DemoSubmissionLead,
} from "@/components/demo/shared/demo-submissions-mapper";
import ApplicationSubmissionsPageShell, {
  type SubmissionsPagePreview,
  type SubmissionsPreviewController,
} from "@/components/school-admin/admissions/ApplicationSubmissionsPageShell";
import { schoolAdminDemoConfigs } from "@/data/school-demos/dashboard-registry";
import type { SchoolAdminDemoConfig } from "@/data/school-demos/demo-dashboard-types";
import { DEMO_ADMIN_SUBMISSION_LEADS } from "@/data/school-demos/demo-admin-admissions-fixtures";
import { buildDemoSubmissionDetail } from "@/data/school-demos/demo-admin-submission-detail-fixtures";
import { DEMO_PORTAL_ORG_ID, DEMO_PORTAL_SLUG } from "@/data/school-demos/demo-portal-shared";
import type { AdminApplicationSubmission } from "@/lib/admissions/application-submissions";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import type { ApplicationSubmissionsPageMeta } from "@/lib/school-admin/load-submissions-page-data";

/*
 * Walkthrough steps 3–4: the REAL Garden admin frame and Submissions page,
 * fed by demo fixtures (no network, no auth, no URL changes).
 * - Step 3 (`animateNewSubmission`): the new application (`l0`) arrives after
 *   a beat; the tiles, "Review next" strip and sidebar badge tick up.
 * - Step 4 (`initialSelectedLeadId` + `autoSendEnrollmentLink`): `l0`'s real
 *   drawer opens, then Accept → Start enrollment runs on fixtures and the real
 *   "Enrollment started" toast shows, all inside the scaled canvas.
 */

const NEW_SUBMISSION_LEAD_ID = "l0";
const NEW_SUBMISSION_DELAY_MS = 700;
const ACCEPT_DELAY_MS = 1800;
const START_ENROLLMENT_DELAY_MS = 1500;

type DemoAdminGardenAdmissionsProps = {
  /** A school in `schoolAdminDemoConfigs`. Ignored when `config` is given. */
  demoSlug?: string;
  /** A config outside the registry (e.g. the Sage Field case study). */
  config?: SchoolAdminDemoConfig;
  animateNewSubmission?: boolean;
  initialSelectedLeadId?: string;
  autoSendEnrollmentLink?: boolean;
  autoSendEnrollmentLinkDelayMs?: number;
};

/**
 * The step's story for `l0`: in step 3 it arrives as a finished application
 * ("Ready to review"); in step 4 the family has had their follow-up and the
 * application is under review, so Accept is the next move.
 */
function withLeadStatus(
  leads: DemoSubmissionLead[],
  leadId: string,
  status: string,
): DemoSubmissionLead[] {
  return leads.map((lead) => (lead.id === leadId ? { ...lead, status } : lead));
}

function buildMeta(rows: AdminApplicationSubmission[]): ApplicationSubmissionsPageMeta {
  const metrics = computeDemoSubmissionMetrics(rows);
  const latest = getLatestSubmittedRow(rows);
  return {
    statusCounts: metrics.statusCounts,
    activeSubmissionsCount: metrics.activeCount,
    latestSubmitted: latest
      ? { id: latest.id, submittedAt: latest.submittedAt, guardianName: latest.guardianName }
      : null,
    formOptions: getDemoFormOptions(rows).map(({ key, label }) => ({ key, title: label })),
  };
}

export default function DemoAdminGardenAdmissions({
  demoSlug,
  config: configProp,
  animateNewSubmission = false,
  initialSelectedLeadId,
  autoSendEnrollmentLink = false,
  autoSendEnrollmentLinkDelayMs,
}: DemoAdminGardenAdmissionsProps) {
  const reduce = useReducedMotion() === true;
  const config = configProp ?? (demoSlug ? schoolAdminDemoConfigs[demoSlug] : undefined);

  const setup = useMemo(() => {
    if (!config) return null;
    const baseLeads =
      (config.contentOverrides?.demoLeads as DemoSubmissionLead[] | undefined) ??
      DEMO_ADMIN_SUBMISSION_LEADS;
    const leads = withLeadStatus(
      baseLeads.slice(0, Math.max(config.compactRows, 1)),
      NEW_SUBMISSION_LEAD_ID,
      autoSendEnrollmentLink ? "contacted" : "application_sent",
    );
    const leadById = new Map(leads.map((lead) => [lead.id, lead]));
    const allRows = mapDemoLeadsToSubmissions(leads);
    const newLead = animateNewSubmission ? leadById.get(NEW_SUBMISSION_LEAD_ID) : undefined;
    const initialRows = newLead ? allRows.filter((row) => row.id !== newLead.id) : allRows;
    return {
      leadById,
      newRow: newLead ? mapDemoLeadToSubmission(newLead) : null,
      tableData: { submissions: initialRows, totalCount: initialRows.length, pageSize: 50 },
      meta: buildMeta(initialRows),
    };
  }, [animateNewSubmission, autoSendEnrollmentLink, config]);

  const previewPathname = useMemo(
    () => schoolAdminPath(DEMO_PORTAL_SLUG, "admissions", "submissions"),
    [],
  );

  const controllerRef = useRef<SubmissionsPreviewController>(null);

  const leadById = setup?.leadById;
  const detailFor = useCallback(
    (submission: AdminApplicationSubmission) => {
      const lead = leadById?.get(submission.id);
      return lead ? buildDemoSubmissionDetail(lead) : null;
    },
    [leadById],
  );

  const newRow = setup?.newRow ?? null;
  useEffect(() => {
    if (!newRow) return;
    const timer = window.setTimeout(
      () => controllerRef.current?.insertRow(newRow),
      reduce ? 0 : NEW_SUBMISSION_DELAY_MS,
    );
    return () => window.clearTimeout(timer);
  }, [newRow, reduce]);

  const preview = useMemo<Omit<SubmissionsPagePreview, "portalContainer">>(
    () => ({
      detailFor,
      initialSelectedId: initialSelectedLeadId ?? null,
      detailScript: autoSendEnrollmentLink
        ? {
            acceptAfterMs: autoSendEnrollmentLinkDelayMs ?? ACCEPT_DELAY_MS,
            startEnrollmentAfterMs: START_ENROLLMENT_DELAY_MS,
          }
        : null,
      controllerRef,
    }),
    [autoSendEnrollmentLink, autoSendEnrollmentLinkDelayMs, detailFor, initialSelectedLeadId],
  );

  if (!setup || !config) return null;

  return (
    <DemoAdminGardenShell
      config={config}
      previewPathname={previewPathname}
      inert
      data-testid="demo-admin-garden-admissions"
    >
      {({ branding, schoolName, portalHost }) => (
        <DemoAdmissionsPage
          branding={branding}
          schoolName={schoolName}
          meta={setup.meta}
          tableData={setup.tableData}
          preview={preview}
          portalHost={portalHost}
        />
      )}
    </DemoAdminGardenShell>
  );
}

/** Keeps `preview` referentially stable per portal host (the page reads it in effects). */
function DemoAdmissionsPage({
  branding,
  schoolName,
  meta,
  tableData,
  preview,
  portalHost,
}: {
  branding: OrganizationBranding;
  schoolName: string;
  meta: ApplicationSubmissionsPageMeta;
  tableData: ComponentProps<typeof ApplicationSubmissionsPageShell>["initialTableData"];
  preview: Omit<SubmissionsPagePreview, "portalContainer">;
  portalHost: HTMLDivElement | null;
}) {
  const fullPreview = useMemo<SubmissionsPagePreview>(
    () => ({ ...preview, portalContainer: portalHost }),
    [portalHost, preview],
  );
  return (
    <ApplicationSubmissionsPageShell
      organizationId={DEMO_PORTAL_ORG_ID}
      branding={branding}
      schoolName={schoolName}
      slug={DEMO_PORTAL_SLUG}
      initialMeta={meta}
      initialTableData={tableData}
      preview={fullPreview}
    />
  );
}
