import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, describe, it } from "node:test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import ws from "ws";
import { createTestAdminClient, integrationTestsEnabled } from "@/test/integration/helpers";
import { TEST_ORG_SLUG } from "../../../e2e/helpers/constants";

/**
 * Phase 1b step 3 remainder (20261153–20261155):
 * memberships are staff-only plus own/peer rows; tuition catalogs are staff-only;
 * visit days, booked slots, and checklist embeds are family-scoped.
 */

const describeIntegration = integrationTestsEnabled() ? describe : describe.skip;

type TestUser = { id: string; client: SupabaseClient };

function requirePublishableKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!key) {
    throw new Error(
      "RLS tests require NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY from `supabase status`.",
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

async function idsFor(
  client: SupabaseClient,
  table: string,
  column: string,
  filter: { column: string; value: string },
): Promise<string[]> {
  const { data, error } = await client
    .from(table)
    .select(column)
    .eq(filter.column, filter.value);
  assert.equal(error, null, `${table}: ${error?.message}`);
  return (data ?? []).map((row) => {
    const record = row as unknown as Record<string, unknown>;
    return String(record[column]);
  });
}

describeIntegration("phase 1b step 3 remainder", () => {
  let admin: SupabaseClient;
  let organizationId: string;
  let programId: string;
  let parent: TestUser;
  let linkedPeer: TestUser;
  let otherParent: TestUser;
  let teacher: TestUser;
  let stranger: TestUser;
  let familyId: string;
  let otherFamilyId: string;
  let groupId: string;
  let ratePlanId: string;
  let tierId: string;
  let paymentPlanId: string;
  let feeComponentId: string;
  let ownSlotId: string;
  let otherSlotId: string;
  let openSlotId: string;
  let ownVisitId: string;
  let otherVisitId: string;
  let ownVisitDayId: string;
  let documentTemplateId: string;
  let otherDocumentTemplateId: string;
  let feeDefinitionId: string;
  let checklistTemplateId: string;
  let enrollmentId: string;
  const users: TestUser[] = [];

  before(async () => {
    admin = createTestAdminClient();
    organizationId = await mustId(
      admin.from("organizations").select("id").eq("slug", TEST_ORG_SLUG).maybeSingle(),
    );

    const { data: existingProgram, error: programError } = await admin
      .from("programs")
      .select("id")
      .eq("organization_id", organizationId)
      .limit(1)
      .maybeSingle();
    if (programError) throw new Error(programError.message);
    programId = existingProgram
      ? String(existingProgram.id)
      : await mustId(
          admin
            .from("programs")
            .insert({
              organization_id: organizationId,
              name: "Remainder Test Program",
              type: "school_year",
              status: "open",
            })
            .select("id")
            .single(),
        );

    parent = await createUser(admin, "s3b-parent");
    linkedPeer = await createUser(admin, "s3b-linked");
    otherParent = await createUser(admin, "s3b-other");
    teacher = await createUser(admin, "s3b-teacher");
    stranger = await createUser(admin, "s3b-stranger");
    users.push(parent, linkedPeer, otherParent, teacher, stranger);

    familyId = await mustId(
      admin
        .from("families")
        .insert({ organization_id: organizationId, name: "Remainder Family A" })
        .select("id")
        .single(),
    );
    otherFamilyId = await mustId(
      admin
        .from("families")
        .insert({ organization_id: organizationId, name: "Remainder Family B" })
        .select("id")
        .single(),
    );

    const { error: guardianError } = await admin.from("guardians").insert([
      {
        organization_id: organizationId,
        family_id: familyId,
        user_id: parent.id,
        first_name: "Parent",
        last_name: "Remainder",
      },
      {
        organization_id: organizationId,
        family_id: otherFamilyId,
        user_id: otherParent.id,
        first_name: "Other",
        last_name: "Remainder",
      },
    ]);
    if (guardianError) throw new Error(guardianError.message);

    for (const [user, role] of [
      [parent, "parent"],
      [linkedPeer, "parent"],
      [otherParent, "parent"],
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

    ratePlanId = await mustId(
      admin
        .from("tuition_rate_plans")
        .insert({
          organization_id: organizationId,
          name: "Remainder Rate Plan",
          billing_basis: "annual",
          amount_cents: 100000,
          status: "active",
        })
        .select("id")
        .single(),
    );
    tierId = await mustId(
      admin
        .from("tuition_rate_tiers")
        .insert({
          organization_id: organizationId,
          rate_plan_id: ratePlanId,
          code: `rem-${randomUUID().slice(0, 8)}`,
          label: "Standard",
          amount_cents: 100000,
        })
        .select("id")
        .single(),
    );
    paymentPlanId = await mustId(
      admin
        .from("tuition_payment_plans")
        .insert({
          organization_id: organizationId,
          rate_plan_id: ratePlanId,
          name: "Remainder Pay",
          installment_count: 1,
          installment_amount_cents: 100000,
        })
        .select("id")
        .single(),
    );
    feeComponentId = await mustId(
      admin
        .from("tuition_fee_components")
        .insert({
          organization_id: organizationId,
          rate_plan_id: ratePlanId,
          code: `fee-${randomUUID().slice(0, 8)}`,
          label: "Enrollment fee",
          amount_cents: 5000,
        })
        .select("id")
        .single(),
    );

    ownSlotId = await mustId(
      admin
        .from("admissions_observation_slots")
        .insert({
          organization_id: organizationId,
          date: "2026-12-01",
          start_time: "09:00",
          end_time: "12:00",
          label: "Remainder own slot",
        })
        .select("id")
        .single(),
    );
    otherSlotId = await mustId(
      admin
        .from("admissions_observation_slots")
        .insert({
          organization_id: organizationId,
          date: "2026-12-02",
          start_time: "09:00",
          end_time: "12:00",
          label: "Remainder other slot",
        })
        .select("id")
        .single(),
    );
    openSlotId = await mustId(
      admin
        .from("admissions_observation_slots")
        .insert({
          organization_id: organizationId,
          date: "2026-12-03",
          start_time: "09:00",
          end_time: "12:00",
          label: "Remainder open slot",
        })
        .select("id")
        .single(),
    );
    const { error: gradeError } = await admin.from("admissions_observation_slot_grades").insert({
      slot_id: ownSlotId,
      grade_value: "1",
    });
    if (gradeError) throw new Error(gradeError.message);

    ownVisitId = await mustId(
      admin
        .from("admissions_scheduled_visits")
        .insert({
          organization_id: organizationId,
          family_id: familyId,
          post_submit_action_id: "remainder-own",
          action_type: "schedule_observation_day",
          scheduled_date: "2026-12-01",
          start_time_slot: "09:00",
          duration_minutes: 30,
        })
        .select("id")
        .single(),
    );
    otherVisitId = await mustId(
      admin
        .from("admissions_scheduled_visits")
        .insert({
          organization_id: organizationId,
          family_id: otherFamilyId,
          post_submit_action_id: "remainder-other",
          action_type: "schedule_observation_day",
          scheduled_date: "2026-12-02",
          start_time_slot: "09:00",
          duration_minutes: 30,
        })
        .select("id")
        .single(),
    );
    ownVisitDayId = await mustId(
      admin
        .from("admissions_scheduled_visit_days")
        .insert({
          scheduled_visit_id: ownVisitId,
          organization_id: organizationId,
          date: "2026-12-01",
          observation_slot_id: ownSlotId,
        })
        .select("id")
        .single(),
    );
    await mustId(
      admin
        .from("admissions_scheduled_visit_days")
        .insert({
          scheduled_visit_id: otherVisitId,
          organization_id: organizationId,
          date: "2026-12-02",
          observation_slot_id: otherSlotId,
        })
        .select("id")
        .single(),
    );

    documentTemplateId = await mustId(
      admin
        .from("document_templates")
        .insert({
          organization_id: organizationId,
          name: "Remainder agreement",
          kind: "inline_sections",
          content: {},
          status: "published",
        })
        .select("id")
        .single(),
    );
    otherDocumentTemplateId = await mustId(
      admin
        .from("document_templates")
        .insert({
          organization_id: organizationId,
          name: "Remainder unused agreement",
          kind: "inline_sections",
          content: {},
          status: "published",
        })
        .select("id")
        .single(),
    );
    feeDefinitionId = await mustId(
      admin
        .from("fee_definitions")
        .insert({
          organization_id: organizationId,
          code: `rem-${randomUUID().slice(0, 8)}`,
          label: "Remainder fee",
          amount_cents: 2500,
        })
        .select("id")
        .single(),
    );
    checklistTemplateId = await mustId(
      admin
        .from("enrollment_checklist_templates")
        .insert({
          organization_id: organizationId,
          program_id: programId,
          name: "Remainder checklist",
          enrollment_path: "new_family",
          status: "published",
        })
        .select("id")
        .single(),
    );
    const templateItemId = await mustId(
      admin
        .from("enrollment_checklist_template_items")
        .insert({
          template_id: checklistTemplateId,
          organization_id: organizationId,
          item_key: "agreement",
          label: "Agreement",
          type: "document_sign",
          document_template_id: documentTemplateId,
        })
        .select("id")
        .single(),
    );
    await mustId(
      admin
        .from("enrollment_checklist_template_items")
        .insert({
          template_id: checklistTemplateId,
          organization_id: organizationId,
          item_key: "fee",
          label: "Fee",
          type: "payment",
          fee_definition_id: feeDefinitionId,
        })
        .select("id")
        .single(),
    );

    const studentId = await mustId(
      admin
        .from("students")
        .insert({
          organization_id: organizationId,
          family_id: familyId,
          first_name: "Remainder",
          last_name: "Child",
        })
        .select("id")
        .single(),
    );
    enrollmentId = await mustId(
      admin
        .from("enrollments")
        .insert({
          organization_id: organizationId,
          student_id: studentId,
          program_id: programId,
          status: "enrolled",
        })
        .select("id")
        .single(),
    );
    await mustId(
      admin
        .from("enrollment_checklists")
        .insert({
          organization_id: organizationId,
          enrollment_id: enrollmentId,
          template_id: checklistTemplateId,
          status: "not_started",
        })
        .select("id")
        .single(),
    );
    void templateItemId;
  });

  after(async () => {
    await admin.from("enrollment_checklists").delete().eq("enrollment_id", enrollmentId);
    await admin.from("enrollments").delete().eq("id", enrollmentId);
    await admin.from("students").delete().eq("family_id", familyId);
    await admin
      .from("enrollment_checklist_template_items")
      .delete()
      .eq("template_id", checklistTemplateId);
    await admin.from("enrollment_checklist_templates").delete().eq("id", checklistTemplateId);
    await admin
      .from("document_templates")
      .delete()
      .in("id", [documentTemplateId, otherDocumentTemplateId]);
    await admin.from("fee_definitions").delete().eq("id", feeDefinitionId);
    await admin
      .from("admissions_scheduled_visit_days")
      .delete()
      .in("scheduled_visit_id", [ownVisitId, otherVisitId]);
    await admin.from("admissions_scheduled_visits").delete().in("id", [ownVisitId, otherVisitId]);
    await admin
      .from("admissions_observation_slots")
      .delete()
      .in("id", [ownSlotId, otherSlotId, openSlotId]);
    await admin.from("tuition_fee_components").delete().eq("id", feeComponentId);
    await admin.from("tuition_payment_plans").delete().eq("id", paymentPlanId);
    await admin.from("tuition_rate_tiers").delete().eq("id", tierId);
    await admin.from("tuition_rate_plans").delete().eq("id", ratePlanId);
    await admin.from("organization_portal_account_link_members").delete().eq("group_id", groupId);
    await admin.from("organization_portal_account_link_groups").delete().eq("id", groupId);
    await admin.from("guardians").delete().in("family_id", [familyId, otherFamilyId]);
    await admin.from("families").delete().in("id", [familyId, otherFamilyId]);
    for (const user of users) {
      await admin
        .from("organization_memberships")
        .delete()
        .eq("organization_id", organizationId)
        .eq("user_id", user.id);
      await admin.auth.admin.deleteUser(user.id);
    }
  });

  it("parents see only their own membership rows; staff see the school", async () => {
    const parentIds = await idsFor(parent.client, "organization_memberships", "user_id", {
      column: "organization_id",
      value: organizationId,
    });
    const peerIds = await idsFor(linkedPeer.client, "organization_memberships", "user_id", {
      column: "organization_id",
      value: organizationId,
    });
    assert.deepEqual(new Set(parentIds), new Set([parent.id, linkedPeer.id]));
    assert.deepEqual(new Set(peerIds), new Set([parent.id, linkedPeer.id]));

    const teacherIds = await idsFor(teacher.client, "organization_memberships", "user_id", {
      column: "organization_id",
      value: organizationId,
    });
    const adminIds = await idsFor(admin, "organization_memberships", "user_id", {
      column: "organization_id",
      value: organizationId,
    });
    assert.deepEqual(new Set(teacherIds), new Set(adminIds));
    assert.ok(teacherIds.includes(parent.id));

    const strangerIds = await idsFor(stranger.client, "organization_memberships", "user_id", {
      column: "organization_id",
      value: organizationId,
    });
    assert.deepEqual(strangerIds, []);
  });

  it("parents cannot read tuition catalogs; a teacher can", async () => {
    for (const [table, id] of [
      ["tuition_rate_plans", ratePlanId],
      ["tuition_rate_tiers", tierId],
      ["tuition_payment_plans", paymentPlanId],
      ["tuition_fee_components", feeComponentId],
    ] as const) {
      const { data, error } = await parent.client.from(table).select("id").eq("id", id);
      assert.equal(error, null, `${table}: ${error?.message}`);
      assert.deepEqual(data, [], `${table} is hidden from a parent`);

      const teacherRead = await teacher.client.from(table).select("id").eq("id", id);
      assert.equal(teacherRead.error, null, `${table}: ${teacherRead.error?.message}`);
      assert.equal(teacherRead.data?.length, 1, `teacher reads ${table}`);
    }
  });

  it("parents read their booked visit and checklist embeds, not the rest of the school", async () => {
    const ownDays = await idsFor(parent.client, "admissions_scheduled_visit_days", "id", {
      column: "organization_id",
      value: organizationId,
    });
    assert.deepEqual(new Set(ownDays), new Set([ownVisitDayId]));

    const peerDays = await idsFor(linkedPeer.client, "admissions_scheduled_visit_days", "id", {
      column: "organization_id",
      value: organizationId,
    });
    assert.ok(peerDays.includes(ownVisitDayId));

    const parentSlots = await idsFor(parent.client, "admissions_observation_slots", "id", {
      column: "organization_id",
      value: organizationId,
    });
    assert.deepEqual(new Set(parentSlots), new Set([ownSlotId]));
    assert.equal(parentSlots.includes(openSlotId), false);
    assert.equal(parentSlots.includes(otherSlotId), false);

    const { data: grades, error: gradeError } = await parent.client
      .from("admissions_observation_slot_grades")
      .select("slot_id")
      .eq("slot_id", ownSlotId);
    assert.equal(gradeError, null, gradeError?.message);
    assert.equal(grades?.length, 1);

    const { data: otherGrades } = await otherParent.client
      .from("admissions_observation_slot_grades")
      .select("slot_id")
      .eq("slot_id", ownSlotId);
    assert.deepEqual(otherGrades, []);

    const teacherOpen = await teacher.client
      .from("admissions_observation_slots")
      .select("id")
      .eq("id", openSlotId);
    assert.equal(teacherOpen.error, null);
    assert.equal(teacherOpen.data?.length, 1);

    const { data: docs, error: docError } = await parent.client
      .from("document_templates")
      .select("id")
      .in("id", [documentTemplateId, otherDocumentTemplateId]);
    assert.equal(docError, null, docError?.message);
    assert.deepEqual(
      new Set((docs ?? []).map((row) => String(row.id))),
      new Set([documentTemplateId]),
    );

    const { data: fees, error: feeError } = await parent.client
      .from("fee_definitions")
      .select("id")
      .eq("id", feeDefinitionId);
    assert.equal(feeError, null, feeError?.message);
    assert.equal(fees?.length, 1);

    const { data: otherDocs } = await otherParent.client
      .from("document_templates")
      .select("id")
      .eq("id", documentTemplateId);
    assert.deepEqual(otherDocs, []);

    const teacherDoc = await teacher.client
      .from("document_templates")
      .select("id")
      .eq("id", otherDocumentTemplateId);
    assert.equal(teacherDoc.data?.length, 1);
  });
});
