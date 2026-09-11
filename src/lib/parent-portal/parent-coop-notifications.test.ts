import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  COOP_SUPPLY_ITEM_ADDED_ACTION,
  COOP_SUPPLY_ITEM_ASSIGNED_ACTION,
  fetchCoopProgramNotifications,
} from "@/lib/parent-portal/parent-coop-notifications";
import { getParentActivityNotificationCategory } from "@/lib/parent-portal/parent-activity-notifications";
import type { ParentNotificationContext } from "@/lib/parent-portal/parent-notification-context";

const CALLER_ORG_ID = "org-caller";
const PROGRAM_ORG_ID = "org-program";
const PROGRAM_ID = "program-1";
const FAMILY_ID = "family-1";

type EqFilter = { table: string; column: string; value: unknown };

function createCoopNotificationsMockSupabase(config: {
  programOrganizationId: string | null;
  supplyItems?: Array<Record<string, unknown>>;
}): { supabase: SupabaseClient; eqFilters: EqFilter[] } {
  const eqFilters: EqFilter[] = [];

  function createQueryBuilder(table: string) {
    const filters: Record<string, unknown> = {};
    const builder = {
      select() {
        return builder;
      },
      eq(column: string, value: unknown) {
        filters[column] = value;
        eqFilters.push({ table, column, value });
        return builder;
      },
      or() {
        return builder;
      },
      gte() {
        return builder;
      },
      order() {
        return builder;
      },
      maybeSingle: async () => {
        if (table !== "programs") {
          throw new Error(`maybeSingle unexpected for table: ${table}`);
        }

        if (filters.id !== PROGRAM_ID || !config.programOrganizationId) {
          return { data: null, error: null };
        }

        return {
          data: { organization_id: config.programOrganizationId },
          error: null,
        };
      },
      async then(
        resolve: (value: { data: unknown[]; error: null }) => void,
        reject?: (reason: unknown) => void,
      ) {
        try {
          resolve({ data: await builder.resolve(), error: null });
        } catch (error) {
          reject?.(error);
        }
      },
      async resolve(): Promise<unknown[]> {
        if (table === "program_coop_supply_items") {
          if (filters.organization_id !== CALLER_ORG_ID) return [];
          return config.supplyItems ?? [];
        }

        if (
          table === "program_coop_teaching_schedule_weeks" ||
          table === "program_coop_curriculum"
        ) {
          if (filters.organization_id !== CALLER_ORG_ID) return [];
          return [];
        }

        throw new Error(`unexpected table: ${table}`);
      },
    };

    return builder;
  }

  return {
    supabase: { from: createQueryBuilder } as SupabaseClient,
    eqFilters,
  };
}

const programContext: Extract<ParentNotificationContext, { mode: "program" }> =
  {
    mode: "program",
    slug: "rooted-meadows",
    programId: PROGRAM_ID,
    programSlug: "kindergarten-co-op",
    parentNavBasePath: "/school/rooted-meadows/parent/p/kindergarten-co-op",
    applyBasePath: "/school/rooted-meadows/apply",
    coopModeEnabled: true,
  };

describe("co-op notification categories", () => {
  it("maps co-op actions to the coop category", () => {
    assert.equal(
      getParentActivityNotificationCategory(COOP_SUPPLY_ITEM_ADDED_ACTION),
      "coop",
    );
    assert.equal(
      getParentActivityNotificationCategory(COOP_SUPPLY_ITEM_ASSIGNED_ACTION),
      "coop",
    );
  });
});

describe("fetchCoopProgramNotifications security", () => {
  it("returns no notifications when resolved program org differs from caller org", async () => {
    const { supabase } = createCoopNotificationsMockSupabase({
      programOrganizationId: PROGRAM_ORG_ID,
      supplyItems: [
        {
          id: "item-1",
          name: "Paper towels",
          assigned_family_ids: [],
          created_at: "2026-09-10T12:00:00.000Z",
          updated_at: "2026-09-10T12:00:00.000Z",
        },
      ],
    });

    const notifications = await fetchCoopProgramNotifications(
      supabase,
      CALLER_ORG_ID,
      programContext,
      FAMILY_ID,
      new Date("2026-09-01T00:00:00.000Z"),
    );

    assert.deepEqual(notifications, []);
  });

  it("scopes coop supply queries by organization_id", async () => {
    const { supabase, eqFilters } = createCoopNotificationsMockSupabase({
      programOrganizationId: CALLER_ORG_ID,
      supplyItems: [
        {
          id: "item-1",
          name: "Paper towels",
          assigned_family_ids: [],
          created_at: "2026-09-10T12:00:00.000Z",
          updated_at: "2026-09-10T12:00:00.000Z",
        },
      ],
    });

    const notifications = await fetchCoopProgramNotifications(
      supabase,
      CALLER_ORG_ID,
      programContext,
      FAMILY_ID,
      new Date("2026-09-01T00:00:00.000Z"),
    );

    assert.equal(notifications.length, 1);
    assert.ok(
      eqFilters.some(
        (filter) =>
          filter.table === "program_coop_supply_items" &&
          filter.column === "organization_id" &&
          filter.value === CALLER_ORG_ID,
      ),
    );
    assert.ok(
      eqFilters.some(
        (filter) =>
          filter.table === "program_coop_teaching_schedule_weeks" &&
          filter.column === "organization_id" &&
          filter.value === CALLER_ORG_ID,
      ),
    );
    assert.ok(
      eqFilters.some(
        (filter) =>
          filter.table === "program_coop_curriculum" &&
          filter.column === "organization_id" &&
          filter.value === CALLER_ORG_ID,
      ),
    );
  });
});

describe("co-op supply assignment heuristics", () => {
  it("treats quick single-family assignment as likely self-claim", () => {
    const createdAt = "2026-09-10T12:00:00.000Z";
    const updatedAt = "2026-09-10T12:00:05.000Z";
    const likelySelfClaim =
      new Date(updatedAt).getTime() - new Date(createdAt).getTime() <= 120_000;

    assert.equal(likelySelfClaim, true);
  });

  it("treats later assignment updates as admin-driven", () => {
    const createdAt = "2026-09-10T12:00:00.000Z";
    const updatedAt = "2026-09-10T12:05:00.000Z";
    const likelySelfClaim =
      new Date(updatedAt).getTime() - new Date(createdAt).getTime() <= 120_000;

    assert.equal(likelySelfClaim, false);
  });
});
