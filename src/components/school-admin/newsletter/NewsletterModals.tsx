"use client";

import { Check, Info } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { weekLabel } from "@/lib/school-admin/newsletter/newsletter-dates";
import { MAX_NEWSLETTER_EVENTS } from "@/lib/school-admin/newsletter/newsletter-limits";
import { editionHasContent } from "@/lib/school-admin/newsletter/newsletter-render";
import {
  createNewsletterId,
  type NewsletterEdition,
  type NewsletterEvent,
  type NewsletterSchoolTemplate,
  type NewsletterWorkspaceState,
} from "@/lib/school-admin/newsletter/newsletter-types";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import NewsletterSectionsSheet from "./NewsletterSectionsSheet";
import styles from "./newsletter-workspace.module.css";

export type NewsletterModalState =
  | { type: "sections" }
  | { type: "event"; index?: number }
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
  onExportHtml: () => void;
  onExportText: () => void;
  onCopyText: () => void;
};

export default function NewsletterModals(props: NewsletterModalsProps) {
  const { modal, onClose } = props;
  const { theme } = useSchoolAdminStoryTheme();
  const [sectionsDraftKey, setSectionsDraftKey] = useState(0);
  const prevModalTypeRef = useRef(modal?.type);

  useEffect(() => {
    if (modal?.type === "sections" && prevModalTypeRef.current !== "sections") {
      setSectionsDraftKey((key) => key + 1);
    }
    prevModalTypeRef.current = modal?.type;
  }, [modal?.type]);

  useEffect(() => {
    if (!modal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal, onClose]);

  if (modal?.type === "sections") {
    return (
      <NewsletterSectionsSheet
        key={sectionsDraftKey}
        open
        workspace={props.workspace}
        activeEdition={props.activeEdition}
        onClose={onClose}
        onWorkspaceChange={props.onWorkspaceChange}
        onToast={props.onToast}
      />
    );
  }

  if (!modal) return null;

  let body: React.ReactNode = null;
  if (modal.type === "event") body = <EventBody {...props} index={modal.index} />;
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
    modal.type === "event"
      ? modal.index === undefined
        ? "Add date"
        : "Edit date"
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

function EventBody({
  activeEdition,
  onClose,
  onActiveEditionChange,
  onToast,
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
    if (index === undefined) {
      if (events.length >= MAX_NEWSLETTER_EVENTS) {
        onToast(`Up to ${MAX_NEWSLETTER_EVENTS} dates.`);
        return;
      }
      events.push(updated);
    } else events[index] = updated;
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
