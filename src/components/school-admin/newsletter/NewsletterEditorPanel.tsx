"use client";

import { Calendar, ImageIcon, Pencil, Trash2 } from "lucide-react";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import AdminSectionKicker from "@/components/school-admin/ui/story/AdminSectionKicker";
import AdminTextLink from "@/components/school-admin/ui/story/AdminTextLink";
import { initialsFromName } from "@/lib/messages/format";
import { submissionContactAvatarStyle } from "@/components/admissions/ParentPortalLoginIcon";
import { shortDate } from "@/lib/school-admin/newsletter/newsletter-dates";
import type {
  NewsletterEdition,
  NewsletterSchoolTemplate,
  NewsletterStoryBlock,
} from "@/lib/school-admin/newsletter/newsletter-types";
import { staffDisplayName } from "@/lib/staff/staff-display";
import type { StaffMemberRecord } from "@/lib/staff/staff-members";
import styles from "./newsletter-workspace.module.css";

export type NewsletterEditorTab = "story" | "teachers" | "details" | "photos";

type NewsletterEditorPanelProps = {
  edition: NewsletterEdition;
  template: NewsletterSchoolTemplate;
  locked: boolean;
  editorTab: NewsletterEditorTab;
  staffMembers: StaffMemberRecord[];
  staffLoading: boolean;
  staffError: string | null;
  onTabChange: (tab: NewsletterEditorTab) => void;
  onEditionChange: (edition: NewsletterEdition) => void;
  onTemplateChange: (template: NewsletterSchoolTemplate) => void;
  onOpenSections: () => void;
  onAddEvent: () => void;
  onEditEvent: (index: number) => void;
  onUploadPhotos: () => void;
};

export default function NewsletterEditorPanel({
  edition,
  template,
  locked,
  editorTab,
  staffMembers,
  staffLoading,
  staffError,
  onTabChange,
  onEditionChange,
  onTemplateChange,
  onOpenSections,
  onAddEvent,
  onEditEvent,
  onUploadPhotos,
}: NewsletterEditorPanelProps) {
  const { theme, C } = useSchoolAdminStoryTheme();

  const patch = (partial: Partial<NewsletterEdition>) => {
    onEditionChange({ ...edition, ...partial });
  };

  const updateBlock = (blockId: string, updater: (block: NewsletterStoryBlock) => NewsletterStoryBlock) => {
    if (locked) return;
    const storyBlocks = edition.storyBlocks.map((b) =>
      b.id === blockId ? updater(b) : b,
    );
    onEditionChange({ ...edition, storyBlocks });
  };

  const updateBlockHeading = (blockId: string, heading: string) => {
    updateBlock(blockId, (b) => ({ ...b, heading }));
    onTemplateChange({
      ...template,
      storyBlocks: template.storyBlocks.map((b) =>
        b.id === blockId ? { ...b, heading } : b,
      ),
    });
  };

  const tabs: { id: NewsletterEditorTab; label: string }[] = [
    { id: "story", label: "The story" },
    { id: "teachers", label: "Teacher Updates" },
    { id: "details", label: "Dates & notes" },
    { id: "photos", label: "Photos" },
  ];

  return (
    <section className={styles.editor} aria-label="Weekly prompts">
      <div className={styles.editorHeading}>Weekly prompts</div>
      <nav className={styles.editorTabs} aria-label="Newsletter content">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={editorTab === id ? styles.tabActive : undefined}
            onClick={() => onTabChange(id)}
          >
            {label}
          </button>
        ))}
      </nav>
      <div className={styles.editorContent}>
        {editorTab === "story" ? (
          <StoryTab
            edition={edition}
            locked={locked}
            theme={theme}
            onPatch={patch}
            onUpdateBlock={updateBlock}
            onUpdateBlockHeading={updateBlockHeading}
          />
        ) : null}
        {editorTab === "teachers" ? (
          <TeachersTab
            edition={edition}
            template={template}
            locked={locked}
            theme={theme}
            C={C}
            staffMembers={staffMembers}
            staffLoading={staffLoading}
            staffError={staffError}
            onPatch={patch}
            onOpenSections={onOpenSections}
          />
        ) : null}
        {editorTab === "details" ? (
          <DetailsTab
            edition={edition}
            locked={locked}
            theme={theme}
            onPatch={onEditionChange}
            onAddEvent={onAddEvent}
            onEditEvent={onEditEvent}
          />
        ) : null}
        {editorTab === "photos" ? (
          <PhotosTab
            edition={edition}
            locked={locked}
            theme={theme}
            onPatch={onEditionChange}
            onUploadPhotos={onUploadPhotos}
          />
        ) : null}
      </div>
    </section>
  );
}

