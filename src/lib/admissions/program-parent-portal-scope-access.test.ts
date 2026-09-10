import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  userHasAccessForNotificationContext,
  userHasAccessForOptionalProgramScope,
  userHasAccessForProgramPortal,
} from "./program-parent-portal-access";
import {
  buildMainParentNotificationContext,
  buildProgramParentNotificationContext,
} from "@/lib/parent-portal/parent-notification-context";

const ORG_ID = "org-1";
const USER_ID = "user-1";
const FAMILY_ID = "family-1";
const STUDENT_ID = "student-1";
const PROGRAM_A = "program-a";
const PROGRAM_B = "program-b";

type EnrollmentRow = {
  program_id: string;
  status: string;
};

type ProgramRow = {
  id: string;
  name: string;
  portal_slug: string;
  parent_portal_settings: Record<string, unknown>;
};

function createEnrollmentAccessMockSupabase(config: {
  familyIds: string[];
  studentIds: string[];
  enrollments: EnrollmentRow[];
  programs: ProgramRow[];
}): SupabaseClient {
  const { familyIds, studentIds, enrollments, programs } = config;

  function createQueryBuilder(table: string) {
    const filters: Record<string, unknown> = {};
    const inFilters: Record<string, unknown[]> = {};

    const builder = {
      select(_columns?: string) {
        return builder;
      },
      eq(column: string, value: unknown) {
        filters[column] = value;
        return builder;
      },
      in(column: string, values: unknown[]) {
        inFilters[column] = values;
        return builder;
      },
      order(_column: string, _options?: { ascending: boolean }) {
        return builder;
      },
      limit(_count: number) {
        return builder;
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
        if (table === "guardians") {
          return familyIds.map((familyId) => ({ family_id: familyId }));
        }

        if (table === "students") {
          const allowedFamilies = inFilters.family_id ?? familyIds;
          return studentIds
            .filter(() => allowedFamilies.includes(FAMILY_ID))
            .map((id) => ({ id }));
        }

        if (table === "enrollments") {
          let rows = enrollments.filter((row) => row.status === "enrolled");
          if (filters.program_id) {
            rows = rows.filter((row) => row.program_id === filters.program_id);
          }
          if (inFilters.student_id) {
            const allowed = new Set(inFilters.student_id.map(String));
            rows = rows.filter(() => allowed.has(STUDENT_ID));
          }
          return rows.map((row) => ({
            id: `enrollment-${row.program_id}`,
            program_id: row.program_id,
          }));
        }

        if (table === "programs") {
          const allowedIds = new Set((inFilters.id ?? []).map(String));
          return programs.filter((row) => allowedIds.has(row.id));
        }

        return [];
      },
    };

    return builder;
  }

  return {
    from(table: string) {
      return createQueryBuilder(table);
    },
  } as unknown as SupabaseClient;
}

const isolatedProgram: ProgramRow = {
  id: PROGRAM_A,
  name: "Kindergarten Co-op",
  portal_slug: "kindergarten-co-op",
  parent_portal_settings: { mode: "isolated", coop_mode: true },
};

const mainProgram: ProgramRow = {
  id: PROGRAM_B,
  name: "School Year",
  portal_slug: "school-year",
  parent_portal_settings: { mode: "inherit" },
};

const baseConfig = {
  familyIds: [FAMILY_ID],
  studentIds: [STUDENT_ID],
  enrollments: [{ program_id: PROGRAM_A, status: "enrolled" }],
  programs: [isolatedProgram],
};

describe("program parent portal scope access helpers", () => {
  it("userHasAccessForProgramPortal allows enrolled program", async () => {
    const supabase = createEnrollmentAccessMockSupabase(baseConfig);

    assert.equal(
      await userHasAccessForProgramPortal(supabase, USER_ID, ORG_ID, PROGRAM_A),
      true,
    );
  });

  it("userHasAccessForProgramPortal denies a different program", async () => {
    const supabase = createEnrollmentAccessMockSupabase(baseConfig);

    assert.equal(
      await userHasAccessForProgramPortal(supabase, USER_ID, ORG_ID, PROGRAM_B),
      false,
    );
  });

  it("userHasAccessForOptionalProgramScope checks program enrollment when programId is set", async () => {
    const supabase = createEnrollmentAccessMockSupabase(baseConfig);

    assert.equal(
      await userHasAccessForOptionalProgramScope(
        supabase,
        USER_ID,
        ORG_ID,
        PROGRAM_B,
      ),
      false,
    );
    assert.equal(
      await userHasAccessForOptionalProgramScope(
        supabase,
        USER_ID,
        ORG_ID,
        PROGRAM_A,
      ),
      true,
    );
  });

  it("userHasAccessForOptionalProgramScope requires main portal enrollment when programId is omitted", async () => {
    const isolatedOnly = createEnrollmentAccessMockSupabase(baseConfig);
    const withMainPortal = createEnrollmentAccessMockSupabase({
      ...baseConfig,
      enrollments: [
        { program_id: PROGRAM_A, status: "enrolled" },
        { program_id: PROGRAM_B, status: "enrolled" },
      ],
      programs: [isolatedProgram, mainProgram],
    });

    assert.equal(
      await userHasAccessForOptionalProgramScope(
        isolatedOnly,
        USER_ID,
        ORG_ID,
        null,
      ),
      false,
    );
    assert.equal(
      await userHasAccessForOptionalProgramScope(
        withMainPortal,
        USER_ID,
        ORG_ID,
        null,
      ),
      true,
    );
  });

  it("userHasAccessForNotificationContext enforces program scope for program mode", async () => {
    const supabase = createEnrollmentAccessMockSupabase(baseConfig);
    const allowedContext = buildProgramParentNotificationContext(
      "rooted-meadows",
      PROGRAM_A,
      "kindergarten-co-op",
      true,
    );
    const deniedContext = buildProgramParentNotificationContext(
      "rooted-meadows",
      PROGRAM_B,
      "school-year",
      false,
    );

    assert.equal(
      await userHasAccessForNotificationContext(
        supabase,
        USER_ID,
        ORG_ID,
        allowedContext,
      ),
      true,
    );
    assert.equal(
      await userHasAccessForNotificationContext(
        supabase,
        USER_ID,
        ORG_ID,
        deniedContext,
      ),
      false,
    );
  });

  it("userHasAccessForNotificationContext requires main portal enrollment for main mode", async () => {
    const isolatedOnly = createEnrollmentAccessMockSupabase(baseConfig);
    const withMainPortal = createEnrollmentAccessMockSupabase({
      ...baseConfig,
      enrollments: [
        { program_id: PROGRAM_A, status: "enrolled" },
        { program_id: PROGRAM_B, status: "enrolled" },
      ],
      programs: [isolatedProgram, mainProgram],
    });
    const mainContext = buildMainParentNotificationContext("rooted-meadows");

    assert.equal(
      await userHasAccessForNotificationContext(
        isolatedOnly,
        USER_ID,
        ORG_ID,
        mainContext,
      ),
      false,
    );
    assert.equal(
      await userHasAccessForNotificationContext(
        withMainPortal,
        USER_ID,
        ORG_ID,
        mainContext,
      ),
      true,
    );
  });
});
