"use client";

import { Suspense } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BellRing, CalendarClock, ChevronRight, ClipboardList, Loader2, Lock, PencilLine, Plus, UsersRound } from "lucide-react";
import ClassroomSignupCreateWizard from "./ClassroomSignupCreateWizard";
import ClassroomSignupNotifyModal from "./ClassroomSignupNotifyModal";
import TeacherClassroomSignupSidebar, { SIGNUP_STATUS_TONES } from "./TeacherClassroomSignupSidebar";
import {
  useTeacherClassroomSignupsModel,
  type SignupFilter,
  type TeacherClassroomSignupsModel,
  type TeacherClassroomSignupsPageProps,
} from "./useTeacherClassroomSignupsModel";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import ParentGardenFrame from "@/components/school-parent/garden/ParentGardenFrame";
import ParentGardenPageHeader from "@/components/school-parent/garden/ParentGardenPageHeader";
import { GConfirmDialog } from "@/components/school-parent/garden/GDialog";
import { PORTAL_EASE } from "@/components/school-parent/garden/motion";
import { GCard, GChip, GProgress, G_FOCUS, NOTE_TINTS, gBtnPopSm, gLinkSm } from "@/components/school-parent/garden/ui";
import { GardenEmptyState, GardenStatTiles } from "@/components/school-admin/garden/kit";
import { GardenLeadStrip } from "@/components/school-admin/garden/blocks";
import { AdminGardenSkin } from "@/components/school-admin/garden/skin";
import { PORTAL_HOME_CONTAINER_CLASS } from "@/lib/portal-home/layout";
import type { ClassroomSignup } from "@/lib/classroom-signups/types";
import { SIGNUP_STATUS_LABELS, SIGNUP_TYPE_LABELS } from "@/lib/classroom-signups/types";
import { formatAudienceLabel, formatSignupDeadline, getSignupProgress } from "@/lib/classroom-signups/utils";

const FILTERS: { key: SignupFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "draft", label: "Draft" },
  { key: "closed", label: "Closed" },
];

/**
 * Staff Classroom signups (Garden): ask families for help and track who
 * signed up. Lead strip for drafts / signups that still need people, linked
 * figures, status filters, signup cards with progress, a guided create
 * wizard, and the signup drawer (reminders, edit, close, CSV). State:
 * `useTeacherClassroomSignupsModel`.
 */
export default function TeacherClassroomSignupsPage(props: TeacherClassroomSignupsPageProps) {
  const { theme } = useParentTheme();
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center gap-2 py-12 text-sm" style={{ color: theme.muted }}>
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading signups…
        </div>
      }
    >
      <TeacherClassroomSignupsView {...props} />
    </Suspense>
  );
}

