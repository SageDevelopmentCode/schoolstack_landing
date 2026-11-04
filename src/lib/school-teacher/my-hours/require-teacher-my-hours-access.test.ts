import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { DEFAULT_FEATURES } from "@/lib/organization-settings/catalog";
import {
  requireTeacherMyHoursAccess,
  TeacherPortalAuthError,
} from "./require-teacher-my-hours-access";

const ORG_ID = "org-1";
const USER = { id: "user-1", email: "teacher@test.com" } as User;

function createMockSupabase(options: {
  myHoursEnabled?: boolean;
  hasMembership?: boolean;
  hasSettings?: boolean;
}): SupabaseClient {
  const myHoursEnabled = options.myHoursEnabled ?? true;
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
          if (table === "organization_portal_account_link_members") {
            return { data: null, error: null };
          }

          if (table === "organization_memberships") {
            return {
              data: hasMembership ? { id: "membership-1" } : null,
              error: null,
            };
          }

          if (table === "organization_settings_public") {
            if (!hasSettings) {
              return { data: null, error: null };
            }

            return {
              data: {
                features: {
                  ...DEFAULT_FEATURES,
                  teacher: {
                    ...DEFAULT_FEATURES.teacher,
                    my_hours: myHoursEnabled,
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

describe("requireTeacherMyHoursAccess", () => {
  it("allows active teachers when my_hours feature is enabled", async () => {
    const supabase = createMockSupabase({ myHoursEnabled: true });
    const user = await requireTeacherMyHoursAccess(supabase, ORG_ID);
    assert.equal(user.id, USER.id);
  });

  it("rejects teachers when my_hours feature is disabled", async () => {
    const supabase = createMockSupabase({ myHoursEnabled: false });

    await assert.rejects(
      () => requireTeacherMyHoursAccess(supabase, ORG_ID),
      (error: unknown) =>
        error instanceof TeacherPortalAuthError &&
        error.status === 403 &&
        error.message.includes("My Hours is not enabled"),
    );
  });
});
