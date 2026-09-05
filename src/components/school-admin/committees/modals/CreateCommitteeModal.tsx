"use client";

import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { CommitteeTemplate } from "@/lib/committees/types";
import { PLATFORM_COMMITTEE_TEMPLATES, CUSTOM_COMMITTEE_TEMPLATE } from "@/lib/committees/templates";
import CommitteeCreateWizard, {
  type CommitteeTemplateOption,
} from "@/components/school-admin/committees/CommitteeCreateWizard";

function buildTemplateOptions(dbTemplates: CommitteeTemplate[]): CommitteeTemplateOption[] {
  const dbSlugs = new Set(dbTemplates.map((t) => t.slug));
  const platformOptions: CommitteeTemplateOption[] = PLATFORM_COMMITTEE_TEMPLATES.filter(
    (t) => !dbSlugs.has(t.slug),
  ).map((t) => ({
    id: null,
    slug: t.slug,
    name: t.name,
    description: t.description,
    defaultTermLabel: t.config.defaultTermLabel ?? "",
  }));

  const dbOptions: CommitteeTemplateOption[] = dbTemplates.map((t) => ({
    id: t.id,
    slug: t.slug,
    name: t.name,
    description: t.description,
    defaultTermLabel: t.config.defaultTermLabel ?? "",
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
  C,
  templates,
  onClose,
  onCreate,
}: {
  C: AdminThemeTokens;
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
      C={C}
      options={options}
      onClose={onClose}
      onCreate={onCreate}
    />
  );
}
