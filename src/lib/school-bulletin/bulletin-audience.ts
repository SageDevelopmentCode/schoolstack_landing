import type { BulletinAudience, BulletinPost } from "./types";
import { normalizeBulletinAudiences, normalizeBulletinProgramIds } from "./mappers";

export type BulletinViewerScope =
  | { viewer: "parent"; mode: "main_portal" }
  | { viewer: "parent"; mode: "program_portal"; programId: string }
  | { viewer: "teacher" };

export function isBulletinPostActive(post: Pick<BulletinPost, "status" | "publishedAt" | "expiresAt">, now = new Date()): boolean {
  if (post.status !== "published") return false;

  if (post.publishedAt) {
    const publishedAt = new Date(post.publishedAt);
    if (publishedAt > now) return false;
  }

  if (post.expiresAt) {
    const expiresAt = new Date(post.expiresAt);
    if (expiresAt <= now) return false;
  }

  return true;
}

function hasAudience(
  audiences: BulletinAudience[],
  audience: BulletinAudience,
): boolean {
  return audiences.includes(audience);
}

export function postVisibleToViewer(
  post: Pick<BulletinPost, "audiences" | "programIds">,
  scope: BulletinViewerScope,
): boolean {
  const audiences = normalizeBulletinAudiences(post.audiences);
  const programIds = normalizeBulletinProgramIds(post.programIds);

  if (scope.viewer === "teacher") {
    return hasAudience(audiences, "school_wide") || hasAudience(audiences, "teachers");
  }

  if (hasAudience(audiences, "school_wide")) return true;

  if (hasAudience(audiences, "parents")) {
    if (programIds.length === 0) {
      if (scope.mode === "main_portal") return true;
    } else if (
      scope.mode === "program_portal" &&
      programIds.includes(scope.programId)
    ) {
      return true;
    }
  }

  if (
    hasAudience(audiences, "program") &&
    scope.mode === "program_portal" &&
    programIds.length > 0 &&
    programIds.includes(scope.programId)
  ) {
    return true;
  }

  return false;
}

export function filterBulletinPostsForViewer(
  posts: BulletinPost[],
  scope: BulletinViewerScope,
  now = new Date(),
): BulletinPost[] {
  return posts.filter(
    (post) => isBulletinPostActive(post, now) && postVisibleToViewer(post, scope),
  );
}

export function parentMainPortalBulletinScope(): BulletinViewerScope {
  return { viewer: "parent", mode: "main_portal" };
}

export function parentProgramPortalBulletinScope(programId: string): BulletinViewerScope {
  return { viewer: "parent", mode: "program_portal", programId };
}

export function teacherBulletinScope(): BulletinViewerScope {
  return { viewer: "teacher" };
}

const AUDIENCE_LABELS: Record<BulletinAudience, string> = {
  school_wide: "School-wide",
  parents: "All families",
  teachers: "Teachers only",
  program: "Program families",
};

export function formatBulletinAudiencesLabel(
  audiences: BulletinAudience[],
  programNameById: ReadonlyMap<string, string>,
  programIds: string[] = [],
): string {
  const normalizedAudiences = normalizeBulletinAudiences(audiences);
  const normalizedProgramIds = normalizeBulletinProgramIds(programIds);
  const parts: string[] = [];

  for (const audience of normalizedAudiences) {
    if (audience === "parents" && normalizedProgramIds.length > 0) {
      for (const programId of normalizedProgramIds) {
        parts.push(`${programNameById.get(programId) ?? "Program"} families`);
      }
      continue;
    }

    if (audience === "program") {
      if (normalizedProgramIds.length === 0) {
        parts.push(AUDIENCE_LABELS.program);
      } else {
        for (const programId of normalizedProgramIds) {
          parts.push(`${programNameById.get(programId) ?? "Program"} families`);
        }
      }
      continue;
    }

    parts.push(AUDIENCE_LABELS[audience]);
  }

  return parts.length > 0 ? parts.join(" · ") : "School-wide";
}

/** @deprecated Use formatBulletinAudiencesLabel */
export function formatBulletinAudienceLabel(
  audience: BulletinAudience,
  programNameById: ReadonlyMap<string, string>,
  programId?: string,
): string {
  return formatBulletinAudiencesLabel(
    [audience],
    programNameById,
    programId ? [programId] : [],
  );
}

export function resolveBulletinDisplayStatus(
  post: Pick<BulletinPost, "status" | "publishedAt" | "expiresAt">,
  now = new Date(),
) {
  if (post.status === "archived") return "archived" as const;
  if (post.status === "draft") return "draft" as const;

  if (post.publishedAt) {
    const publishedAt = new Date(post.publishedAt);
    if (publishedAt > now) return "scheduled" as const;
  }

  if (post.expiresAt) {
    const expiresAt = new Date(post.expiresAt);
    if (expiresAt <= now) return "expired" as const;
  }

  if (post.status === "published") return "active" as const;
  return "draft" as const;
}

export function audiencesIncludeProgramTargeting(audiences: BulletinAudience[]): boolean {
  const normalized = normalizeBulletinAudiences(audiences);
  return normalized.includes("parents") || normalized.includes("program");
}

export function programSelectionRequired(audiences: BulletinAudience[]): boolean {
  return normalizeBulletinAudiences(audiences).includes("program");
}