function StoryTab({
  edition,
  locked,
  theme,
  onPatch,
  onUpdateBlock,
  onUpdateBlockHeading,
}: {
  edition: NewsletterEdition;
  locked: boolean;
  theme: ReturnType<typeof useSchoolAdminStoryTheme>["theme"];
  onPatch: (partial: Partial<NewsletterEdition>) => void;
  onUpdateBlock: (
    blockId: string,
    updater: (block: NewsletterStoryBlock) => NewsletterStoryBlock,
  ) => void;
  onUpdateBlockHeading: (blockId: string, heading: string) => void;
}) {
  const contentBlocks = edition.storyBlocks.filter((b) => b.enabled);

  return (
    <div className="space-y-4">
      <AdminCard theme={theme} padding="compact">
        <Field label="Newsletter title">
          <input
            className={styles.input}
            value={edition.title}
            maxLength={160}
            readOnly={locked}
            onChange={(e) => onPatch({ title: e.target.value })}
          />
        </Field>
        <div className={`${styles.twoFields} mt-4`}>
          <Field label="Week beginning">
            <input
              className={styles.input}
              type="date"
              value={edition.week}
              readOnly={locked}
              onChange={(e) => onPatch({ week: e.target.value })}
            />
          </Field>
          <Field label="Week ending" optional>
            <input
              className={styles.input}
              type="date"
              value={edition.weekEnd ?? ""}
              readOnly={locked}
              onChange={(e) =>
                onPatch({ weekEnd: e.target.value || undefined })
              }
            />
          </Field>
        </div>
        <p className={styles.helper}>
          Optional end date for biweekly or monthly editions. Leave blank for a single week.
        </p>
      </AdminCard>

      {contentBlocks.map((block) => (
        <AdminCard key={block.id} theme={theme} padding="compact">
          <Field label="Section heading">
            <input
              className={styles.input}
              value={block.heading}
              maxLength={120}
              readOnly={locked}
              onChange={(e) => onUpdateBlockHeading(block.id, e.target.value)}
            />
          </Field>
          <Field label={block.prompt} optional={block.optional}>
            {block.starter ? (
              <div className={styles.starter}>{block.starter}</div>
            ) : null}
            <textarea
              className={styles.input}
              value={block.value}
              maxLength={4000}
              readOnly={locked}
              onChange={(e) =>
                onUpdateBlock(block.id, (b) => ({ ...b, value: e.target.value }))
              }
            />
          </Field>
        </AdminCard>
      ))}
    </div>
  );
}

