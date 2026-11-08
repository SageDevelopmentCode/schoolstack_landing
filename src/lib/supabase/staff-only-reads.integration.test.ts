import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, describe, it } from "node:test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import ws from "ws";
import { createTestAdminClient, integrationTestsEnabled } from "@/test/integration/helpers";
import { TEST_ORG_SLUG } from "../../../e2e/helpers/constants";

/**
 * Phase 1b step 3 (20261151): tables no parent reads with their own session are staff-only.
 * Parents and linked logins must see 0 rows; teachers (staff) keep reading their own school.
 */

const describeIntegration = integrationTestsEnabled() ? describe : describe.skip;

const STAFF_ONLY_TABLES = [
  "staff_members",
  "student_teacher_assignments",
  "classroom_staff_assignments",
  "classrooms",
  "classroom_signups",
  "enrollment_classrooms",
  "organization_settings",
  "admissions_availability_slots",
  "admissions_observation_day_availability",
  "application_form_version_revisions",
  "tuition_adjustment_rules",
  "tuition_late_fee_overrides",
  "committee_templates",
] as const;

type TestUser = { id: string; client: SupabaseClient };

function requirePublishableKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!key) {
    throw new Error(
      "Staff-only RLS tests require NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY from `supabase status`.",
    );
  }
  return key;
}

async function createUser(admin: SupabaseClient, label: string): Promise<TestUser> {
  const email = `${label}-${randomUUID()}@example.test`;
  const password = `Pw-${randomUUID()}`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error || !data.user) throw error ?? new Error("createUser failed");

  const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, requirePublishableKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
    realtime: { transport: ws as never },
  });
  const { error: signInError } = await client.auth.signInWithPassword({ email, password });
  if (signInError) throw signInError;
  return { id: data.user.id, client };
}

async function mustId(
  result: PromiseLike<{ data: { id: unknown } | null; error: { message: string } | null }>,
): Promise<string> {
  const { data, error } = await result;
  if (error || !data) throw new Error(error?.message ?? "empty result");
  return String(data.id);
}

