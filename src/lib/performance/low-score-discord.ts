import type { SupabaseClient } from "@supabase/supabase-js";
import {
  type DiscordEmbed,
  sendPerformanceChecksDiscordEmbed,
  truncate,
} from "@/lib/discord";
import { SITE_URL } from "@/lib/site";
import { PERFORMANCE_LOW_SCORE_THRESHOLD } from "@/lib/performance/constants";
import type { AuditFormFactor } from "@/lib/performance/types";

export type PerformanceLowScoreRow = {
  page_id: string;
  label: string;
  form_factor: AuditFormFactor;
  performance_score: number;
  url: string;
};

export type LowScoreNotifyMeta = {
  commitSha: string;
  branch: string;
  runUrl?: string;
};

const DISCORD_EMBED_FIELD_LIMIT = 25;
const DISCORD_EMBED_DESCRIPTION_LIMIT = 4096;

export function buildLowScoreEmbed(
  rows: PerformanceLowScoreRow[],
  meta: LowScoreNotifyMeta,
): DiscordEmbed {
  const sorted = [...rows].sort((left, right) => {
    const scoreDelta = left.performance_score - right.performance_score;
    if (scoreDelta !== 0) return scoreDelta;
    return left.label.localeCompare(right.label);
  });

  const lines = sorted.map(
    (row) =>
      `• **${row.label}** · ${row.form_factor} · **${row.performance_score}** · \`${row.page_id}\``,
  );

  let description = lines.join("\n");
  if (description.length > DISCORD_EMBED_DESCRIPTION_LIMIT) {
    description = truncate(description, DISCORD_EMBED_DESCRIPTION_LIMIT);
  }

  const fields: DiscordEmbed["fields"] = [
    { name: "Commit", value: truncate(meta.commitSha), inline: true },
    { name: "Branch", value: truncate(meta.branch), inline: true },
    {
      name: "Admin",
      value: truncate(`${SITE_URL}/admin/performance`),
      inline: false,
    },
  ];

  if (sorted.length > DISCORD_EMBED_FIELD_LIMIT - fields.length) {
    fields.push({
      name: "Note",
      value: truncate(
        `${sorted.length} page(s) below ${PERFORMANCE_LOW_SCORE_THRESHOLD}; list truncated in description.`,
      ),
      inline: false,
    });
  }

  return {
    title: `Lighthouse CI: ${sorted.length} page(s) below ${PERFORMANCE_LOW_SCORE_THRESHOLD}`,
    description,
    url: meta.runUrl,
    color: 0xf97316,
    fields,
  };
}

export async function notifyCiLowScores(
  admin: SupabaseClient,
  meta: LowScoreNotifyMeta,
) {
  const shortSha = meta.commitSha.slice(0, 7);

  const { data: rows, error } = await admin
    .from("performance_audit_results")
    .select("page_id, label, form_factor, performance_score, url")
    .eq("environment", "ci")
    .lt("performance_score", PERFORMANCE_LOW_SCORE_THRESHOLD)
    .not("performance_score", "is", null)
    .eq("source_ref", `${shortSha} on ${meta.branch}`);

  if (error) {
    throw error;
  }

  const lowScores = (rows ?? []).filter(
    (row): row is PerformanceLowScoreRow =>
      typeof row.page_id === "string" &&
      typeof row.label === "string" &&
      (row.form_factor === "mobile" || row.form_factor === "desktop") &&
      typeof row.performance_score === "number" &&
      typeof row.url === "string",
  );

  if (!lowScores.length) {
    return { notified: false, count: 0 };
  }

  const embed = buildLowScoreEmbed(lowScores, meta);
  await sendPerformanceChecksDiscordEmbed(embed);

  return { notified: true, count: lowScores.length };
}
