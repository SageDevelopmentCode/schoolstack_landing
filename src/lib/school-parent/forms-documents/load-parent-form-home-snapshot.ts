import type { SupabaseClient } from "@supabase/supabase-js";
import { schoolParentPath } from "@/lib/organization-settings/parent-routes";
import { loadParentFormsDocumentsPageBundle } from "./load-parent-forms";
import { countParentFormsByStatus } from "./utils";
import type { ParentFormListItem } from "./types";

const HOME_SNAPSHOT_LIMIT = 4;

export type ParentFormHomeSnapshotItem = {
  formId: string;
  formTitle: string;
  studentNames: string[];
  listStatus: "needs_action" | "signed";
  responseStatus: "pending" | "overdue" | "signed";
  dueDate: string | null;
  signedAt: string | null;
  formsHref: string;
};

export type ParentFormHomeSnapshot = {
  counts: { all: number; needsAction: number; signed: number };
  items: ParentFormHomeSnapshotItem[];
  formsPageHref: string;
};

function compareNeedsActionItems(a: ParentFormListItem, b: ParentFormListItem): number {
  if (a.response.status === "overdue" && b.response.status !== "overdue") return -1;
  if (b.response.status === "overdue" && a.response.status !== "overdue") return 1;

  const aDue = a.form.dueDate ?? "";
  const bDue = b.form.dueDate ?? "";
  if (aDue && bDue) return aDue.localeCompare(bDue);
  if (aDue) return -1;
  if (bDue) return 1;

  return b.form.createdAt.localeCompare(a.form.createdAt);
}

function compareSignedItems(a: ParentFormListItem, b: ParentFormListItem): number {
  const aSigned = a.response.signedAt ?? "";
  const bSigned = b.response.signedAt ?? "";
  return bSigned.localeCompare(aSigned);
}

function sortSnapshotItems(items: ParentFormListItem[]): ParentFormListItem[] {
  const needsAction = items
    .filter((item) => item.listStatus === "needs_action")
    .sort(compareNeedsActionItems);
  const signed = items
    .filter((item) => item.listStatus === "signed")
    .sort(compareSignedItems);

  return [...needsAction, ...signed].slice(0, HOME_SNAPSHOT_LIMIT);
}

export async function loadParentFormHomeSnapshot(
  admin: SupabaseClient,
  organizationId: string,
  familyId: string,
  schoolSlug: string,
  previewBasePath?: string,
): Promise<ParentFormHomeSnapshot | null> {
  const bundle = await loadParentFormsDocumentsPageBundle(
    admin,
    organizationId,
    familyId,
  );

  const counts = countParentFormsByStatus(bundle.items);
  if (counts.all === 0) return null;

  const base = previewBasePath
    ? `${previewBasePath}/parent/forms_documents`
    : schoolParentPath(schoolSlug, "forms_documents");

  const sortedItems = sortSnapshotItems(bundle.items);

  return {
    counts: {
      all: counts.all,
      needsAction: counts.needs_action,
      signed: counts.signed,
    },
    items: sortedItems.map((item) => ({
      formId: item.form.id,
      formTitle: item.form.title,
      studentNames: item.response.studentNames,
      listStatus: item.listStatus,
      responseStatus: item.response.status,
      dueDate: item.form.dueDate,
      signedAt: item.response.signedAt,
      formsHref: `${base}?form=${encodeURIComponent(item.form.id)}`,
    })),
    formsPageHref: base,
  };
}