function TeachersTab({
  edition,
  template,
  locked,
  theme,
  C,
  staffMembers,
  staffLoading,
  staffError,
  onPatch,
  onOpenSections,
}: {
  edition: NewsletterEdition;
  template: NewsletterSchoolTemplate;
  locked: boolean;
  theme: ReturnType<typeof useSchoolAdminStoryTheme>["theme"];
  C: ReturnType<typeof useSchoolAdminStoryTheme>["C"];
  staffMembers: StaffMemberRecord[];
  staffLoading: boolean;
  staffError: string | null;
  onPatch: (partial: Partial<NewsletterEdition>) => void;
  onOpenSections: () => void;
}) {
  if (!edition.sections.teacherUpdates) {
    return (
      <div className={styles.emptyNote}>
        Teacher updates are turned off for this edition.{" "}
        <AdminTextLink theme={theme} disabled={locked} onClick={onOpenSections}>
          Enable in Sections
        </AdminTextLink>
      </div>
    );
  }

  const activeStaff = staffMembers.filter((m) => m.employmentStatus === "active");

  return (
    <div className="space-y-4">
      <AdminSectionKicker theme={theme}>Classroom voices</AdminSectionKicker>
      <AdminDisplayHeading theme={theme} size="section" as="h2" className="!mt-1">
        {template.teacherUpdatesHeading}
      </AdminDisplayHeading>
      <p className="text-[11px] leading-relaxed" style={{ color: theme.muted }}>
        Enter each teacher&apos;s update for this edition. Later, teachers can add their own from
        the teacher dashboard.
      </p>
      {staffLoading ? (
        <p className={styles.emptyNote}>Loading staff…</p>
      ) : staffError ? (
        <p className={styles.emptyNote}>{staffError}</p>
      ) : activeStaff.length === 0 ? (
        <p className={styles.emptyNote}>No active staff yet. Add staff from My School → Staff.</p>
      ) : (
        activeStaff.map((member) => {
          const name = staffDisplayName(member);
          const avatarStyle = submissionContactAvatarStyle(name);
          const value = edition.teacherUpdates[member.id] ?? "";
          return (
            <AdminCard key={member.id} theme={theme} padding="compact">
              <div className="mb-3 flex items-center gap-2.5">
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[10px] font-extrabold"
                  style={avatarStyle}
                  aria-hidden
                >
                  {initialsFromName(name).slice(0, 2)}
                </span>
                <span className="text-sm font-semibold" style={{ color: C.textPrimary }}>
                  {name}
                </span>
              </div>
              <textarea
                className={styles.input}
                value={value}
                readOnly={locked}
                placeholder={`${name.split(" ")[0]}'s update for this week…`}
                maxLength={4000}
                onChange={(e) =>
                  onPatch({
                    teacherUpdates: {
                      ...edition.teacherUpdates,
                      [member.id]: e.target.value,
                    },
                  })
                }
              />
            </AdminCard>
          );
        })
      )}
    </div>
  );
}

function DetailsTab({
  edition,
  locked,
  theme,
  onPatch,
  onAddEvent,
  onEditEvent,
}: {
  edition: NewsletterEdition;
  locked: boolean;
  theme: ReturnType<typeof useSchoolAdminStoryTheme>["theme"];
  onPatch: (edition: NewsletterEdition) => void;
  onAddEvent: () => void;
  onEditEvent: (index: number) => void;
}) {
  if (!edition.sections.events && !edition.sections.reminders) {
    return <p className={styles.emptyNote}>Dates and reminders are off.</p>;
  }

  return (
    <div className="space-y-4">
      {edition.sections.events ? (
        <AdminCard theme={theme} padding="compact">
          <div className={styles.smallHeadingRow}>
            <AdminDisplayHeading theme={theme} size="section" as="h3" className="!mt-0">
              Important dates
            </AdminDisplayHeading>
            <AdminTextLink theme={theme} disabled={locked} onClick={onAddEvent}>
              + Add date
            </AdminTextLink>
          </div>
          {edition.events.length === 0 ? (
            <p className={styles.emptyNote}>No dates added.</p>
          ) : (
            edition.events.map((event, index) => (
              <div key={event.id} className={styles.listItem}>
                <span style={{ color: "#8EBDCB", marginTop: 3 }}>
                  <Calendar size={12} strokeWidth={1.65} aria-hidden />
                </span>
                <div className={styles.grow}>
                  <strong>{event.title}</strong>
                  <p>
                    {shortDate(event.date)}
                    {event.time ? ` · ${event.time}` : ""}
                  </p>
                  {event.note ? <p>{event.note}</p> : null}
                </div>
                <button
                  type="button"
                  aria-label={`Edit ${event.title}`}
                  disabled={locked}
                  onClick={() => onEditEvent(index)}
                >
                  <Pencil size={12} strokeWidth={1.65} />
                </button>
                <button
                  type="button"
                  aria-label={`Remove ${event.title}`}
                  disabled={locked}
                  onClick={() => {
                    const events = edition.events.filter((_, i) => i !== index);
                    onPatch({ ...edition, events });
                  }}
                >
                  <Trash2 size={12} strokeWidth={1.65} />
                </button>
              </div>
            ))
          )}
        </AdminCard>
      ) : null}

      {edition.sections.reminders ? (
        <AdminCard theme={theme} padding="compact">
          <div className={styles.smallHeadingRow}>
            <AdminDisplayHeading theme={theme} size="section" as="h3" className="!mt-0">
              Reminders
            </AdminDisplayHeading>
            <AdminTextLink
              theme={theme}
              disabled={locked}
              onClick={() => {
                onPatch({
                  ...edition,
                  reminders: [
                    ...edition.reminders,
                    { id: `${Date.now()}`, text: "", keep: false },
                  ],
                });
              }}
            >
              + Add reminder
            </AdminTextLink>
          </div>
          {edition.reminders.length === 0 ? (
            <p className={styles.emptyNote}>No reminders yet.</p>
          ) : (
            edition.reminders.map((reminder, index) => (
              <div key={reminder.id} className={styles.reminderItem}>
                <div className={styles.reminderTop}>
                  <input
                    className={styles.input}
                    value={reminder.text}
                    readOnly={locked}
                    placeholder="Reminder for families"
                    maxLength={500}
                    onChange={(e) => {
                      const reminders = edition.reminders.map((r, i) =>
                        i === index ? { ...r, text: e.target.value } : r,
                      );
                      onPatch({ ...edition, reminders });
                    }}
                  />
                  <button
                    type="button"
                    className={styles.iconBtn}
                    aria-label="Remove reminder"
                    disabled={locked}
                    onClick={() => {
                      onPatch({
                        ...edition,
                        reminders: edition.reminders.filter((_, i) => i !== index),
                      });
                    }}
                  >
                    <Trash2 size={12} strokeWidth={1.65} />
                  </button>
                </div>
                <label className={styles.checkLabel}>
                  <input
                    type="checkbox"
                    checked={reminder.keep}
                    disabled={locked}
                    onChange={(e) => {
                      const reminders = edition.reminders.map((r, i) =>
                        i === index ? { ...r, keep: e.target.checked } : r,
                      );
                      onPatch({ ...edition, reminders });
                    }}
                  />
                  Reuse next week
                </label>
              </div>
            ))
          )}
        </AdminCard>
      ) : null}
    </div>
  );
}

