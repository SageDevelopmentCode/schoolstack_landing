"use client";

import { Calendar, ImageIcon, Images, Pencil, Trash2 } from "lucide-react";
import { useRef } from "react";
import { resizeImageFileToDataUrl } from "@/lib/school-admin/newsletter/newsletter-photos";
import SchoolAdminDatePicker, {
  schoolAdminDateRangeBounds,
} from "@/components/school-admin/ui/SchoolAdminDatePicker";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import AdminSectionKicker from "@/components/school-admin/ui/story/AdminSectionKicker";
import AdminTextLink from "@/components/school-admin/ui/story/AdminTextLink";
import { initialsFromName } from "@/lib/messages/format";
import { submissionContactAvatarStyle } from "@/components/admissions/ParentPortalLoginIcon";
import { shortDate } from "@/lib/school-admin/newsletter/newsletter-dates";
import {
  canAddCustomStoryBlock,
  countEnabledStoryBlocks,
  customStoryBlockLimitMessage,
  MAX_ENABLED_STORY_BLOCKS,
  MAX_NEWSLETTER_EVENTS,
  MAX_NEWSLETTER_PHOTOS,
  MAX_NEWSLETTER_REMINDERS,
} from "@/lib/school-admin/newsletter/newsletter-limits";
import {
  createNewsletterId,
  type NewsletterEdition,
  type NewsletterSchoolTemplate,
  type NewsletterStoryBlock,
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
  onOpenGalleryPicker: () => void;
  galleryEnabled: boolean;
  slug: string;
  onToast?: (message: string) => void;
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
  onOpenGalleryPicker,
  galleryEnabled,
  slug,
  onToast,
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
      <div className={styles.editorHeadingRow}>
        <span className={styles.editorHeadingTitle}>Weekly prompts</span>
        <AdminTextLink
          theme={theme}
          disabled={locked}
          className={`${styles.editorSectionsLink} !text-[10px] !font-bold`}
          onClick={onOpenSections}
        >
          Edit sections
        </AdminTextLink>
      </div>
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
            template={template}
            locked={locked}
            theme={theme}
            C={C}
            onPatch={patch}
            onEditionChange={onEditionChange}
            onTemplateChange={onTemplateChange}
            onUpdateBlock={updateBlock}
            onUpdateBlockHeading={updateBlockHeading}
            onToast={onToast}
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
            onToast={onToast}
          />
        ) : null}
        {editorTab === "photos" ? (
          <PhotosTab
            edition={edition}
            locked={locked}
            theme={theme}
            slug={slug}
            galleryEnabled={galleryEnabled}
            onPatch={onEditionChange}
            onUploadPhotos={onUploadPhotos}
            onOpenGalleryPicker={onOpenGalleryPicker}
          />
        ) : null}
      </div>
    </section>
  );
}

