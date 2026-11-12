import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import { resolveBulletinPushRecipients } from "./push-recipients";

function createTeacherPushAdmin(options: {
  membershipSelects: string[];
  memberships?: Array<{ user_id: string }>;
  staffRows?: Array<{ user_id: string; email: string | null }>;
}) {
  const {
    membershipSelects,
    memberships = [{ user_id: "user-teacher-1" }],
    staffRows = [{ user_id: "user-teacher-1", email: "teacher@school.org" }],
  } = options;

  return {
    from(table: string) {
      const filters: Record<string, unknown> = {};

      const builder = {
        select(columns?: string) {
          if (table === "organization_memberships" && columns) {
            membershipSelects.push(columns);
          }
          return builder;
        },
        eq(column: string, value: unknown) {
          filters[column] = value;
          return builder;
        },
        in(_column: string, _values: unknown[]) {
          return builder;
        },
        not() {
          return builder;
        },
        then(onFulfilled: (value: { data: unknown; error: null }) => unknown) {
          if (table === "organization_memberships") {
            return Promise.resolve(onFulfilled({ data: memberships, error: null }));
          }
          if (table === "staff_members") {
            return Promise.resolve(onFulfilled({ data: staffRows, error: null }));
          }
          if (table === "guardians") {
            return Promise.resolve(onFulfilled({ data: [], error: null }));
          }
          if (table === "enrollments") {
            return Promise.resolve(onFulfilled({ data: [], error: null }));
          }
          return Promise.resolve(onFulfilled({ data: [], error: null }));
        },
      };

      return builder;
    },
    auth: {
      admin: {
        getUserById: async () => ({
          data: { user: null },
          error: null,
        }),
      },
    },
  } as unknown as SupabaseClient;
}

describe("resolveBulletinPushRecipients", () => {
  it("does not select email from organization_memberships", async () => {
    const membershipSelects: string[] = [];
    const admin = createTeacherPushAdmin({ membershipSelects });

    await resolveBulletinPushRecipients(admin, "org-1", ["teachers"], []);

    assert.ok(membershipSelects.length >= 1);
    for (const columns of membershipSelects) {
      assert.equal(columns.includes("email"), false, `unexpected columns: ${columns}`);
      assert.equal(columns, "user_id");
    }
  });

  it("returns teacher expo recipients when staff emails match memberships", async () => {
    const membershipSelects: string[] = [];
    const admin = createTeacherPushAdmin({
      membershipSelects,
      staffRows: [
        { user_id: "user-teacher-1", email: "Teacher@School.org" },
      ],
    });

    const recipients = await resolveBulletinPushRecipients(
      admin,
      "org-1",
      ["school_wide"],
      [],
    );

    assert.deepEqual(recipients, [
      {
        userId: "user-teacher-1",
        portal: "teacher",
        email: "Teacher@School.org",
      },
    ]);
  });
});
