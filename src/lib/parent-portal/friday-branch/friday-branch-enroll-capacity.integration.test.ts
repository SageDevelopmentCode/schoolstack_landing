import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { before, describe, it } from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  createTestAdminClient,
  integrationTestsEnabled,
  loadTestEnv,
} from "@/test/integration/helpers";
import { TEST_ORG_SLUG } from "../../../../e2e/helpers/constants";

const describeIntegration = integrationTestsEnabled() ? describe : describe.skip;

type CapacityTestSeed = {
  organizationId: string;
  blockId: string;
  slotId: string;
  classId: string;
  familyIds: string[];
  studentIds: string[];
};

type TimeConflictTestSeed = {
  organizationId: string;
  blockId: string;
  slotId: string;
  classIds: [string, string];
  familyId: string;
  studentId: string;
};

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

function buildSchedulePayload(input: {
  blockId: string;
  slotId: string;
  classId: string;
  capacity: number;
}) {
  return [
    {
      id: input.blockId,
      label: "Capacity Test Block",
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
              name: "Capacity Test Class",
              location: "Studio",
              age_group: "K-2",
              teacher: "Ms. Test",
              family_visible: true,
              capacity: input.capacity,
              sort_order: 0,
            },
          ],
        },
      ],
    },
  ];
}

async function createFamilyWithStudent(
  admin: SupabaseClient,
  organizationId: string,
  label: string,
): Promise<{ familyId: string; studentId: string }> {
  const suffix = randomUUID().slice(0, 8);

  const { data: family, error: familyError } = await admin
    .from("families")
    .insert({
      organization_id: organizationId,
      name: `${label} Family ${suffix}`,
      primary_email: `${label}-${suffix}@schoolstack.test`,
    })
    .select("id")
    .single();

  if (familyError) throw familyError;

  const { data: student, error: studentError } = await admin
    .from("students")
    .insert({
      organization_id: organizationId,
      family_id: family.id,
      first_name: label,
      last_name: "Student",
      date_of_birth: "2020-01-01",
      grade: "k",
      status: "prospect",
    })
    .select("id")
    .single();

  if (studentError) throw studentError;

  return {
    familyId: String(family.id),
    studentId: String(student.id),
  };
}

async function seedCapacityClass(admin: SupabaseClient): Promise<CapacityTestSeed> {
  const organizationId = await getTestOrganizationId(admin);
  const blockId = randomUUID();
  const slotId = randomUUID();
  const classId = randomUUID();

  const { error: saveError } = await admin.rpc("save_friday_branch_schedule", {
    p_organization_id: organizationId,
    p_blocks: buildSchedulePayload({ blockId, slotId, classId, capacity: 1 }),
  });

  if (saveError) throw saveError;

  const first = await createFamilyWithStudent(admin, organizationId, "First");
  const second = await createFamilyWithStudent(admin, organizationId, "Second");

  return {
    organizationId,
    blockId,
    slotId,
    classId,
    familyIds: [first.familyId, second.familyId],
    studentIds: [first.studentId, second.studentId],
  };
}

async function enrollViaRpc(
  admin: SupabaseClient,
  seed: CapacityTestSeed,
  studentIndex: number,
): Promise<{ enrollmentId: string; status: string }> {
  const { data, error } = await admin.rpc("enroll_friday_branch_student_atomic", {
    p_organization_id: seed.organizationId,
    p_class_id: seed.classId,
    p_family_id: seed.familyIds[studentIndex],
    p_student_id: seed.studentIds[studentIndex],
    p_source: "parent",
  });

  if (error) throw error;

  const payload = data as { enrollment_id?: string; status?: string } | null;
  return {
    enrollmentId: String(payload?.enrollment_id ?? ""),
    status: String(payload?.status ?? ""),
  };
}

async function withdrawViaRpc(
  admin: SupabaseClient,
  seed: CapacityTestSeed,
  studentIndex: number,
): Promise<{
  withdrawnEnrollmentId: string;
  promotedEnrollmentId: string | null;
  promotedStudentId: string | null;
}> {
  const { data, error } = await admin.rpc("withdraw_friday_branch_student_atomic", {
    p_organization_id: seed.organizationId,
    p_class_id: seed.classId,
    p_family_id: seed.familyIds[studentIndex],
    p_student_id: seed.studentIds[studentIndex],
    p_source: "parent",
  });

  if (error) throw error;

  const payload = data as {
    withdrawn_enrollment_id?: string;
    promoted_enrollment_id?: string | null;
    promoted_student_id?: string | null;
  } | null;

  return {
    withdrawnEnrollmentId: String(payload?.withdrawn_enrollment_id ?? ""),
    promotedEnrollmentId: payload?.promoted_enrollment_id
      ? String(payload.promoted_enrollment_id)
      : null,
    promotedStudentId: payload?.promoted_student_id
      ? String(payload.promoted_student_id)
      : null,
  };
}

