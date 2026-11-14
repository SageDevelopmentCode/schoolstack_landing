"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { Tick } from "@/components/garden/ui";
import { childFirstName } from "@/components/school-parent/children/parent-children-utils";
import { GConfirmDialog } from "@/components/school-parent/garden/GDialog";
import GSidePanel from "@/components/school-parent/garden/GSidePanel";
import {
  ChildThumb,
  GChip,
  GProgress,
  gBtnOutlineSm,
  gBtnPopSm,
  gLinkSm,
} from "@/components/school-parent/garden/ui";
import {
  CONSENT_ICONS,
  CONSENT_TINTS,
  consentChipTone,
  joinNames,
  type PhotoPermissionLearner,
} from "@/components/school-parent/photos/photo-permissions-ui";
import type {
  PhotoPermissionChange,
  PhotoPermissionSaveResult,
} from "@/components/school-parent/photos/useParentPhotosModel";
import { parentToast } from "@/lib/school-parent/parent-toast";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { PhotoMediaConsentState } from "@/lib/students/load-student-photo-media-consents";
import {
  PHOTO_MEDIA_CONSENT_OPTIONS,
  photoMediaConsentLabel,
  type PhotoMediaConsent,
} from "@/lib/students/photo-media-consent";

type Drafts = Record<string, PhotoMediaConsent | null>;

function draftsFromConsents(
  learners: PhotoPermissionLearner[],
  consentsByStudentId: Record<string, PhotoMediaConsentState>,
): Drafts {
  return Object.fromEntries(
    learners.map((learner) => [
      learner.studentId,
      consentsByStudentId[learner.studentId]?.consent ?? null,
    ]),
  );
}

const ERROR_TOAST_ID = "parent-photo-permissions-error";

type PhotoPermissionsPanelProps = {
  theme: ParentThemeTokens;
  open: boolean;
  learners: PhotoPermissionLearner[];
  consentsByStudentId: Record<string, PhotoMediaConsentState>;
  onClose: () => void;
  onSave: (changes: PhotoPermissionChange[]) => Promise<PhotoPermissionSaveResult>;
};

/**
 * Garden drawer where a parent picks a photo permission per child.
 * Nothing is sent until Save; only changed children are saved, and children
 * that saved stay saved even if another one fails.
 */
