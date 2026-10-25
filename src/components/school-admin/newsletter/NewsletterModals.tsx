"use client";

import { Check, Info, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { weekLabel, plusDays } from "@/lib/school-admin/newsletter/newsletter-dates";
import { editionHasContent } from "@/lib/school-admin/newsletter/newsletter-render";
import {
  applyTemplateToEdition,
  createEditionFromTemplate,
} from "@/lib/school-admin/newsletter/newsletter-template";
import {
  createNewsletterId,
  type NewsletterEdition,
  type NewsletterEvent,
  type NewsletterSchoolTemplate,
  type NewsletterSections,
  type NewsletterStoryBlockKind,
  type NewsletterWorkspaceState,
} from "@/lib/school-admin/newsletter/newsletter-types";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminTextLink from "@/components/school-admin/ui/story/AdminTextLink";
import styles from "./newsletter-workspace.module.css";

export type NewsletterModalState =
  | { type: "editions" }
  | { type: "sections" }
  | { type: "event"; index?: number }
  | { type: "nextWeek" }
  | { type: "publish" }
  | { type: "export" }
  | {
      type: "confirm";
      title: string;
      body: string;
      confirmLabel: string;
      onConfirm: () => void;
    };

type NewsletterModalsProps = {
  modal: NewsletterModalState | null;
  workspace: NewsletterWorkspaceState;
  activeEdition: NewsletterEdition;
  onClose: () => void;
  onWorkspaceChange: (next: NewsletterWorkspaceState) => void;
  onActiveEditionChange: (edition: NewsletterEdition) => void;
  onTemplateChange: (template: NewsletterSchoolTemplate) => void;
  onToast: (message: string) => void;
  onShowPreview: () => void;
  onEditorTabStory: () => void;
  onExportHtml: () => void;
  onExportText: () => void;
  onCopyText: () => void;
};

export default function NewsletterModals(props: NewsletterModalsProps) {
  const { modal, onClose } = props;
  const { theme } = useSchoolAdminStoryTheme();

  useEffect(() => {
    if (!modal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal, onClose]);

  if (!modal) return null;

  let body: React.ReactNode = null;
  if (modal.type === "editions") body = <EditionsBody {...props} />;
  if (modal.type === "sections") body = <SectionsBody {...props} />;
  if (modal.type === "event") body = <EventBody {...props} index={modal.index} />;
  if (modal.type === "nextWeek") body = <NextWeekBody {...props} />;
  if (modal.type === "publish") body = <PublishBody {...props} />;
  if (modal.type === "export") body = <ExportBody {...props} />;
  if (modal.type === "confirm") {
    body = (
      <>
        <p>{modal.body}</p>
        <div className={styles.modalActions}>
          <AdminButton theme={theme} variant="outline" onClick={onClose}>
            Cancel
          </AdminButton>
          <AdminButton
            theme={theme}
            variant="primary"
            onClick={() => {
              modal.onConfirm();
              onClose();
            }}
          >
            {modal.confirmLabel}
          </AdminButton>
        </div>
      </>
    );
  }

  const title =
    modal.type === "editions"
      ? "Editions"
      : modal.type === "sections"
        ? "Newsletter sections"
        : modal.type === "event"
          ? modal.index === undefined
            ? "Add date"
            : "Edit date"
          : modal.type === "nextWeek"
            ? "Start next week"
            : modal.type === "publish"
              ? "Review & publish"
              : modal.type === "export"
                ? "Export newsletter"
                : modal.type === "confirm"
                  ? modal.title
                  : undefined;

  return (
    <div
      className={styles.modalOverlay}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="newsletter-modal-title"
      >
        <div className={styles.modalHead}>
          <div>
            <div className={styles.kicker}>Newsletter</div>
            {title ? <h2 id="newsletter-modal-title">{title}</h2> : null}
          </div>
          <AdminButton theme={theme} variant="outline" size="compact" onClick={onClose}>
            Close
          </AdminButton>
        </div>
        {body}
      </section>
    </div>
  );
}

function EditionsBody({
  workspace,
  onClose,
  onWorkspaceChange,
  onEditorTabStory,
}: NewsletterModalsProps) {
  return (
    <>
      {workspace.editions.map((edition) => (
        <button
          key={edition.id}
          type="button"
          className={styles.editionItem}
          onClick={() => {
            onWorkspaceChange({ ...workspace, activeEditionId: edition.id });
            onEditorTabStory();
            onClose();
          }}
        >
          <span>
            <strong>{edition.title || "Untitled edition"}</strong>
            <small>
              {weekLabel(edition)}
              {edition.id === workspace.activeEditionId ? " · Open" : ""}
            </small>
          </span>
          <span
            className={`${styles.chip} ${edition.status === "published" ? styles.chipSuccess : ""}`}
          >
            {edition.status === "published" ? "Published" : "Draft"}
          </span>
        </button>
      ))}
    </>
  );
}

const STORY_KIND_LABELS: Record<NewsletterStoryBlockKind, string> = {
  welcome: "Opening note",
  learning: "This week's learning",
  moment: "A moment worth sharing",
  next: "Looking ahead",
  family: "At home",
  quote: "Child's words",
  custom: "Custom section",
};

const SECTION_TOGGLE_LABELS: Record<keyof NewsletterSections, string> = {
  teacherUpdates: "Teacher updates",
  events: "Dates",
  reminders: "Reminders",
  photos: "Photos",
};

function SectionsBody({
  workspace,
  activeEdition,
  onClose,
  onWorkspaceChange,
  onToast,
}: NewsletterModalsProps) {
  const { theme } = useSchoolAdminStoryTheme();
  const [template, setTemplate] = useState(() => ({
    ...workspace.template,
    storyBlocks: workspace.template.storyBlocks.map((b) => ({ ...b })),
    sections: { ...workspace.template.sections },
  }));

  const toggleBlock = (id: string) => {
    setTemplate((prev) => ({
      ...prev,
      storyBlocks: prev.storyBlocks.map((b) =>
        b.id === id ? { ...b, enabled: !b.enabled } : b,
      ),
    }));
  };

  const toggleSection = (key: keyof NewsletterSections) => {
    setTemplate((prev) => ({
      ...prev,
      sections: { ...prev.sections, [key]: !prev.sections[key] },
    }));
  };

  const fixedBlocks = template.storyBlocks.filter((b) => b.kind !== "custom");
  const customBlocks = template.storyBlocks.filter((b) => b.kind === "custom");

  return (
    <>
      <p className={styles.helper} style={{ marginTop: 0 }}>
        Choose which story prompts and sections appear. Headings are edited on The story tab.
      </p>
      <div className={styles.sectionToggles}>
        {fixedBlocks.map((block) => (
          <label key={block.id} className={styles.toggleRow}>
            <input
              type="checkbox"
              checked={block.enabled}
              onChange={() => toggleBlock(block.id)}
            />
            {STORY_KIND_LABELS[block.kind]}
          </label>
        ))}
      </div>
      <hr className={styles.divider} />
      <div className={styles.sectionToggles}>
        {(Object.keys(SECTION_TOGGLE_LABELS) as (keyof NewsletterSections)[]).map((key) => (
          <label key={key} className={styles.toggleRow}>
            <input
              type="checkbox"
              checked={template.sections[key]}
              onChange={() => toggleSection(key)}
            />
            {SECTION_TOGGLE_LABELS[key]}
          </label>
        ))}
      </div>
      <hr className={styles.divider} />
      <div className={styles.smallHeadingRow}>
        <span className={styles.smallHeading}>Custom prompts</span>
        <AdminTextLink
          theme={theme}
          onClick={() => {
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
          }}
        >
          + Add
        </AdminTextLink>
      </div>
      {customBlocks.map((block, index) => (
        <div key={block.id} className={styles.customRow}>
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
      <div className={styles.modalActions}>
        <AdminButton
          theme={theme}
          variant="primary"
          onClick={() => {
            const nextEdition = applyTemplateToEdition(template, activeEdition);
            onWorkspaceChange({
              ...workspace,
              template,
              editions: workspace.editions.map((e) =>
                e.id === activeEdition.id ? nextEdition : e,
              ),
            });
            onClose();
          }}
        >
          Apply
        </AdminButton>
      </div>
    </>
  );
}

function EventBody({
  activeEdition,
  onClose,
  onActiveEditionChange,
  index,
}: NewsletterModalsProps & { index?: number }) {
  const { theme } = useSchoolAdminStoryTheme();
  const existing = index !== undefined ? activeEdition.events[index] : null;
  const [title, setTitle] = useState(existing?.title ?? "");
  const [date, setDate] = useState(existing?.date ?? activeEdition.week);
  const [time, setTime] = useState(existing?.time ?? "");
  const [note, setNote] = useState(existing?.note ?? "");
  const [error, setError] = useState("");

  const save = () => {
    if (!title.trim() || !date) {
      setError("Add an event name and date.");
      return;
    }
    const updated: NewsletterEvent = {
      id: existing?.id ?? createNewsletterId(),
      title: title.trim(),
      date,
      time: time.trim(),
      note: note.trim(),
    };
    const events = [...activeEdition.events];
    if (index === undefined) events.push(updated);
    else events[index] = updated;
    events.sort((a, b) => a.date.localeCompare(b.date));
    onActiveEditionChange({ ...activeEdition, events });
    onClose();
  };

  return (
    <>
      <div className={styles.field}>
        <label>Event</label>
        <input
          className={styles.input}
          value={title}
          maxLength={150}
          placeholder="Family garden morning"
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className={styles.twoFields}>
        <div className={styles.field}>
          <label>Date</label>
          <input
            className={styles.input}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label>
            Time <span>Optional</span>
          </label>
          <input
            className={styles.input}
            value={time}
            maxLength={80}
            placeholder="9:00 AM · school time"
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
      </div>
      <div className={styles.field}>
        <label>
          Details <span>Optional</span>
        </label>
        <textarea className={styles.input} value={note} maxLength={500} onChange={(e) => setNote(e.target.value)} />
      </div>
      {error ? <div className={styles.error}>{error}</div> : null}
      <div className={styles.modalActions}>
        <AdminButton theme={theme} variant="primary" onClick={save}>
          Save date
        </AdminButton>
      </div>
    </>
  );
}

function NextWeekBody({
  activeEdition,
  workspace,
  onClose,
  onWorkspaceChange,
  onEditorTabStory,
  onToast,
}: NewsletterModalsProps) {
  const { theme } = useSchoolAdminStoryTheme();
  const defaultWeek = plusDays(activeEdition.week || "2026-10-26", 7);
  const [week, setWeek] = useState(defaultWeek);
  const [carryReminders, setCarryReminders] = useState(true);
  const [carryEvents, setCarryEvents] = useState(true);

  const create = () => {
    if (!week) return;
    const edition = createEditionFromTemplate(workspace.template, {
      week,
      layout: activeEdition.layout,
      title: "This week at our school",
    });
    edition.reminders = carryReminders
      ? activeEdition.reminders
          .filter((r) => r.keep && r.text.trim())
          .map((r) => ({ ...r, id: createNewsletterId() }))
      : [];
    edition.events = carryEvents
      ? activeEdition.events
          .filter((x) => x.date >= week)
          .map((x) => ({ ...x, id: createNewsletterId() }))
      : [];
    onWorkspaceChange({
      ...workspace,
      editions: [edition, ...workspace.editions],
      activeEditionId: edition.id,
    });
    onEditorTabStory();
    onClose();
    onToast("New week ready.");
  };

  return (
    <>
      <div className={styles.field}>
        <label>Week beginning</label>
        <input
          className={styles.input}
          type="date"
          value={week}
          onChange={(e) => setWeek(e.target.value)}
        />
      </div>
      <label className={styles.checkLabel} style={{ fontSize: 11, marginTop: 20 }}>
        <input
          type="checkbox"
          checked={carryReminders}
          onChange={(e) => setCarryReminders(e.target.checked)}
        />
        Keep reminders marked &ldquo;Reuse next week&rdquo;
      </label>
      <label className={styles.checkLabel} style={{ fontSize: 11, marginTop: 12 }}>
        <input
          type="checkbox"
          checked={carryEvents}
          onChange={(e) => setCarryEvents(e.target.checked)}
        />
        Keep dates on or after the new week
      </label>
      <p className={styles.helper}>
        Same prompts and layout. Fresh stories and photos. This edition stays in your editions list.
      </p>
      <div className={styles.modalActions}>
        <AdminButton theme={theme} variant="primary" onClick={create}>
          Create draft
        </AdminButton>
      </div>
    </>
  );
}

function PublishBody({
  activeEdition,
  onClose,
  onShowPreview,
  onActiveEditionChange,
  onToast,
}: NewsletterModalsProps) {
  const { theme } = useSchoolAdminStoryTheme();
  const checks = useMemo(
    () => [
      {
        ok: Boolean(activeEdition.title.trim()),
        label: activeEdition.title.trim() ? "Title ready" : "Add a title",
      },
      {
        ok: Boolean(activeEdition.week),
        label: activeEdition.week ? weekLabel(activeEdition) : "Choose a week",
      },
      {
        ok: editionHasContent(activeEdition),
        label: editionHasContent(activeEdition)
          ? "Content ready"
          : "Add a story, note, date, reminder, or photo",
      },
    ],
    [activeEdition],
  );
  const ready = checks.every((c) => c.ok);
  const [ack, setAck] = useState(false);

  return (
    <>
      {checks.map((check) => (
        <div
          key={check.label}
          className={`${styles.reviewRow} ${check.ok ? "" : styles.reviewRowWarn}`}
        >
          {check.ok ? (
            <Check size={13} strokeWidth={1.65} aria-hidden />
          ) : (
            <Info size={13} strokeWidth={1.65} aria-hidden />
          )}
          <span>{check.label}</span>
        </div>
      ))}
      <label className={styles.checkLabel} style={{ fontSize: 11, marginTop: 18 }}>
        <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} />
        I understand this preview does not email families or update the parent portal.
      </label>
      <div className={styles.modalActions}>
        <AdminButton
          theme={theme}
          variant="outline"
          onClick={() => {
            onClose();
            onShowPreview();
          }}
        >
          Preview
        </AdminButton>
        <AdminButton
          theme={theme}
          variant="primary"
          disabled={!ready || !ack}
          onClick={() => {
            onActiveEditionChange({
              ...activeEdition,
              status: "published",
              publishedAt: new Date().toISOString(),
            });
            onClose();
            onShowPreview();
            onToast("Marked as published in this preview. Nothing was sent.");
          }}
        >
          Mark published (preview)
        </AdminButton>
      </div>
    </>
  );
}

function ExportBody({ onExportHtml, onExportText, onCopyText }: NewsletterModalsProps) {
  const { theme } = useSchoolAdminStoryTheme();
  return (
    <>
      <div className={styles.exportOptions}>
        <AdminButton theme={theme} variant="primary" onClick={onExportHtml}>
          Download HTML
        </AdminButton>
        <AdminButton theme={theme} variant="outline" onClick={onExportText}>
          Download text
        </AdminButton>
        <AdminButton theme={theme} variant="outline" onClick={onCopyText}>
          Copy text
        </AdminButton>
      </div>
      <p className={styles.helper}>
        HTML exports a standalone page, not an email-delivery template. Nothing is sent.
      </p>
    </>
  );
}
