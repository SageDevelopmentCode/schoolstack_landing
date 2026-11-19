"use client";

import { useRef, useState, type ReactNode } from "react";
import { CalendarPlus, EyeOff, ImageIcon, Images, Pencil, Plus, RotateCw, Trash2, Upload, X } from "lucide-react";
import {
  GardenField,
  GardenNotice,
  gBtnDangerSm,
  gBtnOutlineXs,
  gIconBtn,
  gInputClass,
} from "@/components/school-admin/garden/kit";
import { G_FOCUS, gBtnOutlineSm, gBtnPopSm, gLinkSm } from "@/components/school-parent/garden/ui";
import { shortDate } from "@/lib/school-admin/newsletter/newsletter-dates";
import {
  MAX_NEWSLETTER_EVENTS,
  MAX_NEWSLETTER_PHOTOS,
  MAX_NEWSLETTER_PHOTO_CAPTION_LENGTH,
  MAX_NEWSLETTER_REMINDERS,
  NEWSLETTER_PHOTO_CAPTION_COUNT_SHOW_AT,
  newsletterPhotoCaptionLimitMessage,
} from "@/lib/school-admin/newsletter/newsletter-limits";
import { prepareNewsletterImageFileForUpload } from "@/lib/school-admin/newsletter/newsletter-photos";
import {
  createNewsletterId,
  type NewsletterEdition,
  type NewsletterEvent,
  type NewsletterSchoolTemplate,
  type NewsletterStoryBlock,
} from "@/lib/school-admin/newsletter/newsletter-types";
import { staffDisplayName } from "@/lib/staff/staff-display";
import type { StaffMemberRecord } from "@/lib/staff/staff-members";
import NewsletterMediaImage from "./NewsletterMediaImage";

/*
 * One editor per part of the newsletter. They open in the builder's side panel
 * (Family view) or stack as cards (Compact list). Same rules and limits as the
 * old tabbed editor; only the layout changed.
 */

export type NewsletterToast = (
  message: string,
  tone?: "success" | "error" | "info",
  options?: { description?: string },
) => void;

type BaseProps = {
  edition: NewsletterEdition;
  locked: boolean;
  onEditionChange: (edition: NewsletterEdition) => void;
  onToast: NewsletterToast;
};

const TEXTAREA = "min-h-[132px] resize-y leading-relaxed";

function Hint({ children }: { children: ReactNode }) {
  return <p className="m-0 mt-1.5 text-[12.5px] font-semibold leading-relaxed text-[var(--sf-soft)]">{children}</p>;
}

/* ------------------------------------------------------------------ */
/* Cover & welcome                                                     */
/* ------------------------------------------------------------------ */

