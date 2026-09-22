import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  approveCommitteeJoinRequest,
  createCommitteeJoinRequest,
} from "./join-requests";

type MockCommittee = {
  id: string;
  name: string;
  organization_id: string;
  status: string;
  organizations: { name: string; slug: string };
};

type MockJoinRequestRow = {
  id: string;
  organization_id: string;
  committee_id: string;
  user_id: string;
  guardian_id: string | null;
  staff_member_id: string | null;
  preferred_duty_role_id: string | null;
  grade: string | null;
  note: string | null;
  status: "pending" | "approved" | "declined" | "withdrawn";
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  committees?: { name: string };
  guardians?: { first_name: string; last_name: string; email: string };
  staff_members?: { first_name: string; last_name: string; email: string };
  committee_duty_roles?: { title: string } | null;
};

type QueryContext = {
  table: string;
  filters: Record<string, unknown>;
};

function createQueryBuilder(
  context: QueryContext,
  handlers: {
    maybeSingle?: (context: QueryContext) => Promise<{ data: unknown; error: null }>;
    single?: (context: QueryContext) => Promise<{ data: unknown; error: null }>;
    insert?: (
      context: QueryContext,
      values: Record<string, unknown>,
    ) => { select: () => { single: () => Promise<{ data: unknown; error: null }> } };
    update?: (
      context: QueryContext,
      values: Record<string, unknown>,
    ) => ReturnType<typeof createQueryBuilder>;
  },
) {
  const builder = {
    select(_columns?: string) {
      return builder;
    },
    eq(column: string, value: unknown) {
      context.filters[column] = value;
      return builder;
    },
    order() {
      return builder;
    },
    maybeSingle: async () => {
      if (handlers.maybeSingle) {
        return handlers.maybeSingle(context);
      }
      return { data: null, error: null };
    },
    single: async () => {
      if (handlers.single) {
        return handlers.single(context);
      }
      return { data: null, error: null };
    },
    insert(values: Record<string, unknown>) {
      if (handlers.insert) {
        return handlers.insert(context, values);
      }
      return {
        select: () => ({
          single: async () => ({ data: null, error: null }),
        }),
      };
    },
    update(values: Record<string, unknown>) {
      if (handlers.update) {
        return handlers.update(context, values);
      }
      return builder;
    },
  };

  return builder;
}

function createJoinRequestSupabase(handlers: {
  maybeSingle?: (context: QueryContext) => Promise<{ data: unknown; error: null }>;
  single?: (context: QueryContext) => Promise<{ data: unknown; error: null }>;
  insert?: (
    context: QueryContext,
    values: Record<string, unknown>,
  ) => { select: () => { single: () => Promise<{ data: unknown; error: null }> } };
  update?: (
    context: QueryContext,
    values: Record<string, unknown>,
  ) => ReturnType<typeof createQueryBuilder>;
}) {
  const supabase = {
    from(table: string) {
      return {
        select(columns?: string) {
          const context: QueryContext = { table, filters: {} };
          return createQueryBuilder(context, {
            maybeSingle: handlers.maybeSingle,
            single: handlers.single,
            insert: handlers.insert,
            update: handlers.update,
          });
        },
        insert(values: Record<string, unknown>) {
          const context: QueryContext = { table, filters: {} };
          if (handlers.insert) {
            return handlers.insert(context, values);
          }
          return {
            select: () => ({
              single: async () => ({ data: null, error: null }),
            }),
          };
        },
        update(values: Record<string, unknown>) {
          const context: QueryContext = { table, filters: {} };
          if (handlers.update) {
            return handlers.update(context, values);
          }
          return createQueryBuilder(context, handlers);
        },
      };
    },
  };

  return supabase as unknown as SupabaseClient;
}

const orgA = "org-a";
const orgB = "org-b";
const committeeA = "committee-a";
const committeeB = "committee-b";

const activeCommitteeA: MockCommittee = {
  id: committeeA,
  name: "Fundraising",
  organization_id: orgA,
  status: "active",
  organizations: { name: "School A", slug: "school-a" },
};

