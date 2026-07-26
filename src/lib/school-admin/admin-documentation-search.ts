import fuzzysort from "fuzzysort";
import type { AdminDocGuide } from "./admin-documentation";

function guideSearchText(guide: AdminDocGuide): string {
  const stepText = guide.steps
    .map((step) => `${step.title} ${step.description}`)
    .join(" ");

  return [
    guide.title,
    guide.summary,
    guide.category,
    guide.keywords.join(" "),
    stepText,
  ].join(" ");
}

export function searchAdminDocumentationGuides(
  guides: AdminDocGuide[],
  query: string,
): AdminDocGuide[] {
  const trimmed = query.trim();
  if (!trimmed) {
    return guides;
  }

  const prepared = guides.map((guide) => ({
    guide,
    searchText: guideSearchText(guide),
  }));

  const results = fuzzysort.go(trimmed, prepared, {
    key: "searchText",
    threshold: -10000,
  });

  return results.map((result) => result.obj.guide);
}
