import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, describe, it } from "node:test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import ws from "ws";
import { getFamilyIdsForUser } from "@/lib/admissions/application-auth";
import { getTotalUnreadCount } from "@/lib/messages/threads";
import { createTestAdminClient, integrationTestsEnabled } from "@/test/integration/helpers";
import { TEST_ORG_SLUG } from "../../../e2e/helpers/constants";

/**
 * Phase 3 (20261150): parent_portal_access and parent_unread_message_count only describe the
 * signed-in user, include linked logins, and the unread count matches the app's thread rules.
 */

const describeIntegration = integrationTestsEnabled() ? describe : describe.skip;

type AccessResult = {
  link: {
    group_id: string | null;
    primary_user_id: string | null;
    member_user_ids: string[];
    is_primary_login: boolean;
  };
  guardian_ids: string[];
  family_ids: string[];
  student_ids: string[];
  enrolled_programs: Array<{ id: string; name: string; portal_slug: string | null }>;
  has_enrolled_access: boolean;
};

function requirePublishableKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!key) {
    throw new Error(
      "Parent portal access tests require NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY from `supabase status`.",
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

describeIntegration("parent_portal_access / parent_unread_message_count", () => {
  let admin: SupabaseClient;
  let organizationId: string;
  let programId: string;

  const userIds: Record<string, string> = {};
  const clients: Record<string, SupabaseClient> = {};
  const createdFamilyIds: string[] = [];
  const createdThreadIds: string[] = [];

  let familyAId: string;
  let familyBId: string;
  let familyCId: string;
  let studentAId: string;
  let studentBId: string;
  let studentCId: string;
  let guardianAId: string;
  let guardianBId: string;
  let guardianPendingId: string;
  let linkGroupId: string;

  async function createLogin(name: string): Promise<void> {
    const email = `access-${name}-${randomUUID()}@example.test`;
    const password = `Pw-${randomUUID()}`;
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error || !data.user) throw error ?? new Error("createUser failed");
    userIds[name] = data.user.id;
    const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, requirePublishableKey(), {
      auth: { autoRefreshToken: false, persistSession: false },
      realtime: { transport: ws as never },
    });
    const { error: signInError } = await client.auth.signInWithPassword({ email, password });
    if (signInError) throw signInError;
    clients[name] = client;
  }

  async function createThread(input: {
    guardianId: string;
    withProgram?: boolean;
  }): Promise<string> {
    const threadId = await mustId(
      admin
        .from("message_threads")
        .insert({
          organization_id: organizationId,
          subject: "Access test",
          participant_signature: `access-test:${randomUUID()}`,
          program_id: input.withProgram ? programId : null,
        })
        .select("id")
        .single(),
    );
    createdThreadIds.push(threadId);
    const { error } = await admin.from("message_thread_participants").insert([
      {
        thread_id: threadId,
        organization_id: organizationId,
        participant_kind: "guardian",
        guardian_id: input.guardianId,
      },
      {
        thread_id: threadId,
        organization_id: organizationId,
        participant_kind: "school_office",
      },
    ]);
    if (error) throw new Error(error.message);
    return threadId;
  }

  async function addMessage(threadId: string, senderUserId: string, senderKind: string) {
    const { error } = await admin.from("portal_messages").insert({
      thread_id: threadId,
      organization_id: organizationId,
      body: `hello ${randomUUID()}`,
      sender_user_id: senderUserId,
      sender_kind: senderKind,
    });
    if (error) throw new Error(error.message);
  }

  async function accessFor(name: string): Promise<AccessResult> {
    const { data, error } = await clients[name].rpc("parent_portal_access", {
      p_organization_id: organizationId,
    });
    assert.equal(error, null);
    return data as AccessResult;
  }

  async function unreadFor(name: string, program: string | null = null): Promise<number> {
    const { data, error } = await clients[name].rpc("parent_unread_message_count", {
      p_organization_id: organizationId,
      p_program_id: program,
    });
    assert.equal(error, null);
    return Number(data);
  }

  before(async () => {
    admin = createTestAdminClient();
    organizationId = await mustId(
      admin.from("organizations").select("id").eq("slug", TEST_ORG_SLUG).maybeSingle(),
    );

    programId = await mustId(
      admin
        .from("programs")
        .insert({
          organization_id: organizationId,
          name: "Access Test Program",
          portal_slug: `access-test-${randomUUID().slice(0, 8)}`,
          type: "school_year",
          status: "open",
        })
        .select("id")
        .single(),
    );

    for (const name of ["parentA", "linkedA", "parentB", "pending", "stranger", "staff", "multi"]) {
      await createLogin(name);
    }

    async function family(name: string) {
      const id = await mustId(
        admin
          .from("families")
          .insert({ organization_id: organizationId, name })
          .select("id")
          .single(),
      );
      createdFamilyIds.push(id);
      return id;
    }
    familyAId = await family("Access Family A");
    familyBId = await family("Access Family B");
    familyCId = await family("Access Family C (pending)");

    async function student(familyId: string, first: string) {
      return mustId(
        admin
          .from("students")
          .insert({
            organization_id: organizationId,
            family_id: familyId,
            first_name: first,
            last_name: "AccessTest",
          })
          .select("id")
          .single(),
      );
    }
    studentAId = await student(familyAId, "Ada");
    studentBId = await student(familyBId, "Ben");
    studentCId = await student(familyCId, "Cy");

    async function guardian(familyId: string, userId: string, first: string) {
      return mustId(
        admin
          .from("guardians")
          .insert({
            organization_id: organizationId,
            family_id: familyId,
            user_id: userId,
            first_name: first,
            last_name: "AccessTest",
          })
          .select("id")
          .single(),
      );
    }
    guardianAId = await guardian(familyAId, userIds.parentA, "Alice");
    guardianBId = await guardian(familyBId, userIds.parentB, "Bob");
    guardianPendingId = await guardian(familyCId, userIds.pending, "Pia");

    const { error: enrollError } = await admin.from("enrollments").insert([
      {
        organization_id: organizationId,
        student_id: studentAId,
        program_id: programId,
        status: "enrolled",
      },
      {
        organization_id: organizationId,
        student_id: studentBId,
        program_id: programId,
        status: "enrolled",
      },
      {
        organization_id: organizationId,
        student_id: studentCId,
        program_id: programId,
        status: "pending",
      },
    ]);
    if (enrollError) throw new Error(enrollError.message);

    // linkedA has no guardian row of their own; they are linked to parentA's login.
    linkGroupId = await mustId(
      admin
        .from("organization_portal_account_link_groups")
        .insert({ organization_id: organizationId, primary_user_id: userIds.parentA })
        .select("id")
        .single(),
    );
    const { error: memberError } = await admin
      .from("organization_portal_account_link_members")
      .insert([
        { group_id: linkGroupId, organization_id: organizationId, user_id: userIds.parentA },
        { group_id: linkGroupId, organization_id: organizationId, user_id: userIds.linkedA },
      ]);
    if (memberError) throw new Error(memberError.message);
  });

  after(async () => {
    await admin.from("message_threads").delete().in("id", createdThreadIds);
    await admin.from("organization_portal_account_link_groups").delete().eq("id", linkGroupId);
    await admin.from("enrollments").delete().eq("program_id", programId);
    await admin.from("guardians").delete().in("family_id", createdFamilyIds);
    await admin.from("students").delete().in("family_id", createdFamilyIds);
    await admin.from("families").delete().in("id", createdFamilyIds);
    await admin.from("programs").delete().eq("id", programId);
    for (const id of Object.values(userIds)) {
      await admin.auth.admin.deleteUser(id);
    }
  });

  it("returns only the signed-in parent's own family, students and programs", async () => {
    const access = await accessFor("parentA");
    assert.deepEqual(access.family_ids, [familyAId]);
    assert.deepEqual(access.student_ids, [studentAId]);
    assert.deepEqual(access.guardian_ids, [guardianAId]);
    assert.equal(access.has_enrolled_access, true);
    assert.deepEqual(
      access.enrolled_programs.map((program) => program.id),
      [programId],
    );
    assert.equal(access.link.group_id, linkGroupId);
    assert.equal(access.link.primary_user_id, userIds.parentA);
    assert.equal(access.link.is_primary_login, true);
    assert.ok(access.link.member_user_ids.includes(userIds.linkedA));
    assert.ok(!access.family_ids.includes(familyBId));
  });

  it("gives a linked login the primary family but no guardian rows of their own", async () => {
    const access = await accessFor("linkedA");
    assert.deepEqual(access.family_ids, [familyAId]);
    assert.deepEqual(access.student_ids, [studentAId]);
    assert.deepEqual(access.guardian_ids, []);
    assert.equal(access.has_enrolled_access, true);
    assert.equal(access.link.is_primary_login, false);
    assert.equal(access.link.primary_user_id, userIds.parentA);
  });

  it("does not leak another family to an unrelated parent", async () => {
    const access = await accessFor("parentB");
    assert.deepEqual(access.family_ids, [familyBId]);
    assert.deepEqual(access.student_ids, [studentBId]);
    assert.deepEqual(access.guardian_ids, [guardianBId]);
    assert.equal(access.link.group_id, null);
  });

  it("reports no enrolled access for a parent whose child is only pending", async () => {
    const access = await accessFor("pending");
    assert.deepEqual(access.family_ids, [familyCId]);
    assert.equal(access.has_enrolled_access, false);
    assert.deepEqual(access.enrolled_programs, []);
    assert.equal(await unreadFor("pending"), 0);
  });

  it("orders families by oldest guardian row, identically in the RPC and getFamilyIdsForUser", async () => {
    const newerFamilyId = await mustId(
      admin
        .from("families")
        .insert({ organization_id: organizationId, name: "Access Family Newer" })
        .select("id")
        .single(),
    );
    const olderFamilyId = await mustId(
      admin
        .from("families")
        .insert({ organization_id: organizationId, name: "Access Family Older" })
        .select("id")
        .single(),
    );
    createdFamilyIds.push(newerFamilyId, olderFamilyId);

    // Insert the newer family first so insertion order cannot explain the result.
    for (const [familyId, createdAt] of [
      [newerFamilyId, "2020-01-02T00:00:00.000Z"],
      [olderFamilyId, "2020-01-01T00:00:00.000Z"],
    ] as const) {
      const { error } = await admin.from("guardians").insert({
        organization_id: organizationId,
        family_id: familyId,
        user_id: userIds.multi,
        first_name: "Multi",
        last_name: "AccessTest",
        created_at: createdAt,
      });
      if (error) throw new Error(error.message);
    }

    const access = await accessFor("multi");
    assert.deepEqual(access.family_ids, [olderFamilyId, newerFamilyId]);

    const viaApp = await getFamilyIdsForUser(clients.multi, userIds.multi, organizationId);
    assert.deepEqual(viaApp, access.family_ids);
  });

  it("returns an empty result for a login with no family", async () => {
    const access = await accessFor("stranger");
    assert.deepEqual(access.family_ids, []);
    assert.deepEqual(access.student_ids, []);
    assert.deepEqual(access.guardian_ids, []);
    assert.equal(access.has_enrolled_access, false);
    assert.equal(await unreadFor("stranger"), 0);
  });

  it("is callable by authenticated users and not by anon or the service role as a person", async () => {
    const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, requirePublishableKey(), {
      auth: { autoRefreshToken: false, persistSession: false },
      realtime: { transport: ws as never },
    });
    const anonAccess = await anon.rpc("parent_portal_access", { p_organization_id: organizationId });
    assert.ok(anonAccess.error, "anon must not execute parent_portal_access");
    const anonUnread = await anon.rpc("parent_unread_message_count", {
      p_organization_id: organizationId,
      p_program_id: null,
    });
    assert.ok(anonUnread.error, "anon must not execute parent_unread_message_count");

    // With no auth.uid() the service role gets an empty answer.
    const { data, error } = await admin.rpc("parent_portal_access", {
      p_organization_id: organizationId,
    });
    assert.equal(error, null);
    assert.equal((data as AccessResult).has_enrolled_access, false);
    assert.deepEqual((data as AccessResult).family_ids, []);
  });

  it("unread count matches getTotalUnreadCount for the parent", async () => {
    const officeUser = userIds.staff;

    // Two unread school messages in a school-wide thread, one unread in a program thread.
    const schoolThread = await createThread({ guardianId: guardianAId });
    await addMessage(schoolThread, officeUser, "org_admin");
    await addMessage(schoolThread, officeUser, "org_admin");
    const programThread = await createThread({ guardianId: guardianAId, withProgram: true });
    await addMessage(programThread, officeUser, "org_admin");

    // The parent's own message never counts as unread.
    const ownThread = await createThread({ guardianId: guardianAId });
    await addMessage(ownThread, userIds.parentA, "guardian");

    // Another family's thread never counts for parent A.
    const otherThread = await createThread({ guardianId: guardianBId });
    await addMessage(otherThread, officeUser, "org_admin");

    const rpcAll = await unreadFor("parentA");
    const legacy = await getTotalUnreadCount(admin, organizationId, userIds.parentA, "Office", "parent", {
      type: "guardian",
      guardianIds: [guardianAId],
    });
    assert.equal(rpcAll, 3);
    assert.equal(rpcAll, legacy);

    // Program scope: program thread plus school-office thread without a program.
    assert.equal(await unreadFor("parentA", programId), 3);

    // Marking the school thread read drops its two messages.
    const { error: readError } = await admin.from("message_thread_reads").upsert(
      {
        thread_id: schoolThread,
        user_id: userIds.parentA,
        last_read_at: new Date(Date.now() + 1000).toISOString(),
      },
      { onConflict: "thread_id,user_id" },
    );
    assert.equal(readError, null);
    const afterRead = await unreadFor("parentA");
    const legacyAfterRead = await getTotalUnreadCount(
      admin,
      organizationId,
      userIds.parentA,
      "Office",
      "parent",
      { type: "guardian", guardianIds: [guardianAId] },
    );
    assert.equal(afterRead, 1);
    assert.equal(afterRead, legacyAfterRead);

    // A linked login has no guardian rows of its own, so messaging stays per login.
    assert.equal(await unreadFor("linkedA"), 0);
    // The other family sees only its own thread.
    assert.equal(await unreadFor("parentB"), 1);
  });
});
