"use client";

import { useState } from "react";
import { plusDays, weekLabel } from "@/lib/school-admin/newsletter/newsletter-dates";
import { createEditionFromTemplate } from "@/lib/school-admin/newsletter/newsletter-template";
import {
  createNewsletterId,
  type NewsletterEdition,
  type NewsletterWorkspaceState,
} from "@/lib/school-admin/newsletter/newsletter-types";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import SchoolAdminDatePicker from "@/components/school-admin/ui/SchoolAdminDatePicker";
import styles from "./newsletter-workspace.module.css";

type NewsletterNewEditionModalProps = {
  open: boolean;
  workspace: NewsletterWorkspaceState;
  sourceEdition: NewsletterEdition | null;
  onClose: () => void;
  onCreated: (edition: NewsletterEdition) => void;
};

export default function NewsletterNewEditionModal({
  open,
  workspace,
  sourceEdition,
  onClose,
  onCreated,
}: NewsletterNewEditionModalProps) {
  const { theme, C } = useSchoolAdminStoryTheme();
  const reference = sourceEdition ?? workspace.editions[0] ?? null;
  const defaultWeek = plusDays(reference?.week || "2026-10-26", 7);
  const [week, setWeek] = useState(defaultWeek);
  const [carryReminders, setCarryReminders] = useState(true);
  const [carryEvents, setCarryEvents] = useState(true);

  if (!open) return null;

  const create = () => {
    if (!week) return;
    const edition = createEditionFromTemplate(workspace.template, {
      week,
      layout: reference?.layout ?? "storybook",
      title: "This week at our school",
    });
    if (reference) {
      edition.reminders = carryReminders
        ? reference.reminders
            .filter((r) => r.keep && r.text.trim())
            .map((r) => ({ ...r, id: createNewsletterId() }))
        : [];
      edition.events = carryEvents
        ? reference.events
            .filter((x) => x.date >= week)
            .map((x) => ({ ...x, id: createNewsletterId() }))
        : [];
    }
    onCreated(edition);
    onClose();
  };

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
        aria-labelledby="newsletter-new-edition-title"
      >
        <div className={styles.modalHead}>
          <div>
            <div className={styles.kicker}>Newsletter</div>
            <h2 id="newsletter-new-edition-title">New newsletter</h2>
          </div>
          <AdminButton theme={theme} variant="outline" size="compact" onClick={onClose}>
            Close
          </AdminButton>
        </div>
        <p className={styles.helper} style={{ marginTop: 0 }}>
          Start a fresh draft for a new week. Your section layout and prompts stay the same.
        </p>
        {reference ? (
          <p className={styles.helper}>
            Copying options from {weekLabel(reference)}.
          </p>
        ) : null}
        <div className={styles.field}>
          <label htmlFor="newsletter-new-edition-week">Week beginning</label>
          <SchoolAdminDatePicker
            id="newsletter-new-edition-week"
            C={C}
            value={week}
            onChange={setWeek}
            placeholder="Select start date"
          />
        </div>
        {reference ? (
          <>
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
          </>
        ) : null}
        <div className={styles.modalActions}>
          <AdminButton theme={theme} variant="outline" onClick={onClose}>
            Cancel
          </AdminButton>
          <AdminButton theme={theme} variant="primary" onClick={create}>
            Create draft
          </AdminButton>
        </div>
      </section>
    </div>
  );
}