async function getEnrollmentStatus(
  admin: SupabaseClient,
  seed: CapacityTestSeed,
  studentIndex: number,
): Promise<string | null> {
  const { data, error } = await admin
    .from("friday_branch_class_enrollments")
    .select("status")
    .eq("organization_id", seed.organizationId)
    .eq("class_id", seed.classId)
    .eq("student_id", seed.studentIds[studentIndex])
    .maybeSingle();

  if (error) throw error;
  return data?.status ? String(data.status) : null;
}

async function seedCapacityClassWithThreeStudents(
  admin: SupabaseClient,
): Promise<CapacityTestSeed> {
  const organizationId = await getTestOrganizationId(admin);
  const blockId = randomUUID();
  const slotId = randomUUID();
  const classId = randomUUID();

  const { error: saveError } = await admin.rpc("save_friday_branch_schedule", {
    p_organization_id: organizationId,
    p_blocks: buildSchedulePayload({ blockId, slotId, classId, capacity: 1 }),
  });

  if (saveError) throw saveError;

  const first = await createFamilyWithStudent(admin, organizationId, "First");
  const second = await createFamilyWithStudent(admin, organizationId, "Second");
  const third = await createFamilyWithStudent(admin, organizationId, "Third");

  return {
    organizationId,
    blockId,
    slotId,
    classId,
    familyIds: [first.familyId, second.familyId, third.familyId],
    studentIds: [first.studentId, second.studentId, third.studentId],
  };
}

function buildSameSlotSchedulePayload(input: {
  blockId: string;
  slotId: string;
  classIds: [string, string];
}) {
  return [
    {
      id: input.blockId,
      label: "Time Conflict Test Block",
      start_date: "2026-09-01",
      end_date: "2026-09-30",
      accent: "sky",
      description: "",
      status: "current",
      sort_order: 0,
      slots: [
        {
          id: input.slotId,
          time: "10:00",
          sort_order: 0,
          classes: [
            {
              id: input.classIds[0],
              name: "Art",
              location: "Studio A",
              age_group: "K-2",
              teacher: "Ms. Art",
              family_visible: true,
              capacity: null,
              sort_order: 0,
            },
            {
              id: input.classIds[1],
              name: "Music",
              location: "Studio B",
              age_group: "K-2",
              teacher: "Ms. Music",
              family_visible: true,
              capacity: null,
              sort_order: 1,
            },
          ],
        },
      ],
    },
  ];
}

async function seedSameSlotClasses(admin: SupabaseClient): Promise<TimeConflictTestSeed> {
  const organizationId = await getTestOrganizationId(admin);
  const blockId = randomUUID();
  const slotId = randomUUID();
  const classIds: [string, string] = [randomUUID(), randomUUID()];

  const { error: saveError } = await admin.rpc("save_friday_branch_schedule", {
    p_organization_id: organizationId,
    p_blocks: buildSameSlotSchedulePayload({ blockId, slotId, classIds }),
  });

  if (saveError) throw saveError;

  const family = await createFamilyWithStudent(admin, organizationId, "Conflict");

  return {
    organizationId,
    blockId,
    slotId,
    classIds,
    familyId: family.familyId,
    studentId: family.studentId,
  };
}

async function cleanupTimeConflictTest(
  admin: SupabaseClient,
  seed: TimeConflictTestSeed,
): Promise<void> {
  await admin
    .from("friday_branch_blocks")
    .delete()
    .eq("id", seed.blockId)
    .eq("organization_id", seed.organizationId);

  await admin.from("students").delete().eq("family_id", seed.familyId);
  await admin.from("families").delete().eq("id", seed.familyId);
}

async function cleanupCapacityTest(admin: SupabaseClient, seed: CapacityTestSeed): Promise<void> {
  await admin
    .from("friday_branch_blocks")
    .delete()
    .eq("id", seed.blockId)
    .eq("organization_id", seed.organizationId);

  for (const familyId of seed.familyIds) {
    await admin.from("students").delete().eq("family_id", familyId);
    await admin.from("families").delete().eq("id", familyId);
  }
}

