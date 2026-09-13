import type {
  CreateOrganizationEventInput,
  UpdateOrganizationEventInput,
} from "@/lib/school-events/events";
import type { OrganizationEvent } from "@/lib/school-events/types";

export class SchoolEventApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "SchoolEventApiError";
    this.status = status;
  }
}

export function schoolEventApiErrorStatus(err: unknown): number | undefined {
  if (err instanceof SchoolEventApiError) return err.status;
  return undefined;
}

async function readApiError(response: Response, fallback: string): Promise<string> {
  try {
    const payload = (await response.json()) as { error?: string };
    return payload.error?.trim() || fallback;
  } catch {
    return fallback;
  }
}

function throwApiError(response: Response, message: string): never {
  throw new SchoolEventApiError(message, response.status);
}

export async function createOrganizationEventViaApi(
  organizationId: string,
  input: CreateOrganizationEventInput,
): Promise<OrganizationEvent> {
  const response = await fetch("/api/school-events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ organizationId, ...input }),
  });

  const payload = (await response.json()) as {
    event?: OrganizationEvent;
    error?: string;
  };

  if (!response.ok || !payload.event) {
    throwApiError(response, payload.error?.trim() || "Failed to add event.");
  }

  return payload.event;
}

export async function updateOrganizationEventViaApi(
  organizationId: string,
  eventId: string,
  input: UpdateOrganizationEventInput,
): Promise<void> {
  const response = await fetch(`/api/school-events/${eventId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ organizationId, ...input }),
  });

  if (!response.ok) {
    throwApiError(
      response,
      await readApiError(response, "Failed to update event."),
    );
  }
}

export async function deleteOrganizationEventViaApi(
  organizationId: string,
  eventId: string,
): Promise<void> {
  const params = new URLSearchParams({ organizationId });
  const response = await fetch(`/api/school-events/${eventId}?${params}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throwApiError(
      response,
      await readApiError(response, "Failed to delete event."),
    );
  }
}
