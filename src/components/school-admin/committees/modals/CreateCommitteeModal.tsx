"use client";

import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { CommitteeTemplate } from "@/lib/committees/types";
import { PLATFORM_COMMITTEE_TEMPLATES, CUSTOM_COMMITTEE_TEMPLATE } from "@/lib/committees/templates";
import CommitteeCreateWizard, {
  type CommitteeTemplateOption,
} from "@/components/school-admin/committees/CommitteeCreateWizard";

function buildTemplateOptions(dbTemplates: CommitteeTemplate[]): CommitteeTemplateOption[] {
  const dbSlugs = new Set(dbTemplates.map((template) => template.slug));
  const platformOptions: CommitteeTemplateOption[] = PLATFORM_COMMITTEE_TEMPLATES.filter(
    (template) => !dbSlugs.has(template.slug),
  ).map((template) => ({
    id: null,
    slug: template.slug,
    name: template.name,
    description: template.description,
    defaultTermLabel: template.config.defaultTermLabel ?? "",
  }));

  const dbOptions: CommitteeTemplateOption[] = dbTemplates.map((template) => ({
    id: template.id,
    slug: template.slug,
    name: template.name,
    description: template.description,
    defaultTermLabel: template.config.defaultTermLabel ?? "",
  }));

  return [...dbOptions, ...platformOptions, {
    id: null,
    slug: CUSTOM_COMMITTEE_TEMPLATE.slug,
    name: CUSTOM_COMMITTEE_TEMPLATE.name,
    description: CUSTOM_COMMITTEE_TEMPLATE.description,
    defaultTermLabel: CUSTOM_COMMITTEE_TEMPLATE.config.defaultTermLabel ?? "",
  }];
}

export default function CreateCommitteeModal({
  theme,
  templates,
  onClose,
  onCreate,
}: {
  theme: ParentThemeTokens;
  templates: CommitteeTemplate[];
  onClose: () => void;
  onCreate: (input: {
    templateId: string | null;
    platformSlug: string;
    name: string;
    description: string;
    termLabel: string;
  }) => Promise<void>;
}) {
  const options = buildTemplateOptions(templates);

  return (
    <CommitteeCreateWizard
      theme={theme}
      options={options}
      onClose={onClose}
      onCreate={onCreate}
    />
  );
}
