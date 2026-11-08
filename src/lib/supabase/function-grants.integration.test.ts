import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, describe, it } from "node:test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import ws from "ws";
import { createTestAdminClient, integrationTestsEnabled } from "@/test/integration/helpers";

/**
 * Guards the Phase 1a lockdown (20261146_lock_down_open_policies_and_function_grants.sql):
 * - service-only functions must not be callable with the public or a signed-in key
 * - guarded page-summary functions must reject callers with no membership
 * - anon cannot write organizations
 *
 * Extend the lists below whenever a new SECURITY DEFINER function is added.
 */

const describeIntegration = integrationTestsEnabled() ? describe : describe.skip;

const PERMISSION_DENIED = "42501";

const ZERO = "00000000-0000-0000-0000-000000000000";

/** Server-only functions (createAdminClient() callers). */
const SERVICE_ONLY_FUNCTIONS: Array<{ name: string; args: Record<string, unknown> }> = [
  { name: "waive_tuition_charge_atomic", args: { p_charge_id: ZERO, p_organization_id: ZERO } },
  { name: "revert_tuition_ach_settlement_atomic", args: { p_payment_id: ZERO } },
  {
    name: "sign_teacher_parent_form_response_atomic",
    args: {
      p_organization_id: ZERO,
      p_form_id: ZERO,
      p_family_id: ZERO,
      p_responses: {},
      p_signed_at: "2026-01-01T00:00:00Z",
    },
  },
  {
    name: "enroll_friday_branch_student_atomic",
    args: { p_organization_id: ZERO, p_class_id: ZERO, p_family_id: ZERO, p_student_id: ZERO },
  },
  {
    name: "withdraw_friday_branch_student_atomic",
    args: { p_organization_id: ZERO, p_class_id: ZERO, p_family_id: ZERO, p_student_id: ZERO },
  },
  { name: "save_friday_branch_schedule", args: { p_organization_id: ZERO, p_blocks: [] } },
  {
    name: "append_program_coop_supply_assigned_family",
    args: { p_item_id: ZERO, p_program_id: ZERO, p_organization_id: ZERO, p_family_id: ZERO },
  },
  {
    name: "remove_program_coop_supply_assigned_family",
    args: { p_item_id: ZERO, p_program_id: ZERO, p_organization_id: ZERO, p_family_id: ZERO },
  },
  {
    name: "append_program_coop_teaching_schedule_parent",
    args: {
      p_week_id: ZERO,
      p_program_id: ZERO,
      p_organization_id: ZERO,
      p_role: "x",
      p_family_id: ZERO,
    },
  },
  {
    name: "remove_program_coop_teaching_schedule_parent",
    args: {
      p_week_id: ZERO,
      p_program_id: ZERO,
      p_organization_id: ZERO,
      p_role: "x",
      p_family_id: ZERO,
    },
  },
  { name: "latest_messages_for_threads", args: { p_thread_ids: [ZERO] } },
  { name: "thread_unread_counts", args: { p_user_id: ZERO, p_thread_ids: [ZERO] } },
  { name: "count_admin_unread_messages", args: { p_organization_id: ZERO, p_user_id: ZERO } },
  // 20261152: the public-form rate limiter is called with the service role only.
  {
    name: "check_public_form_submission_allowed",
    args: { p_form: "grants_test", p_ip: "203.0.113.1", p_email: "grants@example.test" },
  },
  {
    name: "record_public_form_submission_event",
    args: { p_form: "grants_test", p_ip: "203.0.113.1", p_email: "grants@example.test" },
  },
  {
    name: "record_public_form_submission_if_allowed",
    args: { p_form: "grants_test", p_ip: "203.0.113.1", p_email: "grants@example.test" },
  },
];

/** Functions with an internal caller check: a signed-in user with no membership is rejected. */
const GUARDED_FUNCTIONS: Array<{ name: string; args: Record<string, unknown> }> = [
  { name: "admin_dashboard_metrics", args: { p_organization_id: ZERO, p_user_id: ZERO } },
  { name: "admin_schedule_page_meta", args: { p_organization_id: ZERO, p_year: 2026, p_month: 1 } },
  { name: "admin_students_page_meta", args: { p_organization_id: ZERO } },
  { name: "admin_submissions_page_meta", args: { p_organization_id: ZERO } },
  { name: "admin_tuition_page_meta", args: { p_organization_id: ZERO } },
  { name: "parent_billing_page_meta", args: { p_organization_id: ZERO, p_family_id: ZERO } },
  { name: "parent_portal_home_meta", args: { p_organization_id: ZERO, p_family_id: ZERO } },
];

/**
 * RLS helpers (20261155). Policies call them, so a signed-in user may execute them.
 * They only answer yes/no for the caller; anon stays revoked.
 */
const RLS_HELPER_FUNCTIONS: Array<{ name: string; args: Record<string, unknown> }> = [
  { name: "user_can_read_scheduled_visit", args: { p_visit_id: ZERO } },
  { name: "user_can_read_observation_slot", args: { p_slot_id: ZERO } },
  { name: "user_can_read_checklist_template", args: { p_template_id: ZERO } },
];