function TeacherClassroomSignupsView(props: TeacherClassroomSignupsPageProps) {
  const model = useTeacherClassroomSignupsModel(props);
  const { theme } = model;
  const reduce = useReducedMotion() === true;
  const fade = {
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: PORTAL_EASE } },
    exit: { opacity: 0, transition: { duration: 0.15 } },
  };

  return (
    <>
      <ParentGardenFrame theme={theme} className="bg-[var(--sf-cream)]">
        <AdminGardenSkin theme={theme}>
          <div className={`sf-admin-garden-skin ${PORTAL_HOME_CONTAINER_CLASS}`} data-testid="teacher-classroom-signups-page">
            <AnimatePresence mode="wait" initial={false}>
              {model.creating ? (
                <motion.div key="create" {...fade}>
                  <ClassroomSignupCreateWizard
                    organizationId={props.organizationId}
                    teacherName={props.teacherName}
                    classroomOptions={props.classroomOptions}
                    assignedFamilyCount={props.assignedFamilyCount}
                    onCancel={model.cancelCreate}
                    onPublished={model.handlePublished}
                    onDraftSaved={model.handleDraftSaved}
                  />
                </motion.div>
              ) : (
                <motion.div key="list" {...fade} className="flex flex-col gap-5">
                  <SignupsList model={model} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </AdminGardenSkin>
      </ParentGardenFrame>

      {/* Drawer and dialogs stay outside the Garden frame. */}
      <TeacherClassroomSignupSidebar
        key={model.selectedSignupId ?? "closed"}
        theme={theme}
        open={model.selectedSignup != null}
        organizationId={props.organizationId}
        signup={model.selectedSignup}
        responses={model.selectedSignupId ? (model.responsesBySignupId[model.selectedSignupId] ?? []) : []}
        teacherName={props.teacherName}
        classroomOptions={props.classroomOptions}
        previewMode={model.previewMode}
        closing={model.closing}
        onClose={model.closeSidebar}
        onSignupUpdated={model.handleSignupUpdated}
        onRequestCloseSignup={model.requestClose}
        onSendReminder={model.openReminder}
        onExportCsv={model.exportCsv}
      />

      {model.reminderTarget ? (
        <ClassroomSignupNotifyModal
          signup={model.reminderTarget}
          responses={model.confirmedResponses(model.reminderTarget.id)}
          teacherName={props.teacherName}
          open
          sending={model.sendingReminder}
          previewMode={model.previewMode}
          onClose={model.closeReminder}
          onSend={(message) => model.sendReminder(model.reminderTarget!, message)}
        />
      ) : null}

      <GConfirmDialog
        theme={theme}
        open={model.closeTarget != null}
        title={`Close “${model.closeTarget?.title ?? "this signup"}”?`}
        description="Families can't sign up anymore. Everyone who already signed up stays on the list, and you can still export it."
        confirmLabel="Close signup"
        loadingLabel="Closing…"
        cancelLabel="Keep it open"
        destructive
        loading={model.closing}
        onConfirm={() => void model.confirmClose()}
        onClose={model.cancelClose}
        confirmTestId="teacher-classroom-signup-close-confirm"
      />
    </>
  );
}

/* ------------------------------------------------------------------ */

function SignupsList({ model }: { model: TeacherClassroomSignupsModel }) {
  const { metrics } = model;
  const firstDraft = model.drafts[0];
  const firstNeedy = model.needsAttention[0];

  const header = (
    <ParentGardenPageHeader
      title={
        <>
          Classroom <span className="text-[var(--sf-clay)]">signups</span>
        </>
      }
      subtitle={
        <>
          Create requests for parent volunteers and track responses.
          {model.signups.length > 0 ? (
            <span className="mt-1.5 block text-[13px] font-extrabold tabular-nums text-[var(--sf-ink)]/70" data-testid="teacher-signups-status-line">
              {[
                `${metrics.openCount} open`,
                model.drafts.length > 0 ? `${model.drafts.length} draft${model.drafts.length === 1 ? "" : "s"}` : null,
                metrics.responsesThisWeek > 0 ? `${metrics.responsesThisWeek} new response${metrics.responsesThisWeek === 1 ? "" : "s"} this week` : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </span>
          ) : null}
        </>
      }
      actions={
        <button
          type="button"
          className={gBtnPopSm}
          onClick={model.startCreate}
          disabled={model.previewMode}
          title={model.previewMode ? "Creating signups is off in preview" : undefined}
          data-testid="teacher-signups-create"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Create signup
        </button>
      }
    />
  );

  if (model.signups.length === 0) {
    return (
      <>
        {header}
        <GCard index={1} kicker="Get started">
          <GardenEmptyState
            icon={ClipboardList}
            title="Create your first signup"
            description="Ask parents to help with reading buddies, class events, field trips, and more. Start from a template and publish in a couple of minutes."
          />
          <ol className="m-0 mt-4 grid list-none gap-2 p-0 sm:grid-cols-3">
            {["Pick a template or start blank", "Choose time slots, roles or an open signup", "Publish — and send a reminder if you like"].map(
              (text, index) => (
                <li key={text} className="flex items-start gap-2.5 rounded-[14px] bg-[var(--sf-paper)] px-3.5 py-3 text-[13.5px] font-semibold text-[var(--sf-ink)]/85">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-[1.5px] border-[var(--sf-ink)]/25 bg-white text-[12px] font-extrabold tabular-nums">
                    {index + 1}
                  </span>
                  {text}
                </li>
              ),
            )}
          </ol>
        </GCard>
      </>
    );
  }

  return (
    <>
      {header}

      {firstDraft ? (
        <GardenLeadStrip
          icon={PencilLine}
          kicker={`Needs attention · ${model.drafts.length} draft${model.drafts.length === 1 ? "" : "s"}`}
          title={`“${firstDraft.title}” isn't published yet`}
          meta="Families can't see drafts. Finish the details and publish when you're ready."
          cta="Continue draft"
          onClick={() => model.openSidebar(firstDraft.id)}
          data-testid="teacher-signups-lead-draft"
        />
      ) : firstNeedy ? (
        <GardenLeadStrip
          icon={BellRing}
          kicker={`Needs attention · ${model.needsAttention.length} signup${model.needsAttention.length === 1 ? "" : "s"}`}
          title={`“${firstNeedy.title}” still needs people`}
          meta={getSignupProgress(firstNeedy, model.confirmedResponses(firstNeedy.id)).label}
          cta="Open signup"
          onClick={() => model.openSidebar(firstNeedy.id)}
          data-testid="teacher-signups-lead-attention"
        />
      ) : null}

      <GardenStatTiles
        layout="strip"
        ariaLabel="Signups at a glance"
        stats={[
          {
            id: "open",
            label: "Open signups",
            value: metrics.openCount,
            accent: "forest",
            active: model.filter === "open",
            onClick: () => model.setFilter(model.filter === "open" ? "all" : "open"),
          },
          { id: "responses", label: "Responses this week", value: metrics.responsesThisWeek, accent: "sky" },
          {
            id: "attention",
            label: "Needs attention",
            value: metrics.needsAttentionCount,
            accent: "gold",
            onClick: firstNeedy ? () => model.openSidebar(firstNeedy.id) : undefined,
            hint: firstNeedy ? "Open the first one" : undefined,
          },
        ]}
      />

      <GCard
        index={2}
        kicker="Your signups"
        title={`${model.filteredSignups.length} signup${model.filteredSignups.length === 1 ? "" : "s"}`}
        data-testid="teacher-signups-list"
      >
        <div className="mb-4 flex flex-wrap items-center gap-1.5 border-b-[1.5px] border-dashed border-[var(--sf-ink)]/12 pb-4" role="group" aria-label="Filter by status">
          {FILTERS.map((option) => {
            const active = model.filter === option.key;
            const count = model.statusCounts[option.key];
            return (
              <button
                key={option.key}
                type="button"
                aria-pressed={active}
                aria-label={`${option.label} · ${count}`}
                onClick={() => model.setFilter(option.key)}
                className={`inline-flex min-h-[34px] items-center gap-1.5 rounded-full border-[1.5px] px-3.5 py-1 text-[13px] font-extrabold transition-all duration-200 ${
                  active
                    ? "border-[var(--sf-ink)] bg-[var(--sf-clay)] text-white shadow-[0_2px_0_0_var(--sf-ink)]"
                    : "border-[var(--sf-ink)]/15 bg-white text-[var(--sf-ink)]/70 hover:border-[var(--sf-ink)]/35 hover:text-[var(--sf-ink)]"
                } ${G_FOCUS}`}
              >
                {option.label}
                <span className={`rounded-full px-1.5 text-[11.5px] tabular-nums ${active ? "bg-white/25" : "bg-[var(--sf-ink)]/[0.06]"}`}>{count}</span>
              </button>
            );
          })}
        </div>

        {model.filteredSignups.length === 0 ? (
          <div className="rounded-[16px] bg-[var(--sf-paper)] p-4 text-[13.5px] font-semibold text-[var(--sf-soft)]" role="status">
            No {model.filter} signups right now.{" "}
            <button type="button" className={gLinkSm} onClick={() => model.setFilter("all")}>
              Show all signups
            </button>
          </div>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
            {model.filteredSignups.map((signup, index) => (
              <li key={signup.id}>
                <SignupCard
                  signup={signup}
                  index={index}
                  model={model}
                  flashed={model.flashId === signup.id}
                  selected={model.selectedSignupId === signup.id}
                />
              </li>
            ))}
          </ul>
        )}
      </GCard>
    </>
  );
}

function SignupCard({
  signup,
  index,
  model,
  flashed,
  selected,
}: {
  signup: ClassroomSignup;
  index: number;
  model: TeacherClassroomSignupsModel;
  flashed: boolean;
  selected: boolean;
}) {
  const responses = model.confirmedResponses(signup.id);
  const progress = getSignupProgress(signup, responses);
  const deadline = formatSignupDeadline(signup.responseDeadline);
  const pastDue = signup.status === "open" && signup.responseDeadline != null && new Date(signup.responseDeadline) < new Date();
  const actionLabel = signup.status === "draft" ? "Continue draft" : signup.status === "open" ? "Manage" : "View";
  const Icon = signup.status === "closed" ? Lock : ClipboardList;

  return (
    <div
      className={`relative flex flex-col gap-3 rounded-[18px] border-[1.5px] p-4 transition-colors duration-500 sm:flex-row sm:items-center ${
        flashed
          ? "border-[var(--sf-forest)]/40 bg-[var(--sf-mint)]"
          : selected
            ? "border-[var(--sf-clay)]/40 bg-[var(--sf-accent-wash)]"
            : signup.status === "closed"
              ? "border-[var(--sf-ink)]/10 bg-[var(--sf-paper)]"
              : "border-[var(--sf-ink)]/12 bg-white hover:border-[var(--sf-ink)]/30"
      }`}
    >
      <button
        type="button"
        onClick={() => model.openSidebar(signup.id)}
        aria-label={`${actionLabel}: ${signup.title}`}
        className={`absolute inset-0 rounded-[18px] ${G_FOCUS}`}
      />
      <div className="pointer-events-none flex min-w-0 flex-1 items-start gap-3">
        <span
          aria-hidden="true"
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] ${
            signup.status === "closed" ? "bg-[var(--sf-ink)]/[0.06]" : NOTE_TINTS[index % NOTE_TINTS.length]
          }`}
        >
          <Icon className="h-5 w-5 text-[var(--sf-ink)]/75" strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="sf-display m-0 text-[1.1rem] leading-tight text-[var(--sf-ink)]">{signup.title}</p>
          <p className="m-0 mt-1 flex items-center gap-1.5 text-[13px] font-semibold text-[var(--sf-soft)]">
            <UsersRound className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="truncate">{formatAudienceLabel(signup)}</span>
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <GChip tone={SIGNUP_STATUS_TONES[signup.status]}>{SIGNUP_STATUS_LABELS[signup.status]}</GChip>
            <GChip tone="info">{SIGNUP_TYPE_LABELS[signup.signupType]}</GChip>
            {deadline ? (
              <GChip tone={pastDue ? "alert" : "neutral"}>
                <span className="inline-flex items-center gap-1">
                  <CalendarClock className="h-3.5 w-3.5" aria-hidden />
                  {pastDue ? `Deadline passed ${deadline}` : `Sign up by ${deadline}`}
                </span>
              </GChip>
            ) : null}
          </div>
          {signup.status !== "draft" ? (
            <div className="mt-3 flex items-center gap-3">
              <GProgress
                value={progress.filled}
                total={Math.max(progress.total, 1)}
                label={`${signup.title}: ${progress.label}`}
                done={progress.isComplete}
                className="max-w-sm"
              />
              <span className="shrink-0 text-[12.5px] font-extrabold tabular-nums text-[var(--sf-ink)]/70">{progress.label}</span>
            </div>
          ) : null}
        </div>
      </div>
      <span className="pointer-events-none inline-flex shrink-0 items-center gap-1 self-end rounded-full border-[1.5px] border-[var(--sf-ink)]/20 bg-white px-3.5 py-1.5 text-[13px] font-extrabold text-[var(--sf-ink)] sm:self-center">
        {actionLabel}
        <ChevronRight className="h-4 w-4" aria-hidden />
      </span>
    </div>
  );
}
