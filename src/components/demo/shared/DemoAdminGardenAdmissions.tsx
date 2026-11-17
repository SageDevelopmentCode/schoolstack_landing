"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import {
  ADMIN_DEMO_COLORS,
  ADMIN_DEMO_COPY,
  applyAdminDemoRuntime,
  getAdminDemoLogo,
} from "@/components/demo/shared/admin-demo-runtime";
import {
  computeDemoSubmissionMetrics,
  getDemoFormOptions,
  getLatestSubmittedRow,
  mapDemoLeadToSubmission,
  mapDemoLeadsToSubmissions,
  type DemoSubmissionLead,
} from "@/components/demo/shared/demo-submissions-mapper";
import SchoolAdminBaseline from "@/components/school-admin/SchoolAdminBaseline";
import SchoolAdminStoryShell from "@/components/school-admin/SchoolAdminStoryShell";
import ApplicationSubmissionsPageShell, {
  type SubmissionsPagePreview,
  type SubmissionsPreviewController,
} from "@/components/school-admin/admissions/ApplicationSubmissionsPageShell";
import GardenToaster from "@/components/school-parent/garden/GardenToaster";
import { schoolAdminDemoConfigs } from "@/data/school-demos/dashboard-registry";
import { DEMO_ADMIN_SUBMISSION_LEADS } from "@/data/school-demos/demo-admin-admissions-fixtures";
import { buildDemoSubmissionDetail } from "@/data/school-demos/demo-admin-submission-detail-fixtures";
import {
  DEMO_ADMIN_FEATURES,
  DEMO_PORTAL_ORG_ID,
  DEMO_PORTAL_SLUG,
} from "@/data/school-demos/demo-portal-shared";
import type { AdminApplicationSubmission } from "@/lib/admissions/application-submissions";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import { DEFAULT_BRANDING } from "@/lib/organization-settings/catalog";
import { buildParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import type { SchoolAdminUserProfile } from "@/lib/school-admin/access";
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

const DEMO_ADMIN_USER: SchoolAdminUserProfile = {
  displayName: "Morgan Ellis",
  email: "demo@mudkitchen.app",
};

type DemoAdminGardenAdmissionsProps = {
  demoSlug: string;
  animateNewSubmission?: boolean;
  initialSelectedLeadId?: string;
  autoSendEnrollmentLink?: boolean;
  autoSendEnrollmentLinkDelayMs?: number;
};

function buildBranding(): OrganizationBranding {
  const colors = ADMIN_DEMO_COLORS;
  const logo = getAdminDemoLogo();
  return {
    ...DEFAULT_BRANDING,
    colors: {
      ...DEFAULT_BRANDING.colors,
      accent: colors.accent,
      accentDark: colors.accentDark,
      accentBright: colors.accentBright,
      accentLight: colors.accentLight,
      accentGlow: colors.accentGlow,
      secondaryBtnBorder: colors.secondaryBtnBorder,
      clay: colors.clay,
      clayBg: colors.clayBg,
      clayBorder: colors.clayBorder,
    },
    logo: {
      src: logo.src,
      alt: logo.alt,
      width: logo.width ?? 220,
      height: logo.height ?? 52,
    },
  };
}

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
  animateNewSubmission = false,
  initialSelectedLeadId,
  autoSendEnrollmentLink = false,
  autoSendEnrollmentLinkDelayMs,
}: DemoAdminGardenAdmissionsProps) {
  const reduce = useReducedMotion() === true;
  const config = schoolAdminDemoConfigs[demoSlug];

  const setup = useMemo(() => {
    if (!config) return null;
    applyAdminDemoRuntime(config);
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
    const branding = buildBranding();
    return {
      branding,
      theme: buildParentThemeTokens(branding),
      schoolName: ADMIN_DEMO_COPY.schoolName,
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

  // Dialogs portal here so they stay inside the scaled 1440px canvas.
  const [portalHost, setPortalHost] = useState<HTMLDivElement | null>(null);
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

  const preview = useMemo<SubmissionsPagePreview>(
    () => ({
      detailFor,
      initialSelectedId: initialSelectedLeadId ?? null,
      detailScript: autoSendEnrollmentLink
        ? {
            acceptAfterMs: autoSendEnrollmentLinkDelayMs ?? ACCEPT_DELAY_MS,
            startEnrollmentAfterMs: START_ENROLLMENT_DELAY_MS,
          }
        : null,
      portalContainer: portalHost,
      controllerRef,
    }),
    [
      autoSendEnrollmentLink,
      autoSendEnrollmentLinkDelayMs,
      detailFor,
      initialSelectedLeadId,
      portalHost,
    ],
  );

  if (!setup) return null;

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      data-testid="demo-admin-garden-admissions"
      // Scripted, non-interactive preview: `inert` makes the drawer's and
      // dialog's focus() calls no-ops, so they can't scroll the walkthrough
      // frame sideways (and keyboard users can't tab into fake rows).
      inert
    >
      <SchoolAdminStoryShell branding={setup.branding} className="h-full">
        <div className="pointer-events-none h-full select-none">
          <SchoolAdminBaseline
            slug={DEMO_PORTAL_SLUG}
            organizationId={DEMO_PORTAL_ORG_ID}
            schoolName={setup.schoolName}
            branding={setup.branding}
            features={DEMO_ADMIN_FEATURES}
            userProfile={DEMO_ADMIN_USER}
            previewMode
            previewPathname={previewPathname}
            initialSidebarExpanded
            fillParentHeight
            portalOptions={[]}
            initialMessagesUnreadCount={0}
            initialActivityUnreadCount={0}
          >
            <ApplicationSubmissionsPageShell
              organizationId={DEMO_PORTAL_ORG_ID}
              branding={setup.branding}
              schoolName={setup.schoolName}
              slug={DEMO_PORTAL_SLUG}
              initialMeta={setup.meta}
              initialTableData={setup.tableData}
              preview={preview}
            />
          </SchoolAdminBaseline>
        </div>
      </SchoolAdminStoryShell>
      <div ref={setPortalHost} className="pointer-events-none absolute inset-0 z-[130] select-none" />
      <GardenToaster theme={setup.theme} />
    </div>
  );
}
