import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { DEFAULT_FEATURES } from "@/lib/organization-settings/catalog";
import {
  requireTeacherAttendanceAccess,
  TeacherPortalAuthError,
} from "./require-teacher-attendance-access";

const ORG_ID = "org-1";
const USER = { id: "user-1", email: "teacher@test.com" } as User;

function createMockSupabase(options: {
  attendanceEnabled?: boolean;
  hasMembership?: boolean;
  hasSettings?: boolean;
}): SupabaseClient {
  const attendanceEnabled = options.attendanceEnabled ?? true;
  const hasMembership = options.hasMembership ?? true;
  const hasSettings = options.hasSettings ?? true;

  return {
    auth: {
      getUser: async () => ({
        data: { user: USER },
        error: null,
      }),
    },
    from(table: string) {
      return {
        select() {
          return this;
        },
        eq() {
          return this;
        },
        in() {
          return this;
        },
        maybeSingle: async () => {
          if (table === "organization_memberships") {
            return {
              data: hasMembership ? { id: "membership-1" } : null,
              error: null,
            };
          }

          if (table === "organization_settings") {
            if (!hasSettings) {
              return { data: null, error: null };
            }

            return {
              data: {
                features: {
                  ...DEFAULT_FEATURES,
                  teacher: {
                    ...DEFAULT_FEATURES.teacher,
                    attendance: attendanceEnabled,
                  },
                },
              },
              error: null,
            };
          }

          throw new Error(`Unexpected table: ${table}`);
        },
      };
    },
  } as unknown as SupabaseClient;
}

describe("requireTeacherAttendanceAccess", () => {
  it("allows active teachers when attendance feature is enabled", async () => {
    const supabase = createMockSupabase({ attendanceEnabled: true });
    const user = await requireTeacherAttendanceAccess(supabase, ORG_ID);
    assert.equal(user.id, USER.id);
  });

  it("rejects teachers when attendance feature is disabled", async () => {
    const supabase = createMockSupabase({ attendanceEnabled: false });

    await assert.rejects(
      () => requireTeacherAttendanceAccess(supabase, ORG_ID),
      (error: unknown) =>
        error instanceof TeacherPortalAuthError &&
        error.status === 403 &&
        error.message.includes("Attendance is not enabled"),
    );
  });

  it("rejects users without teacher portal membership", async () => {
    const supabase = createMockSupabase({ hasMembership: false });

    await assert.rejects(
      () => requireTeacherAttendanceAccess(supabase, ORG_ID),
      (error: unknown) =>
        error instanceof TeacherPortalAuthError && error.status === 403,
    );
  });

  it("rejects when organization settings are missing", async () => {
    const supabase = createMockSupabase({ hasSettings: false });

    await assert.rejects(
      () => requireTeacherAttendanceAccess(supabase, ORG_ID),
      (error: unknown) =>
        error instanceof TeacherPortalAuthError &&
        error.status === 403 &&
        error.message.includes("School not found"),
    );
  });
});