describeIntegration("staff-only reads (Phase 1b step 3)", () => {
  let admin: SupabaseClient;
  let organizationId: string;
  let parent: TestUser;
  let linkedPeer: TestUser;
  let teacher: TestUser;
  let familyId: string;
  let groupId: string;
  let staffMemberId: string;
  let classroomId: string;
  let committeeTemplateId: string;
  let globalTemplateId: string;
  let createdSettings = false;
  const users: TestUser[] = [];

  before(async () => {
    admin = createTestAdminClient();
    organizationId = await mustId(
      admin.from("organizations").select("id").eq("slug", TEST_ORG_SLUG).maybeSingle(),
    );

    parent = await createUser(admin, "s3-parent");
    linkedPeer = await createUser(admin, "s3-linked");
    teacher = await createUser(admin, "s3-teacher");
    users.push(parent, linkedPeer, teacher);

    familyId = await mustId(
      admin
        .from("families")
        .insert({ organization_id: organizationId, name: "Staff Only Test Family" })
        .select("id")
        .single(),
    );
    const { error: guardianError } = await admin.from("guardians").insert({
      organization_id: organizationId,
      family_id: familyId,
      user_id: parent.id,
      first_name: "Parent",
      last_name: "StaffOnlyTest",
    });
    if (guardianError) throw new Error(guardianError.message);

    for (const [user, role] of [
      [parent, "parent"],
      [linkedPeer, "parent"],
      [teacher, "teacher"],
    ] as const) {
      const { error } = await admin.from("organization_memberships").insert({
        organization_id: organizationId,
        user_id: user.id,
        role,
        status: "active",
      });
      if (error) throw new Error(error.message);
    }

    groupId = await mustId(
      admin
        .from("organization_portal_account_link_groups")
        .insert({ organization_id: organizationId, primary_user_id: parent.id })
        .select("id")
        .single(),
    );
    const { error: memberError } = await admin.from("organization_portal_account_link_members").insert(
      [parent, linkedPeer].map((user) => ({
        group_id: groupId,
        organization_id: organizationId,
        user_id: user.id,
      })),
    );
    if (memberError) throw new Error(memberError.message);

    // Ensure the test school has a settings row (the seed may not).
    const { data: existingSettings } = await admin
      .from("organization_settings")
      .select("organization_id")
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!existingSettings) {
      const { error: settingsError } = await admin
        .from("organization_settings")
        .insert({ organization_id: organizationId });
      if (settingsError) throw new Error(settingsError.message);
      createdSettings = true;
    }

    staffMemberId = await mustId(
      admin
        .from("staff_members")
        .insert({
          organization_id: organizationId,
          first_name: "Staff",
          last_name: "OnlyTest",
          email: `staff-only-${randomUUID()}@example.test`,
        })
        .select("id")
        .single(),
    );
    classroomId = await mustId(
      admin
        .from("classrooms")
        .insert({ organization_id: organizationId, name: "Staff Only Classroom" })
        .select("id")
        .single(),
    );
    committeeTemplateId = await mustId(
      admin
        .from("committee_templates")
        .insert({
          organization_id: organizationId,
          slug: `staff-only-${randomUUID().slice(0, 8)}`,
          name: "Staff Only Template",
          type: "event",
        })
        .select("id")
        .single(),
    );
    globalTemplateId = await mustId(
      admin
        .from("committee_templates")
        .insert({
          organization_id: null,
          slug: `staff-only-global-${randomUUID().slice(0, 8)}`,
          name: "Staff Only Global Template",
          type: "event",
        })
        .select("id")
        .single(),
    );
  });

  after(async () => {
    if (createdSettings) {
      await admin.from("organization_settings").delete().eq("organization_id", organizationId);
    }
    await admin.from("committee_templates").delete().in("id", [committeeTemplateId, globalTemplateId]);
    await admin.from("classrooms").delete().eq("id", classroomId);
    await admin.from("staff_members").delete().eq("id", staffMemberId);
    await admin.from("organization_portal_account_link_members").delete().eq("group_id", groupId);
    await admin.from("organization_portal_account_link_groups").delete().eq("id", groupId);
    await admin.from("guardians").delete().eq("family_id", familyId);
    await admin.from("families").delete().eq("id", familyId);
    for (const user of users) {
      await admin
        .from("organization_memberships")
        .delete()
        .eq("organization_id", organizationId)
        .eq("user_id", user.id);
      await admin.auth.admin.deleteUser(user.id);
    }
  });

  async function countFor(client: SupabaseClient, table: string): Promise<number> {
    const { count, error } = await client.from(table).select("*", { count: "exact", head: true });
    assert.equal(error, null, `${table}: ${error?.message}`);
    return count ?? 0;
  }

  it("parents and linked logins read nothing from the staff-only tables", async () => {
    for (const table of STAFF_ONLY_TABLES) {
      const adminCount = await countFor(admin, table);
      if (["staff_members", "classrooms", "committee_templates", "organization_settings"].includes(table)) {
        assert.ok(adminCount > 0, `${table} has seeded rows for this check`);
      }
      // committee_templates keeps platform-default rows (organization_id is null) readable.
      const scoped = (client: SupabaseClient) =>
        table === "committee_templates"
          ? client
              .from(table)
              .select("*", { count: "exact", head: true })
              .eq("organization_id", organizationId)
          : client.from(table).select("*", { count: "exact", head: true });
      for (const [label, user] of [
        ["parent", parent],
        ["linked login", linkedPeer],
      ] as const) {
        const { count, error } = await scoped(user.client);
        assert.equal(error, null, `${table}: ${error?.message}`);
        assert.equal(count ?? 0, 0, `${label} reads ${table}`);
      }
    }
  });

  it("staff (teacher) still read their own school's rows", async () => {
    for (const table of STAFF_ONLY_TABLES) {
      const { count: expected, error: expectedError } = await admin
        .from(table)
        .select("*", { count: "exact", head: true })
        .eq("organization_id", organizationId);
      assert.equal(expectedError, null);
      const { count, error } = await teacher.client
        .from(table)
        .select("*", { count: "exact", head: true })
        .eq("organization_id", organizationId);
      assert.equal(error, null);
      assert.equal(count ?? 0, expected ?? 0, `teacher reads ${table}`);
    }

    const { data: staffRow } = await teacher.client
      .from("staff_members")
      .select("id")
      .eq("id", staffMemberId);
    assert.equal((staffRow ?? []).length, 1);
    const { data: classroom } = await teacher.client
      .from("classrooms")
      .select("id")
      .eq("id", classroomId);
    assert.equal((classroom ?? []).length, 1);
  });

  it("a parent cannot read a school's committee template; global platform templates stay readable", async () => {
    const { data: ownOrg } = await parent.client
      .from("committee_templates")
      .select("id")
      .eq("id", committeeTemplateId);
    assert.deepEqual(ownOrg ?? [], []);

    const { data: staffOwnOrg } = await teacher.client
      .from("committee_templates")
      .select("id")
      .eq("id", committeeTemplateId);
    assert.equal((staffOwnOrg ?? []).length, 1);

    // organization_id is null rows are platform defaults (no school data); unchanged by 20261151.
    const { data: staffGlobal } = await teacher.client
      .from("committee_templates")
      .select("id")
      .eq("id", globalTemplateId);
    assert.equal((staffGlobal ?? []).length, 1);
  });

  it("staff do not read other schools' rows", async () => {
    for (const table of STAFF_ONLY_TABLES) {
      if (table === "committee_templates") continue;
      const { count, error } = await teacher.client
        .from(table)
        .select("*", { count: "exact", head: true })
        .neq("organization_id", organizationId);
      assert.equal(error, null);
      assert.equal(count ?? 0, 0, `teacher reads other orgs in ${table}`);
    }
  });

  it("parents still read branding through organization_settings_public", async () => {
    const { data, error } = await parent.client
      .from("organization_settings_public")
      .select("organization_id")
      .eq("organization_id", organizationId);
    assert.equal(error, null);
    assert.equal((data ?? []).length, 1);
  });
});
