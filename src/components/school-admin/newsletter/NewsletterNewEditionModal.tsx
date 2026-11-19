"use client";

import { useState } from "react";
import { plusDays, weekLabel } from "@/lib/school-admin/newsletter/newsletter-dates";
import {
  createNewsletterId,
  type NewsletterEdition,
  type NewsletterWorkspaceState,
} from "@/lib/school-admin/newsletter/newsletter-types";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import { BusyLabel, GardenField, gInputClass } from "@/components/school-admin/garden/kit";
import { GDialog } from "@/components/school-parent/garden/GDialog";
import { gBtnOutlineSm, gBtnPopSm } from "@/components/school-parent/garden/ui";

type NewsletterNewEditionModalProps = {
  open: boolean;
  workspace: NewsletterWorkspaceState;
  sourceEdition: NewsletterEdition | null;
  creating?: boolean;
  onClose: () => void;
  onCreate: (input: {
    week: string;
    cloneFromEditionId?: string;
    patchAfterCreate?: (edition: NewsletterEdition) => NewsletterEdition;
  }) => void | Promise<void>;
};

export default function NewsletterNewEditionModal({
  open,
  workspace,
  sourceEdition,
  creating = false,
  onClose,
  onCreate,
}: NewsletterNewEditionModalProps) {
  const { theme } = useSchoolAdminStoryTheme();
  const reference = sourceEdition ?? workspace.editions[0] ?? null;
  const defaultWeek = plusDays(reference?.week || new Date().toISOString().slice(0, 10), 7);
  const [week, setWeek] = useState(defaultWeek);
  const [carryReminders, setCarryReminders] = useState(true);
  const [carryEvents, setCarryEvents] = useState(true);

  const create = () => {
    if (!week || creating) return;

    void onCreate({
      week,
      cloneFromEditionId: reference?.id,
      patchAfterCreate: reference
        ? (edition) => ({
            ...edition,
            reminders: carryReminders
              ? reference.reminders
                  .filter((r) => r.keep && r.text.trim())
                  .map((r) => ({ ...r, id: createNewsletterId() }))
              : [],
            events: carryEvents
              ? reference.events
                  .filter((x) => x.date >= week)
                  .map((x) => ({ ...x, id: createNewsletterId() }))
              : [],
          })
        : undefined,
    });
  };

  const checkClass = "h-4 w-4 shrink-0 accent-[var(--sf-clay)]";

  return (
    <GDialog
      theme={theme}
      open={open}
      onClose={onClose}
      closeDisabled={creating}
      title="New newsletter"
      description="Start a fresh draft for a new week. Your section layout and prompts stay the same."
      data-testid="newsletter-new-edition-dialog"
      footer={
        <>
          <button type="button" className={gBtnOutlineSm} onClick={onClose} disabled={creating}>
            Cancel
          </button>
          <button
            type="button"
            className={gBtnPopSm}
            onClick={create}
            disabled={creating || !week}
            aria-busy={creating || undefined}
            data-testid="newsletter-new-edition-create"
          >
            <BusyLabel busy={creating} busyLabel="Creating…">
              Create draft
            </BusyLabel>
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {reference ? (
          <p className="m-0 text-[14px] font-semibold text-[var(--sf-soft)]">Copying options from {weekLabel(reference)}.</p>
        ) : null}
        <GardenField id="newsletter-new-edition-week" label="Week beginning" required>
          <input
            id="newsletter-new-edition-week"
            type="date"
            className={gInputClass()}
            value={week}
            onChange={(e) => setWeek(e.target.value)}
          />
        </GardenField>
        {reference ? (
          <div className="flex flex-col gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2.5 text-[14px] font-bold text-[var(--sf-ink)]">
              <input
                type="checkbox"
                className={checkClass}
                checked={carryReminders}
                onChange={(e) => setCarryReminders(e.target.checked)}
              />
              Keep reminders marked &ldquo;Reuse next week&rdquo;
            </label>
            <label className="inline-flex cursor-pointer items-center gap-2.5 text-[14px] font-bold text-[var(--sf-ink)]">
              <input
                type="checkbox"
                className={checkClass}
                checked={carryEvents}
                onChange={(e) => setCarryEvents(e.target.checked)}
              />
              Keep dates on or after the new week
            </label>
          </div>
        ) : null}
      </div>
    </GDialog>
  );
}
