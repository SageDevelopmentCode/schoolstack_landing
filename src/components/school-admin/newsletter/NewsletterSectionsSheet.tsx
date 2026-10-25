"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import { SettingToggleRow } from "@/components/school-admin/notifications/NotificationChannelCard";
import SchoolAdminSlideOverShell from "@/components/school-admin/ui/SchoolAdminSlideOverShell";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import AdminSectionKicker from "@/components/school-admin/ui/story/AdminSectionKicker";
import AdminTextLink from "@/components/school-admin/ui/story/AdminTextLink";
import { applyTemplateToEdition } from "@/lib/school-admin/newsletter/newsletter-template";
import {
  createNewsletterId,
  type NewsletterEdition,
  type NewsletterSchoolTemplate,
  type NewsletterSections,
  type NewsletterStoryBlockKind,
  type NewsletterWorkspaceState,
} from "@/lib/school-admin/newsletter/newsletter-types";
import styles from "./newsletter-workspace.module.css";

const STORY_KIND_LABELS: Record<NewsletterStoryBlockKind, string> = {
  welcome: "Opening note",
  learning: "This week's learning",
  moment: "A moment worth sharing",
  next: "Looking ahead",
  family: "At home",
  quote: "Child's words",
  custom: "Custom section",
};

function cloneTemplate(template: NewsletterSchoolTemplate): NewsletterSchoolTemplate {
  return {
    ...template,
    storyBlocks: template.storyBlocks.map((b) => ({ ...b })),
    sections: { ...template.sections },
  };
}

type NewsletterSectionsSheetProps = {
  open: boolean;
  workspace: NewsletterWorkspaceState;
  activeEdition: NewsletterEdition;
  onClose: () => void;
  onWorkspaceChange: (next: NewsletterWorkspaceState) => void;
  onToast: (message: string) => void;
};

