import { ACTIVITY_ACTIONS } from "@/lib/activity-log";
import type { ActivityEventRow } from "@/lib/activity-log";
import {
  assignmentContextFromMetadata,
  isTuitionAssignmentAction,
  metadataStringFromEvent,
  type AssignmentActivityContext,
} from "@/lib/activity-event-context";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import { resolveTeacherParentFormPublishedLink } from "@/lib/parent-portal/parent-activity-notifications";

function submissionsHref(slug: string, applicationId: string): string {
  return `${schoolAdminPath(slug, "admissions", "submissions")}?application=${applicationId}`;
}

export type ActivityEventLink = {
  href: string;
  ctaLabel: string;
};

export type ActivityEventLinks = {
  primary: ActivityEventLink;
  previewFamily?: ActivityEventLink;
  previewTeacher?: ActivityEventLink;
};

type LinkEvent = Pick<
  ActivityEventRow,
  "action" | "entity_type" | "entity_id" | "metadata"
>;

export function tuitionFamiliesAdminHref(
  slug: string,
  familyId?: string | null,
): string {
  const base = `${schoolAdminPath(slug, "my_school", "tuition")}?tab=families`;
  if (!familyId) return base;
  return `${base}&family=${encodeURIComponent(familyId)}`;
}

function tuitionAdminHref(slug: string): string {
  return schoolAdminPath(slug, "my_school", "tuition");
}

function parentPreviewBase(slug: string, familyId: string): string {
  return `/admin/preview/${slug}/family/${familyId}/parent/(school)`;
}

function teacherFormPreviewHref(
  slug: string,
  staffMemberId: string,
  formId?: string | null,
): string {
  const base = `/admin/preview/${slug}/teacher/${staffMemberId}/forms_documents`;
  if (!formId) return base;
  return `${base}?form=${encodeURIComponent(formId)}`;
}

function parentPreviewFormLink(
  slug: string,
  familyId: string,
  formId: string | null,
  formCategory: string | null,
): ActivityEventLink {
  const parentBase = parentPreviewBase(slug, familyId);
  const link = resolveTeacherParentFormPublishedLink(
    parentBase,
    formId,
    formCategory,
  );
  return { href: link.href, ctaLabel: "Preview as family" };
}

export function resolveActivityEventLinks(
  slug: string | null | undefined,
  event: LinkEvent,
  assignmentContext?: AssignmentActivityContext | null,
): ActivityEventLinks | null {
  if (!slug?.trim()) return null;

  const schoolSlug = slug.trim();
  const metadata = event.metadata ?? {};
  const context =
    assignmentContext ?? assignmentContextFromMetadata(metadata);

  if (isTuitionAssignmentAction(event.action)) {
    const familyId = context.familyId ?? metadataStringFromEvent(metadata, "familyId");
    return {
      primary: {
        href: tuitionFamiliesAdminHref(schoolSlug, familyId),
        ctaLabel: familyId ? "Open family billing" : "View tuition",
      },
      previewFamily: familyId
        ? {
            href: `${parentPreviewBase(schoolSlug, familyId)}/billing`,
            ctaLabel: "Preview as family",
          }
        : undefined,
    };
  }

  if (event.action === ACTIVITY_ACTIONS.TEACHER_PARENT_FORM_PUBLISHED) {
    const formId =
      metadataStringFromEvent(metadata, "formId") ?? event.entity_id;
    const formCategory = metadataStringFromEvent(metadata, "formCategory");
    const familyId = metadataStringFromEvent(metadata, "familyId");
    const staffMemberId = metadataStringFromEvent(metadata, "staffMemberId");

    const primaryHref = staffMemberId
      ? teacherFormPreviewHref(schoolSlug, staffMemberId, formId)
      : tuitionAdminHref(schoolSlug);

    return {
      primary: {
        href: primaryHref,
        ctaLabel: staffMemberId ? "Open in teacher portal" : "View tuition",
      },
      previewFamily: familyId
        ? parentPreviewFormLink(
            schoolSlug,
            familyId,
            formId,
            formCategory,
          )
        : undefined,
      previewTeacher: staffMemberId
        ? {
            href: teacherFormPreviewHref(schoolSlug, staffMemberId, formId),
            ctaLabel: "Preview as teacher",
          }
        : undefined,
    };
  }

  if (event.action === ACTIVITY_ACTIONS.TEACHER_PARENT_FORM_RESPONSE_SIGNED) {
    const formId =
      metadataStringFromEvent(metadata, "formId") ?? event.entity_id;
    const familyId = metadataStringFromEvent(metadata, "familyId");
    const staffMemberId = metadataStringFromEvent(metadata, "staffMemberId");
    const formCategory = metadataStringFromEvent(metadata, "formCategory");

    return {
      primary: {
        href: tuitionFamiliesAdminHref(schoolSlug, familyId),
        ctaLabel: familyId ? "Open family billing" : "View tuition",
      },
      previewFamily: familyId
        ? parentPreviewFormLink(
            schoolSlug,
            familyId,
            formId,
            formCategory,
          )
        : undefined,
      previewTeacher: staffMemberId
        ? {
            href: teacherFormPreviewHref(schoolSlug, staffMemberId, formId),
            ctaLabel: "Preview as teacher",
          }
        : undefined,
    };
  }

  if (event.action.startsWith("tuition.")) {
    const familyId = metadataStringFromEvent(metadata, "familyId");
    return {
      primary: {
        href: tuitionFamiliesAdminHref(schoolSlug, familyId),
        ctaLabel: familyId ? "Open family billing" : "View tuition",
      },
      previewFamily: familyId
        ? {
            href: `${parentPreviewBase(schoolSlug, familyId)}/billing`,
            ctaLabel: "Preview as family",
          }
        : undefined,
    };
  }

  if (event.action === ACTIVITY_ACTIONS.TUITION_PAYMENT_COMPLETED) {
    const familyId = metadataStringFromEvent(metadata, "familyId");
    return {
      primary: {
        href: tuitionFamiliesAdminHref(schoolSlug, familyId),
        ctaLabel: familyId ? "Open family billing" : "View tuition",
      },
      previewFamily: familyId
        ? {
            href: `${parentPreviewBase(schoolSlug, familyId)}/billing`,
            ctaLabel: "Preview as family",
          }
        : undefined,
    };
  }

  if (event.action === ACTIVITY_ACTIONS.MESSAGES_RECEIVED) {
    const threadId = metadataStringFromEvent(metadata, "threadId");
    const messagesBase = schoolAdminPath(schoolSlug, "messages");
    return {
      primary: {
        href: threadId ? `${messagesBase}?thread=${threadId}` : messagesBase,
        ctaLabel: "View message",
      },
    };
  }

  const applicationId = metadataStringFromEvent(metadata, "applicationId");
  if (applicationId) {
    return {
      primary: {
        href: submissionsHref(schoolSlug, applicationId),
        ctaLabel: "View application",
      },
    };
  }

  if (event.entity_type === "application" && event.entity_id) {
    return {
      primary: {
        href: submissionsHref(schoolSlug, event.entity_id),
        ctaLabel: "View application",
      },
    };
  }

  return null;
}
