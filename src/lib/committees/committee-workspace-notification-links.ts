import { ACTIVITY_ACTIONS } from "@/lib/activity-log";

export type CommitteeActivityFocusEvent = {
  entity_type?: string | null;
  entity_id?: string | null;
  metadata?: unknown;
};

/**
 * Appends committee workspace deep-link query params for activity notifications.
 * `metadata.committeeId` is always set by committee activity logging.
 */
function activityMetadataRecord(metadata: unknown): Record<string, unknown> {
  if (metadata && typeof metadata === "object" && !Array.isArray(metadata)) {
    return metadata as Record<string, unknown>;
  }
  return {};
}

export function appendCommitteeActivityFocusParams(
  params: URLSearchParams,
  action: string,
  event: CommitteeActivityFocusEvent,
  metadataString: (metadata: Record<string, unknown>, key: string) => string | null,
): void {
  if (action === ACTIVITY_ACTIONS.COMMITTEE_EVENT_CREATED) {
    const committeeEventId =
      event.entity_type === "committee_event" ? event.entity_id : null;
    if (committeeEventId) {
      params.set("event", committeeEventId);
    }
    const eventDate = metadataString(activityMetadataRecord(event.metadata), "eventDate");
    if (eventDate) {
      params.set("date", eventDate);
    }
    return;
  }

  if (
    action === ACTIVITY_ACTIONS.COMMITTEE_RESOURCE_CREATED &&
    event.entity_type === "committee_resource" &&
    event.entity_id
  ) {
    params.set("resource", event.entity_id);
    return;
  }

  if (
    (action === ACTIVITY_ACTIONS.COMMITTEE_TASK_CREATED ||
      action === ACTIVITY_ACTIONS.COMMITTEE_TASK_ASSIGNED) &&
    event.entity_type === "committee_task" &&
    event.entity_id
  ) {
    params.set("task", event.entity_id);
  }
}