export default function NewsletterSectionsSheet({
  open,
  workspace,
  activeEdition,
  onClose,
  onWorkspaceChange,
  onToast,
}: NewsletterSectionsSheetProps) {
  const { theme, C } = useSchoolAdminStoryTheme();
  const [template, setTemplate] = useState(() => cloneTemplate(workspace.template));

  const toggleBlock = (id: string, enabled: boolean) => {
    setTemplate((prev) => ({
      ...prev,
      storyBlocks: prev.storyBlocks.map((b) => (b.id === id ? { ...b, enabled } : b)),
    }));
  };

  const toggleSection = (key: keyof NewsletterSections, enabled: boolean) => {
    setTemplate((prev) => ({
      ...prev,
      sections: { ...prev.sections, [key]: enabled },
    }));
  };

  const apply = () => {
    const nextEdition = applyTemplateToEdition(template, activeEdition);
    onWorkspaceChange({
      ...workspace,
      template,
      editions: workspace.editions.map((e) =>
        e.id === activeEdition.id ? nextEdition : e,
      ),
    });
    onClose();
  };

  const fixedBlocks = template.storyBlocks.filter((b) => b.kind !== "custom");
  const customBlocks = template.storyBlocks.filter((b) => b.kind === "custom");

  const addCustom = () => {
    const customCount = template.storyBlocks.filter((b) => b.kind === "custom").length;
    if (customCount >= 6) {
      onToast("Up to six custom prompts.");
      return;
    }
    const id = createNewsletterId();
    setTemplate((prev) => ({
      ...prev,
      storyBlocks: [
        ...prev.storyBlocks,
        {
          id,
          kind: "custom",
          heading: "Custom section",
          prompt: "Your prompt",
          optional: true,
          enabled: true,
        },
      ],
    }));
  };

  return (
    <SchoolAdminSlideOverShell
      open={open}
      onClose={onClose}
      title="Newsletter sections"
      subtitle="Headings are edited on The story tab."
      C={C}
      widthClassName="w-[min(100%,24rem)]"
      footer={
        <>
          <AdminButton theme={theme} variant="outline" onClick={onClose}>
            Cancel
          </AdminButton>
          <AdminButton theme={theme} variant="primary" onClick={apply}>
            Apply
          </AdminButton>
        </>
      }
    >
      <div className="space-y-5 pb-2">
        <section className="pb-2">
          <AdminSectionKicker theme={theme}>The story</AdminSectionKicker>
          <AdminDisplayHeading theme={theme} size="section" as="h3" className="!mt-1 mb-2">
            Story prompts
          </AdminDisplayHeading>
          <AdminCard theme={theme} padding="none" className="pb-1 mb-4">
            {fixedBlocks.map((block, index) => (
              <SettingToggleRow
                key={block.id}
                C={C}
                label={STORY_KIND_LABELS[block.kind]}
                checked={block.enabled}
                disabled={false}
                showDivider={index < fixedBlocks.length - 1}
                onChange={(checked) => toggleBlock(block.id, checked)}
              />
            ))}
          </AdminCard>
        </section>

        <section>
          <AdminSectionKicker theme={theme}>Classroom</AdminSectionKicker>
          <AdminCard theme={theme} padding="none" className="mt-2">
            <SettingToggleRow
              C={C}
              label="Teacher updates"
              checked={template.sections.teacherUpdates}
              disabled={false}
              onChange={(checked) => toggleSection("teacherUpdates", checked)}
            />
          </AdminCard>
        </section>

        <section>
          <AdminSectionKicker theme={theme}>Family calendar</AdminSectionKicker>
          <AdminCard theme={theme} padding="none" className="mt-2">
            <SettingToggleRow
              C={C}
              label="Dates"
              checked={template.sections.events}
              disabled={false}
              showDivider
              onChange={(checked) => toggleSection("events", checked)}
            />
            <SettingToggleRow
              C={C}
              label="Reminders"
              checked={template.sections.reminders}
              disabled={false}
              onChange={(checked) => toggleSection("reminders", checked)}
            />
          </AdminCard>
        </section>

        <section>
          <AdminSectionKicker theme={theme}>Media</AdminSectionKicker>
          <AdminCard theme={theme} padding="none" className="mt-2">
            <SettingToggleRow
              C={C}
              label="Photos"
              checked={template.sections.photos}
              disabled={false}
              onChange={(checked) => toggleSection("photos", checked)}
            />
          </AdminCard>
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between gap-3">
            <AdminDisplayHeading theme={theme} size="section" as="h3" className="!mt-0">
              Custom prompts
            </AdminDisplayHeading>
            <AdminTextLink theme={theme} onClick={addCustom}>
              + Add
            </AdminTextLink>
          </div>
          {customBlocks.length === 0 ? (
            <p className="text-[11px] leading-relaxed" style={{ color: theme.muted }}>
              Optional extra story blocks with your own prompt labels.
            </p>
          ) : (
            <AdminCard theme={theme} padding="none">
              {customBlocks.map((block, index) => (
                <SettingToggleRow
                  key={block.id}
                  C={C}
                  label={block.prompt.trim() || "Custom section"}
                  checked={block.enabled}
                  disabled={false}
                  showDivider={index < customBlocks.length - 1}
                  onChange={(checked) => toggleBlock(block.id, checked)}
                />
              ))}
            </AdminCard>
          )}
          {customBlocks.length > 0 ? (
            <div className="mt-3 space-y-2">
              {customBlocks.map((block, index) => (
                <div key={`edit-${block.id}`} className={styles.customRow}>
                  <input
                    className={styles.input}
                    value={block.prompt}
                    placeholder="Prompt / section title"
                    maxLength={100}
                    aria-label={`Custom prompt ${index + 1}`}
                    onChange={(e) => {
                      const prompt = e.target.value;
                      setTemplate((prev) => ({
                        ...prev,
                        storyBlocks: prev.storyBlocks.map((b) =>
                          b.id === block.id
                            ? { ...b, prompt, heading: prompt || b.heading }
                            : b,
                        ),
                      }));
                    }}
                  />
                  <button
                    type="button"
                    className={styles.iconBtn}
                    aria-label={`Remove custom prompt ${index + 1}`}
                    onClick={() => {
                      setTemplate((prev) => ({
                        ...prev,
                        storyBlocks: prev.storyBlocks.filter((b) => b.id !== block.id),
                      }));
                    }}
                  >
                    <Trash2 size={14} strokeWidth={1.65} />
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </SchoolAdminSlideOverShell>
  );
}
