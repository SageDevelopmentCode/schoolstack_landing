import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, describe, it } from "node:test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import ws from "ws";
import { createTestAdminClient, integrationTestsEnabled } from "@/test/integration/helpers";
import { TEST_ORG_SLUG } from "../../../e2e/helpers/constants";

/**
 * Phase 2 (20261149): submit_classroom_signup_response_atomic validates the student, the
 * slot/role ids and capacity, and serializes concurrent submissions.
 */

const describeIntegration = integrationTestsEnabled() ? describe : describe.skip;

function requirePublishableKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!key) {
    throw new Error(
      "Classroom signup tests require NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY from `supabase status`.",
    );
  }
  return key;
}

async function mustId(
  result: PromiseLike<{ data: { id: unknown } | null; error: { message: string } | null }>,
): Promise<string> {
  const { data, error } = await result;
  if (error || !data) throw new Error(error?.message ?? "empty result");
  return String(data.id);
}

describeIntegration("submit_classroom_signup_response_atomic", () => {
  let admin: SupabaseClient;
  let organizationId: string;
  let staffMemberId: string;
  let familyAId: string;
  let familyBId: string;
  let studentAId: string;
  let studentBId: string;
  let signupId: string;
  let closedSignupId: string;
  let openSignupId: string;
  let parentUserId: string;
  let parentClient: SupabaseClient;

  function submit(input: {
    signup?: string;
    family: string;
    student: string;
    slots?: unknown;
    roles?: unknown;
    note?: string | null;
  }) {
    return admin.rpc("submit_classroom_signup_response_atomic", {
      p_organization_id: organizationId,
      p_signup_id: input.signup ?? signupId,
      p_family_id: input.family,
      p_student_id: input.student,
      p_selected_slot_ids: input.slots ?? [],
      p_selected_role_ids: input.roles ?? [],
      p_note: input.note ?? null,
    });
  }

  before(async () => {
    admin = createTestAdminClient();

    organizationId = await mustId(
      admin.from("organizations").select("id").eq("slug", TEST_ORG_SLUG).maybeSingle(),
    );

    staffMemberId = await mustId(
      admin
        .from("staff_members")
        .insert({
          organization_id: organizationId,
          first_name: "Signup",
          last_name: "Teacher",
        })
        .select("id")
        .single(),
    );

    familyAId = await mustId(
      admin
        .from("families")
        .insert({ organization_id: organizationId, name: "Signup Test Family A" })
        .select("id")
        .single(),
    );
    familyBId = await mustId(
      admin
        .from("families")
        .insert({ organization_id: organizationId, name: "Signup Test Family B" })
        .select("id")
        .single(),
    );

    studentAId = await mustId(
      admin
        .from("students")
        .insert({
          organization_id: organizationId,
          family_id: familyAId,
          first_name: "Ada",
          last_name: "SignupTest",
        })
        .select("id")
        .single(),
    );
    studentBId = await mustId(
      admin
        .from("students")
        .insert({
          organization_id: organizationId,
          family_id: familyBId,
          first_name: "Ben",
          last_name: "SignupTest",
        })
        .select("id")
        .single(),
    );

    const baseSignup = {
      organization_id: organizationId,
      created_by_staff_member_id: staffMemberId,
      title: "Integration signup",
      audience: "assigned",
    };

    signupId = await mustId(
      admin
        .from("classroom_signups")
        .insert({
          ...baseSignup,
          signup_type: "time_slots",
          status: "open",
          config: {
            allowMultipleSelections: false,
            slots: [
              { id: "s1", label: "One", capacity: 1 },
              { id: "s2", label: "Two", capacity: 2 },
              { id: "s3", label: "Race", capacity: 1 },
            ],
            roles: [{ id: "r1", name: "Helper", quantityNeeded: 1 }],
          },
        })
        .select("id")
        .single(),
    );

    closedSignupId = await mustId(
      admin
        .from("classroom_signups")
        .insert({
          ...baseSignup,
          signup_type: "time_slots",
          status: "closed",
          config: { slots: [{ id: "s1", label: "One", capacity: 5 }] },
        })
        .select("id")
        .single(),
    );

    openSignupId = await mustId(
      admin
        .from("classroom_signups")
        .insert({
          ...baseSignup,
          signup_type: "open",
          status: "open",
          config: { maxFamilies: 1 },
        })
        .select("id")
        .single(),
    );

    const email = `signup-parent-${randomUUID()}@example.test`;
    const password = `Pw-${randomUUID()}`;
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error || !data.user) throw error ?? new Error("createUser failed");
    parentUserId = data.user.id;
    parentClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, requirePublishableKey(), {
      auth: { autoRefreshToken: false, persistSession: false },
      realtime: { transport: ws as never },
    });
    const { error: signInError } = await parentClient.auth.signInWithPassword({ email, password });
    if (signInError) throw signInError;
  });

  after(async () => {
    await admin
      .from("classroom_signup_responses")
      .delete()
      .in("signup_id", [signupId, closedSignupId, openSignupId]);
    await admin
      .from("classroom_signups")
      .delete()
      .in("id", [signupId, closedSignupId, openSignupId]);
    await admin.from("students").delete().in("id", [studentAId, studentBId]);
    await admin.from("families").delete().in("id", [familyAId, familyBId]);
    await admin.from("staff_members").delete().eq("id", staffMemberId);
    await admin.auth.admin.deleteUser(parentUserId);
  });

  it("saves a valid response and lets the same family re-submit a full slot", async () => {
    const first = await submit({ family: familyAId, student: studentAId, slots: ["s1"] });
    assert.equal(first.error, null);
    assert.ok(first.data);

    // s1 has capacity 1 and family A already holds it; its own response must not block it.
    const again = await submit({
      family: familyAId,
      student: studentAId,
      slots: ["s1"],
      note: "updated",
    });
    assert.equal(again.error, null);
    assert.equal(again.data, first.data);

    const { data: row } = await admin
      .from("classroom_signup_responses")
      .select("note, status, selected_slot_ids")
      .eq("id", String(first.data))
      .single();
    assert.equal(row?.note, "updated");
    assert.equal(row?.status, "confirmed");
    assert.deepEqual(row?.selected_slot_ids, ["s1"]);
  });

  it("rejects a slot that is already at capacity for another family", async () => {
    const result = await submit({ family: familyBId, student: studentBId, slots: ["s1"] });
    assert.equal(result.error?.message, "classroom_signup:slot_full");
  });

  it("rejects slot and role ids that are not in the signup config", async () => {
    const badSlot = await submit({ family: familyBId, student: studentBId, slots: ["nope"] });
    assert.equal(badSlot.error?.message, "classroom_signup:invalid_selection");

    const badRole = await submit({ family: familyBId, student: studentBId, roles: ["nope"] });
    assert.equal(badRole.error?.message, "classroom_signup:invalid_selection");
  });

  it("rejects more than one slot when multiple selections are not allowed", async () => {
    const result = await submit({ family: familyBId, student: studentBId, slots: ["s2", "s3"] });
    assert.equal(result.error?.message, "classroom_signup:invalid_selection");
  });

  it("rejects a student that belongs to a different family", async () => {
    const result = await submit({ family: familyAId, student: studentBId, slots: ["s2"] });
    assert.equal(result.error?.message, "classroom_signup:invalid_student");
  });

  it("rejects closed or unknown signups", async () => {
    const closed = await submit({
      signup: closedSignupId,
      family: familyAId,
      student: studentAId,
      slots: ["s1"],
    });
    assert.equal(closed.error?.message, "classroom_signup:not_found");

    const unknown = await submit({
      signup: randomUUID(),
      family: familyAId,
      student: studentAId,
    });
    assert.equal(unknown.error?.message, "classroom_signup:not_found");
  });

  it("enforces role quantity and maxFamilies on open signups", async () => {
    const roleA = await submit({ family: familyAId, student: studentAId, slots: [], roles: ["r1"] });
    assert.equal(roleA.error, null);
    const roleB = await submit({ family: familyBId, student: studentBId, roles: ["r1"] });
    assert.equal(roleB.error?.message, "classroom_signup:role_full");

    const openA = await submit({ signup: openSignupId, family: familyAId, student: studentAId });
    assert.equal(openA.error, null);
    const openB = await submit({ signup: openSignupId, family: familyBId, student: studentBId });
    assert.equal(openB.error?.message, "classroom_signup:signup_full");
  });

  it("never overfills a slot when two families submit at the same time", async () => {
    const results = await Promise.all([
      submit({ family: familyAId, student: studentAId, slots: ["s3"] }),
      submit({ family: familyBId, student: studentBId, slots: ["s3"] }),
    ]);
    const succeeded = results.filter((result) => result.error === null);
    const full = results.filter((result) => result.error?.message === "classroom_signup:slot_full");
    assert.equal(succeeded.length, 1);
    assert.equal(full.length, 1);
  });

  it("is not callable by a signed-in parent", async () => {
    const { error } = await parentClient.rpc("submit_classroom_signup_response_atomic", {
      p_organization_id: organizationId,
      p_signup_id: signupId,
      p_family_id: familyAId,
      p_student_id: studentAId,
      p_selected_slot_ids: ["s2"],
      p_selected_role_ids: [],
      p_note: null,
    });
    assert.ok(error, "authenticated users must not execute the function");
  });
});
