"use client";

import { Check, Copy, Eye, Loader2, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
import { GardenSteps, GardenSwitch } from "@/components/school-admin/garden/kit";
import { gBtnOutlineSm, gBtnPopSm, gLinkSm } from "@/components/school-parent/garden/ui";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
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
  onToast: (message: string, tone?: "success" | "error" | "info") => void;
  onShowPreview: () => void;
  onExportHtml: () => void;
  onExportText: () => void;
  /** Resolves true when the text reached the clipboard. */
  onCopyText: () => Promise<boolean>;
  onPublish: (notifyFamilies: boolean) => Promise<void>;
  /** Close the dialog and put the cursor in an editor field (publish checklist "Fix"). */
  onFocusField?: (field: "title" | "week" | "content") => void;
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

const PUBLISH_ERROR_ID = "newsletter-publish-error";

function PublishBody({
  activeEdition,
  onClose,
  onShowPreview,
  onPublish,
  onFocusField,
}: NewsletterModalsProps) {
  const hasTitle = Boolean(activeEdition.title.trim());
  const hasWeek = Boolean(activeEdition.week);
  const hasContent = editionHasContent(activeEdition);
  const ready = hasTitle && hasWeek && hasContent;
  const [notifyFamilies, setNotifyFamilies] = useState(true);
  const [publishing, setPublishing] = useState(false);

  const fix = (field: "title" | "week" | "content") =>
    onFocusField ? (
      <button type="button" className={`${gLinkSm} !text-[12.5px]`} onClick={() => onFocusField(field)}>
        Fix
      </button>
    ) : undefined;

  const steps = [
    {
      id: "title",
      title: hasTitle ? "Title ready" : "Add a title",
      description: hasTitle ? activeEdition.title.trim() : "Families see it at the top of the newsletter.",
      status: hasTitle ? ("done" as const) : ("blocked" as const),
      aside: hasTitle ? undefined : fix("title"),
    },
    {
      id: "week",
      title: hasWeek ? weekLabel(activeEdition) : "Choose a week",
      description: hasWeek ? undefined : "Pick the week this edition covers.",
      status: hasWeek ? ("done" as const) : ("blocked" as const),
      aside: hasWeek ? undefined : fix("week"),
    },
    {
      id: "content",
      title: hasContent ? "Content ready" : "Add a story, note, date, reminder, or photo",
      status: hasContent ? ("done" as const) : ("blocked" as const),
      aside: hasContent ? undefined : fix("content"),
    },
  ];

  const publish = () => {
    setPublishing(true);
    void onPublish(notifyFamilies)
      .then(() => {
        onClose();
        onShowPreview();
        adminToast.dismiss(PUBLISH_ERROR_ID);
        adminToast.success("Published.", {
          id: "newsletter-publish",
          description: notifyFamilies
            ? "Families can read it in the parent portal and were notified by email and push."
            : "Families can read it in the parent portal. No notification was sent.",
        });
      })
      .catch((err: unknown) => {
        adminToast.error("Couldn't publish.", {
          id: PUBLISH_ERROR_ID,
          description: `${formatActionError(err, "Could not publish this newsletter.")} It's still a draft — families can't see it yet.`,
          action: { label: "Retry", onClick: publish },
        });
      })
      .finally(() => {
        setPublishing(false);
      });
  };

  return (
    <>
      <GardenSteps
        steps={steps}
        progressLabel="Ready to publish"
        compactDone={false}
        data-testid="newsletter-publish-checklist"
      />
      <div className="mt-[18px] rounded-[16px] border-[1.5px] border-[var(--sf-ink)]/10 bg-white p-3.5">
        <GardenSwitch
          checked={notifyFamilies}
          onChange={setNotifyFamilies}
          disabled={publishing}
          label="Notify families by email and mobile push"
          description="Families can read this newsletter in the parent portal either way."
        />
      </div>
      {!ready ? (
        <p className="m-0 mt-3 text-[13px] font-semibold text-[var(--sf-soft)]" role="status">
          Finish the steps above to publish.
        </p>
      ) : null}
      <div className={styles.modalActions}>
        <button
          type="button"
          className={gBtnOutlineSm}
          disabled={publishing}
          onClick={() => {
            onClose();
            onShowPreview();
          }}
        >
          <Eye className="h-4 w-4" aria-hidden />
          Preview
        </button>
        <button
          type="button"
          className={gBtnPopSm}
          disabled={!ready || publishing}
          aria-busy={publishing || undefined}
          onClick={publish}
          data-testid="newsletter-publish-confirm"
        >
          {publishing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Publishing…
            </>
          ) : (
            <>
              <Send className="h-4 w-4" aria-hidden />
              Publish
            </>
          )}
        </button>
      </div>
    </>
  );
}

function ExportBody({ onExportHtml, onExportText, onCopyText }: NewsletterModalsProps) {
  const [copied, setCopied] = useState(false);
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    if (!copied) return undefined;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  return (
    <>
      <div className={styles.exportOptions}>
        <button type="button" className={gBtnPopSm} onClick={onExportHtml}>
          Download HTML
        </button>
        <button type="button" className={gBtnOutlineSm} onClick={onExportText}>
          Download text
        </button>
        <button
          type="button"
          className={gBtnOutlineSm}
          disabled={copying}
          aria-live="polite"
          onClick={() => {
            setCopying(true);
            void onCopyText()
              .then((ok) => setCopied(ok))
              .finally(() => setCopying(false));
          }}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-[var(--sf-forest)]" aria-hidden />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" aria-hidden />
              Copy text
            </>
          )}
        </button>
      </div>
      <p className={styles.helper}>
        HTML exports a standalone page, not an email-delivery template. Nothing is sent.
      </p>
    </>
  );
}