describe("createCommitteeJoinRequest", () => {
  it("rejects when committee belongs to another organization", async () => {
    const supabase = createJoinRequestSupabase({
      maybeSingle: async ({ table, filters }) => {
        if (table === "committee_join_requests") return { data: null, error: null };
        if (table === "committee_members") return { data: null, error: null };
        if (table === "committees" && filters.organization_id === orgA) {
          return { data: null, error: null };
        }
        return { data: null, error: null };
      },
    });

    await assert.rejects(
      () =>
        createCommitteeJoinRequest(supabase, {
          organizationId: orgA,
          committeeId: committeeB,
          userId: "user-1",
          requesterType: "parent",
          guardianId: "guardian-1",
          guardianName: "Pat Parent",
          guardianEmail: "pat@example.com",
        }),
      /Committee not found/,
    );
  });

  it("rejects inactive committees", async () => {
    const supabase = createJoinRequestSupabase({
      maybeSingle: async ({ table, filters }) => {
        if (table === "committee_join_requests") return { data: null, error: null };
        if (table === "committee_members") return { data: null, error: null };
        if (
          table === "committees" &&
          filters.id === committeeA &&
          filters.status === "active"
        ) {
          return { data: null, error: null };
        }
        return { data: null, error: null };
      },
    });

    await assert.rejects(
      () =>
        createCommitteeJoinRequest(supabase, {
          organizationId: orgA,
          committeeId: committeeA,
          userId: "user-1",
          requesterType: "parent",
          guardianId: "guardian-1",
          guardianName: "Pat Parent",
          guardianEmail: "pat@example.com",
        }),
      /Committee not found/,
    );
  });

  it("rejects preferred duty roles from another committee", async () => {
    const supabase = createJoinRequestSupabase({
      maybeSingle: async ({ table, filters }) => {
        if (table === "committee_join_requests") return { data: null, error: null };
        if (table === "committee_members") return { data: null, error: null };
        if (table === "committees" && filters.organization_id === orgA) {
          return { data: activeCommitteeA, error: null };
        }
        if (table === "committee_duty_roles" && filters.id === "duty-in-committee-b") {
          return { data: null, error: null };
        }
        return { data: null, error: null };
      },
    });

    await assert.rejects(
      () =>
        createCommitteeJoinRequest(supabase, {
          organizationId: orgA,
          committeeId: committeeA,
          userId: "user-1",
          requesterType: "parent",
          guardianId: "guardian-1",
          guardianName: "Pat Parent",
          guardianEmail: "pat@example.com",
          preferredDutyRoleId: "duty-in-committee-b",
        }),
      /Duty role not found/,
    );
  });
});

describe("approveCommitteeJoinRequest", () => {
  const pendingRequest: MockJoinRequestRow = {
    id: "request-1",
    organization_id: orgA,
    committee_id: committeeB,
    user_id: "user-1",
    guardian_id: "guardian-1",
    staff_member_id: null,
    preferred_duty_role_id: null,
    grade: null,
    note: null,
    status: "pending",
    reviewed_by: null,
    reviewed_at: null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    committees: { name: "Foreign Committee" },
    guardians: { first_name: "Pat", last_name: "Parent", email: "pat@example.com" },
  };

  it("rejects approval when the committee is outside the request organization", async () => {
    const supabase = createJoinRequestSupabase({
      maybeSingle: async ({ table, filters }) => {
        if (
          table === "committee_join_requests" &&
          filters.id === pendingRequest.id &&
          filters.status === "pending"
        ) {
          return { data: pendingRequest, error: null };
        }
        if (
          table === "committees" &&
          filters.id === committeeB &&
          filters.organization_id === orgA
        ) {
          return { data: null, error: null };
        }
        return { data: null, error: null };
      },
    });

    await assert.rejects(
      () =>
        approveCommitteeJoinRequest(supabase, {
          requestId: pendingRequest.id,
          organizationId: orgA,
          reviewerUserId: "admin-1",
          reviewerName: "Admin",
          schoolSlug: "school-a",
        }),
      /Committee not found/,
    );
  });

  it("rejects foreign assignDutyRoleId values", async () => {
    const supabase = createJoinRequestSupabase({
      maybeSingle: async ({ table, filters }) => {
        if (
          table === "committee_join_requests" &&
          filters.id === pendingRequest.id &&
          filters.status === "pending"
        ) {
          return {
            data: { ...pendingRequest, committee_id: committeeA },
            error: null,
          };
        }
        if (
          table === "committees" &&
          filters.id === committeeA &&
          filters.organization_id === orgA
        ) {
          return { data: activeCommitteeA, error: null };
        }
        if (table === "committee_duty_roles" && filters.id === "duty-in-committee-b") {
          return { data: null, error: null };
        }
        return { data: null, error: null };
      },
    });

    await assert.rejects(
      () =>
        approveCommitteeJoinRequest(supabase, {
          requestId: pendingRequest.id,
          organizationId: orgA,
          reviewerUserId: "admin-1",
          reviewerName: "Admin",
          schoolSlug: "school-a",
          assignDutyRoleId: "duty-in-committee-b",
        }),
      /Duty role not found/,
    );
  });
});
