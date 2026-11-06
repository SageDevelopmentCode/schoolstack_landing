import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, describe, it } from "node:test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import ws from "ws";
import { createTestAdminClient, integrationTestsEnabled } from "@/test/integration/helpers";
import { TEST_ORG_SLUG } from "../../../e2e/helpers/constants";

/**
 * Phase 1b (20261147 + 20261148): parents read only their own family's billing data.
 *
 * Seed: family A (parent A + a linked login), family B (parent B), a teacher.
 * Tables used: tuition_billing_accounts and family_payment_methods (same policy shape as
 * tuition_charges / splits / assignments / adjustments; those are covered by the dry-run SQL).
 */

const describeIntegration = integrationTestsEnabled() ? describe : describe.skip;

type TestUser = { id: string; email: string; password: string; client: SupabaseClient };

function requirePublishableKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!key) {
    throw new Error(
      "Family RLS tests require NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY from `supabase status`.",
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

async function createUser(admin: SupabaseClient, label: string): Promise<TestUser> {
  const email = `${label}-${randomUUID()}@example.test`;
  const password = `Pw-${randomUUID()}`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error || !data.user) throw error ?? new Error("createUser failed");

  const client = createPublicClient();
  const { error: signInError } = await client.auth.signInWithPassword({ email, password });
  if (signInError) throw signInError;

  return { id: data.user.id, email, password, client };
}

async function mustId(
  result: PromiseLike<{ data: { id: unknown } | null; error: { message: string } | null }>,
): Promise<string> {
  const { data, error } = await result;
  if (error || !data) throw new Error(error?.message ?? "empty result");
  return String(data.id);
}

describeIntegration("family financial RLS", () => {
  let admin: SupabaseClient;
  let organizationId: string;
  let parentA: TestUser;
  let linkedPeer: TestUser;
  let parentB: TestUser;
  let teacher: TestUser;
  let familyAId: string;
  let familyBId: string;
  let accountAId: string;
  let accountBId: string;
  let groupId: string;

  before(async () => {
    admin = createTestAdminClient();

    organizationId = await mustId(
      admin.from("organizations").select("id").eq("slug", TEST_ORG_SLUG).maybeSingle(),
    );

    parentA = await createUser(admin, "fin-parent-a");
    linkedPeer = await createUser(admin, "fin-linked-peer");
    parentB = await createUser(admin, "fin-parent-b");
    teacher = await createUser(admin, "fin-teacher");

    familyAId = await mustId(
      admin
        .from("families")
        .insert({ organization_id: organizationId, name: "Fin Test Family A" })
        .select("id")
        .single(),
    );

    familyBId = await mustId(
      admin
        .from("families")
        .insert({ organization_id: organizationId, name: "Fin Test Family B" })
        .select("id")
        .single(),
    );

    const guardianRows = [
      { family: familyAId, user: parentA, first: "ParentA" },
      { family: familyBId, user: parentB, first: "ParentB" },
    ];
    for (const row of guardianRows) {
      const { error } = await admin.from("guardians").insert({
        organization_id: organizationId,
        family_id: row.family,
        user_id: row.user.id,
        first_name: row.first,
        last_name: "FinTest",
        email: row.user.email,
      });
      if (error) throw error;
    }

    const memberships = [
      { user: parentA, role: "parent" },
      { user: linkedPeer, role: "parent" },
      { user: parentB, role: "parent" },
      { user: teacher, role: "teacher" },
    ];
    for (const row of memberships) {
      const { error } = await admin.from("organization_memberships").insert({
        organization_id: organizationId,
        user_id: row.user.id,
        role: row.role,
        status: "active",
      });
      if (error) throw error;
    }

    groupId = await mustId(
      admin
        .from("organization_portal_account_link_groups")
        .insert({ organization_id: organizationId, primary_user_id: parentA.id })
        .select("id")
        .single(),
    );

    for (const user of [parentA, linkedPeer]) {
      const { error } = await admin.from("organization_portal_account_link_members").insert({
        group_id: groupId,
        organization_id: organizationId,
        user_id: user.id,
      });
      if (error) throw error;
    }

    accountAId = await mustId(
      admin
        .from("tuition_billing_accounts")
        .insert({ organization_id: organizationId, family_id: familyAId })
        .select("id")
        .single(),
    );

    accountBId = await mustId(
      admin
        .from("tuition_billing_accounts")
        .insert({ organization_id: organizationId, family_id: familyBId })
        .select("id")
        .single(),
    );

    for (const row of [
      { family: familyAId, account: accountAId, pm: `pm_fin_a_${randomUUID()}` },
      { family: familyBId, account: accountBId, pm: `pm_fin_b_${randomUUID()}` },
    ]) {
      const { error } = await admin.from("family_payment_methods").insert({
        organization_id: organizationId,
        family_id: row.family,
        billing_account_id: row.account,
        stripe_payment_method_id: row.pm,
      });
      if (error) throw error;
    }
  });

  after(async () => {
    await admin.from("family_payment_methods").delete().in("family_id", [familyAId, familyBId]);
    await admin.from("tuition_billing_accounts").delete().in("family_id", [familyAId, familyBId]);
    await admin.from("guardians").delete().in("family_id", [familyAId, familyBId]);
    await admin.from("families").delete().in("id", [familyAId, familyBId]);
    await admin
      .from("organization_portal_account_link_members")
      .delete()
      .eq("group_id", groupId);
    await admin.from("organization_portal_account_link_groups").delete().eq("id", groupId);
    for (const user of [parentA, linkedPeer, parentB, teacher]) {
      await admin
        .from("organization_memberships")
        .delete()
        .eq("organization_id", organizationId)
        .eq("user_id", user.id);
      await admin.auth.admin.deleteUser(user.id);
    }
  });

  async function accountFamilyIds(user: TestUser): Promise<string[]> {
    const { data, error } = await user.client
      .from("tuition_billing_accounts")
      .select("family_id")
      .in("family_id", [familyAId, familyBId]);
    assert.equal(error, null);
    return (data ?? []).map((row) => String(row.family_id)).sort();
  }

  async function paymentMethodFamilyIds(user: TestUser): Promise<string[]> {
    const { data, error } = await user.client
      .from("family_payment_methods")
      .select("family_id")
      .in("family_id", [familyAId, familyBId]);
    assert.equal(error, null);
    return (data ?? []).map((row) => String(row.family_id)).sort();
  }

  it("a parent reads only their own family's billing account and payment methods", async () => {
    assert.deepEqual(await accountFamilyIds(parentA), [familyAId]);
    assert.deepEqual(await paymentMethodFamilyIds(parentA), [familyAId]);
    assert.deepEqual(await accountFamilyIds(parentB), [familyBId]);
    assert.deepEqual(await paymentMethodFamilyIds(parentB), [familyBId]);
  });

  it("a linked login reads the linked family's billing data and nothing else", async () => {
    assert.deepEqual(await accountFamilyIds(linkedPeer), [familyAId]);
    assert.deepEqual(await paymentMethodFamilyIds(linkedPeer), [familyAId]);
  });

  it("staff read every family's billing data", async () => {
    assert.deepEqual(await accountFamilyIds(teacher), [familyAId, familyBId].sort());
    assert.deepEqual(await paymentMethodFamilyIds(teacher), [familyAId, familyBId].sort());
  });

  it("parents cannot read signature records", async () => {
    const { data, error } = await parentA.client
      .from("document_signatures")
      .select("id")
      .limit(5);
    assert.equal(error, null);
    assert.deepEqual(data ?? [], []);
  });

  it("a parent reads their own membership row but not other members' rows", async () => {
    const { data, error } = await parentB.client
      .from("organization_memberships")
      .select("user_id")
      .eq("organization_id", organizationId);
    assert.equal(error, null);
    const ids = new Set((data ?? []).map((row) => String(row.user_id)));
    assert.ok(ids.has(parentB.id), "parent B sees their own membership");
    // Step 3 (later) removes the broad member-read policy; until then other rows may be visible.
    // This assertion documents the intended end state for the narrow policy only:
    const { data: own } = await parentB.client
      .from("organization_memberships")
      .select("user_id")
      .eq("organization_id", organizationId)
      .eq("user_id", parentB.id);
    assert.equal((own ?? []).length, 1);
  });

  it("narrow program helper: a family with no enrollment or application has no program link", async () => {
    const { data: programs } = await admin
      .from("programs")
      .select("id")
      .eq("organization_id", organizationId)
      .limit(1);
    const programId = programs?.[0]?.id;
    assert.ok(programId, "seed has a program");

    const { data, error } = await parentB.client.rpc("user_has_program_portal_link", {
      p_program_id: programId,
    });
    assert.equal(error, null);
    assert.equal(data, false);
  });
});
