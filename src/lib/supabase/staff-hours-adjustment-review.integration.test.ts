import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, describe, it } from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createTestAdminClient, integrationTestsEnabled } from "@/test/integration/helpers";
import { TEST_ORG_SLUG } from "../../../e2e/helpers/constants";

/**
 * review_staff_hours_adjustment_request_atomic locks the pending request and
 * applies hours in the same transaction as the status change.
 */

const describeIntegration = integrationTestsEnabled() ? describe : describe.skip;

async function mustId(
  result: PromiseLike<{ data: { id: unknown } | null; error: { message: string } | null }>,
): Promise<string> {
  const { data, error } = await result;
  if (error || !data) throw new Error(error?.message ?? "empty result");
  return String(data.id);
}

describeIntegration("review_staff_hours_adjustment_request_atomic", () => {
  let admin: SupabaseClient;
  let organizationId: string;
  let reviewerUserId: string;
  let staffMemberId: string;
  let requestId: string;
  let timezone: string;
  const workDate = "2025-08-20";

  before(async () => {
    admin = createTestAdminClient();

    organizationId = await mustId(
      admin.from("organizations").select("id").eq("slug", TEST_ORG_SLUG).maybeSingle(),
    );

    const { data: org, error: orgError } = await admin
      .from("organizations")
      .select("timezone")
      .eq("id", organizationId)
      .maybeSingle();
    if (orgError) throw orgError;
    timezone =
      typeof org?.timezone === "string" && org.timezone.trim()
        ? org.timezone.trim()
        : "America/Denver";

    const email = `hours-review-${randomUUID()}@example.test`;
    const { data: createdUser, error: createUserError } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
    });
    if (createUserError || !createdUser.user?.id) {
      throw createUserError ?? new Error("createUser failed");
    }
    reviewerUserId = createdUser.user.id;

    staffMemberId = await mustId(
      admin
        .from("staff_members")
        .insert({
          organization_id: organizationId,
          first_name: "Hours",
          last_name: "Race",
          email: `hours-race-${randomUUID()}@example.test`,
        })
        .select("id")
        .single(),
    );

    const { data: upsertedId, error: upsertError } = await admin.rpc(
      "upsert_staff_hours_adjustment_request_atomic",
      {
        p_organization_id: organizationId,
        p_staff_member_id: staffMemberId,
        p_work_date: workDate,
        p_note: "concurrency test",
        p_proposed_sessions: [{ clockIn: "09:00", clockOut: "12:00" }],
        p_previous_sessions: [],
        p_submitted_by_user_id: reviewerUserId,
      },
    );
    if (upsertError) throw upsertError;
    requestId = String(upsertedId);
  });

  after(async () => {
    if (!admin) return;
    if (requestId) {
      await admin.from("staff_work_time_entries").delete().eq("staff_member_id", staffMemberId);
      await admin.from("staff_hours_adjustment_requests").delete().eq("id", requestId);
      await admin.from("staff_members").delete().eq("id", staffMemberId);
    }
    if (reviewerUserId) {
      await admin.auth.admin.deleteUser(reviewerUserId);
    }
  });

  it("allows only one concurrent review", async () => {
    const review = (decision: "approved" | "denied") =>
      admin.rpc("review_staff_hours_adjustment_request_atomic", {
        p_organization_id: organizationId,
        p_request_id: requestId,
        p_decision: decision,
        p_reviewer_user_id: reviewerUserId,
        p_timezone: timezone,
      });

    const [first, second] = await Promise.all([review("denied"), review("approved")]);
    const succeeded = [first, second].filter((result) => result.error === null);
    const alreadyReviewed = [first, second].filter((result) =>
      result.error?.message?.includes("staff_hours_adjustment:already_reviewed"),
    );
    assert.equal(succeeded.length, 1);
    assert.equal(alreadyReviewed.length, 1);

    const { data: row, error } = await admin
      .from("staff_hours_adjustment_requests")
      .select("status")
      .eq("id", requestId)
      .maybeSingle();
    if (error) throw error;
    assert.ok(row?.status === "approved" || row?.status === "denied");
  });
});
