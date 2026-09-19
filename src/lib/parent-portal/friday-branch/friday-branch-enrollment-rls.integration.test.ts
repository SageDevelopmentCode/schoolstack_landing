import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { before, describe, it } from "node:test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import ws from "ws";
import {
  createTestAdminClient,
  integrationTestsEnabled,
  loadTestEnv,
} from "@/test/integration/helpers";
import { TEST_ORG_SLUG } from "../../../../e2e/helpers/constants";

const describeIntegration = integrationTestsEnabled() ? describe : describe.skip;

type RlsTestSeed = {
  organizationId: string;
  blockId: string;
  slotId: string;
  classId: string;
  alternateClassId: string;
  familyId: string;
  studentId: string;
  guardianId: string;
  authUserId: string;
  enrollmentId: string;
  guardianEmail: string;
  guardianPassword: string;
};

function requirePublishableKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!key) {
    throw new Error(
      "RLS integration tests require NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY from `supabase status`.",
    );
  }
  return key;
}

async function getTestOrganizationId(admin: SupabaseClient): Promise<string> {
  const { data, error } = await admin
    .from("organizations")
    .select("id")
    .eq("slug", TEST_ORG_SLUG)
    .maybeSingle();

  if (error) throw error;
  if (!data?.id) {
    throw new Error(
      `Integration seed aborted: organization "${TEST_ORG_SLUG}" not found. Run supabase db reset.`,
    );
  }

  return String(data.id);
}

async function createGuardianClient(email: string, password: string): Promise<SupabaseClient> {
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    requirePublishableKey(),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      realtime: {
        transport: ws as never,
      },
    },
  );

  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return client;
}

function buildRlsSchedulePayload(input: {
  blockId: string;
  slotId: string;
  classId: string;
  alternateClassId: string;
}) {
  return [
    {
      id: input.blockId,
      label: "RLS Test Block",
      start_date: "2026-09-01",
      end_date: "2026-09-30",
      accent: "sky",
      description: "",
      status: "current",
      sort_order: 0,
      slots: [
        {
          id: input.slotId,
          time: "9:00",
          sort_order: 0,
          classes: [
            {
              id: input.classId,
              name: "RLS Test Class",
              location: "Studio",
              age_group: "K-2",
              teacher: "Ms. Test",
              family_visible: true,
              capacity: 10,
              sort_order: 0,
            },
            {
              id: input.alternateClassId,
              name: "RLS Alternate Class",
              location: "Studio",
              age_group: "K-2",
              teacher: "Ms. Test",
              family_visible: true,
              capacity: 10,
              sort_order: 1,
            },
          ],
        },
      ],
    },
  ];
}

async function seedRlsTest(admin: SupabaseClient): Promise<RlsTestSeed> {
  const organizationId = await getTestOrganizationId(admin);
  const blockId = randomUUID();
  const slotId = randomUUID();
  const classId = randomUUID();
  const alternateClassId = randomUUID();
  const suffix = randomUUID().slice(0, 8);
  const guardianEmail = `friday-branch-rls-${suffix}@schoolstack.test`;
  const guardianPassword = `test-password-${suffix}`;

  const { error: saveError } = await admin.rpc("save_friday_branch_schedule", {
    p_organization_id: organizationId,
    p_blocks: buildRlsSchedulePayload({ blockId, slotId, classId, alternateClassId }),
  });
  if (saveError) throw saveError;

  const { data: family, error: familyError } = await admin
    .from("families")
    .insert({
      organization_id: organizationId,
      name: `RLS Test Family ${suffix}`,
      primary_email: guardianEmail,
    })
    .select("id")
    .single();
  if (familyError) throw familyError;

  const { data: student, error: studentError } = await admin
    .from("students")
    .insert({
      organization_id: organizationId,
      family_id: family.id,
      first_name: "RLS",
      last_name: "Student",
      date_of_birth: "2020-01-01",
      grade: "k",
      status: "prospect",
    })
    .select("id")
    .single();
  if (studentError) throw studentError;

  const { data: authUser, error: authError } = await admin.auth.admin.createUser({
    email: guardianEmail,
    password: guardianPassword,
    email_confirm: true,
  });
  if (authError) throw authError;
  if (!authUser.user?.id) {
    throw new Error("Failed to create guardian auth user for RLS test.");
  }

  const { data: guardian, error: guardianError } = await admin
    .from("guardians")
    .insert({
      organization_id: organizationId,
      family_id: family.id,
      user_id: authUser.user.id,
      first_name: "RLS",
      last_name: "Parent",
      email: guardianEmail,
      relationship: "parent",
    })
    .select("id")
    .single();
  if (guardianError) throw guardianError;

  const { data: enrollmentPayload, error: enrollError } = await admin.rpc(
    "enroll_friday_branch_student_atomic",
    {
      p_organization_id: organizationId,
      p_class_id: classId,
      p_family_id: family.id,
      p_student_id: student.id,
      p_source: "parent",
    },
  );
  if (enrollError) throw enrollError;

  const enrollmentId = String(
    (enrollmentPayload as { enrollment_id?: string } | null)?.enrollment_id ?? "",
  );
  if (!enrollmentId) {
    throw new Error("Friday Branch RLS test seed did not create an enrollment.");
  }

  return {
    organizationId,
    blockId,
    slotId,
    classId,
    alternateClassId,
    familyId: String(family.id),
    studentId: String(student.id),
    guardianId: String(guardian.id),
    authUserId: authUser.user.id,
    enrollmentId,
    guardianEmail,
    guardianPassword,
  };
}