function PhotosTab({
  edition,
  locked,
  theme,
  onPatch,
  onUploadPhotos,
}: {
  edition: NewsletterEdition;
  locked: boolean;
  theme: ReturnType<typeof useSchoolAdminStoryTheme>["theme"];
  onPatch: (edition: NewsletterEdition) => void;
  onUploadPhotos: () => void;
}) {
  if (!edition.sections.photos) {
    return <p className={styles.emptyNote}>Photos are off for this edition.</p>;
  }

  return (
    <AdminCard theme={theme} padding="compact">
      <AdminDisplayHeading theme={theme} size="section" as="h3" className="!mt-0">
        Photos
      </AdminDisplayHeading>
      <button
        type="button"
        className={styles.upload}
        disabled={locked || edition.photos.length >= 6}
        onClick={onUploadPhotos}
      >
        <ImageIcon size={24} strokeWidth={1.65} aria-hidden />
        <strong>Add photos</strong>
        <small>Up to six images · JPG or PNG</small>
      </button>
      {edition.photos.length === 0 ? (
        <div
          className="mt-4 flex min-h-[100px] items-center justify-center rounded-xl border border-dashed px-4 py-6 text-center text-[11px]"
          style={{ borderColor: "#DCE4D8", color: theme.muted }}
        >
          No photos yet. Upload from your device.
        </div>
      ) : (
        edition.photos.map((photo, index) => (
          <div key={photo.id} className={styles.photoItem}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.src} alt={photo.caption || "Newsletter photo"} />
            <div className={styles.photoMeta}>
              <input
                className={styles.input}
                value={photo.caption}
                readOnly={locked}
                placeholder="Caption (optional)"
                maxLength={200}
                onChange={(e) => {
                  const photos = edition.photos.map((p, i) =>
                    i === index ? { ...p, caption: e.target.value } : p,
                  );
                  onPatch({ ...edition, photos });
                }}
              />
              <button
                type="button"
                className={styles.textAction}
                disabled={locked}
                onClick={() => {
                  onPatch({
                    ...edition,
                    photos: edition.photos.filter((_, i) => i !== index),
                  });
                }}
              >
                Remove photo
              </button>
            </div>
          </div>
        ))
      )}
    </AdminCard>
  );
}

function Field({
  label,
  optional,
  children,
}: {
  label: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.field}>
      <label>
        {label}
        {optional ? <span>Optional</span> : null}
      </label>
      {children}
    </div>
  );
}