export function CoverEditor({
  edition,
  locked,
  onEditionChange,
  onToast,
  galleryEnabled,
  onOpenCoverGalleryPicker,
}: BaseProps & { galleryEnabled: boolean; onOpenCoverGalleryPicker?: () => void }) {
  const coverInputRef = useRef<HTMLInputElement>(null);
  const welcome = edition.storyBlocks.find((b) => b.kind === "welcome");
  const patch = (partial: Partial<NewsletterEdition>) => onEditionChange({ ...edition, ...partial });

  const handleCoverFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (locked) return;
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      onToast("Use a JPG or PNG image.", "info", { description: "The cover didn't change." });
      return;
    }
    try {
      const src = await prepareNewsletterImageFileForUpload(file);
      patch({ coverImage: src, coverGalleryPhotoId: undefined });
    } catch {
      onToast("Couldn't load that image.", "error", { description: "Try a JPG or PNG. The cover didn't change." });
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <GardenField id={`newsletter-title-${edition.id}`} label="Newsletter title" required>
        <input
          id={`newsletter-title-${edition.id}`}
          className={gInputClass()}
          value={edition.title}
          maxLength={160}
          readOnly={locked}
          placeholder="A week of small discoveries"
          onChange={(e) => patch({ title: e.target.value })}
        />
      </GardenField>

      <div>
        <p className="mb-1.5 text-[13px] font-extrabold text-[var(--sf-ink)]">
          Cover photo <span className="font-semibold text-[var(--sf-soft)]">· Optional</span>
        </p>
        {edition.coverImage ? (
          <div className="overflow-hidden rounded-[18px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white">
            <div className="relative aspect-[16/9]">
              <NewsletterMediaImage
                instanceKey="cover"
                src={edition.coverImage}
                alt=""
                className="absolute inset-0 h-full w-full"
                imageClassName="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-wrap gap-2 p-3">
              <button type="button" className={gBtnOutlineXs} disabled={locked} onClick={() => coverInputRef.current?.click()}>
                <Upload className="h-3.5 w-3.5" aria-hidden />
                Change
              </button>
              {galleryEnabled && onOpenCoverGalleryPicker ? (
                <button type="button" className={gBtnOutlineXs} disabled={locked} onClick={onOpenCoverGalleryPicker}>
                  <Images className="h-3.5 w-3.5" aria-hidden />
                  From library
                </button>
              ) : null}
              <button
                type="button"
                className={gBtnOutlineXs}
                disabled={locked}
                onClick={() => patch({ coverImage: undefined, coverGalleryPhotoId: undefined })}
              >
                <X className="h-3.5 w-3.5" aria-hidden />
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 rounded-[18px] border-2 border-dashed border-[var(--sf-ink)]/20 p-4">
            <button type="button" className={gBtnOutlineSm} disabled={locked} onClick={() => coverInputRef.current?.click()}>
              <ImageIcon className="h-4 w-4" aria-hidden />
              Upload cover
            </button>
            {galleryEnabled && onOpenCoverGalleryPicker ? (
              <button type="button" className={gBtnOutlineSm} disabled={locked} onClick={onOpenCoverGalleryPicker}>
                <Images className="h-4 w-4" aria-hidden />
                From library
              </button>
            ) : null}
          </div>
        )}
        <input ref={coverInputRef} type="file" accept="image/*" hidden onChange={(e) => void handleCoverFile(e)} />
        <Hint>Shown behind the title and on the newsletters list. Uploads are optimized before saving.</Hint>
      </div>

      <div className="grid gap-3 min-[420px]:grid-cols-2">
        <GardenField id={`newsletter-week-begin-${edition.id}`} label="Week beginning" required>
          <input
            id={`newsletter-week-begin-${edition.id}`}
            type="date"
            className={gInputClass()}
            value={edition.week}
            max={edition.weekEnd || undefined}
            readOnly={locked}
            onChange={(e) => patch({ week: e.target.value })}
          />
        </GardenField>
        <GardenField id={`newsletter-week-end-${edition.id}`} label="Week ending" optional>
          <input
            id={`newsletter-week-end-${edition.id}`}
            type="date"
            className={gInputClass()}
            value={edition.weekEnd ?? ""}
            min={edition.week || undefined}
            readOnly={locked}
            onChange={(e) => patch({ weekEnd: e.target.value || undefined })}
          />
        </GardenField>
      </div>
      <Hint>Leave the end date blank for a single week; add one for biweekly or monthly editions.</Hint>

      {welcome?.enabled ? (
        <GardenField id={`newsletter-welcome-${edition.id}`} label={welcome.prompt || "Welcome note"} optional={welcome.optional}>
          {welcome.starter ? <Hint>{welcome.starter}</Hint> : null}
          <textarea
            id={`newsletter-welcome-${edition.id}`}
            className={gInputClass(null, TEXTAREA)}
            value={welcome.value}
            maxLength={4000}
            readOnly={locked}
            onChange={(e) =>
              onEditionChange({
                ...edition,
                storyBlocks: edition.storyBlocks.map((b) => (b.id === welcome.id ? { ...b, value: e.target.value } : b)),
              })
            }
          />
        </GardenField>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Story block                                                         */
/* ------------------------------------------------------------------ */

export function StoryBlockEditor({
  edition,
  template,
  block,
  locked,
  onEditionChange,
  onTemplateChange,
  onRemoved,
}: BaseProps & {
  template: NewsletterSchoolTemplate;
  block: NewsletterStoryBlock;
  onTemplateChange: (template: NewsletterSchoolTemplate) => void;
  onRemoved?: () => void;
}) {
  const updateBlock = (updater: (b: NewsletterStoryBlock) => NewsletterStoryBlock) => {
    if (locked) return;
    onEditionChange({ ...edition, storyBlocks: edition.storyBlocks.map((b) => (b.id === block.id ? updater(b) : b)) });
  };

  const setHeading = (heading: string) => {
    if (locked) return;
    const nextEdition = {
      ...edition,
      storyBlocks: edition.storyBlocks.map((b) => (b.id === block.id ? { ...b, heading } : b)),
    };
    onTemplateChange({
      ...template,
      storyBlocks: template.storyBlocks.map((b) => (b.id === block.id ? { ...b, heading } : b)),
    });
    onEditionChange(nextEdition);
  };

  const remove = () => {
    if (locked) return;
    if (block.kind === "custom") {
      onTemplateChange({ ...template, storyBlocks: template.storyBlocks.filter((b) => b.id !== block.id) });
      onEditionChange({ ...edition, storyBlocks: edition.storyBlocks.filter((b) => b.id !== block.id) });
    } else {
      onTemplateChange({
        ...template,
        storyBlocks: template.storyBlocks.map((b) => (b.id === block.id ? { ...b, enabled: false } : b)),
      });
      onEditionChange({
        ...edition,
        storyBlocks: edition.storyBlocks.map((b) => (b.id === block.id ? { ...b, enabled: false } : b)),
      });
    }
    onRemoved?.();
  };

  const headingId = `newsletter-block-heading-${block.id}`;
  const valueId = `newsletter-block-value-${block.id}`;

  return (
    <div className="flex flex-col gap-4">
      <GardenField id={headingId} label="Section heading" hint="Used for this section in every new edition.">
        <input
          id={headingId}
          className={gInputClass()}
          value={block.heading}
          maxLength={120}
          readOnly={locked}
          onChange={(e) => setHeading(e.target.value)}
        />
      </GardenField>
      <GardenField id={valueId} label={block.prompt} optional={block.optional}>
        {block.starter ? <Hint>{block.starter}</Hint> : null}
        <textarea
          id={valueId}
          className={gInputClass(null, `${TEXTAREA} mt-1.5`)}
          value={block.value}
          maxLength={4000}
          readOnly={locked}
          data-newsletter-story-value=""
          onChange={(e) => updateBlock((b) => ({ ...b, value: e.target.value }))}
        />
      </GardenField>
      <Hint>Paste a link (https://…) and families can tap it.</Hint>
      {block.kind === "learning" ? <Hint>Families read it as “This week, we explored …”.</Hint> : null}
      {block.kind === "next" ? <Hint>Families read it as “Next week, we’ll explore …”.</Hint> : null}
      <div className="border-t-[1.5px] border-dashed border-[var(--sf-ink)]/12 pt-4">
        <button type="button" className={block.kind === "custom" ? gBtnDangerSm : gBtnOutlineSm} disabled={locked} onClick={remove}>
          {block.kind === "custom" ? <Trash2 className="h-4 w-4" aria-hidden /> : <EyeOff className="h-4 w-4" aria-hidden />}
          {block.kind === "custom" ? "Remove section" : "Hide section"}
        </button>
        <Hint>
          {block.kind === "custom"
            ? "Removes it from this edition and future ones."
            : "Turn it back on any time in Edit sections."}
        </Hint>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Teacher updates                                                     */
/* ------------------------------------------------------------------ */

export function TeacherUpdatesEditor({
  edition,
  locked,
  onEditionChange,
  staffMembers,
  staffLoading,
  staffError,
  onRetryStaff,
}: BaseProps & {
  staffMembers: StaffMemberRecord[];
  staffLoading: boolean;
  staffError: string | null;
  onRetryStaff: () => void;
}) {
  const activeStaff = staffMembers.filter((m) => m.employmentStatus === "active");
  if (staffLoading && !staffMembers.length) {
    return <p className="m-0 text-[14px] font-semibold text-[var(--sf-soft)]">Loading staff…</p>;
  }
  if (staffError) {
    return (
      <GardenNotice
        tone="alert"
        title="Couldn't load your staff"
        role="alert"
        action={
          <button type="button" className={gBtnOutlineXs} onClick={onRetryStaff}>
            <RotateCw className="h-3.5 w-3.5" aria-hidden />
            Try again
          </button>
        }
      >
        {staffError}
      </GardenNotice>
    );
  }
  if (!activeStaff.length) {
    return <Hint>No active staff yet. Add staff from My School → Staff.</Hint>;
  }
  return (
    <div className="flex flex-col gap-4">
      <Hint>Enter each teacher&apos;s update for this edition. Teachers left blank are skipped.</Hint>
      {activeStaff.map((member) => {
        const name = staffDisplayName(member);
        const id = `newsletter-teacher-${member.id}`;
        return (
          <GardenField key={member.id} id={id} label={name} optional>
            <textarea
              id={id}
              className={gInputClass(null, "min-h-[104px] resize-y leading-relaxed")}
              value={edition.teacherUpdates[member.id] ?? ""}
              readOnly={locked}
              placeholder={`${name.split(" ")[0]}'s update for this week…`}
              maxLength={4000}
              onChange={(e) =>
                onEditionChange({
                  ...edition,
                  teacherUpdates: { ...edition.teacherUpdates, [member.id]: e.target.value },
                })
              }
            />
          </GardenField>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Dates                                                               */
/* ------------------------------------------------------------------ */

function EventForm({
  initial,
  defaultDate,
  onSave,
  onCancel,
}: {
  initial: NewsletterEvent | null;
  defaultDate: string;
  onSave: (event: NewsletterEvent) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [date, setDate] = useState(initial?.date ?? defaultDate);
  const [time, setTime] = useState(initial?.time ?? "");
  const [note, setNote] = useState(initial?.note ?? "");
  const [error, setError] = useState<string | null>(null);
  const key = initial?.id ?? "new";

  const save = () => {
    if (!title.trim() || !date) {
      setError("Add an event name and date.");
      return;
    }
    onSave({ id: initial?.id ?? createNewsletterId(), title: title.trim(), date, time: time.trim(), note: note.trim() });
  };

  return (
    <div className="flex flex-col gap-3 rounded-[18px] border-[1.5px] border-[var(--sf-ink)]/15 bg-[var(--sf-paper)] p-4">
      <GardenField id={`event-title-${key}`} label="Event" required error={error && !title.trim() ? error : null}>
        <input
          id={`event-title-${key}`}
          className={gInputClass(error && !title.trim() ? error : null)}
          value={title}
          maxLength={150}
          placeholder="Family garden morning"
          onChange={(e) => setTitle(e.target.value)}
        />
      </GardenField>
      <div className="grid gap-3 min-[420px]:grid-cols-2">
        <GardenField id={`event-date-${key}`} label="Date" required error={error && !date ? error : null}>
          <input id={`event-date-${key}`} type="date" className={gInputClass()} value={date} onChange={(e) => setDate(e.target.value)} />
        </GardenField>
        <GardenField id={`event-time-${key}`} label="Time" optional>
          <input
            id={`event-time-${key}`}
            className={gInputClass()}
            value={time}
            maxLength={80}
            placeholder="9:00 AM"
            onChange={(e) => setTime(e.target.value)}
          />
        </GardenField>
      </div>
      <GardenField id={`event-note-${key}`} label="Details" optional hint="Paste a link (https://…) and families can tap it.">
        <textarea
          id={`event-note-${key}`}
          className={gInputClass(null, "min-h-[80px] resize-y")}
          value={note}
          maxLength={500}
          onChange={(e) => setNote(e.target.value)}
        />
      </GardenField>
      <div className="flex flex-wrap justify-end gap-2">
        <button type="button" className={gBtnOutlineSm} onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className={gBtnPopSm} onClick={save} data-testid="newsletter-event-save">
          Save date
        </button>
      </div>
    </div>
  );
}

export function DatesEditor({ edition, locked, onEditionChange, onToast }: BaseProps) {
  const [editing, setEditing] = useState<string | "new" | null>(edition.events.length ? null : "new");
  const atCap = edition.events.length >= MAX_NEWSLETTER_EVENTS;

  const saveEvent = (event: NewsletterEvent) => {
    const exists = edition.events.some((e) => e.id === event.id);
    if (!exists && edition.events.length >= MAX_NEWSLETTER_EVENTS) {
      onToast(`Up to ${MAX_NEWSLETTER_EVENTS} dates.`, "info", { description: "Remove a date to add another." });
      return;
    }
    const events = exists ? edition.events.map((e) => (e.id === event.id ? event : e)) : [...edition.events, event];
    events.sort((a, b) => a.date.localeCompare(b.date));
    onEditionChange({ ...edition, events });
    setEditing(null);
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="m-0 text-[13px] font-extrabold tabular-nums text-[var(--sf-soft)]">
        {edition.events.length} of {MAX_NEWSLETTER_EVENTS} dates
      </p>
      {edition.events.map((event) =>
        editing === event.id ? (
          <EventForm
            key={event.id}
            initial={event}
            defaultDate={edition.week}
            onSave={saveEvent}
            onCancel={() => setEditing(null)}
          />
        ) : (
          <div
            key={event.id}
            className="flex items-start gap-3 rounded-[16px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white px-3.5 py-3"
          >
            <span className="flex w-12 shrink-0 flex-col items-center rounded-xl bg-[var(--sf-peach)] py-1.5 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[var(--sf-clay-deep)]">
              {shortDate(event.date, { month: "short" })}
              <span className="sf-display text-[1.2rem] leading-none tracking-normal text-[var(--sf-ink)]">
                {shortDate(event.date, { day: "numeric" })}
              </span>
            </span>
            <div className="min-w-0 flex-1">
              <p className="m-0 truncate text-[14.5px] font-extrabold text-[var(--sf-ink)]">{event.title}</p>
              {event.time ? <p className="m-0 text-[13px] font-semibold text-[var(--sf-soft)]">{event.time}</p> : null}
              {event.note ? <p className="m-0 line-clamp-2 text-[13px] text-[var(--sf-soft)]">{event.note}</p> : null}
            </div>
            <button type="button" className={gIconBtn} aria-label={`Edit ${event.title}`} disabled={locked} onClick={() => setEditing(event.id)}>
              <Pencil className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              className={gIconBtn}
              aria-label={`Remove ${event.title}`}
              disabled={locked}
              onClick={() => onEditionChange({ ...edition, events: edition.events.filter((e) => e.id !== event.id) })}
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          </div>
        ),
      )}
      {editing === "new" && !locked ? (
        <EventForm initial={null} defaultDate={edition.week} onSave={saveEvent} onCancel={() => setEditing(null)} />
      ) : (
        <button
          type="button"
          className={`${gLinkSm} self-start`}
          disabled={locked || atCap}
          onClick={() => setEditing("new")}
          data-testid="newsletter-add-event"
        >
          <CalendarPlus className="h-4 w-4" aria-hidden />
          Add date
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Reminders                                                           */
/* ------------------------------------------------------------------ */

export function RemindersEditor({ edition, locked, onEditionChange, onToast }: BaseProps) {
  const atCap = edition.reminders.length >= MAX_NEWSLETTER_REMINDERS;
  const setReminders = (reminders: NewsletterEdition["reminders"]) => onEditionChange({ ...edition, reminders });
  return (
    <div className="flex flex-col gap-3">
      <p className="m-0 text-[13px] font-extrabold tabular-nums text-[var(--sf-soft)]">
        {edition.reminders.length} of {MAX_NEWSLETTER_REMINDERS} reminders
      </p>
      {edition.reminders.map((reminder, index) => {
        const id = `newsletter-reminder-${reminder.id}`;
        return (
          <div key={reminder.id} className="rounded-[16px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white p-3">
            <div className="flex items-center gap-2">
              <label htmlFor={id} className="sr-only">
                Reminder {index + 1}
              </label>
              <input
                id={id}
                className={gInputClass()}
                value={reminder.text}
                readOnly={locked}
                placeholder="Reminder for families"
                maxLength={500}
                onChange={(e) => setReminders(edition.reminders.map((r) => (r.id === reminder.id ? { ...r, text: e.target.value } : r)))}
              />
              <button
                type="button"
                className={gIconBtn}
                aria-label="Remove reminder"
                disabled={locked}
                onClick={() => setReminders(edition.reminders.filter((r) => r.id !== reminder.id))}
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-[13px] font-bold text-[var(--sf-ink)]/80">
              <input
                type="checkbox"
                className="h-4 w-4 accent-[var(--sf-clay)]"
                checked={reminder.keep}
                disabled={locked}
                onChange={(e) => setReminders(edition.reminders.map((r) => (r.id === reminder.id ? { ...r, keep: e.target.checked } : r)))}
              />
              Reuse next week
            </label>
          </div>
        );
      })}
      <button
        type="button"
        className={`${gLinkSm} self-start`}
        disabled={locked || atCap}
        onClick={() => {
          if (atCap) {
            onToast(`Up to ${MAX_NEWSLETTER_REMINDERS} reminders.`);
            return;
          }
          setReminders([...edition.reminders, { id: createNewsletterId(), text: "", keep: false }]);
        }}
      >
        <Plus className="h-4 w-4" aria-hidden />
        Add reminder
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Photos                                                              */
/* ------------------------------------------------------------------ */

export function PhotosEditor({
  edition,
  locked,
  onEditionChange,
  slug,
  galleryEnabled,
  onUploadPhotos,
  onOpenGalleryPicker,
}: BaseProps & {
  slug: string;
  galleryEnabled: boolean;
  onUploadPhotos: () => void;
  onOpenGalleryPicker: () => void;
}) {
  const atCap = edition.photos.length >= MAX_NEWSLETTER_PHOTOS;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {galleryEnabled ? (
          <button type="button" className={gBtnOutlineSm} disabled={locked || atCap} onClick={onOpenGalleryPicker}>
            <Images className="h-4 w-4" aria-hidden />
            From library
          </button>
        ) : null}
        <button type="button" className={gBtnOutlineSm} disabled={locked || atCap} onClick={onUploadPhotos}>
          <ImageIcon className="h-4 w-4" aria-hidden />
          From device
        </button>
        <span className="text-[13px] font-extrabold tabular-nums text-[var(--sf-soft)]">
          {edition.photos.length} / {MAX_NEWSLETTER_PHOTOS}
        </span>
      </div>
      {!galleryEnabled ? (
        <Hint>
          The school photo library is off. Upload from your device, or manage photos under{" "}
          <a href={`/school/${slug}/admin/photos`} className={`underline ${G_FOCUS}`}>
            My School → Photos
          </a>
          .
        </Hint>
      ) : null}
      <Hint>{newsletterPhotoCaptionLimitMessage()}</Hint>
      {edition.photos.length === 0 ? (
        <div className="flex min-h-[110px] items-center justify-center rounded-[18px] border-2 border-dashed border-[var(--sf-ink)]/18 text-[14px] font-semibold text-[var(--sf-soft)]">
          No photos yet.
        </div>
      ) : (
        <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 min-[420px]:grid-cols-2">
          {edition.photos.map((photo) => {
            const captionId = `newsletter-photo-caption-${photo.id}`;
            return (
              <li key={photo.id} className="overflow-hidden rounded-[16px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white">
                <div className="relative aspect-[4/3]">
                  <NewsletterMediaImage
                    instanceKey={photo.id}
                    src={photo.src}
                    alt={photo.caption || "Newsletter photo"}
                    className="absolute inset-0 h-full w-full"
                    imageClassName="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    className={`${gIconBtn} absolute right-2 top-2 !h-8 !w-8 bg-white/95`}
                    disabled={locked}
                    aria-label="Remove photo"
                    onClick={() => onEditionChange({ ...edition, photos: edition.photos.filter((p) => p.id !== photo.id) })}
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                </div>
                <div className="p-2.5">
                  <label htmlFor={captionId} className="sr-only">
                    Caption
                  </label>
                  <input
                    id={captionId}
                    className={gInputClass(null, "!py-2 !text-[14px]")}
                    value={photo.caption}
                    readOnly={locked}
                    placeholder="Caption (optional)"
                    maxLength={MAX_NEWSLETTER_PHOTO_CAPTION_LENGTH}
                    onChange={(e) =>
                      onEditionChange({
                        ...edition,
                        photos: edition.photos.map((p) => (p.id === photo.id ? { ...p, caption: e.target.value } : p)),
                      })
                    }
                  />
                  {photo.caption.length >= NEWSLETTER_PHOTO_CAPTION_COUNT_SHOW_AT ? (
                    <p className="m-0 mt-1 text-right text-[12px] font-semibold tabular-nums text-[var(--sf-soft)]">
                      {photo.caption.length} / {MAX_NEWSLETTER_PHOTO_CAPTION_LENGTH}
                    </p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
