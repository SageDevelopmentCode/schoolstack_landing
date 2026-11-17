"use client";

import { AlertTriangle, Loader2, Plus, RotateCw, Trash2 } from "lucide-react";
import PopupTimePicker from "@/components/school-events/PopupTimePicker";
import GSidePanel from "@/components/school-parent/garden/GSidePanel";
import { GChip, G_INPUT, G_LABEL, gBtnOutlineSm, gBtnPopSm, gLinkSm } from "@/components/school-parent/garden/ui";
import type { TeacherMyHoursModel } from "@/components/school-teacher/my-hours/useTeacherMyHoursModel";
import { sessionMinutes } from "@/lib/school-teacher/my-hours/adjust-validation";
import { formatHoursMinutes, formatLongWeekdayDate, parseDateKey } from "@/lib/school-teacher/my-hours/format-duration";
import { sessionCountLabel } from "@/lib/school-teacher/my-hours/my-hours-status";

const PREVIEW_SAVE_REASON = "Saving hours is off in preview";

/** Adjust / add hours for one day, on the Garden drawer (mounted outside the page frame). */
export default function MyHoursAdjustPanel({ model }: { model: TeacherMyHoursModel }) {
  const { editor, adjust, theme, previewMode } = model;
  const state = editor.state;
  const mode = state?.hasExisting ? "adjust" : "add";
  const saveLabel = adjust.requireApproval ? "Submit for approval" : mode === "adjust" ? "Save changes" : "Save";
  const { validation } = editor;

  const onClose = () => {
    // The time picker closes itself on Escape; don't close the drawer underneath it.
    if (document.querySelector('[aria-label="Close time picker"]')) return;
    editor.closeEditor();
  };

  return (
    <GSidePanel
      theme={theme}
      open={editor.open}
      kicker="My Hours"
      title={mode === "adjust" ? "Adjust hours" : "Add hours"}
      subtitle={state ? formatLongWeekdayDate(parseDateKey(state.dateKey)) : null}
      headerAside={state?.pending ? <GChip tone="warning">Change pending approval</GChip> : null}
      onClose={onClose}
      testId="teacher-my-hours-adjust-sidebar"
      panelId="teacher-my-hours-adjust"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="m-0 text-[13px] font-extrabold tabular-nums text-[var(--sf-soft)]" aria-live="polite">
            {validation.totalMinutes > 0 && state
              ? `${formatHoursMinutes(validation.totalMinutes)} · ${sessionCountLabel(state.sessions.length)}`
              : ""}
          </p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <button type="button" className={gBtnOutlineSm} onClick={editor.closeEditor} disabled={editor.saving}>
              Cancel
            </button>
            <button
              type="button"
              className={gBtnPopSm}
              onClick={editor.save}
              disabled={previewMode || editor.saving}
              aria-busy={editor.saving || undefined}
              title={previewMode ? PREVIEW_SAVE_REASON : undefined}
              data-testid="teacher-my-hours-adjust-save"
            >
              {editor.saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
              {editor.saving ? "Saving…" : saveLabel}
            </button>
          </div>
        </div>
      }
    >
      {state ? (
        <div className="flex flex-col gap-4">
          {previewMode ? (
            <p className="m-0 rounded-[14px] bg-[var(--sf-sky)] px-4 py-3 text-[13px] font-semibold text-[#24507a]">
              {PREVIEW_SAVE_REASON}.
            </p>
          ) : null}

          {editor.openSessionLabel ? (
            <div className="rounded-[16px] border-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-mint)] px-4 py-3">
              <p className="m-0 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--sf-forest)]">Open session</p>
              <p className="m-0 mt-1 text-[14px] font-extrabold text-[var(--sf-ink)]">
                Started at {editor.openSessionLabel} · In progress
              </p>
              <p className="m-0 mt-0.5 text-[13px] font-semibold text-[var(--sf-soft)]">Clock out before changing this open session.</p>
            </div>
          ) : null}

          <ol className="m-0 flex list-none flex-col gap-3 p-0">
            {state.sessions.map((session, index) => {
              const minutes = sessionMinutes(session.clockIn, session.clockOut);
              const error = validation.errors[session.key];
              return (
                <li
                  key={session.key}
                  className={`rounded-[18px] border-[1.5px] bg-white p-4 ${
                    error && state.showErrors ? "border-[var(--sf-clay)]" : "border-[var(--sf-ink)]/12"
                  }`}
                  data-testid={`teacher-my-hours-adjust-session-${index + 1}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="m-0 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--sf-soft)]">Session {index + 1}</p>
                      {session.originalLabel ? (
                        <p className="m-0 mt-0.5 text-[12px] font-semibold text-[var(--sf-soft)]">{session.originalLabel}</p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {minutes != null && !error ? <GChip tone="neutral">{formatHoursMinutes(minutes)}</GChip> : null}
                      {state.sessions.length > 1 ? (
                        <button
                          type="button"
                          className={`${gLinkSm} !text-[var(--sf-soft)]`}
                          onClick={() => editor.removeSession(session.key)}
                          aria-label={`Remove session ${index + 1}`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                          <span className="max-sm:sr-only">Remove</span>
                        </button>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="min-w-0">
                      <span className={G_LABEL}>Clock in</span>
                      <PopupTimePicker
                        theme={theme}
                        value={session.clockIn}
                        onChange={(value) => editor.setSessionTime(session.key, "clockIn", value)}
                        ariaLabel={`Session ${index + 1} clock in`}
                        className="rounded-[14px] py-2.5"
                      />
                    </div>
                    <div className="min-w-0">
                      <span className={G_LABEL}>Clock out</span>
                      <PopupTimePicker
                        theme={theme}
                        value={session.clockOut}
                        onChange={(value) => editor.setSessionTime(session.key, "clockOut", value)}
                        ariaLabel={`Session ${index + 1} clock out`}
                        className="rounded-[14px] py-2.5"
                      />
                    </div>
                  </div>
                  {error ? (
                    <p
                      className={`m-0 mt-2 text-[13px] font-extrabold ${state.showErrors ? "text-[var(--sf-clay-deep)]" : "text-[var(--sf-soft)]"}`}
                      role={state.showErrors ? "alert" : undefined}
                    >
                      {error}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ol>

          <button type="button" className={`${gBtnOutlineSm} w-full`} onClick={editor.addSession}>
            <Plus className="h-4 w-4" aria-hidden /> Add another session
          </button>

          <label className="block" htmlFor="teacher-my-hours-adjust-note">
            <span className={G_LABEL}>Note</span>
            <textarea
              id="teacher-my-hours-adjust-note"
              rows={3}
              value={state.note}
              placeholder="Optional — why you're changing this day"
              onChange={(event) => editor.setNote(event.target.value)}
              className={`${G_INPUT} resize-y`}
            />
          </label>

          {state.showErrors && !validation.valid ? (
            <p className="m-0 text-[14px] font-extrabold text-[var(--sf-clay-deep)]" role="alert">
              Check the times above before saving.
            </p>
          ) : null}

          {editor.saveError ? (
            <div
              role="alert"
              className="flex flex-col items-start gap-3 rounded-[16px] border-[1.5px] border-dashed border-[var(--sf-clay)]/40 bg-[var(--sf-peach)] p-4"
              data-testid="teacher-my-hours-adjust-error"
            >
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--sf-clay-deep)]" aria-hidden />
                <div>
                  <p className="m-0 text-[14px] font-extrabold text-[var(--sf-ink)]">Your hours weren&apos;t saved.</p>
                  <p className="m-0 mt-0.5 text-[13px] font-semibold text-[var(--sf-ink)]/75">
                    {editor.saveError} Nothing was changed — try again.
                  </p>
                </div>
              </div>
              <button type="button" className={gBtnOutlineSm} onClick={editor.retrySave} disabled={editor.saving}>
                <RotateCw className={`h-4 w-4 ${editor.saving ? "animate-spin" : ""}`} aria-hidden />
                {editor.saving ? "Trying again…" : "Retry"}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </GSidePanel>
  );
}
