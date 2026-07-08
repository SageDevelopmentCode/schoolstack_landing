"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, Reorder, motion, useDragControls } from "framer-motion";
import {
  CalendarClock,
  ChevronDown,
  GripVertical,
  Info,
  ListChecks,
  Plus,
  Trash2,
} from "lucide-react";
import ConfirmDialog from "@/components/school-admin/ConfirmDialog";
import AdmissionsAvailabilityEditor from "./AdmissionsAvailabilityEditor";
import type {
  ApplicationFormPostSubmitConfig,
  PostSubmitAction,
  PostSubmitActionType,
} from "@/lib/admissions/application-form-schema";
import {
  POST_SUBMIT_ACTION_TEMPLATES,
  POST_SUBMIT_ACTION_TYPES,
  createPostSubmitAction,
  postSubmitActionLabel,
  postSubmitDurationOptionLabel,
  postSubmitDurationOptions,
  resolvedPostSubmitDurationMinutes,
} from "@/lib/admissions/post-submit-templates";
import {
  countAdmissionsAvailabilitySlotsInMonth,
  getOrganizationTimezone,
  todayMonthYearInTimezone,
} from "@/lib/admissions/admissions-availability";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { createClient } from "@/utils/supabase/client";

type ApplicationFormPostSubmitEditorProps = {
  C: AdminThemeTokens;
  organizationId: string;
  postSubmitConfig: ApplicationFormPostSubmitConfig;
  readOnly: boolean;
  onChange: (config: ApplicationFormPostSubmitConfig) => void;
};