describeIntegration("enroll_friday_branch_student_atomic capacity", () => {
  before(() => {
    loadTestEnv();
  });

  it("waitlists the second student when the class is already at capacity", async () => {
    const admin = createTestAdminClient();
    const seed = await seedCapacityClass(admin);

    try {
      const { data: existingEnrollment, error: existingError } = await admin
        .from("friday_branch_class_enrollments")
        .insert({
          organization_id: seed.organizationId,
          class_id: seed.classId,
          block_id: seed.blockId,
          student_id: seed.studentIds[0],
          family_id: seed.familyIds[0],
          status: "confirmed",
          source: "parent",
        })
        .select("id")
        .single();

      if (existingError) throw existingError;
      assert.ok(existingEnrollment?.id);

      const secondEnrollment = await enrollViaRpc(admin, seed, 1);
      assert.equal(secondEnrollment.status, "waitlisted");
      assert.ok(secondEnrollment.enrollmentId);
    } finally {
      await cleanupCapacityTest(admin, seed);
    }
  });

  it("rejects parallel enrolls into different classes at the same slot time", async () => {
    const admin = createTestAdminClient();
    const seed = await seedSameSlotClasses(admin);

    try {
      const [firstResult, secondResult] = await Promise.all([
        admin.rpc("enroll_friday_branch_student_atomic", {
          p_organization_id: seed.organizationId,
          p_class_id: seed.classIds[0],
          p_family_id: seed.familyId,
          p_student_id: seed.studentId,
          p_source: "parent",
        }),
        admin.rpc("enroll_friday_branch_student_atomic", {
          p_organization_id: seed.organizationId,
          p_class_id: seed.classIds[1],
          p_family_id: seed.familyId,
          p_student_id: seed.studentId,
          p_source: "parent",
        }),
      ]);

      const outcomes = [firstResult, secondResult];
      const successes = outcomes.filter((result) => !result.error);
      const failures = outcomes.filter((result) => result.error);

      assert.equal(successes.length, 1);
      assert.equal(failures.length, 1);
      assert.match(failures[0]?.error?.message ?? "", /time_conflict/);

      const { count, error: countError } = await admin
        .from("friday_branch_class_enrollments")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", seed.organizationId)
        .eq("student_id", seed.studentId)
        .eq("block_id", seed.blockId)
        .in("status", ["confirmed", "waitlisted"]);

      if (countError) throw countError;
      assert.equal(count, 1);
    } finally {
      await cleanupTimeConflictTest(admin, seed);
    }
  });

  it("confirms the first student and waitlists the second when capacity is 1", async () => {
    const admin = createTestAdminClient();
    const seed = await seedCapacityClass(admin);

    try {
      const firstEnrollment = await enrollViaRpc(admin, seed, 0);
      assert.equal(firstEnrollment.status, "confirmed");

      const secondEnrollment = await enrollViaRpc(admin, seed, 1);
      assert.equal(secondEnrollment.status, "waitlisted");

      const { count, error: countError } = await admin
        .from("friday_branch_class_enrollments")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", seed.organizationId)
        .eq("class_id", seed.classId)
        .eq("status", "confirmed");

      if (countError) throw countError;
      assert.equal(count, 1);
    } finally {
      await cleanupCapacityTest(admin, seed);
    }
  });
});

describeIntegration("withdraw_friday_branch_student_atomic waitlist promotion", () => {
  before(() => {
    loadTestEnv();
  });

  it("promotes the oldest waitlisted student when a confirmed student withdraws", async () => {
    const admin = createTestAdminClient();
    const seed = await seedCapacityClass(admin);

    try {
      const firstEnrollment = await enrollViaRpc(admin, seed, 0);
      assert.equal(firstEnrollment.status, "confirmed");

      const secondEnrollment = await enrollViaRpc(admin, seed, 1);
      assert.equal(secondEnrollment.status, "waitlisted");

      const withdrawal = await withdrawViaRpc(admin, seed, 0);
      assert.ok(withdrawal.withdrawnEnrollmentId);
      assert.equal(withdrawal.promotedStudentId, seed.studentIds[1]);

      assert.equal(await getEnrollmentStatus(admin, seed, 0), "withdrawn");
      assert.equal(await getEnrollmentStatus(admin, seed, 1), "confirmed");

      const { count, error: countError } = await admin
        .from("friday_branch_class_enrollments")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", seed.organizationId)
        .eq("class_id", seed.classId)
        .eq("status", "confirmed");

      if (countError) throw countError;
      assert.equal(count, 1);
    } finally {
      await cleanupCapacityTest(admin, seed);
    }
  });

  it("does not promote waitlist when a waitlisted student withdraws", async () => {
    const admin = createTestAdminClient();
    const seed = await seedCapacityClassWithThreeStudents(admin);

    try {
      assert.equal((await enrollViaRpc(admin, seed, 0)).status, "confirmed");
      assert.equal((await enrollViaRpc(admin, seed, 1)).status, "waitlisted");
      assert.equal((await enrollViaRpc(admin, seed, 2)).status, "waitlisted");

      const withdrawal = await withdrawViaRpc(admin, seed, 1);
      assert.ok(withdrawal.withdrawnEnrollmentId);
      assert.equal(withdrawal.promotedEnrollmentId, null);
      assert.equal(withdrawal.promotedStudentId, null);

      assert.equal(await getEnrollmentStatus(admin, seed, 0), "confirmed");
      assert.equal(await getEnrollmentStatus(admin, seed, 1), "withdrawn");
      assert.equal(await getEnrollmentStatus(admin, seed, 2), "waitlisted");

      const { count, error: countError } = await admin
        .from("friday_branch_class_enrollments")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", seed.organizationId)
        .eq("class_id", seed.classId)
        .eq("status", "confirmed");

      if (countError) throw countError;
      assert.equal(count, 1);
    } finally {
      await cleanupCapacityTest(admin, seed);
    }
  });
});
