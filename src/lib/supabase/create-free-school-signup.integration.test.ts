import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, describe, it } from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createTestAdminClient, integrationTestsEnabled } from "@/test/integration/helpers";

/**
 * create_free_school_atomic serializes signup per user; concurrent completes
 * must not create duplicate free onboarding organizations.
 */

const describeIntegration = integrationTestsEnabled() ? describe : describe.skip;

type RpcResult = {
  organization_id: string;
  slug: string;
  idempotent: boolean;
};

function parseRpcPayload(data: unknown): RpcResult | null {
  if (!data || typeof data !== "object") return null;
  const row = data as Record<string, unknown>;
  const organizationId = row.organization_id;
  const slug = row.slug;
  const idempotent = row.idempotent;
  if (typeof organizationId !== "string" || typeof slug !== "string") return null;
  return {
    organization_id: organizationId,
    slug,
    idempotent: idempotent === true,
  };
}

describeIntegration("create_free_school_atomic", () => {
  let admin: SupabaseClient;
  let userId: string;
  const schoolName = `Parallel Free School ${randomUUID().slice(0, 8)}`;
  const timezone = "America/Chicago";

  before(async () => {
    admin = createTestAdminClient();
    const email = `free-school-race-${randomUUID()}@example.test`;
    const { data, error } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
    });
    if (error || !data.user?.id) throw error ?? new Error("createUser failed");
    userId = data.user.id;
  });

  after(async () => {
    if (!admin || !userId) return;

    const { data: memberships, error: membershipError } = await admin
      .from("organization_memberships")
      .select("organization_id")
      .eq("user_id", userId)
      .eq("role", "owner");
    if (membershipError) return;

    const organizationIds = (memberships ?? []).map((row) => String(row.organization_id));

    if (organizationIds.length > 0) {
      await admin.from("organization_settings").delete().in("organization_id", organizationIds);
      await admin.from("organization_memberships").delete().eq("user_id", userId);
      await admin.from("organizations").delete().in("id", organizationIds);
    }

    await admin.auth.admin.deleteUser(userId);
  });

  it("allows only one organization under concurrent signup", async () => {
    const call = () =>
      admin.rpc("create_free_school_atomic", {
        p_user_id: userId,
        p_school_name: schoolName,
        p_timezone: timezone,
      });

    const [first, second] = await Promise.all([call(), call()]);

    assert.equal(first.error, null, first.error?.message);
    assert.equal(second.error, null, second.error?.message);

    const firstPayload = parseRpcPayload(first.data);
    const secondPayload = parseRpcPayload(second.data);
    assert.ok(firstPayload);
    assert.ok(secondPayload);
    assert.equal(firstPayload.slug, secondPayload.slug);
    assert.equal(firstPayload.organization_id, secondPayload.organization_id);

    const idempotentCount = [firstPayload, secondPayload].filter((row) => row.idempotent).length;
    assert.ok(idempotentCount <= 1);

    const { count, error: countError } = await admin
      .from("organization_memberships")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("role", "owner")
      .eq("status", "active");
    if (countError) throw countError;
    assert.equal(count, 1);
  });
});
