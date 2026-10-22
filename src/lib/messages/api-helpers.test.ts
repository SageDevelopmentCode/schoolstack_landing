import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import { PortalRouteError } from "@/lib/api/portal-route-errors";
import { assertSchoolAdminCanAccessThread } from "./thread-access";

function createFilterBuilder(table: string, tableData: Record<string, unknown[]>) {
  const builder = {
    select(_columns?: string) {
      return builder;
    },
    eq(_column: string, _value: unknown) {
      return builder;
    },
    then(
      resolve: (value: unknown) => unknown,
      reject?: (reason?: unknown) => unknown,
    ) {
      const data = tableData[table] ?? [];
      return Promise.resolve(resolve({ data, error: null })).then(resolve, reject);
    },
  };

  return builder;
}

function createMockSupabase(tableData: Record<string, unknown[]>) {
  return {
    from(table: string) {
      return createFilterBuilder(table, tableData);
    },
  } as unknown as SupabaseClient;
}

const supportParticipants = [
  {
    id: "p1",
    thread_id: "thread-support",
    organization_id: "org-1",
    participant_kind: "guardian",
    family_id: null,
    guardian_id: "guardian-1",
    staff_member_id: null,
  },
  {
    id: "p2",
    thread_id: "thread-support",
    organization_id: "org-1",
    participant_kind: "platform_support",
    family_id: null,
    guardian_id: null,
    staff_member_id: null,
  },
];

const officeParticipants = [
  {
    id: "o1",
    thread_id: "thread-office",
    organization_id: "org-1",
    participant_kind: "guardian",
    family_id: null,
    guardian_id: "guardian-1",
    staff_member_id: null,
  },
  {
    id: "o2",
    thread_id: "thread-office",
    organization_id: "org-1",
    participant_kind: "school_office",
    family_id: null,
    guardian_id: null,
    staff_member_id: null,
  },
];

describe("assertSchoolAdminCanAccessThread", () => {
  it("rejects MudKitchen Support threads for school admins", async () => {
    const admin = createMockSupabase({
      message_thread_participants: supportParticipants,
    });

    await assert.rejects(
      () => assertSchoolAdminCanAccessThread(admin, "org-1", "thread-support"),
      (err: unknown) => {
        assert.ok(err instanceof PortalRouteError);
        assert.equal(err.status, 403);
        assert.match(err.message, /do not have access/);
        return true;
      },
    );
  });

  it("allows normal school office threads", async () => {
    const admin = createMockSupabase({
      message_thread_participants: officeParticipants,
    });

    await assertSchoolAdminCanAccessThread(admin, "org-1", "thread-office");
  });
});
