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

type ScheduleSeed = {
  organizationId: string;
  familyId: string;
  studentId: string;
  blockId: string;
  slotId: string;
  classId: string;
  enrollmentId: string;
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
  capacity?: number | null;
  priceCents?: number | null;
  flyerStoragePath?: string | null;
  flyerFileName?: string | null;
  flyerFileSizeBytes?: number | null;
  includeClass?: boolean;
}) {
  const includeClass = input.includeClass ?? true;

  return [
    {
      id: input.blockId,
      label: "Integration Friday Block",
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
          classes: includeClass
            ? [
                {
                  id: input.classId,
                  name: "Integration Art",
                  location: "Studio",
                  age_group: "K-2",
                  teacher: "Ms. Test",
                  family_visible: true,
                  capacity: input.capacity ?? null,
                  price_cents: input.priceCents ?? null,
                  flyer_storage_path: input.flyerStoragePath ?? null,
                  flyer_file_name: input.flyerFileName ?? null,
                  flyer_file_size_bytes: input.flyerFileSizeBytes ?? null,
                  sort_order: 0,
                },
              ]
            : [],
        },
      ],
    },
  ];
}

async function seedFridayBranchScheduleWithEnrollment(
  admin: SupabaseClient,
): Promise<ScheduleSeed> {
  const organizationId = await getTestOrganizationId(admin);
  const suffix = randomUUID().slice(0, 8);
  const blockId = randomUUID();
  const slotId = randomUUID();
  const classId = randomUUID();

  const { data: family, error: familyError } = await admin
    .from("families")
    .insert({
      organization_id: organizationId,
      name: `Friday Branch Family ${suffix}`,
      primary_email: `friday-branch-${suffix}@schoolstack.test`,
    })
    .select("id")
    .single();

  if (familyError) throw familyError;

  const { data: student, error: studentError } = await admin
    .from("students")
    .insert({
      organization_id: organizationId,
      family_id: family.id,
      first_name: "Friday",
      last_name: "Student",
      date_of_birth: "2020-01-01",
      grade: "k",
      status: "prospect",
    })
    .select("id")
    .single();

  if (studentError) throw studentError;

  const { error: saveError } = await admin.rpc("save_friday_branch_schedule", {
    p_organization_id: organizationId,
    p_blocks: buildSchedulePayload({ blockId, slotId, classId, capacity: 10 }),
  });

  if (saveError) throw saveError;

  const { data: enrollment, error: enrollmentError } = await admin
    .from("friday_branch_class_enrollments")
    .insert({
      organization_id: organizationId,
      class_id: classId,
      block_id: blockId,
      student_id: student.id,
      family_id: family.id,
      status: "confirmed",
      source: "parent",
    })
    .select("id")
    .single();

  if (enrollmentError) throw enrollmentError;

  return {
    organizationId,
    familyId: String(family.id),
    studentId: String(student.id),
    blockId,
    slotId,
    classId,
    enrollmentId: String(enrollment.id),
  };
}

async function cleanupFridayBranchSchedule(
  admin: SupabaseClient,
  seed: Pick<ScheduleSeed, "organizationId" | "blockId" | "familyId" | "enrollmentId">,
): Promise<void> {
  await admin
    .from("friday_branch_class_enrollments")
    .delete()
    .eq("id", seed.enrollmentId);

  await admin
    .from("friday_branch_blocks")
    .delete()
    .eq("id", seed.blockId)
    .eq("organization_id", seed.organizationId);

  await admin.from("students").delete().eq("family_id", seed.familyId);
  await admin.from("families").delete().eq("id", seed.familyId);
}

describeIntegration("save_friday_branch_schedule", () => {
  before(() => {
    loadTestEnv();
  });

  it("preserves enrollments when saving unchanged class IDs with updated fields", async () => {
    const admin = createTestAdminClient();
    const seed = await seedFridayBranchScheduleWithEnrollment(admin);

    try {
      const { error: saveError } = await admin.rpc("save_friday_branch_schedule", {
        p_organization_id: seed.organizationId,
        p_blocks: buildSchedulePayload({
          blockId: seed.blockId,
          slotId: seed.slotId,
          classId: seed.classId,
          capacity: 12,
        }),
      });

      if (saveError) throw saveError;

      const { data: enrollment, error: enrollmentError } = await admin
        .from("friday_branch_class_enrollments")
        .select("id, status, student_id, class_id")
        .eq("id", seed.enrollmentId)
        .maybeSingle();

      if (enrollmentError) throw enrollmentError;

      assert.ok(enrollment, "expected enrollment to still exist after identity save");
      assert.equal(enrollment.status, "confirmed");
      assert.equal(enrollment.student_id, seed.studentId);
      assert.equal(enrollment.class_id, seed.classId);

      const { data: classRow, error: classError } = await admin
        .from("friday_branch_classes")
        .select("capacity")
        .eq("id", seed.classId)
        .maybeSingle();

      if (classError) throw classError;
      assert.equal(classRow?.capacity, 12);
    } finally {
      await cleanupFridayBranchSchedule(admin, seed);
    }
  });

  it("round-trips price and flyer metadata for unchanged class IDs", async () => {
    const admin = createTestAdminClient();
    const seed = await seedFridayBranchScheduleWithEnrollment(admin);

    try {
      const flyerPath = `${seed.organizationId}/classes/${seed.classId}/flyer_test.pdf`;
      const { error: saveError } = await admin.rpc("save_friday_branch_schedule", {
        p_organization_id: seed.organizationId,
        p_blocks: buildSchedulePayload({
          blockId: seed.blockId,
          slotId: seed.slotId,
          classId: seed.classId,
          capacity: 10,
          priceCents: 2500,
          flyerStoragePath: flyerPath,
          flyerFileName: "Art Flyer.pdf",
          flyerFileSizeBytes: 4096,
        }),
      });

      if (saveError) throw saveError;

      const { data: classRow, error: classError } = await admin
        .from("friday_branch_classes")
        .select(
          "price_cents, flyer_storage_path, flyer_file_name, flyer_file_size_bytes",
        )
        .eq("id", seed.classId)
        .maybeSingle();

      if (classError) throw classError;
      assert.equal(classRow?.price_cents, 2500);
      assert.equal(classRow?.flyer_storage_path, flyerPath);
      assert.equal(classRow?.flyer_file_name, "Art Flyer.pdf");
      assert.equal(classRow?.flyer_file_size_bytes, 4096);
    } finally {
      await cleanupFridayBranchSchedule(admin, seed);
    }
  });

  it("deletes enrollments when a class is removed from the schedule", async () => {
    const admin = createTestAdminClient();
    const seed = await seedFridayBranchScheduleWithEnrollment(admin);

    try {
      const { error: saveError } = await admin.rpc("save_friday_branch_schedule", {
        p_organization_id: seed.organizationId,
        p_blocks: buildSchedulePayload({
          blockId: seed.blockId,
          slotId: seed.slotId,
          classId: seed.classId,
          includeClass: false,
        }),
      });

      if (saveError) throw saveError;

      const { data: enrollment, error: enrollmentError } = await admin
        .from("friday_branch_class_enrollments")
        .select("id")
        .eq("id", seed.enrollmentId)
        .maybeSingle();

      if (enrollmentError) throw enrollmentError;
      assert.equal(enrollment, null);
    } finally {
      await cleanupFridayBranchSchedule(admin, seed);
    }
  });
});
