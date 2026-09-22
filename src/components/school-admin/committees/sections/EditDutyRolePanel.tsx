"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { Trash2, UserRound } from "lucide-react";
import ConfirmDialog from "@/components/school-admin/ConfirmDialog";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import SchoolAdminSelect from "@/components/school-admin/ui/SchoolAdminSelect";
import CommitteeFormSidePanel from "@/components/school-admin/committees/sections/CommitteeFormSidePanel";
import {
  committeeStoryInputClassName,
  committeeStoryInputStyle,
} from "@/components/school-admin/committees/committee-story-input-style";
import type { Committee, CommitteeDutyRole } from "@/lib/committees/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { parentThemeToAdminCompat } from "@/lib/organization-settings/parent-theme";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

export type DutyRoleFormValue = {
  title: string;
  description: string;
  assigneeMemberId: string | null;
};

export type DutyRolePanelState =
  | { mode: "create" }
  | { mode: "edit"; roleId: string };

function emptyDutyRoleForm(): DutyRoleFormValue {
  return {
    title: "",
    description: "",
    assigneeMemberId: null,
  };
}

function dutyRoleToForm(role: CommitteeDutyRole | null): DutyRoleFormValue {
  if (!role) return emptyDutyRoleForm();
  return {
    title: role.title,
    description: role.description ?? "",
    assigneeMemberId: role.assigneeId ?? null,
  };
}

function normalizeDutyRoleForm(form: DutyRoleFormValue): DutyRoleFormValue {
  return {
    title: form.title.trim(),
    description: form.description.trim(),
    assigneeMemberId: form.assigneeMemberId,
  };
}

function areDutyRoleFormsEqual(a: DutyRoleFormValue, b: DutyRoleFormValue): boolean {
  const left = normalizeDutyRoleForm(a);
  const right = normalizeDutyRoleForm(b);
  return (
    left.title === right.title &&
    left.description === right.description &&
    left.assigneeMemberId === right.assigneeMemberId
  );
}

function panelStatesEqual(a: DutyRolePanelState, b: DutyRolePanelState): boolean {
  if (a.mode !== b.mode) return false;
  if (a.mode === "create" && b.mode === "create") return true;
  if (a.mode === "edit" && b.mode === "edit") return a.roleId === b.roleId;
  return false;
}

function FieldLabel({
  theme,
  htmlFor,
  children,
}: {
  theme: ParentThemeTokens;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-xs font-semibold uppercase tracking-wide"
      style={{ color: theme.muted }}
    >
      {children}
    </label>
  );
}

type EditDutyRolePanelProps = {
  open: boolean;
  mode: "create" | "edit";
  dutyRole: CommitteeDutyRole | null;
  committee: Committee;
  theme: ParentThemeTokens;
  saving?: boolean;
  pendingNavigation?: DutyRolePanelState | null;
  onClose: () => void;
  onSave: (value: DutyRoleFormValue) => void | Promise<void>;
  onDelete?: () => void;
  onDirtyChange?: (dirty: boolean) => void;
  onConfirmNavigation?: (state: DutyRolePanelState) => void;
  onCancelNavigation?: () => void;
};

export default function EditDutyRolePanel({
  open,
  mode,
  dutyRole,
  committee,
  theme,
  saving = false,
  pendingNavigation = null,
  onClose,
  onSave,
  onDelete,
  onDirtyChange,
  onConfirmNavigation,
  onCancelNavigation,
}: EditDutyRolePanelProps) {
  const C = useMemo(() => parentThemeToAdminCompat(theme), [theme]);
  const inputStyle = useMemo(() => committeeStoryInputStyle(theme), [theme]);

  const [form, setForm] = useState<DutyRoleFormValue>(emptyDutyRoleForm);
  const [baselineForm, setBaselineForm] = useState<DutyRoleFormValue>(emptyDutyRoleForm);
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [discardIntent, setDiscardIntent] = useState<"close" | "navigate">("close");

  useEffect(() => {
    if (!open) return;
    const next = dutyRoleToForm(mode === "edit" ? dutyRole : null);
    setForm(next);
    setBaselineForm(next);
    setDiscardDialogOpen(false);
    setDeleteDialogOpen(false);
  }, [open, mode, dutyRole]);

  const isDirty = useMemo(
    () => !areDutyRoleFormsEqual(form, baselineForm),
    [form, baselineForm],
  );

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  useEffect(() => {
    if (!open || !pendingNavigation || !isDirty) return;
    setDiscardIntent("navigate");
    setDiscardDialogOpen(true);
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
        if (discardIntent === "navigate") onCancelNavigation?.();
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

  const assigneeOptions = useMemo(
    () => [
      { value: "", label: "Unassigned" },
      ...committee.members.map((member) => ({
        value: member.id,
        label: member.name,
      })),
    ],
    [committee.members],
  );

  const canSubmit = isDirty && form.title.trim().length > 0;
  const headerTitle =
    mode === "create" ? "Add role" : dutyRole?.title?.trim() || "Edit role";

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    void onSave(normalizeDutyRoleForm(form));
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
    if (discardIntent === "navigate") onCancelNavigation?.();
  };

  return (
    <>
      <CommitteeFormSidePanel
        open={open}
        theme={theme}
        kicker="Duty roles"
        title={headerTitle}
        icon={<UserRound className="h-4 w-4" style={{ color: theme.primary }} />}
        onRequestClose={requestClose}
        saving={saving}
        formId="committee-duty-role-form"
        onSubmit={handleSubmit}
        footer={
          <div className="flex items-center justify-between gap-2">
            {mode === "edit" && onDelete ? (
              <button
                type="button"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={saving}
                className="rounded-md p-2 transition-colors disabled:opacity-50"
                style={{ color: theme.alert }}
                aria-label="Delete role"
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
                    ? "Add role"
                    : "Save changes"}
              </AdminButton>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <FieldLabel theme={theme} htmlFor="committee-duty-role-title">
              Role title
            </FieldLabel>
            <input
              id="committee-duty-role-title"
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({ ...current, title: event.target.value }))
              }
              placeholder="e.g. Fall Service Project Lead"
              className={committeeStoryInputClassName}
              style={inputStyle}
            />
          </div>

          <div className="space-y-2">
            <FieldLabel theme={theme} htmlFor="committee-duty-role-description">
              Description
            </FieldLabel>
            <textarea
              id="committee-duty-role-description"
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
              placeholder="What does this role involve?"
              rows={4}
              className={`${committeeStoryInputClassName} resize-y`}
              style={inputStyle}
            />
          </div>

          <div className="space-y-2">
            <FieldLabel theme={theme}>Assign to</FieldLabel>
            <DutyRoleSelect
              C={C}
              value={form.assigneeMemberId ?? ""}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  assigneeMemberId: value || null,
                }))
              }
              options={assigneeOptions}
              ariaLabel="Role assignee"
            />
          </div>
        </div>
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
        title="Delete duty role?"
        description={
          dutyRole
            ? `"${dutyRole.title}" will be removed. Members assigned to this role will be unassigned.`
            : ""
        }
        confirmLabel="Delete role"
        cancelLabel="Cancel"
        variant="destructive"
        loading={saving}
        onConfirm={() => {
          setDeleteDialogOpen(false);
          onDelete?.();
        }}
        onClose={() => setDeleteDialogOpen(false)}
      />
    </>
  );
}

export { panelStatesEqual as dutyRolePanelStatesEqual };

function DutyRoleSelect({
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
