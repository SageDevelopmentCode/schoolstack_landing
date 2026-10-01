import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { CommitteeUnreadSection } from "@/lib/committees/committee-unread-types";

/** Matches “no read row” for unread counts; must not be used on UPDATE of existing rows. */
export const COMMITTEE_SECTION_NEVER_READ_AT =
  "1970-01-01T00:00:00.000Z";

export type MemberSectionPair = {
  memberId: string;
  section: CommitteeUnreadSection;
};

export function memberSectionKey(memberId: string, section: string): string {
  return `${memberId}:${section}`;
}

export function partitionPairsByExistingReads(
  pairs: MemberSectionPair[],
  existingKeys: Iterable<string>,
): { toUpdate: MemberSectionPair[]; toInsert: MemberSectionPair[] } {
  const existing = new Set(existingKeys);
  const toUpdate: MemberSectionPair[] = [];
  const toInsert: MemberSectionPair[] = [];
  const seen = new Set<string>();

  for (const pair of pairs) {
    const key = memberSectionKey(pair.memberId, pair.section);
    if (seen.has(key)) continue;
    seen.add(key);
    if (existing.has(key)) {
      toUpdate.push(pair);
    } else {
      toInsert.push(pair);
    }
  }

  return { toUpdate, toInsert };
}

export async function stampCommitteeSectionDigestNotified(
  admin: SupabaseClient,
  pairs: MemberSectionPair[],
  notifiedAt: string,
): Promise<void> {
  if (pairs.length === 0) return;

  const memberIds = [...new Set(pairs.map((pair) => pair.memberId))];
  const sections = [...new Set(pairs.map((pair) => pair.section))];

  const { data, error } = await admin
    .from("committee_member_section_reads")
    .select("committee_member_id, section")
    .in("committee_member_id", memberIds)
    .in("section", sections);

  if (error) throw new Error(error.message);

  const existingKeys = (data ?? []).map((row) =>
    memberSectionKey(String(row.committee_member_id), String(row.section)),
  );

  const { toUpdate, toInsert } = partitionPairsByExistingReads(pairs, existingKeys);

  if (toUpdate.length > 0) {
    const { error: updateError } = await admin
      .from("committee_member_section_reads")
      .upsert(
        toUpdate.map((pair) => ({
          committee_member_id: pair.memberId,
          section: pair.section,
          last_unread_digest_notified_at: notifiedAt,
          updated_at: notifiedAt,
        })),
        { onConflict: "committee_member_id,section" },
      );

    if (updateError) throw new Error(updateError.message);
  }

  if (toInsert.length > 0) {
    const { error: insertError } = await admin
      .from("committee_member_section_reads")
      .insert(
        toInsert.map((pair) => ({
          committee_member_id: pair.memberId,
          section: pair.section,
          read_at: COMMITTEE_SECTION_NEVER_READ_AT,
          last_unread_digest_notified_at: notifiedAt,
          updated_at: notifiedAt,
        })),
      );

    if (insertError) throw new Error(insertError.message);
  }
}

export async function tryClaimCommitteeSectionDigest(
  admin: SupabaseClient,
  pair: MemberSectionPair,
  input: {
    claimAt: string;
    expectedDigestNotifiedAt: string | null;
    hadReadRowAtLoad: boolean;
  },
): Promise<boolean> {
  if (input.hadReadRowAtLoad) {
    let query = admin
      .from("committee_member_section_reads")
      .update({
        last_unread_digest_notified_at: input.claimAt,
        updated_at: input.claimAt,
      })
      .eq("committee_member_id", pair.memberId)
      .eq("section", pair.section);

    if (input.expectedDigestNotifiedAt === null) {
      query = query.is("last_unread_digest_notified_at", null);
    } else {
      query = query.eq(
        "last_unread_digest_notified_at",
        input.expectedDigestNotifiedAt,
      );
    }

    const { data, error } = await query.select("committee_member_id");
    if (error) throw new Error(error.message);
    return (data?.length ?? 0) > 0;
  }

  const { error: insertError } = await admin
    .from("committee_member_section_reads")
    .insert({
      committee_member_id: pair.memberId,
      section: pair.section,
      read_at: COMMITTEE_SECTION_NEVER_READ_AT,
      last_unread_digest_notified_at: input.claimAt,
      updated_at: input.claimAt,
    });

  if (!insertError) {
    return true;
  }

  if (insertError.code !== "23505") {
    throw new Error(insertError.message);
  }

  const { data, error } = await admin
    .from("committee_member_section_reads")
    .update({
      last_unread_digest_notified_at: input.claimAt,
      updated_at: input.claimAt,
    })
    .eq("committee_member_id", pair.memberId)
    .eq("section", pair.section)
    .is("last_unread_digest_notified_at", null)
    .select("committee_member_id");

  if (error) throw new Error(error.message);
  return (data?.length ?? 0) > 0;
}

export async function releaseCommitteeSectionDigestClaim(
  admin: SupabaseClient,
  pair: MemberSectionPair,
  input: {
    claimAt: string;
    priorDigestNotifiedAt: string | null;
  },
): Promise<void> {
  const query = admin
    .from("committee_member_section_reads")
    .update({
      last_unread_digest_notified_at: input.priorDigestNotifiedAt,
      updated_at: new Date().toISOString(),
    })
    .eq("committee_member_id", pair.memberId)
    .eq("section", pair.section)
    .eq("last_unread_digest_notified_at", input.claimAt);

  const { error } = await query;
  if (error) throw new Error(error.message);
}
