"use client";

import SchoolAdminSlideOverShell from "@/components/school-admin/ui/SchoolAdminSlideOverShell";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import {
  BulletinPostEditorFooter,
  BulletinPostEditorForm,
  bulletinEditorSheetSubtitle,
  bulletinEditorSheetTitle,
  useBulletinPostEditor,
} from "@/components/school-admin/bulletin/BulletinPostEditor";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { BulletinPost, ProgramOption } from "@/lib/school-bulletin/types";

type BulletinPostEditorSheetProps = {
  open: boolean;
  onClose: () => void;
  slug: string;
  post: BulletinPost | null;
  programs: ProgramOption[];
  isNew?: boolean;
  onSaved: (post: BulletinPost) => void;
  onDeleted?: () => void;
  C: AdminThemeTokens;
};

export default function BulletinPostEditorSheet({
  open,
  onClose,
  slug,
  post,
  programs,
  isNew = false,
  onSaved,
  onDeleted,
  C,
}: BulletinPostEditorSheetProps) {
  const { theme } = useSchoolAdminStoryTheme();
  const editor = useBulletinPostEditor({
    slug,
    post,
    programs,
    onSaved,
    onDeleted,
  });

  return (
    <SchoolAdminSlideOverShell
      open={open}
      onClose={onClose}
      title={bulletinEditorSheetTitle(isNew && !editor.activePost, editor.activePost ?? post)}
      subtitle={bulletinEditorSheetSubtitle(isNew)}
      C={C}
      widthClassName="w-[min(100%,36rem)]"
      footer={
        <BulletinPostEditorFooter theme={theme} editor={editor} onDeleted={onDeleted} />
      }
    >
      <BulletinPostEditorForm theme={theme} C={C} programs={programs} editor={editor} />
    </SchoolAdminSlideOverShell>
  );
}
