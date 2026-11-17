"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { FamilyAdmissionTimelineEvent } from "@/lib/admissions/application-submissions";
import type {
  EnrollmentChecklistItem,
  EnrollmentChecklistItemInstance,
} from "@/lib/admissions/enrollment-checklist-schema";
import type { FamilyGuardianRecord } from "@/lib/admissions/family-guardians";
import type { ApplicationDetail } from "@/lib/admissions/parent-portal-access";
import type { PaymentRecordDisplayRow } from "@/lib/admissions/payment-records";

/*
 * Fixture seam for the submission review drawer (marketing walkthrough).
 * When the drawer gets `previewDetail`, it and its sections read from here
 * instead of Supabase / `/api`, and writes resolve locally. Outside a preview
 * the context is empty and every section loads exactly as before.
 */

/** What `GET /api/admissions/applications/:id/start-enrollment` returns. */
export type StartEnrollmentPreviewVariant = {
  id: string;
  label: string;
  isDefault: boolean;
  variantKey: string;
  sectionCount: number;
};

export type StartEnrollmentPreviewGroup = {
  groupId: string;
  groupLabel: string;
  variants: StartEnrollmentPreviewVariant[];
};

export type StartEnrollmentPreview = {
  applicationId: string;
  status: string;
  templateName: string;
  groups: StartEnrollmentPreviewGroup[];
  sharedItems: Array<{ id: string; label: string; type: string }>;
};

/** What `EnrollmentStatusCard` shows once a checklist exists. */
export type EnrollmentStatusPreview = {
  status: string;
  progress: { completed: number; total: number };
  variantLabels: string[];
  items: EnrollmentChecklistItem[];
  instances: EnrollmentChecklistItemInstance[];
  checklistId: string;
};

export type SubmissionDetailPreview = {
  detail: ApplicationDetail;
  familyId: string | null;
  guardians: FamilyGuardianRecord[];
  payments: PaymentRecordDisplayRow[];
  history: FamilyAdmissionTimelineEvent[];
  /** The application already has an enrollment checklist. */
  hasChecklist: boolean;
  /** The program has a published checklist ("Start enrollment" is offered). */
  publishedChecklistName: string | null;
  startEnrollment: StartEnrollmentPreview | null;
  /** The checklist as it looks right after enrollment starts. */
  enrollmentStatus: EnrollmentStatusPreview | null;
};

/** Timed demo steps that drive the drawer's real controls. */
export type SubmissionDetailPreviewScript = {
  /** Press "Accept" (opens Start enrollment) after this many ms. */
  acceptAfterMs?: number;
  /** Press "Start enrollment" in the dialog this long after it opens. */
  startEnrollmentAfterMs?: number;
};

type SubmissionDetailPreviewContextValue = {
  preview: SubmissionDetailPreview | null;
  /** Writes are disabled (or resolve locally); UI is never hidden. */
  previewMode: boolean;
  script: SubmissionDetailPreviewScript | null;
  /** In-canvas node for dialogs, so they stay inside a scaled preview. */
  portalContainer: HTMLElement | null;
};

const SubmissionDetailPreviewContext = createContext<SubmissionDetailPreviewContextValue>({
  preview: null,
  previewMode: false,
  script: null,
  portalContainer: null,
});

export function SubmissionDetailPreviewProvider({
  value,
  children,
}: {
  value: SubmissionDetailPreviewContextValue;
  children: ReactNode;
}) {
  return (
    <SubmissionDetailPreviewContext.Provider value={value}>
      {children}
    </SubmissionDetailPreviewContext.Provider>
  );
}

export function useSubmissionDetailPreview(): SubmissionDetailPreviewContextValue {
  return useContext(SubmissionDetailPreviewContext);
}
