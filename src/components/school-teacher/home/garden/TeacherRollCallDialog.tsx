"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, RotateCw, UserCheck, UserX, Zap } from "lucide-react";
import { Tick } from "@/components/garden/ui";
import { GDialog } from "@/components/school-parent/garden/GDialog";
import { PORTAL_EASE } from "@/components/school-parent/garden/motion";
import { GChip, GProgress, G_FOCUS, gBtnOutlineSm, gBtnPopSm, gLinkSm } from "@/components/school-parent/garden/ui";
import { adminToast } from "@/lib/school-admin/admin-toast";
import { formatAttendanceDateLabel } from "@/lib/school-admin/attendance/attendance-date-utils";
import type { AttendanceRosterStudent } from "@/lib/school-admin/attendance/attendance-types";
import { formatEnrolledStudentName, formatStudentGrade } from "@/lib/school-admin/enrolled-students";
import type { TeacherDashboardModel } from "../useTeacherDashboardModel";

/** What roll call needs from a page model (Dashboard or the Attendance page). */
export type TeacherRollCallModel = Pick<
  TeacherDashboardModel,
  "att" | "theme" | "rollCallOpen" | "closeRollCall" | "attendanceFilter" | "setAttendanceFilter"
>;
import { StudentFace, plural } from "./parts";

type Choice = "present" | "absent";
type Result = Choice | "skipped";

type Session = {
  /** Student ids still unmarked when roll call opened (the list never shrinks under you). */
  queue: string[];
  index: number;
  results: Record<string, Result>;
  finished: boolean;
};

const CHOICE_BTN = `group flex min-h-[112px] flex-col items-center justify-center gap-1.5 rounded-[20px] border-2 border-[var(--sf-ink)] px-3 py-4 text-[var(--sf-ink)] shadow-[0_4px_0_0_var(--sf-ink)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_0_0_var(--sf-ink)] active:translate-y-0.5 active:shadow-[0_1px_0_0_var(--sf-ink)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 ${G_FOCUS}`;

function studentMeta(student: AttendanceRosterStudent): string {
  const grade = formatStudentGrade(student.grade) ?? "Grade not listed";
  const parts = [grade, ...student.programNames];
  if (student.classroomNames.length > 0) parts.push(student.classroomNames.join(", "));
  return parts.join(" · ");
}

function Kbd({ children }: { children: string }) {
  return (
    <kbd className="hidden rounded-md border-[1.5px] border-[var(--sf-ink)]/25 bg-white/80 px-1.5 text-[11px] font-extrabold text-[var(--sf-ink)]/60 sm:inline-block">
      {children}
    </kbd>
  );
}

function startSession(students: AttendanceRosterStudent[], only?: string[]): Session {
  const queue = students
    .filter((s) => s.attendanceStatus === "not_marked" && (!only || only.includes(s.id)))
    .map((s) => s.id);
  return { queue, index: 0, results: {}, finished: queue.length === 0 };
}

/**
 * Guided roll call: today's unmarked students one at a time, Present or
 * Absent (P / A, → skip, ← back). Saves go through the shared attendance
 * model quietly (inline confirmation); one recap toast when it closes.
 */