/** Already guarded internally by an earlier migration (platform admin / org admin only). */
const PRE_GUARDED_FUNCTIONS: Array<{ name: string; args: Record<string, unknown> }> = [
  { name: "get_organization_payment_transactions_meta", args: { p_organization_id: ZERO } },
];

function requirePublishableKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!key) {
    throw new Error(
      "Function grant tests require NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY from `supabase status`.",
    );
  }
  return key;
}

function createPublicClient(): SupabaseClient {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, requirePublishableKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
    realtime: { transport: ws as never },
  });
}

describeIntegration("function grants lockdown", () => {
  let admin: SupabaseClient;
  let anon: SupabaseClient;
  let signedIn: SupabaseClient;
  let signedInUserId: string | null = null;

  before(async () => {
    admin = createTestAdminClient();
    anon = createPublicClient();

    const email = `grants-${randomUUID()}@example.test`;
    const password = `Pw-${randomUUID()}`;
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) throw error;
    signedInUserId = data.user?.id ?? null;

    signedIn = createPublicClient();
    const { error: signInError } = await signedIn.auth.signInWithPassword({ email, password });
    if (signInError) throw signInError;
  });

  after(async () => {
    if (signedInUserId) {
      await admin.auth.admin.deleteUser(signedInUserId);
    }
  });

  for (const fn of SERVICE_ONLY_FUNCTIONS) {
    it(`${fn.name} is not callable with the public key`, async () => {
      const { error } = await anon.rpc(fn.name, fn.args);
      assert.equal(error?.code, PERMISSION_DENIED, `${fn.name}: ${error?.message ?? "no error"}`);
    });

    it(`${fn.name} is not callable by a signed-in user`, async () => {
      const { error } = await signedIn.rpc(fn.name, fn.args);
      assert.equal(error?.code, PERMISSION_DENIED, `${fn.name}: ${error?.message ?? "no error"}`);
    });
  }

  for (const fn of GUARDED_FUNCTIONS) {
    it(`${fn.name} is not callable with the public key`, async () => {
      const { error } = await anon.rpc(fn.name, fn.args);
      assert.equal(error?.code, PERMISSION_DENIED, `${fn.name}: ${error?.message ?? "no error"}`);
    });

    it(`${fn.name} rejects a signed-in user without membership`, async () => {
      const { error } = await signedIn.rpc(fn.name, fn.args);
      assert.equal(error?.code, PERMISSION_DENIED, `${fn.name}: ${error?.message ?? "no error"}`);
    });

    it(`${fn.name} still works for the service role`, async () => {
      const { error } = await admin.rpc(fn.name, fn.args);
      assert.notEqual(error?.code, PERMISSION_DENIED, `${fn.name}: ${error?.message ?? ""}`);
    });
  }

  for (const fn of PRE_GUARDED_FUNCTIONS) {
    it(`${fn.name} is not callable with the public key`, async () => {
      const { error } = await anon.rpc(fn.name, fn.args);
      assert.equal(error?.code, PERMISSION_DENIED, `${fn.name}: ${error?.message ?? "no error"}`);
    });

    it(`${fn.name} rejects a signed-in user without membership`, async () => {
      const { error } = await signedIn.rpc(fn.name, fn.args);
      assert.equal(error?.code, PERMISSION_DENIED, `${fn.name}: ${error?.message ?? "no error"}`);
    });
  }

  for (const fn of RLS_HELPER_FUNCTIONS) {
    it(`${fn.name} is not callable with the public key`, async () => {
      const { error } = await anon.rpc(fn.name, fn.args);
      assert.equal(error?.code, PERMISSION_DENIED, `${fn.name}: ${error?.message ?? "no error"}`);
    });

    it(`${fn.name} is callable by a signed-in user`, async () => {
      const { error } = await signedIn.rpc(fn.name, fn.args);
      assert.notEqual(error?.code, PERMISSION_DENIED, `${fn.name}: ${error?.message ?? ""}`);
    });
  }

  it("service role can still call read-only message RPCs", async () => {
    const { error } = await admin.rpc("latest_messages_for_threads", { p_thread_ids: [] });
    assert.equal(error, null);
  });

  it("anon cannot update or delete organizations", async () => {
    const update = await anon.from("organizations").update({ name: "pwned" }).eq("id", ZERO);
    assert.ok(update.error, "anon update on organizations should be rejected");

    const del = await anon.from("organizations").delete().eq("id", ZERO);
    assert.ok(del.error, "anon delete on organizations should be rejected");
  });

  it("signed-in user without membership cannot update organizations", async () => {
    const { data } = await signedIn
      .from("organizations")
      .update({ name: "pwned" })
      .eq("id", ZERO)
      .select("id");
    assert.deepEqual(data ?? [], []);
  });
});