async function cleanupRlsTest(admin: SupabaseClient, seed: RlsTestSeed): Promise<void> {
  await admin
    .from("friday_branch_blocks")
    .delete()
    .eq("id", seed.blockId)
    .eq("organization_id", seed.organizationId);

  await admin.from("guardians").delete().eq("id", seed.guardianId);
  await admin.from("students").delete().eq("family_id", seed.familyId);
  await admin.from("families").delete().eq("id", seed.familyId);
  await admin.auth.admin.deleteUser(seed.authUserId);
}

function assertRlsInsertBlocked(error: { message?: string } | null): void {
  assert.ok(error, "expected guardian insert to be blocked by RLS");
  assert.match(error?.message ?? "", /policy|permission|row-level security/i);
}

function assertNoRowsMutated(rows: unknown[] | null | undefined, action: string): void {
  assert.equal(rows?.length ?? 0, 0, `expected guardian ${action} to mutate zero rows`);
}

describeIntegration("friday_branch_class_enrollments guardian RLS", () => {
  before(() => {
    loadTestEnv();
  });

  it("allows guardians to read own-family enrollments but not write them", async () => {
    const admin = createTestAdminClient();
    const seed = await seedRlsTest(admin);

    try {
      const guardianClient = await createGuardianClient(
        seed.guardianEmail,
        seed.guardianPassword,
      );

      const { data: rows, error: selectError } = await guardianClient
        .from("friday_branch_class_enrollments")
        .select("id, status")
        .eq("family_id", seed.familyId);

      assert.ifError(selectError);
      assert.equal(rows?.length, 1);
      assert.equal(rows?.[0]?.id, seed.enrollmentId);

      const { error: insertError } = await guardianClient
        .from("friday_branch_class_enrollments")
        .insert({
          organization_id: seed.organizationId,
          class_id: seed.alternateClassId,
          block_id: seed.blockId,
          student_id: seed.studentId,
          family_id: seed.familyId,
          status: "confirmed",
          source: "parent",
        });

      assertRlsInsertBlocked(insertError);

      const { data: updatedRows, error: updateError } = await guardianClient
        .from("friday_branch_class_enrollments")
        .update({ status: "withdrawn" })
        .eq("id", seed.enrollmentId)
        .select("id");

      assert.ifError(updateError);
      assertNoRowsMutated(updatedRows, "update");

      const { data: afterUpdate, error: afterUpdateError } = await admin
        .from("friday_branch_class_enrollments")
        .select("status")
        .eq("id", seed.enrollmentId)
        .maybeSingle();

      assert.ifError(afterUpdateError);
      assert.equal(afterUpdate?.status, "confirmed");

      const { data: deletedRows, error: deleteError } = await guardianClient
        .from("friday_branch_class_enrollments")
        .delete()
        .eq("id", seed.enrollmentId)
        .select("id");

      assert.ifError(deleteError);
      assertNoRowsMutated(deletedRows, "delete");

      const { data: afterDelete, error: afterDeleteError } = await admin
        .from("friday_branch_class_enrollments")
        .select("id")
        .eq("id", seed.enrollmentId)
        .maybeSingle();

      assert.ifError(afterDeleteError);
      assert.equal(afterDelete?.id, seed.enrollmentId);
    } finally {
      await cleanupRlsTest(admin, seed);
    }
  });
});