export default function PhotoPermissionsPanel({
  theme,
  open,
  learners,
  consentsByStudentId,
  onClose,
  onSave,
}: PhotoPermissionsPanelProps) {
  const [drafts, setDrafts] = useState<Drafts>({});
  const [saving, setSaving] = useState(false);
  const [failures, setFailures] = useState<PhotoPermissionSaveResult["failures"]>([]);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const confirmDiscardRef = useRef(false);
  const saveRef = useRef<() => Promise<void>>(async () => undefined);

  useEffect(() => {
    confirmDiscardRef.current = confirmDiscard;
  }, [confirmDiscard]);

  // Fresh drafts each time the panel opens.
  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => {
      setDrafts(draftsFromConsents(learners, consentsByStudentId));
      setFailures([]);
      setConfirmDiscard(false);
    });
    // Only on open: saved rows update consents while the panel stays open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const chosenCount = learners.filter((learner) => drafts[learner.studentId] != null).length;
  const missing = learners.filter((learner) => drafts[learner.studentId] == null);
  const changes = useMemo<PhotoPermissionChange[]>(
    () =>
      learners.flatMap((learner) => {
        const draft = drafts[learner.studentId];
        const saved = consentsByStudentId[learner.studentId]?.consent ?? null;
        return draft && draft !== saved ? [{ studentId: learner.studentId, consent: draft }] : [];
      }),
    [consentsByStudentId, drafts, learners],
  );
  const dirty = changes.length > 0;
  const canSave = missing.length === 0 && dirty && !saving;

  const requestClose = useCallback(() => {
    if (saving || confirmDiscardRef.current) return;
    if (dirty) {
      setConfirmDiscard(true);
      return;
    }
    onClose();
  }, [dirty, onClose, saving]);

  const handleSave = useCallback(async () => {
    if (missing.length > 0) return;
    if (changes.length === 0) {
      onClose();
      return;
    }
    setSaving(true);
    setFailures([]);
    parentToast.dismiss(ERROR_TOAST_ID);
    try {
      const result = await onSave(changes);
      const savedSummary = changes
        .filter((change) => result.savedIds.includes(change.studentId))
        .map((change) => {
          const learner = learners.find((entry) => entry.studentId === change.studentId);
          const name = learner ? childFirstName(learner.studentName) : "Your child";
          return `${name}: ${photoMediaConsentLabel(change.consent)}`;
        })
        .join(" · ");

      if (result.failures.length === 0) {
        parentToast.success("Photo permissions saved", {
          description: `${savedSummary}. The school now has your choice on file.`,
        });
        onClose();
        return;
      }

      setFailures(result.failures);
      const failedNames = joinNames(result.failures.map((failure) => failure.name));
      parentToast.error(`Couldn't save for ${failedNames}`, {
        id: ERROR_TOAST_ID,
        description:
          result.savedIds.length > 0
            ? `Saved ${savedSummary}. ${result.failures[0].message} Your choice for ${failedNames} is still selected, so you can try again.`
            : `${result.failures[0].message} Your choices are still selected, so you can try again.`,
        action: { label: "Try again", onClick: () => void saveRef.current() },
      });
    } finally {
      setSaving(false);
    }
  }, [changes, learners, missing.length, onClose, onSave]);

  useEffect(() => {
    saveRef.current = handleSave;
  }, [handleSave]);

  const setDraft = (studentId: string, consent: PhotoMediaConsent) => {
    setDrafts((prev) => ({ ...prev, [studentId]: consent }));
    setFailures((prev) => prev.filter((failure) => failure.studentId !== studentId));
  };

  const firstChoice = learners.map((learner) => drafts[learner.studentId]).find(Boolean) ?? null;
  const canApplyAll =
    learners.length > 1 &&
    firstChoice != null &&
    learners.some((learner) => drafts[learner.studentId] !== firstChoice);
  const applyToAll = () => {
    if (!firstChoice) return;
    setDrafts(Object.fromEntries(learners.map((learner) => [learner.studentId, firstChoice])));
    setFailures([]);
  };

  const firstOpenStepId = missing[0]?.studentId ?? null;

  const statusText = saving
    ? "Saving your choices…"
    : missing.length > 0
      ? `Choose a level for ${joinNames(missing.map((learner) => childFirstName(learner.studentName)))} to save.`
      : dirty
        ? `${changes.length} ${changes.length === 1 ? "change" : "changes"} ready to save.`
        : "No changes yet.";

  return (
    <>
      <GSidePanel
        theme={theme}
        open={open}
        onClose={requestClose}
        panelId="parent-photo-permissions-panel"
        testId="parent-photo-permissions-sidebar"
        kicker="Photo permissions"
        title="Choose for each child"
        subtitle="Pick how the school may use photos and video of each child. Nothing changes until you save."
        closeLabel="Close photo permissions"
        headerAside={
          <div className="flex items-center gap-3">
            <GChip tone={chosenCount === learners.length ? "success" : "info"}>
              {chosenCount} of {learners.length} chosen
            </GChip>
            <GProgress
              value={chosenCount}
              total={learners.length}
              done={chosenCount === learners.length}
              label="Children with a choice"
              className="max-w-[10rem] flex-1"
            />
          </div>
        }
        footer={
          <>
            <p
              className="m-0 w-full text-[13px] font-bold text-[var(--sf-soft)]"
              aria-live="polite"
              data-testid="parent-photo-permissions-status"
            >
              {statusText}
            </p>
            <div className="ml-auto flex flex-wrap items-center justify-end gap-2.5">
            <button type="button" onClick={requestClose} disabled={saving} className={gBtnOutlineSm}>
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={!canSave}
              aria-busy={saving || undefined}
              className={gBtnPopSm}
              data-testid="parent-photo-permissions-save"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
              {saving ? "Saving…" : "Save permissions"}
            </button>
            </div>
          </>
        }
      >
        {failures.length > 0 ? (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-[16px] border-[1.5px] border-[var(--sf-clay-deep)]/30 bg-[var(--sf-peach)] px-3.5 py-3"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--sf-clay-deep)]" aria-hidden />
            <div className="min-w-0 text-[13px] font-bold text-[var(--sf-clay-deep)]">
              <p className="m-0">
                We couldn&apos;t save for {joinNames(failures.map((failure) => failure.name))}.
              </p>
              <p className="m-0 mt-0.5 font-semibold">{failures[0].message}</p>
            </div>
          </div>
        ) : null}

        <ol className="m-0 flex list-none flex-col gap-4 p-0">
          {learners.map((learner, i) => {
            const draft = drafts[learner.studentId] ?? null;
            const saved = consentsByStudentId[learner.studentId]?.consent ?? null;
            const changed = draft != null && draft !== saved;
            const failed = failures.some((failure) => failure.studentId === learner.studentId);
            const current = learner.studentId === firstOpenStepId;
            const firstName = childFirstName(learner.studentName);
            const legendId = `photo-consent-legend-${learner.studentId}`;
            return (
              <li
                key={learner.studentId}
                className={`rounded-[20px] border-[1.5px] p-4 transition-colors ${
                  failed
                    ? "border-[var(--sf-clay-deep)]/50 bg-[var(--sf-peach)]/40"
                    : current
                      ? "border-[var(--sf-clay)]/40 bg-[var(--sf-accent-wash)]"
                      : "border-[var(--sf-ink)]/10 bg-white"
                }`}
              >
                <fieldset className="m-0 min-w-0 border-0 p-0">
                  <legend id={legendId} className="w-full p-0">
                    <span className="flex items-center gap-3">
                      <span
                        aria-hidden="true"
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-[1.5px] text-[13px] font-extrabold ${
                          draft
                            ? "border-[var(--sf-forest)] bg-[var(--sf-mint)] text-[var(--sf-forest)]"
                            : "border-[var(--sf-ink)]/25 bg-white text-[var(--sf-ink)]/70"
                        }`}
                      >
                        {draft ? <Tick className="h-5 w-5" fill="transparent" /> : i + 1}
                      </span>
                      <ChildThumb child={learner.child} index={i} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[16px] font-extrabold text-[var(--sf-ink)]">
                          {learner.studentName}
                        </span>
                        <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[12px] font-bold text-[var(--sf-soft)]">
                          Saved:
                          <GChip tone={consentChipTone(saved)} className="!py-0">
                            {photoMediaConsentLabel(saved)}
                          </GChip>
                          {changed ? (
                            <GChip tone="neutral" className="!py-0">
                              Changed
                            </GChip>
                          ) : null}
                          {failed ? (
                            <GChip tone="alert" className="!py-0">
                              Not saved
                            </GChip>
                          ) : null}
                        </span>
                      </span>
                    </span>
                  </legend>

                  <div className="mt-3 flex flex-col gap-2" data-testid={`parent-photo-consent-options-${learner.studentId}`}>
                    {PHOTO_MEDIA_CONSENT_OPTIONS.map((option) => {
                      const selected = draft === option.value;
                      const Icon = CONSENT_ICONS[option.value];
                      return (
                        <label
                          key={option.value}
                          className={`group relative flex cursor-pointer items-start gap-3 rounded-[16px] border-[1.5px] p-3 transition-all duration-200 has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-[var(--sf-clay)]/35 ${
                            selected
                              ? "border-[var(--sf-ink)] bg-white shadow-[0_3px_0_0_var(--sf-ink)]"
                              : "border-[var(--sf-ink)]/12 bg-white hover:-translate-y-0.5 hover:border-[var(--sf-ink)]/35"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`photo-media-consent-${learner.studentId}`}
                            value={option.value}
                            checked={selected}
                            onChange={() => setDraft(learner.studentId, option.value)}
                            disabled={saving}
                            className="sr-only"
                          />
                          <span
                            aria-hidden="true"
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-[1.5px] ring-[var(--sf-ink)]/15 ${CONSENT_TINTS[option.value]}`}
                          >
                            <Icon className="h-4 w-4 text-[var(--sf-ink)]" strokeWidth={2.4} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[14px] font-extrabold text-[var(--sf-ink)]">
                              {option.label}
                            </span>
                            <span className="mt-0.5 block text-[12.5px] font-semibold leading-snug text-[var(--sf-soft)]">
                              {option.description}
                            </span>
                          </span>
                          <span
                            aria-hidden="true"
                            className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-[1.5px] ${
                              selected
                                ? "border-[var(--sf-forest)] bg-[var(--sf-mint)]"
                                : "border-[var(--sf-ink)]/25 bg-white"
                            }`}
                          >
                            {selected ? <Tick className="h-5 w-5" fill="transparent" /> : null}
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  {i === 0 && canApplyAll ? (
                    <button
                      type="button"
                      onClick={applyToAll}
                      disabled={saving}
                      className={`${gLinkSm} mt-3`}
                      data-testid="parent-photo-permissions-apply-all"
                    >
                      Use {photoMediaConsentLabel(firstChoice).toLowerCase()} for every child
                    </button>
                  ) : null}
                  {i === 0 && !canApplyAll && learners.length > 1 && firstChoice == null ? (
                    <p className="m-0 mt-3 text-[12px] font-bold text-[var(--sf-soft)]">
                      Tip: choose for {firstName} first, then copy it to your other children in one tap.
                    </p>
                  ) : null}
                </fieldset>
              </li>
            );
          })}
        </ol>
      </GSidePanel>

      <GConfirmDialog
        theme={theme}
        open={confirmDiscard}
        title="Discard your changes?"
        description="Your new photo permission choices haven't been saved. If you close now, the school keeps your previous choices."
        confirmLabel="Discard changes"
        cancelLabel="Keep editing"
        destructive
        onClose={() => setConfirmDiscard(false)}
        onConfirm={() => {
          setConfirmDiscard(false);
          onClose();
        }}
        data-testid="parent-photo-permissions-discard"
      />
    </>
  );
}
