"use client";

import GSidePanel from "@/components/school-parent/garden/GSidePanel";
import { GCard } from "@/components/school-parent/garden/ui";
import {
  BulletinPostEditorFooter,
  BulletinPostEditorForm,
  bulletinEditorSheetSubtitle,
  bulletinEditorSheetTitle,
  useBulletinPostEditor,
} from "@/components/school-admin/bulletin/BulletinPostEditor";
import { BulletinStatusChip } from "@/components/school-admin/bulletin/bulletin-status";
import { resolveBulletinDisplayStatus } from "@/lib/school-bulletin/bulletin-audience";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { BulletinPost, ProgramOption } from "@/lib/school-bulletin/types";

type BulletinPostEditorSheetProps = {
  open: boolean;
  onClose: () => void;
  organizationId: string;
  slug: string;
  post: BulletinPost | null;
  programs: ProgramOption[];
  isNew?: boolean;
  onSaved: (post: BulletinPost) => void;
  onDeleted?: () => void;
  theme: ParentThemeTokens;
  C: AdminThemeTokens;
  /**
   * "panel" (default): Garden side panel. "inline": the same editor in a card
   * on the page (marketing demo windows, where a body portal would escape).
   */
  presentation?: "panel" | "inline";
};

/** Bulletin editor shell: Garden side panel (or an inline card for previews). */
export default function BulletinPostEditorSheet({
  open,
  onClose,
  organizationId,
  slug,
  post,
  programs,
  isNew = false,
  onSaved,
  onDeleted,
  theme,
  C,
  presentation = "panel",
}: BulletinPostEditorSheetProps) {
  const editor = useBulletinPostEditor({
    organizationId,
    slug,
    post,
    programs,
    onSaved,
    onDeleted,
    C,
  });

  const title = bulletinEditorSheetTitle(isNew && !editor.activePost, editor.activePost ?? post);
  const subtitle = bulletinEditorSheetSubtitle(isNew && !editor.activePost);
  const status = editor.activePost ? <BulletinStatusChip status={resolveBulletinDisplayStatus(editor.activePost)} /> : null;
  const footer = <BulletinPostEditorFooter theme={theme} editor={editor} onDeleted={onDeleted} />;
  const form = <BulletinPostEditorForm theme={theme} C={C} programs={programs} editor={editor} />;

  if (presentation === "inline") {
    if (!open) return null;
    return (
      <GCard index={2} kicker={isNew ? "New post" : "Editing"} title={title} action={status} data-testid="bulletin-editor-inline">
        <div className="flex flex-col gap-6">
          {form}
          <div className="border-t border-[var(--sf-ink)]/[0.08] pt-4">{footer}</div>
        </div>
      </GCard>
    );
  }

  return (
    <>
      <GSidePanel
        theme={theme}
        open={open}
        onClose={() => void editor.requestClose(onClose)}
        title={title}
        kicker={isNew && !editor.activePost ? "New post" : "Bulletin post"}
        subtitle={subtitle}
        headerAside={status}
        size="xl"
        testId="bulletin-editor-panel"
        panelId="bulletin-editor"
        footer={footer}
      >
        {form}
      </GSidePanel>
      {editor.confirmDialog}
    </>
  );
}
