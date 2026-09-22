"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { CheckSquare, Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/school-admin/ConfirmDialog";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import SchoolAdminDatePicker from "@/components/school-admin/ui/SchoolAdminDatePicker";
import SchoolAdminSelect from "@/components/school-admin/ui/SchoolAdminSelect";
import CommitteeFormSidePanel, {
  CommitteeFormSection,
} from "@/components/school-admin/committees/sections/CommitteeFormSidePanel";
import {
  committeeStoryInputClassName,
  committeeStoryInputStyle,
} from "@/components/school-admin/committees/committee-story-input-style";
import { CommitteeAttributionLabel } from "@/components/school-admin/committees/CommitteeAttributionLabel";
import type {
  CommitteeMember,
  CommitteeTask,
  CommitteeTaskGroupDef,
  CommitteeTaskStatus,
} from "@/lib/committees/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { parentThemeToAdminCompat } from "@/lib/organization-settings/parent-theme";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { TASK_STATUS_LABELS } from "@/lib/committees/task-utils";

export type CommitteeTaskFormData = {
  title: string;
  description: string;
  group: string;
  assigneeMemberId: string | null;
  dueDate: string;
  status: CommitteeTaskStatus;
};

export type CommitteeTaskPanelState =
  | { mode: "create"; status: CommitteeTaskStatus }
  | { mode: "edit"; taskId: string };

type CommitteeTaskDetailPanelProps = {
  open: boolean;
  mode: "create" | "edit";
  task: CommitteeTask | null;
  defaultStatus?: CommitteeTaskStatus;
  taskGroups: CommitteeTaskGroupDef[];
  members: CommitteeMember[];
  theme: ParentThemeTokens;
  readOnly?: boolean;
  canEdit?: boolean;
  saving?: boolean;
  pendingNavigation?: CommitteeTaskPanelState | null;
  onClose: () => void;
  onSave: (data: CommitteeTaskFormData) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
  onDirtyChange?: (dirty: boolean) => void;
  onConfirmNavigation?: (state: CommitteeTaskPanelState) => void;
  onCancelNavigation?: () => void;
};

const STATUS_OPTIONS: CommitteeTaskStatus[] = [
  "open",
  "claimed",
  "in_progress",
  "done",
];

