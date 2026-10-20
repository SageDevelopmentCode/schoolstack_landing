export type OpsCheckAnswerStatus = "attention" | "improving" | "working";

export const OPS_CHECK_STATUS_LABELS: Record<OpsCheckAnswerStatus, string> = {
  attention: "Priority",
  improving: "To simplify",
  working: "Working well",
};

/** Higher option scores mean more operational strain (0 = best, 3 = worst). */
export function classifyAnswerStatus(score: number): OpsCheckAnswerStatus {
  if (score >= 3) return "attention";
  if (score >= 1) return "improving";
  return "working";
}

export function countByStatus(
  scores: number[],
): Record<OpsCheckAnswerStatus, number> {
  const counts: Record<OpsCheckAnswerStatus, number> = {
    attention: 0,
    improving: 0,
    working: 0,
  };
  for (const score of scores) {
    counts[classifyAnswerStatus(score)] += 1;
  }
  return counts;
}
