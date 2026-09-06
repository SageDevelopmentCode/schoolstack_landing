"use client";

import { useMemo } from "react";
import { COMMITTEE_TEMPLATES } from "@/data/school-demos/rooted-meadows-committees";
import { ROOTED_MEADOWS_PORTAL_BRANDING } from "@/data/school-demos/rooted-meadows-portal-branding";
import CommitteeCreateWizard, {
  type CommitteeTemplateOption,
} from "@/components/school-admin/committees/CommitteeCreateWizard";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import { CUSTOM_COMMITTEE_TEMPLATE } from "@/lib/committees/templates";

const DEMO_TEMPLATE_OPTIONS: CommitteeTemplateOption[] = [
  ...COMMITTEE_TEMPLATES.map((t) => ({
    id: t.id,
    slug: t.id,
    name: t.name,
    description: t.description,
    defaultTermLabel: t.defaultTermLabel,
  })),
  {
    id: null,
    slug: CUSTOM_COMMITTEE_TEMPLATE.slug,
    name: CUSTOM_COMMITTEE_TEMPLATE.name,
    description: CUSTOM_COMMITTEE_TEMPLATE.description,
    defaultTermLabel: CUSTOM_COMMITTEE_TEMPLATE.config.defaultTermLabel ?? "",
  },
];

export default function CreateCommitteeModal({
  onClose,
  onCreate,
  preselectedTemplateId = "template-service-sunshine",
  showCreateWorkspaceHint = false,
}: {
  onClose: () => void;
  onCreate?: (templateId: string) => void;
  preselectedTemplateId?: string;
  showCreateWorkspaceHint?: boolean;
}) {
  const C = useMemo(() => buildAdminThemeTokens(ROOTED_MEADOWS_PORTAL_BRANDING), []);

  return (
    <CommitteeCreateWizard
      C={C}
      options={DEMO_TEMPLATE_OPTIONS}
      initialSelectedSlug={preselectedTemplateId}
      onClose={onClose}
      showPreloadChecklist
      showCreateWorkspaceHint={showCreateWorkspaceHint}
      onCreate={({ platformSlug }) => {
        onCreate?.(platformSlug);
      }}
    />
  );
}