function FieldLabel({
  theme,
  htmlFor,
  children,
  hint,
}: {
  theme: ParentThemeTokens;
  htmlFor?: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1">
      <label
        htmlFor={htmlFor}
        className="block text-xs font-semibold uppercase tracking-wide"
        style={{ color: theme.muted }}
      >
        {children}
      </label>
      {hint ? (
        <p className="text-xs leading-snug" style={{ color: theme.muted }}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function buildFormState(
  mode: "create" | "edit",
  task: CommitteeTask | null,
  defaultStatus: CommitteeTaskStatus,
  defaultGroup: string,
): CommitteeTaskFormData {
  if (mode === "edit" && task) {
    return {
      title: task.title,
      description: task.description ?? "",
      group: task.group,
      assigneeMemberId: task.assigneeId ?? null,
      dueDate: task.dueDate ?? "",
      status: task.status,
    };
  }

  return {
    title: "",
    description: "",
    group: defaultGroup,
    assigneeMemberId: null,
    dueDate: "",
    status: defaultStatus,
  };
}

function normalizeTaskForm(form: CommitteeTaskFormData): CommitteeTaskFormData {
  return {
    title: form.title.trim(),
    description: form.description.trim(),
    group: form.group,
    assigneeMemberId: form.assigneeMemberId,
    dueDate: form.dueDate,
    status: form.status,
  };
}

export function areTaskFormsEqual(
  a: CommitteeTaskFormData,
  b: CommitteeTaskFormData,
): boolean {
  const left = normalizeTaskForm(a);
  const right = normalizeTaskForm(b);

  return (
    left.title === right.title &&
    left.description === right.description &&
    left.group === right.group &&
    left.assigneeMemberId === right.assigneeMemberId &&
    left.dueDate === right.dueDate &&
    left.status === right.status
  );
}

export default function CommitteeTaskDetailPanel({
  open,
  mode,
  task,
  defaultStatus = "open",
  taskGroups,
  members,
  theme,
  readOnly = false,
  canEdit = true,
  saving = false,
  pendingNavigation = null,
  onClose,
  onSave,
  onDelete,
  onDirtyChange,
  onConfirmNavigation,
  onCancelNavigation,
}: CommitteeTaskDetailPanelProps) {
  const C = useMemo(() => parentThemeToAdminCompat(theme), [theme]);
  const inputStyle = useMemo(() => committeeStoryInputStyle(theme), [theme]);
  const defaultGroup = taskGroups[0]?.id ?? "general";

  const [form, setForm] = useState<CommitteeTaskFormData>(() =>
    buildFormState(mode, task, defaultStatus, defaultGroup),
  );
  const [baselineForm, setBaselineForm] = useState<CommitteeTaskFormData>(() =>
    buildFormState(mode, task, defaultStatus, defaultGroup),
  );
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [discardIntent, setDiscardIntent] = useState<"close" | "navigate">("close");

  useEffect(() => {
    if (!open) return;
    const nextForm = buildFormState(mode, task, defaultStatus, defaultGroup);
    queueMicrotask(() => {
      setForm(nextForm);
      setBaselineForm(nextForm);
      setDiscardDialogOpen(false);
      setDeleteDialogOpen(false);
    });
  }, [open, mode, task, defaultStatus, defaultGroup]);

  const editable = !readOnly && canEdit;

  const isDirty = useMemo(
    () => editable && !areTaskFormsEqual(form, baselineForm),
    [editable, form, baselineForm],
  );

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  useEffect(() => {
    if (!open || !pendingNavigation || !isDirty) return;
    queueMicrotask(() => {
      setDiscardIntent("navigate");
      setDiscardDialogOpen(true);
    });
  }, [open, pendingNavigation, isDirty]);

  const requestClose = useCallback(() => {
    if (saving) return;

    if (!isDirty) {
      onClose();
      return;
    }

    setDiscardIntent("close");
    setDiscardDialogOpen(true);
  }, [isDirty, onClose, saving]);

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || saving) return;

      if (deleteDialogOpen) {
        setDeleteDialogOpen(false);
        return;
      }

      if (discardDialogOpen) {
        setDiscardDialogOpen(false);
        if (discardIntent === "navigate") {
          onCancelNavigation?.();
        }
        return;
      }

      requestClose();
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [
    deleteDialogOpen,
    discardDialogOpen,
    discardIntent,
    onCancelNavigation,
    open,
    requestClose,
    saving,
  ]);

  const assignableMembers = useMemo(
    () =>
      members.filter(
        (member) => member.role === "member" || member.role === "lead",
      ),
    [members],
  );

  const categoryOptions = useMemo(
    () =>
      taskGroups.map((groupItem) => ({
        value: groupItem.id,
        label: groupItem.label,
      })),
    [taskGroups],
  );

  const assigneeOptions = useMemo(
    () => [
      { value: "", label: "Unassigned" },
      ...assignableMembers.map((member) => ({
        value: member.id,
        label: member.name,
      })),
    ],
    [assignableMembers],
  );

  const statusOptions = useMemo(
    () =>
      STATUS_OPTIONS.map((status) => ({
        value: status,
        label: TASK_STATUS_LABELS[status],
      })),
    [],
  );

  const showFooter = editable;
  const headerTitle =
    mode === "create" ? "New task" : task?.title?.trim() || "Task";
  const canSubmit = isDirty && form.title.trim().length > 0;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!editable || !canSubmit) return;
    void onSave(form);
  };

  const handleConfirmDiscard = () => {
    setDiscardDialogOpen(false);

    if (discardIntent === "navigate" && pendingNavigation) {
      onConfirmNavigation?.(pendingNavigation);
      return;
    }

    onClose();
  };

  const handleCancelDiscard = () => {
    setDiscardDialogOpen(false);
    if (discardIntent === "navigate") {
      onCancelNavigation?.();
    }
  };

  const handleConfirmDelete = () => {
    setDeleteDialogOpen(false);
    void onDelete?.();
  };

  return (
    <>
      <CommitteeFormSidePanel
        open={open}
        theme={theme}
        kicker={mode === "create" ? "New task" : "Task"}
        title={headerTitle}
        icon={<CheckSquare className="h-4 w-4" style={{ color: theme.primary }} />}
        onRequestClose={requestClose}
        saving={saving}
        formId="committee-task-form"
        onSubmit={handleSubmit}
        footer={
          showFooter ? (
            <div className="flex items-center justify-between gap-2">
              {mode === "edit" && onDelete ? (
                <button
                  type="button"
                  onClick={() => setDeleteDialogOpen(true)}
                  disabled={saving}
                  className="rounded-md p-2 transition-colors disabled:opacity-50"
                  style={{ color: theme.alert }}
                  aria-label="Delete task"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              ) : (
                <span aria-hidden="true" />
              )}
              <div className="flex gap-2">
                <AdminButton
                  theme={theme}
                  variant="soft"
                  type="button"
                  onClick={requestClose}
                  disabled={saving}
                >
                  Cancel
                </AdminButton>
                <AdminButton
                  theme={theme}
                  variant="primary"
                  type="submit"
                  disabled={saving || !canSubmit}
                >
                  {saving
                    ? mode === "create"
                      ? "Adding…"
                      : "Saving…"
                    : mode === "create"
                      ? "Add task"
                      : "Save changes"}
                </AdminButton>
              </div>
            </div>
          ) : undefined
        }
      >
        <CommitteeFormSection theme={theme} title="Details">
          <div className="space-y-2">
            <FieldLabel theme={theme} htmlFor="committee-task-title">
              Title
            </FieldLabel>
            <input
              id="committee-task-title"
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              placeholder="What needs to be done?"
              disabled={!editable}
              className={committeeStoryInputClassName}
              style={inputStyle}
            />
          </div>
          <div className="space-y-2">
            <FieldLabel theme={theme} htmlFor="committee-task-description">
              Description
            </FieldLabel>
            <textarea
              id="committee-task-description"
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              placeholder="Add details, links, or instructions"
              rows={4}
              disabled={!editable}
              className={`${committeeStoryInputClassName} resize-y`}
              style={inputStyle}
            />
          </div>
        </CommitteeFormSection>

        <CommitteeFormSection theme={theme} title="Organization">
          <div className="space-y-2">
            <FieldLabel
              theme={theme}
              hint="Workstreams for this committee — use them to group related tasks."
            >
              Category
            </FieldLabel>
            <TaskSelect
              C={C}
              value={form.group}
              onChange={(value) =>
                setForm((current) => ({ ...current, group: value }))
              }
              options={categoryOptions}
              ariaLabel="Task category"
              disabled={!editable}
            />
          </div>
          <div className="space-y-2">
            <FieldLabel theme={theme}>Status</FieldLabel>
            <TaskSelect
              C={C}
              value={form.status}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  status: value as CommitteeTaskStatus,
                }))
              }
              options={statusOptions}
              ariaLabel="Task status"
              disabled={!editable}
            />
          </div>
        </CommitteeFormSection>

        <CommitteeFormSection theme={theme} title="Assignment">
          <div className="space-y-2">
            <FieldLabel theme={theme}>Assignee</FieldLabel>
            <TaskSelect
              C={C}
              value={form.assigneeMemberId ?? ""}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  assigneeMemberId: value || null,
                }))
              }
              options={assigneeOptions}
              ariaLabel="Task assignee"
              disabled={!editable}
            />
          </div>
          <div className="space-y-2">
            <FieldLabel theme={theme}>Due date</FieldLabel>
            <SchoolAdminDatePicker
              id="committee-task-due-date"
              C={C}
              value={form.dueDate}
              onChange={(dueDate) =>
                setForm((current) => ({ ...current, dueDate }))
              }
              placeholder="Select due date…"
              disabled={!editable}
            />
          </div>
        </CommitteeFormSection>

        {mode === "edit" && task ? (
          <CommitteeAttributionLabel
            theme={theme}
            createdByMemberId={task.createdByMemberId}
            createdByName={task.createdByName}
            createdByRole={task.createdByRole}
            members={members}
            className="text-xs"
          />
        ) : null}
      </CommitteeFormSidePanel>

      <ConfirmDialog
        C={C}
        open={discardDialogOpen}
        title="Unsaved changes"
        description="You have unsaved changes. If you close now, your changes will be lost."
        confirmLabel="Discard changes"
        cancelLabel="Keep editing"
        variant="destructive"
        onConfirm={handleConfirmDiscard}
        onClose={handleCancelDiscard}
      />

      <ConfirmDialog
        C={C}
        open={deleteDialogOpen}
        title="Delete task?"
        description="This task will be permanently removed. This cannot be undone."
        confirmLabel="Delete task"
        cancelLabel="Cancel"
        variant="destructive"
        loading={saving}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteDialogOpen(false)}
      />
    </>
  );
}

function TaskSelect({
  C,
  value,
  onChange,
  options,
  ariaLabel,
  disabled,
}: {
  C: AdminThemeTokens;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  ariaLabel: string;
  disabled?: boolean;
}) {
  return (
    <SchoolAdminSelect
      C={C}
      value={value}
      onChange={onChange}
      options={options}
      ariaLabel={ariaLabel}
      disabled={disabled}
      triggerClassName="rounded-md text-sm"
    />
  );
}
