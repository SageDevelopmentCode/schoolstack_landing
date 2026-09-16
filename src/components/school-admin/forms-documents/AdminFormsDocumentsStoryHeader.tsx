"use client";

import { Plus } from "lucide-react";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type AdminFormsDocumentsStoryHeaderProps = {
  theme: ParentThemeTokens;
  onCreate?: () => void;
};

export default function AdminFormsDocumentsStoryHeader({
  theme,
  onCreate,
}: AdminFormsDocumentsStoryHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <ParentSectionKicker
          theme={theme}
          className="normal-case tracking-normal font-semibold"
        >
          Forms &amp; documents
        </ParentSectionKicker>
        <ParentDisplayHeading theme={theme}>Family forms</ParentDisplayHeading>
        <p className="mt-1 text-sm" style={{ color: theme.muted }}>
          View all teacher forms and publish school-wide forms to classrooms.
        </p>
      </div>
      {onCreate ? (
        <AdminButton
          theme={theme}
          variant="primary"
          onClick={onCreate}
          className="w-full sm:w-auto"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Create form
        </AdminButton>
      ) : null}
    </div>
  );
}