function PostSubmitActionRow({
  C,
  action,
  readOnly,
  expanded,
  inputStyle,
  onToggleExpand,
  onUpdate,
  onDelete,
}: {
  C: AdminThemeTokens;
  action: PostSubmitAction;
  readOnly: boolean;
  expanded: boolean;
  inputStyle: React.CSSProperties;
  onToggleExpand: () => void;
  onUpdate: (patch: Partial<PostSubmitAction>) => void;
  onDelete: () => void;
}) {
  const dragControls = useDragControls();
  const template = POST_SUBMIT_ACTION_TEMPLATES[action.type];
  const Icon = template.Icon;

  return (
    <Reorder.Item
      as="div"
      value={action}
      dragListener={false}
      dragControls={dragControls}
      layout="position"
      className="overflow-hidden rounded-sm border"
      style={{ listStyle: "none", borderColor: C.border, backgroundColor: C.surface }}
    >
      <div className="flex items-center gap-2 px-3 py-2.5">
        {!readOnly ? (
          <button
            type="button"
            aria-label="Drag to reorder step"
            className="shrink-0 touch-none cursor-grab active:cursor-grabbing"
            style={{ color: C.textQuaternary }}
            onPointerDown={(e) => dragControls.start(e)}
          >
            <GripVertical className="h-4 w-4" />
          </button>
        ) : null}
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm"
          style={{ backgroundColor: C.accentLight, color: C.accent }}
        >
          <Icon className="h-4 w-4" />
        </span>
        <button
          type="button"
          onClick={onToggleExpand}
          className="min-w-0 flex-1 text-left"
        >
          <p className="truncate text-sm font-medium" style={{ color: C.textPrimary }}>
            {postSubmitActionLabel(action)}
          </p>
          <p className="truncate text-[11px]" style={{ color: C.textTertiary }}>
            {template.description}
          </p>
        </button>
        {!readOnly ? (
          <label
            className="inline-flex shrink-0 items-center gap-1.5 text-[11px] font-medium"
            style={{ color: C.textSecondary }}
          >
            <input
              type="checkbox"
              checked={action.enabled}
              onChange={(e) => onUpdate({ enabled: e.target.checked })}
              className="h-3.5 w-3.5 rounded"
              style={{ accentColor: C.accent }}
            />
            On
          </label>
        ) : null}
        <button
          type="button"
          onClick={onToggleExpand}
          className="shrink-0 rounded p-1"
          style={{ color: C.textTertiary }}
          aria-label={expanded ? "Collapse step" : "Expand step"}
        >
          <ChevronDown
            className="h-4 w-4 transition-transform duration-150"
            style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
          />
        </button>
        {!readOnly ? (
          <button
            type="button"
            onClick={onDelete}
            className="shrink-0 rounded p-1.5"
            style={{ color: C.error, backgroundColor: C.errorBg }}
            aria-label="Remove step"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div
              className="space-y-4 px-3 pb-3 pt-1"
              style={{ borderTop: `1px solid ${C.border}` }}
            >
              <div className="space-y-1">
                <label className="block text-xs font-medium" style={{ color: C.textSecondary }}>
                  Title
                </label>
                <input
                  type="text"
                  value={action.title ?? ""}
                  disabled={readOnly}
                  onChange={(e) => onUpdate({ title: e.target.value })}
                  placeholder={template.label}
                  style={inputStyle}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium" style={{ color: C.textSecondary }}>
                  Instructions for families
                </label>
                <textarea
                  rows={3}
                  value={action.instructions ?? ""}
                  disabled={readOnly}
                  onChange={(e) => onUpdate({ instructions: e.target.value })}
                  placeholder={template.defaultInstructions}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium" style={{ color: C.textSecondary }}>
                  Duration
                </label>
                <select
                  value={resolvedPostSubmitDurationMinutes(action)}
                  disabled={readOnly}
                  onChange={(e) =>
                    onUpdate({ durationMinutes: Number(e.target.value) })
                  }
                  style={inputStyle}
                >
                  {postSubmitDurationOptions(action.type).map((minutes) => (
                    <option key={minutes} value={minutes}>
                      {postSubmitDurationOptionLabel(minutes)}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] leading-relaxed" style={{ color: C.textTertiary }}>
                  Families will book a consecutive block of this length from your open
                  availability.
                </p>
              </div>

              <label
                className="inline-flex items-center gap-2 text-xs font-medium"
                style={{ color: C.textPrimary }}
              >
                <input
                  type="checkbox"
                  checked={action.required !== false}
                  disabled={readOnly}
                  onChange={(e) => onUpdate({ required: e.target.checked })}
                  className="h-4 w-4 rounded"
                  style={{ accentColor: C.accent }}
                />
                Required before enrollment
              </label>

              <div
                className="flex gap-2 rounded-sm px-3 py-2.5 text-[11px] leading-relaxed"
                style={{
                  backgroundColor: C.infoBg,
                  color: C.info,
                  border: `1px solid ${C.border}`,
                }}
              >
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <p>
                  Families schedule these steps from their apply dashboard after
                  submitting. Set your school&apos;s open visit times above.
                </p>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Reorder.Item>
  );
}

export default function ApplicationFormPostSubmitEditor({
  C,
  organizationId,
  postSubmitConfig,
  readOnly,
  onChange,
}: ApplicationFormPostSubmitEditorProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [showAvailability, setShowAvailability] = useState(false);
  const [monthSlotCount, setMonthSlotCount] = useState<number | null>(null);
  const [expandedActionId, setExpandedActionId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const supabase = useMemo(() => createClient(), []);

  const refreshCurrentMonthSlotCount = useCallback(async () => {
    try {
      const timezone = await getOrganizationTimezone(supabase, organizationId);
      const { year, month } = todayMonthYearInTimezone(timezone);
      const count = await countAdmissionsAvailabilitySlotsInMonth(
        supabase,
        organizationId,
        year,
        month,
      );
      setMonthSlotCount(count);
    } catch {
      setMonthSlotCount(0);
    }
  }, [organizationId, supabase]);

  useEffect(() => {
    void refreshCurrentMonthSlotCount();
  }, [refreshCurrentMonthSlotCount]);

  const canAddStep = !readOnly && monthSlotCount !== null && monthSlotCount > 0;

  useEffect(() => {
    if (!canAddStep && showPicker) {
      setShowPicker(false);
    }
  }, [canAddStep, showPicker]);

  const inputStyle: React.CSSProperties = {
    backgroundColor: C.input,
    border: `1px solid ${C.inputBorder}`,
    color: C.textPrimary,
    borderRadius: C.r.sm,
    fontSize: "12px",
    padding: "8px 10px",
    width: "100%",
    boxSizing: "border-box",
  };

  const usedTypes = new Set(postSubmitConfig.actions.map((action) => action.type));
  const availableTypes = POST_SUBMIT_ACTION_TYPES.filter((type) => !usedTypes.has(type));
  const pendingDeleteAction = postSubmitConfig.actions.find(
    (action) => action.id === pendingDeleteId,
  );

  const updateActions = (actions: PostSubmitAction[]) => {
    onChange({ actions });
  };

  const updateAction = (id: string, patch: Partial<PostSubmitAction>) => {
    updateActions(
      postSubmitConfig.actions.map((action) =>
        action.id === id ? { ...action, ...patch } : action,
      ),
    );
  };

  const addAction = (type: PostSubmitActionType) => {
    const action = createPostSubmitAction(type);
    updateActions([...postSubmitConfig.actions, action]);
    setExpandedActionId(action.id);
    setShowPicker(false);
  };

  const confirmDelete = () => {
    if (!pendingDeleteId) return;
    updateActions(postSubmitConfig.actions.filter((action) => action.id !== pendingDeleteId));
    if (expandedActionId === pendingDeleteId) {
      setExpandedActionId(null);
    }
    setPendingDeleteId(null);
  };

  const handleReorder = (next: PostSubmitAction[]) => {
    if (readOnly) return;
    if (next.length === 0 && postSubmitConfig.actions.length > 0) return;
    const unchanged =
      next.length === postSubmitConfig.actions.length &&
      next.every((action, index) => action.id === postSubmitConfig.actions[index]?.id);
    if (unchanged) return;
    updateActions(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {!readOnly ? (
          <button
            type="button"
            onClick={() => setShowAvailability((open) => !open)}
            className="inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-[11px] font-medium"
            style={{
              backgroundColor: showAvailability ? C.accentLight : C.surface,
              color: C.accent,
              border: `1px solid ${C.secondaryBtnBorder}`,
            }}
          >
            <CalendarClock className="h-3.5 w-3.5" />
            {showAvailability ? "Hide availability" : "Set availability"}
          </button>
        ) : null}
        {monthSlotCount !== null && monthSlotCount > 0 ? (
          <span
            className="rounded-full px-2.5 py-0.5 text-[11px] font-medium"
            style={{ backgroundColor: C.accentLight, color: C.accent }}
          >
            {monthSlotCount} open slot{monthSlotCount === 1 ? "" : "s"} this month
          </span>
        ) : null}
        {monthSlotCount === 0 ? (
          <span
            className="rounded-full px-2.5 py-0.5 text-[11px] font-medium"
            style={{ backgroundColor: C.warningBg, color: C.warning }}
          >
            No open slots this month
          </span>
        ) : null}
      </div>

      {monthSlotCount === 0 ? (
        <p className="text-[11px] leading-relaxed" style={{ color: C.textTertiary }}>
          Open at least one visit time this month before adding a scheduling step.
        </p>
      ) : null}

      <AnimatePresence initial={false}>
        {showAvailability ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div
              className="rounded-sm border p-4"
              style={{ borderColor: C.border, backgroundColor: C.elevated }}
            >
              <AdmissionsAvailabilityEditor
                C={C}
                organizationId={organizationId}
                readOnly={readOnly}
                onMonthSlotCountChange={() => {
                  void refreshCurrentMonthSlotCount();
                }}
              />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <Reorder.Group
        axis="y"
        values={postSubmitConfig.actions}
        onReorder={handleReorder}
        as="div"
        className="flex flex-col gap-2"
      >
        {postSubmitConfig.actions.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center rounded-sm py-10"
            style={{ border: `2px dashed ${C.borderStrong}`, color: C.textTertiary }}
          >
            <ListChecks className="mb-2 h-6 w-6 opacity-40" />
            <p className="mb-3 text-sm">No post-submit steps yet.</p>
            {!readOnly ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    if (canAddStep) setShowPicker(true);
                  }}
                  disabled={!canAddStep}
                  className="flex items-center gap-1 rounded-sm px-3 py-1.5 text-[11px] font-medium disabled:cursor-not-allowed disabled:opacity-60"
                  style={{
                    backgroundColor: C.accentLight,
                    color: C.accent,
                    border: `1px solid ${C.secondaryBtnBorder}`,
                  }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add step
                </button>
                {monthSlotCount === 0 ? (
                  <p className="mt-2 max-w-xs text-center text-[11px] leading-relaxed">
                    Set availability above to add your first step.
                  </p>
                ) : null}
              </>
            ) : null}
          </div>
        ) : (
          postSubmitConfig.actions.map((action) => (
            <PostSubmitActionRow
              key={action.id}
              C={C}
              action={action}
              readOnly={readOnly}
              expanded={expandedActionId === action.id}
              inputStyle={inputStyle}
              onToggleExpand={() =>
                setExpandedActionId((prev) => (prev === action.id ? null : action.id))
              }
              onUpdate={(patch) => updateAction(action.id, patch)}
              onDelete={() => setPendingDeleteId(action.id)}
            />
          ))
        )}
      </Reorder.Group>

      <AnimatePresence initial={false}>
        {showPicker && canAddStep && availableTypes.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div
              className="space-y-2 rounded-sm border p-3"
              style={{ borderColor: C.border, backgroundColor: C.elevated }}
            >
              <p className="text-xs font-semibold" style={{ color: C.textSecondary }}>
                Choose a template
              </p>
              <div className="grid gap-2 sm:grid-cols-1">
                {availableTypes.map((type) => {
                  const template = POST_SUBMIT_ACTION_TEMPLATES[type];
                  const Icon = template.Icon;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => addAction(type)}
                      className="flex items-start gap-3 rounded-sm border px-3 py-2.5 text-left transition-colors hover:opacity-90"
                      style={{
                        borderColor: C.border,
                        backgroundColor: C.surface,
                      }}
                    >
                      <span
                        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-sm"
                        style={{ backgroundColor: C.accentLight, color: C.accent }}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span
                          className="block text-sm font-medium"
                          style={{ color: C.textPrimary }}
                        >
                          {template.label}
                        </span>
                        <span
                          className="mt-0.5 block text-[11px] leading-snug"
                          style={{ color: C.textTertiary }}
                        >
                          {template.description}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => setShowPicker(false)}
                className="text-[11px] font-medium"
                style={{ color: C.textTertiary }}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {!readOnly &&
      postSubmitConfig.actions.length > 0 &&
      availableTypes.length > 0 &&
      !showPicker ? (
        <button
          type="button"
          onClick={() => {
            if (canAddStep) setShowPicker(true);
          }}
          disabled={!canAddStep}
          className="flex items-center gap-1 rounded-sm px-3 py-1.5 text-[11px] font-medium disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            backgroundColor: C.accentLight,
            color: C.accent,
            border: `1px solid ${C.secondaryBtnBorder}`,
          }}
        >
          <Plus className="h-3.5 w-3.5" />
          Add step
        </button>
      ) : null}

      <ConfirmDialog
        C={C}
        open={pendingDeleteId !== null}
        title="Remove this post-submit step?"
        description={
          pendingDeleteAction
            ? `"${postSubmitActionLabel(pendingDeleteAction)}" will be removed from this form.`
            : "This step will be removed from the form."
        }
        confirmLabel="Remove"
        variant="destructive"
        onConfirm={confirmDelete}
        onClose={() => setPendingDeleteId(null)}
      />
    </div>
  );
}
