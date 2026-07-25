import type { CommitteeWorkspaceSection } from "@/lib/committees/types";

const VALID_SECTIONS: CommitteeWorkspaceSection[] = [
  "home",
  "about",
  "resources",
  "calendar",
  "tasks",
  "messages",
  "members",
  "settings",
];

export function parseCommitteeSection(
  value: string | null,
): CommitteeWorkspaceSection {
  if (value && VALID_SECTIONS.includes(value as CommitteeWorkspaceSection)) {
    return value as CommitteeWorkspaceSection;
  }
  return "home";
}