export default function TeacherRollCallDialog({ model }: { model: TeacherRollCallModel }) {
  const { att, theme } = model;
  const open = model.rollCallOpen;
  const reduce = useReducedMotion() === true;
  const [session, setSession] = useState<Session | null>(null);
  const [saving, setSaving] = useState<Choice | null>(null);
  const [error, setError] = useState<{ studentId: string; choice: Choice; message: string } | null>(null);
  const [announcement, setAnnouncement] = useState("");

  // Snapshot the queue when the dialog opens; drop it when it closes.
  if (open && !session) {
    setSession(startSession(att.students));
  } else if (!open && session) {
    setSession(null);
    setError(null);
    setAnnouncement("");
  }

  const queue = session?.queue ?? [];
  const index = session?.index ?? 0;
  const results = session?.results ?? {};
  const finished = session?.finished ?? false;
  const student = att.students.find((s) => s.id === queue[index]) ?? null;
  const name = student ? formatEnrolledStudentName(student) : "";
  // Counts cover the whole roll call, including a "go back to skipped" pass.
  const resultValues = Object.values(results);
  const presentCount = resultValues.filter((r) => r === "present").length;
  const absentCount = resultValues.filter((r) => r === "absent").length;
  const handled = presentCount + absentCount;
  const skippedIds = Object.keys(results).filter((id) => results[id] === "skipped");

  const advance = useCallback((result?: { id: string; value: Result }) => {
    setSession((current) => {
      if (!current) return current;
      const nextResults = result ? { ...current.results, [result.id]: result.value } : current.results;
      const nextIndex = current.index + 1;
      return nextIndex >= current.queue.length
        ? { ...current, results: nextResults, finished: true }
        : { ...current, results: nextResults, index: nextIndex };
    });
  }, []);

  const choose = useCallback(
    async (choice: Choice) => {
      if (!student || saving || att.readOnly) return;
      setSaving(choice);
      setError(null);
      const ok = await att.saveAttendanceAction(student, choice, undefined, { quiet: true });
      setSaving(null);
      if (ok) {
        setAnnouncement(`${name} marked ${choice}.`);
        advance({ id: student.id, value: choice });
      } else {
        setError({
          studentId: student.id,
          choice,
          message: `${name}'s attendance was not changed. Check your connection and try again.`,
        });
      }
    },
    [advance, att, name, saving, student],
  );

  const skip = useCallback(() => {
    if (!student || saving) return;
    setError(null);
    const already = session?.results[student.id];
    advance(already === "present" || already === "absent" ? undefined : { id: student.id, value: "skipped" });
  }, [advance, saving, session, student]);

  const back = useCallback(() => {
    if (saving) return;
    setError(null);
    setSession((current) =>
      current
        ? { ...current, finished: false, index: current.finished ? current.queue.length - 1 : Math.max(0, current.index - 1) }
        : current,
    );
  }, [saving]);

  // Keyboard: P / A / → (or S) / ←. Ignored while typing or saving.
  const handlersRef = useRef({ choose, skip, back });
  useEffect(() => {
    handlersRef.current = { choose, skip, back };
  });
  useEffect(() => {
    if (!open || finished) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      const key = event.key.toLowerCase();
      if (key === "p") {
        event.preventDefault();
        void handlersRef.current.choose("present");
      } else if (key === "a") {
        event.preventDefault();
        void handlersRef.current.choose("absent");
      } else if (key === "arrowright" || key === "s") {
        event.preventDefault();
        handlersRef.current.skip();
      } else if (key === "arrowleft") {
        event.preventDefault();
        handlersRef.current.back();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, finished]);

  const close = () => {
    if (saving) return;
    if (handled > 0) {
      const left = att.summary.notMarkedCount;
      adminToast.success(
        finished ? `Roll call saved: ${plural(handled, "student")} marked.` : `Roll call paused: ${plural(handled, "student")} marked.`,
        {
          id: "teacher-roll-call",
          description:
            left > 0
              ? `${plural(left, "student")} still to mark${att.viewingToday ? " today" : ""}. Take roll call again any time.`
              : `Everyone is marked${att.viewingToday ? " for today" : ""}. ${att.subcopy}.`,
        },
      );
    }
    // Don't leave the roster on an empty "Not marked" filter once everyone is marked.
    if (att.summary.notMarkedCount === 0 && model.attendanceFilter === "not_marked") {
      model.setAttendanceFilter("all");
    }
    model.closeRollCall();
  };

  const reviewSkipped = () => {
    setError(null);
    const next = startSession(att.students, skippedIds);
    const kept = Object.fromEntries(Object.entries(results).filter(([, r]) => r !== "skipped"));
    setSession({ ...next, results: kept });
  };

  const dateLabel = formatAttendanceDateLabel(att.activeDate);
  const progressValue = finished ? queue.length : index;

  return (
    <GDialog
      theme={theme}
      open={open}
      onClose={close}
      closeDisabled={saving != null}
      size="lg"
      data-testid="teacher-roll-call-dialog"
      icon={<Zap />}
      title={finished ? "Roll call saved" : "Roll call"}
      description={
        finished
          ? `${dateLabel}${att.viewingToday ? " · today" : ""}`
          : `${dateLabel}${att.viewingToday ? " · today" : ""} · One student at a time. Tap Present or Absent.`
      }
      headerExtra={
        queue.length > 0 ? (
          <div className="flex items-center gap-3">
            <GProgress
              value={progressValue}
              total={queue.length}
              label={`${progressValue} of ${queue.length} students done`}
              done={finished}
            />
            <span className="shrink-0 text-[12px] font-extrabold tabular-nums text-[var(--sf-ink)]/65">
              {finished ? `${queue.length} of ${queue.length}` : `${index + 1} of ${queue.length}`}
            </span>
          </div>
        ) : null
      }
      footer={
        finished ? (
          <>
            {skippedIds.length > 0 && !att.readOnly ? (
              <button type="button" onClick={reviewSkipped} className={gBtnOutlineSm}>
                <RotateCw className="h-4 w-4" aria-hidden />
                Go back to {plural(skippedIds.length, "skipped student")}
              </button>
            ) : null}
            <button type="button" onClick={close} className={gBtnPopSm} data-testid="teacher-roll-call-done">
              Done
            </button>
          </>
        ) : undefined
      }
    >
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>

      {finished ? (
        <Recap
          model={model}
          presentCount={presentCount}
          absentCount={absentCount}
          skippedCount={skippedIds.length}
        />
      ) : student ? (
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={student.id}
            initial={reduce ? false : { opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? undefined : { opacity: 0, x: -24 }}
            transition={{ duration: 0.22, ease: PORTAL_EASE }}
            className="flex flex-col gap-5"
          >
            <div className="flex flex-col items-center gap-3 text-center">
              <StudentFace student={student} index={index} size="lg" />
              <div className="min-w-0">
                <h3 className="sf-display m-0 text-[1.9rem] leading-none text-[var(--sf-ink)]">{name}</h3>
                <p className="m-0 mt-1.5 text-[13px] font-semibold text-[var(--sf-soft)]">{studentMeta(student)}</p>
                {results[student.id] === "present" || results[student.id] === "absent" ? (
                  <GChip tone={results[student.id] === "present" ? "success" : "warning"} className="mt-2">
                    Marked {results[student.id]}. Pick again to change it.
                  </GChip>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => void choose("present")}
                disabled={saving != null || att.readOnly}
                aria-busy={saving === "present" || undefined}
                className={`${CHOICE_BTN} bg-[var(--sf-mint)]`}
                data-testid="teacher-roll-call-present"
              >
                {saving === "present" ? <Loader2 className="h-7 w-7 animate-spin" aria-hidden /> : <UserCheck className="h-7 w-7" aria-hidden />}
                <span className="text-[17px] font-extrabold">{saving === "present" ? "Saving…" : "Present"}</span>
                <Kbd>P</Kbd>
              </button>
              <button
                type="button"
                onClick={() => void choose("absent")}
                disabled={saving != null || att.readOnly}
                aria-busy={saving === "absent" || undefined}
                className={`${CHOICE_BTN} bg-[var(--sf-butter)]`}
                data-testid="teacher-roll-call-absent"
              >
                {saving === "absent" ? <Loader2 className="h-7 w-7 animate-spin" aria-hidden /> : <UserX className="h-7 w-7" aria-hidden />}
                <span className="text-[17px] font-extrabold">{saving === "absent" ? "Saving…" : "Absent"}</span>
                <Kbd>A</Kbd>
              </button>
            </div>

            {error && error.studentId === student.id ? (
              <div
                role="alert"
                className="flex flex-col gap-2 rounded-[16px] border-[1.5px] border-dashed border-[#b4412f]/35 bg-[#fdf0ec] p-3.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <p className="m-0 text-[13px] font-semibold text-[#7d2c1d]">{error.message}</p>
                <button type="button" onClick={() => void choose(error.choice)} className={`${gBtnOutlineSm} !py-1.5`}>
                  <RotateCw className="h-3.5 w-3.5" aria-hidden />
                  Retry
                </button>
              </div>
            ) : null}

            <div className="flex items-center justify-between gap-3 border-t-[1.5px] border-dashed border-[var(--sf-ink)]/12 pt-3">
              <button type="button" onClick={back} disabled={index === 0 || saving != null} className={`${gLinkSm} disabled:opacity-40`}>
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                Back <Kbd>←</Kbd>
              </button>
              <UpNext model={model} queue={queue} index={index} />
              <button type="button" onClick={skip} disabled={saving != null} className={`${gLinkSm} disabled:opacity-40`}>
                Skip <Kbd>→</Kbd>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      ) : (
        <p className="m-0 rounded-[16px] bg-[var(--sf-paper)] p-4 text-[14px] font-semibold text-[var(--sf-soft)]">
          Everyone on this roster is already marked.
        </p>
      )}
    </GDialog>
  );
}

function UpNext({ model, queue, index }: { model: TeacherRollCallModel; queue: string[]; index: number }) {
  const next = queue
    .slice(index + 1, index + 4)
    .map((id) => model.att.students.find((s) => s.id === id))
    .filter((s): s is AttendanceRosterStudent => Boolean(s));
  if (next.length === 0) {
    return <span className="text-[12px] font-semibold text-[var(--sf-soft)]">Last one</span>;
  }
  return (
    <span className="flex min-w-0 items-center gap-2">
      <span className="hidden text-[12px] font-semibold text-[var(--sf-soft)] sm:inline">Up next</span>
      <span className="flex items-center" aria-hidden="true">
        {next.map((s, i) => (
          <StudentFace key={s.id} student={s} index={index + 1 + i} size="xs" className={i > 0 ? "-ml-2" : ""} />
        ))}
      </span>
      <span className="sr-only">Up next: {next.map((s) => s.firstName).join(", ")}</span>
    </span>
  );
}

function Recap({
  model,
  presentCount,
  absentCount,
  skippedCount,
}: {
  model: TeacherRollCallModel;
  presentCount: number;
  absentCount: number;
  skippedCount: number;
}) {
  const { att } = model;
  const left = att.summary.notMarkedCount;
  const tiles = [
    { label: "Present", value: presentCount, tint: "bg-[var(--sf-mint)]" },
    { label: "Absent", value: absentCount, tint: "bg-[var(--sf-butter)]" },
    { label: "Skipped", value: skippedCount, tint: "bg-[var(--sf-ink)]/[0.06]" },
  ];
  return (
    <div className="flex flex-col gap-4" data-testid="teacher-roll-call-recap">
      <div className="flex items-center gap-4 rounded-[18px] bg-[var(--sf-mint)] p-4">
        <Tick className="h-12 w-12" color="var(--sf-forest)" />
        <div className="min-w-0">
          <p className="m-0 text-[16px] font-extrabold text-[var(--sf-ink)]">
            {presentCount + absentCount > 0
              ? `${plural(presentCount + absentCount, "student")} marked`
              : "Nothing was changed"}
          </p>
          <p className="m-0 mt-0.5 text-[13px] font-semibold text-[var(--sf-ink)]/70">
            {att.subcopy}
            {left > 0 ? ` · ${left} still to mark` : " · everyone is marked"}
          </p>
        </div>
      </div>
      <dl className="m-0 grid grid-cols-3 gap-2">
        {tiles.map((tile) => (
          <div key={tile.label} className={`rounded-[16px] px-3 py-3 ${tile.tint}`}>
            <dt className="text-[12px] font-extrabold text-[var(--sf-ink)]/65">{tile.label}</dt>
            <dd className="sf-display m-0 mt-0.5 text-[1.8rem] leading-none tabular-nums text-[var(--sf-ink)]">{tile.value}</dd>
          </div>
        ))}
      </dl>
      <p className="m-0 text-[12.5px] font-semibold text-[var(--sf-soft)]">
        Need to record a pickup or change a mark? Open the student on the roster.
      </p>
    </div>
  );
}
