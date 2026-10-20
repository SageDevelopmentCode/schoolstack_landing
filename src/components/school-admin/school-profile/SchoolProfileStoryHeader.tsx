"use client";

import { Loader2 } from "lucide-react";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import AdminSectionKicker from "@/components/school-admin/ui/story/AdminSectionKicker";
import ParentStoryPillNav from "@/components/school-parent/ui/ParentStoryPillNav";
import {
  isSchoolProfileSectionLoading,
  SCHOOL_PROFILE_SECTION_ICON_CLASS,
  SCHOOL_PROFILE_SECTIONS,
  subtitleForSchoolProfileSection,
  type SchoolProfileSectionId,
} from "@/components/school-admin/school-profile/school-profile-sections";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type SchoolProfileStoryHeaderProps = {
  theme: ParentThemeTokens;
  schoolName: string;
  timezone: string;
  activeSection: SchoolProfileSectionId;
  pendingSection?: SchoolProfileSectionId | null;
  loadingSection?: SchoolProfileSectionId | null;
  saving: boolean;
  saveDisabled: boolean;
  showUnsavedChanges?: boolean;
  showSaveButton?: boolean;
  onSectionChange: (section: SchoolProfileSectionId) => void;
  onSave: () => void;
};

export default function SchoolProfileStoryHeader({
  theme,
  schoolName,
  timezone,
  activeSection,
  pendingSection = null,
  loadingSection = null,
  saving,
  saveDisabled,
  showUnsavedChanges = false,
  showSaveButton = true,
  onSectionChange,
  onSave,
}: SchoolProfileStoryHeaderProps) {
  const sectionSubtitle = subtitleForSchoolProfileSection(activeSection);

  const pillItems = SCHOOL_PROFILE_SECTIONS.map((section) => {
    const Icon = section.icon;
    const tabLoading = isSchoolProfileSectionLoading(
      section.id,
      pendingSection,
      loadingSection,
    );
    return {
      key: section.id,
      label: section.label,
      icon: <Icon className={SCHOOL_PROFILE_SECTION_ICON_CLASS} aria-hidden />,
      testId: `school-profile-section-${section.id}`,
      ariaBusy: tabLoading,
      suffix: tabLoading ? (
        <Loader2
          className="h-3 w-3 animate-spin"
          data-testid="school-profile-section-loading"
        />
      ) : undefined,
    };
  });

  return (
    <div className="mb-5 flex flex-col gap-4">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end sm:gap-5">
        <div className="min-w-0">
          <AdminSectionKicker theme={theme}>My school</AdminSectionKicker>
          <AdminDisplayHeading theme={theme} as="h1" size="section" className="mt-1.5">
            School profile
          </AdminDisplayHeading>
          <p className="mt-2 text-[13px]" style={{ color: theme.muted }}>
            {schoolName} · Timezone {timezone} (organization level)
          </p>
          <p className="mt-1 text-[13px]" style={{ color: theme.muted }}>
            {sectionSubtitle}
          </p>
        </div>
        <div className="flex w-full shrink-0 flex-wrap items-center justify-end gap-2 sm:w-auto">
          {showUnsavedChanges ? (
            <span className="text-xs" style={{ color: theme.muted }}>
              Unsaved changes
            </span>
          ) : null}
          {showSaveButton ? (
            <AdminButton
              theme={theme}
              variant="primary"
              type="button"
              className="w-full sm:w-auto"
              disabled={saveDisabled}
              onClick={onSave}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save profile
            </AdminButton>
          ) : null}
        </div>
      </div>

      <ParentStoryPillNav
        theme={theme}
        items={pillItems}
        activeKey={activeSection}
        onChange={(key) => onSectionChange(key as SchoolProfileSectionId)}
        ariaLabel="School profile sections"
        data-testid="school-profile-section-nav"
      />
    </div>
  );
}
