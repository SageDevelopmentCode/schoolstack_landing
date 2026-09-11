import type { SupabaseClient } from "@supabase/supabase-js";
import {
  listProgramCoopCurriculumDiscussionMessages,
  type ProgramCoopCurriculumDiscussionMessage,
} from "@/lib/admissions/program-coop-curriculum-discussion";

export type OrganizationCoopDiscussionThreadSummary = {
  programId: string;
  programName: string;
  curriculumId: string | null;
  threadLabel: string;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  messageCount: number;
};

type DiscussionMessageRow = {
  id: string;
  program_id: string;
  curriculum_id: string | null;
  body: string;
  created_at: string;
};

function previewBody(body: string, maxLength = 80): string {
  const trimmed = body.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 1)}…`;
}

function threadKey(programId: string, curriculumId: string | null): string {
  return `${programId}|${curriculumId ?? "general"}`;
}

export async function listOrganizationCoopDiscussionThreads(
  admin: SupabaseClient,
  organizationId: string,
): Promise<OrganizationCoopDiscussionThreadSummary[]> {
  const { data: messages, error: messagesError } = await admin
    .from("program_coop_curriculum_discussion_messages")
    .select("id, program_id, curriculum_id, body, created_at")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (messagesError) throw new Error(messagesError.message);
  if (!messages?.length) return [];

  const threadStats = new Map<
    string,
    {
      programId: string;
      curriculumId: string | null;
      lastMessageAt: string;
      lastMessagePreview: string;
      messageCount: number;
    }
  >();

  for (const row of messages as DiscussionMessageRow[]) {
    const programId = String(row.program_id);
    const curriculumId = row.curriculum_id ? String(row.curriculum_id) : null;
    const key = threadKey(programId, curriculumId);
    const existing = threadStats.get(key);

    if (existing) {
      existing.messageCount += 1;
      continue;
    }

    threadStats.set(key, {
      programId,
      curriculumId,
      lastMessageAt: String(row.created_at),
      lastMessagePreview: previewBody(String(row.body ?? "")),
      messageCount: 1,
    });
  }

  const programIds = [...new Set([...threadStats.values()].map((stat) => stat.programId))];
  const curriculumIds = [
    ...new Set(
      [...threadStats.values()]
        .map((stat) => stat.curriculumId)
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  const [programsResult, curriculumResult] = await Promise.all([
    admin
      .from("programs")
      .select("id, name")
      .eq("organization_id", organizationId)
      .in("id", programIds),
    curriculumIds.length > 0
      ? admin
          .from("program_coop_curriculum")
          .select("id, title")
          .in("id", curriculumIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (programsResult.error) throw new Error(programsResult.error.message);
  if (curriculumResult.error) throw new Error(curriculumResult.error.message);

  const programNameById = new Map(
    (programsResult.data ?? []).map((row) => [String(row.id), String(row.name)]),
  );
  const curriculumTitleById = new Map(
    (curriculumResult.data ?? []).map((row) => [String(row.id), String(row.title)]),
  );

  const threads = [...threadStats.values()].map((stat) => ({
    programId: stat.programId,
    programName: programNameById.get(stat.programId) ?? "Co-op program",
    curriculumId: stat.curriculumId,
    threadLabel: stat.curriculumId
      ? (curriculumTitleById.get(stat.curriculumId) ?? "Curriculum guide")
      : "General",
    lastMessageAt: stat.lastMessageAt,
    lastMessagePreview: stat.lastMessagePreview,
    messageCount: stat.messageCount,
  }));

  return threads.sort((a, b) => {
    const programCompare = a.programName.localeCompare(b.programName);
    if (programCompare !== 0) return programCompare;
    if (a.curriculumId === null && b.curriculumId !== null) return -1;
    if (a.curriculumId !== null && b.curriculumId === null) return 1;
    if (a.lastMessageAt && b.lastMessageAt) {
      return b.lastMessageAt.localeCompare(a.lastMessageAt);
    }
    return a.threadLabel.localeCompare(b.threadLabel);
  });
}

export async function getOrganizationCoopDiscussionMessages(
  admin: SupabaseClient,
  organizationId: string,
  programId: string,
  curriculumId?: string | null,
): Promise<ProgramCoopCurriculumDiscussionMessage[]> {
  return listProgramCoopCurriculumDiscussionMessages(admin, {
    organizationId,
    programId,
    curriculumId,
  });
}
