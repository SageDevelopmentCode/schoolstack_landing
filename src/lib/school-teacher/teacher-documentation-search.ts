import fuzzysort from "fuzzysort";
import type { TeacherDocGuide } from "./teacher-documentation";

function guideSearchText(guide: TeacherDocGuide): string {
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

export function searchTeacherDocumentationGuides(
  guides: TeacherDocGuide[],
  query: string,
): TeacherDocGuide[] {
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
