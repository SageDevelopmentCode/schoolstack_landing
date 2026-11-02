import { PARENT_VISIBLE_SECTIONS } from '@/lib/parent/committees/constants';
import {
  ADMIN_VISIBLE_SECTIONS,
  type CommitteeWorkspaceSection,
} from '@/lib/parent/parent-committees-types';

export function dedupeCommitteeSections(
  sections: CommitteeWorkspaceSection[],
): CommitteeWorkspaceSection[] {
  return sections.filter((section, index, arr) => arr.indexOf(section) === index);
}

export function resolveParentTeacherCommitteeNavSections(
  configSections: CommitteeWorkspaceSection[],
): CommitteeWorkspaceSection[] {
  const merged = dedupeCommitteeSections([...configSections, 'projects']);
  return merged.filter((section) => PARENT_VISIBLE_SECTIONS.includes(section));
}

export function resolveSchoolAdminCommitteeNavSections(
  configSections: CommitteeWorkspaceSection[],
  options: { preview: boolean },
): CommitteeWorkspaceSection[] {
  const extras: CommitteeWorkspaceSection[] = ['projects'];
  if (!options.preview) {
    extras.push('activity', 'settings');
  }
  const merged = dedupeCommitteeSections([...configSections, ...extras]);
  return merged.filter((section) => ADMIN_VISIBLE_SECTIONS.includes(section));
}