function StoryTab({
  edition,
  template,
  locked,
  theme,
  C,
  onPatch,
  onEditionChange,
  onTemplateChange,
  onUpdateBlock,
  onUpdateBlockHeading,
  onToast,
}: {
  edition: NewsletterEdition;
  template: NewsletterSchoolTemplate;
  locked: boolean;
  theme: ReturnType<typeof useSchoolAdminStoryTheme>["theme"];
  C: ReturnType<typeof useSchoolAdminStoryTheme>["C"];
  onPatch: (partial: Partial<NewsletterEdition>) => void;
  onEditionChange: (edition: NewsletterEdition) => void;
  onTemplateChange: (template: NewsletterSchoolTemplate) => void;
  onUpdateBlock: (
    blockId: string,
    updater: (block: NewsletterStoryBlock) => NewsletterStoryBlock,
  ) => void;
  onUpdateBlockHeading: (blockId: string, heading: string) => void;
  onToast?: (message: string) => void;
}) {
  const contentBlocks = edition.storyBlocks.filter((b) => b.enabled);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const dateBounds = schoolAdminDateRangeBounds();

  const removeSection = (block: NewsletterStoryBlock) => {
    if (locked) return;
    if (block.kind === "custom") {
      onTemplateChange({
        ...template,
        storyBlocks: template.storyBlocks.filter((b) => b.id !== block.id),
      });
      onEditionChange({
        ...edition,
        storyBlocks: edition.storyBlocks.filter((b) => b.id !== block.id),
      });
      return;
    }
    onTemplateChange({
      ...template,
      storyBlocks: template.storyBlocks.map((b) =>
        b.id === block.id ? { ...b, enabled: false } : b,
      ),
    });
    onEditionChange({
      ...edition,
      storyBlocks: edition.storyBlocks.map((b) =>
        b.id === block.id ? { ...b, enabled: false } : b,
      ),
    });
  };

  const addSection = () => {
    if (locked) return;
    if (!canAddCustomStoryBlock(template)) {
      onToast?.(customStoryBlockLimitMessage());
      return;
    }
    const id = createNewsletterId();
    const block: NewsletterStoryBlock = {
      id,
      kind: "custom",
      heading: "Custom section",
      prompt: "Your prompt",
      optional: true,
      enabled: true,
      value: "",
    };
    onTemplateChange({
      ...template,
      storyBlocks: [
        ...template.storyBlocks,
        {
          id: block.id,
          kind: block.kind,
          heading: block.heading,
          prompt: block.prompt,
          optional: block.optional,
          enabled: block.enabled,
        },
      ],
    });
    onEditionChange({
      ...edition,
      storyBlocks: [...edition.storyBlocks, block],
    });
  };

  const handleCoverFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (locked) return;
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      onToast?.("Use a JPG or PNG image.");
      return;
    }
    try {
      const src = await resizeImageFileToDataUrl(file);
      onPatch({ coverImage: src });
    } catch {
      onToast?.("Could not load that image. Try JPG or PNG.");
    }
  };

  return (
    <div className="space-y-5">
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
        <div className="mt-4">
          <Field label="Cover image" optional>
            {edition.coverImage ? (
              <>
                <div className={styles.coverPreview}>
                  <img src={edition.coverImage} alt="" />
                </div>
                <div className={styles.coverActions}>
                  <AdminButton
                    theme={theme}
                    variant="outline"
                    size="compact"
                    disabled={locked}
                    onClick={() => coverInputRef.current?.click()}
                  >
                    Change
                  </AdminButton>
                  <AdminButton
                    theme={theme}
                    variant="outline"
                    size="compact"
                    disabled={locked}
                    onClick={() => onPatch({ coverImage: undefined })}
                  >
                    Remove
                  </AdminButton>
                </div>
              </>
            ) : (
              <button
                type="button"
                className={styles.coverUploadBtn}
                disabled={locked}
                onClick={() => coverInputRef.current?.click()}
              >
                <ImageIcon size={22} strokeWidth={1.65} aria-hidden />
                Add cover image
              </button>
            )}
          </Field>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => void handleCoverFile(e)}
          />
          <p className={styles.helper}>Shown on the newsletters list in this browser.</p>
        </div>
        <div className={`${styles.twoFields} mt-4`}>
          <Field label="Week beginning">
            <SchoolAdminDatePicker
              id={`newsletter-week-begin-${edition.id}`}
              C={C}
              value={edition.week}
              disabled={locked}
              onChange={(value) => onPatch({ week: value })}
              maxDate={edition.weekEnd || dateBounds.maxDate}
              placeholder="Select start date"
            />
          </Field>
          <Field label="Week ending" optional>
            <SchoolAdminDatePicker
              id={`newsletter-week-end-${edition.id}`}
              C={C}
              value={edition.weekEnd ?? ""}
              disabled={locked}
              onChange={(value) => onPatch({ weekEnd: value || undefined })}
              minDate={edition.week || dateBounds.minDate}
              placeholder="Select end date"
            />
          </Field>
        </div>
        <p className={styles.helper}>
          Optional end date for biweekly or monthly editions. Leave blank for a single week.
        </p>
      </AdminCard>

      <p className="text-[10px] leading-relaxed" style={{ color: theme.muted }}>
        {countEnabledStoryBlocks(edition.storyBlocks)} of {MAX_ENABLED_STORY_BLOCKS} story
        sections
      </p>

      {contentBlocks.map((block) => (
        <AdminCard key={block.id} theme={theme} padding="compact">
          <div className={styles.smallHeadingRow}>
            <span className={styles.smallHeading}>Section</span>
            <button
              type="button"
              className={styles.iconBtn}
              disabled={locked}
              aria-label={
                block.kind === "custom" ? "Remove section" : "Hide section"
              }
              onClick={() => removeSection(block)}
            >
              <Trash2 size={14} strokeWidth={1.65} aria-hidden />
            </button>
          </div>
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

      <AdminTextLink theme={theme} disabled={locked} onClick={addSection}>
        + Add section
      </AdminTextLink>
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
  onToast,
}: {
  edition: NewsletterEdition;
  locked: boolean;
  theme: ReturnType<typeof useSchoolAdminStoryTheme>["theme"];
  onPatch: (edition: NewsletterEdition) => void;
  onAddEvent: () => void;
  onEditEvent: (index: number) => void;
  onToast?: (message: string) => void;
}) {
  const atEventCap = edition.events.length >= MAX_NEWSLETTER_EVENTS;
  const atReminderCap = edition.reminders.length >= MAX_NEWSLETTER_REMINDERS;
  if (!edition.sections.events && !edition.sections.reminders) {
    return <p className={styles.emptyNote}>Dates and reminders are off.</p>;
  }

  return (
    <div className="space-y-4">
      {edition.sections.events ? (
        <AdminCard theme={theme} padding="compact">
          <div className={styles.smallHeadingRow}>
            <AdminDisplayHeading theme={theme} size="section" as="h3" className="!mt-0">
              Important dates · {edition.events.length} / {MAX_NEWSLETTER_EVENTS}
            </AdminDisplayHeading>
            <AdminTextLink theme={theme} disabled={locked || atEventCap} onClick={onAddEvent}>
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
              Reminders · {edition.reminders.length} / {MAX_NEWSLETTER_REMINDERS}
            </AdminDisplayHeading>
            <AdminTextLink
              theme={theme}
              disabled={locked || atReminderCap}
              onClick={() => {
                if (atReminderCap) {
                  onToast?.(`Up to ${MAX_NEWSLETTER_REMINDERS} reminders.`);
                  return;
                }
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
  slug,
  galleryEnabled,
  onPatch,
  onUploadPhotos,
  onOpenGalleryPicker,
}: {
  edition: NewsletterEdition;
  locked: boolean;
  theme: ReturnType<typeof useSchoolAdminStoryTheme>["theme"];
  slug: string;
  galleryEnabled: boolean;
  onPatch: (edition: NewsletterEdition) => void;
  onUploadPhotos: () => void;
  onOpenGalleryPicker: () => void;
}) {
  if (!edition.sections.photos) {
    return <p className={styles.emptyNote}>Photos are off for this edition.</p>;
  }

  const atPhotoCap = edition.photos.length >= MAX_NEWSLETTER_PHOTOS;
  const photosHref = `/school/${slug}/admin/photos`;

  return (
    <AdminCard theme={theme} padding="compact">
      <AdminDisplayHeading theme={theme} size="section" as="h3" className="!mt-0">
        Photos · {edition.photos.length} / {MAX_NEWSLETTER_PHOTOS}
      </AdminDisplayHeading>
      <div className="mt-3 flex flex-row flex-nowrap items-center gap-2">
        {galleryEnabled ? (
          <AdminButton
            theme={theme}
            variant="primary"
            size="compact"
            className="!px-2.5 whitespace-nowrap"
            disabled={locked || atPhotoCap}
            onClick={onOpenGalleryPicker}
          >
            <Images size={14} strokeWidth={1.65} aria-hidden />
            From library
          </AdminButton>
        ) : null}
        <AdminButton
          theme={theme}
          variant="soft"
          size="compact"
          className="!px-2.5 whitespace-nowrap"
          disabled={locked || atPhotoCap}
          onClick={onUploadPhotos}
        >
          <ImageIcon size={14} strokeWidth={1.65} aria-hidden />
          From device
        </AdminButton>
      </div>
      {!galleryEnabled ? (
        <p className={styles.helper}>
          School photo library is off. Upload from your device, or manage photos under{" "}
          <a href={photosHref} className="underline" style={{ color: theme.primary }}>
            My School → Photos
          </a>
          .
        </p>
      ) : (
        <p className={styles.helper}>JPG or PNG from your device, or pick from the school library.</p>
      )}
      {edition.photos.length === 0 ? (
        <div
          className="mt-4 flex min-h-[100px] items-center justify-center rounded-xl border border-dashed px-4 py-6 text-center text-[11px]"
          style={{ borderColor: "#DCE4D8", color: theme.muted }}
        >
          No photos yet.
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
