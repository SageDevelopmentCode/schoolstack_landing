"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { ExternalLink, FileText, Link2, ListChecks, Trash2, Upload, X } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import ConfirmDialog from "@/components/school-admin/ConfirmDialog";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminChip from "@/components/school-admin/ui/story/AdminChip";
import SchoolAdminSelect from "@/components/school-admin/ui/SchoolAdminSelect";
import CommitteeFormSidePanel from "@/components/school-admin/committees/sections/CommitteeFormSidePanel";
import {
  committeeStoryInputClassName,
  committeeStoryInputStyle,
} from "@/components/school-admin/committees/committee-story-input-style";
import { CommitteeAttributionLabel } from "@/components/school-admin/committees/CommitteeAttributionLabel";
import type { CommitteeMember, CommitteeResource, CommitteeResourceType } from "@/lib/committees/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { parentThemeToAdminCompat } from "@/lib/organization-settings/parent-theme";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import {
  acceptForResourceType,
  formatCommitteeResourceMaxFileSizeLabel,
  openCommitteeResource,
  validateCommitteeResourceFile,
} from "@/lib/committees/resource-file-storage";
import { committeeOperationalSurface } from "@/components/school-admin/committees/CommitteeAttributionLabel";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";

export type CommitteeResourceFormData = {
  title: string;
  description: string;
  url: string;
  type: CommitteeResourceType;
  file: File | null;
};

export type CommitteeResourcePanelState =
  | { mode: "create" }
  | { mode: "view"; resourceId: string };

const RESOURCE_TYPE_OPTIONS: { value: CommitteeResourceType; label: string }[] = [
  { value: "link", label: "Link" },
  { value: "pdf", label: "PDF" },
  { value: "doc", label: "Document" },
  { value: "checklist", label: "Checklist" },
];

export const COMMITTEE_RESOURCE_TYPE_LABELS: Record<CommitteeResourceType, string> = {
  link: "Link",
  pdf: "PDF",
  doc: "Document",
  checklist: "Checklist",
};

export function CommitteeResourceTypeIcon({
  type,
  className = "h-4 w-4",
  style,
}: {
  type: CommitteeResourceType;
  className?: string;
  style?: React.CSSProperties;
}) {
  switch (type) {
    case "link":
      return <Link2 className={className} style={style} />;
    case "checklist":
      return <ListChecks className={className} style={style} />;
    default:
      return <FileText className={className} style={style} />;
  }
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

function FormGroupLabel({
  theme,
  children,
}: {
  theme: ParentThemeTokens;
  children: ReactNode;
}) {
  return (
    <h3
      className="text-[11px] font-semibold uppercase tracking-wide"
      style={{ color: theme.muted }}
    >
      {children}
    </h3>
  );
}

function ResourceOpenLink({
  theme,
  label,
  disabled,
  onClick,
}: {
  theme: ParentThemeTokens;
  label: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex max-w-full items-center gap-1.5 text-left text-sm font-medium underline-offset-2 hover:underline disabled:opacity-50"
      style={{ color: theme.primary }}
    >
      <span className="truncate">{label}</span>
      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
    </button>
  );
}

function emptyResourceForm(): CommitteeResourceFormData {
  return {
    title: "",
    description: "",
    url: "",
    type: "link",
    file: null,
  };
}

function normalizeResourceForm(form: CommitteeResourceFormData): CommitteeResourceFormData {
  return {
    title: form.title.trim(),
    description: form.description.trim(),
    url: form.url.trim(),
    type: form.type,
    file: form.file,
  };
}

function areResourceFormsEqual(
  a: CommitteeResourceFormData,
  b: CommitteeResourceFormData,
): boolean {
  const left = normalizeResourceForm(a);
  const right = normalizeResourceForm(b);
  return (
    left.title === right.title &&
    left.description === right.description &&
    left.url === right.url &&
    left.type === right.type &&
    left.file === right.file
  );
}

function isResourceFormValid(form: CommitteeResourceFormData): boolean {
  if (!form.title.trim()) return false;
  if (form.type === "link") return form.url.trim().length > 0;
  if (form.type === "pdf" || form.type === "doc") return form.file !== null;
  return true;
}

type CommitteeResourceDetailPanelProps = {
  open: boolean;
  mode: "create" | "view";
  resource: CommitteeResource | null;
  theme: ParentThemeTokens;
  supabase: SupabaseClient;
  organizationId: string;
  members: CommitteeMember[];
  readOnly?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  saving?: boolean;
  pendingNavigation?: CommitteeResourcePanelState | null;
  onClose: () => void;
  onSave?: (data: CommitteeResourceFormData) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
  onDirtyChange?: (dirty: boolean) => void;
  onConfirmNavigation?: (state: CommitteeResourcePanelState) => void;
  onCancelNavigation?: () => void;
  isAdmin?: boolean;
};

export default function CommitteeResourceDetailPanel({
  open,
  mode,
  resource,
  theme,
  supabase,
  organizationId,
  members,
  readOnly = false,
  canEdit = true,
  canDelete = false,
  saving = false,
  pendingNavigation = null,
  onClose,
  onSave,
  onDelete,
  onDirtyChange,
  onConfirmNavigation,
  onCancelNavigation,
  isAdmin = true,
}: CommitteeResourceDetailPanelProps) {
  const C = useMemo(() => parentThemeToAdminCompat(theme), [theme]);
  const inputStyle = useMemo(() => committeeStoryInputStyle(theme), [theme]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<CommitteeResourceFormData>(emptyResourceForm);
  const [baselineForm, setBaselineForm] = useState<CommitteeResourceFormData>(emptyResourceForm);
  const [fileError, setFileError] = useState<string | null>(null);
  const [openingFile, setOpeningFile] = useState(false);
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [discardIntent, setDiscardIntent] = useState<"close" | "navigate">("close");

  useEffect(() => {
    if (!open || mode !== "create") return;
    const next = emptyResourceForm();
    queueMicrotask(() => {
      setForm(next);
      setBaselineForm(next);
      setFileError(null);
      setDiscardDialogOpen(false);
      setDeleteDialogOpen(false);
    });
  }, [open, mode]);

  const editable = mode === "create" && !readOnly && canEdit;

  const isDirty = useMemo(
    () => editable && !areResourceFormsEqual(form, baselineForm),
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
    if (mode === "view" || !isDirty) {
      onClose();
      return;
    }
    setDiscardIntent("close");
    setDiscardDialogOpen(true);
  }, [isDirty, mode, onClose, saving]);

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

  const needsFile = form.type === "pdf" || form.type === "doc";
  const canSubmit = isDirty && isResourceFormValid(form);
  const headerTitle =
    mode === "create" ? "New resource" : resource?.title?.trim() || "Resource";

  const typeOptions = useMemo(
    () =>
      RESOURCE_TYPE_OPTIONS.map((option) => ({
        value: option.value,
        label: option.label,
      })),
    [],
  );

  const handleTypeChange = (next: CommitteeResourceType) => {
    setForm((current) => ({
      ...current,
      type: next,
      url: next === "link" ? current.url : "",
      file: next === "pdf" || next === "doc" ? current.file : null,
    }));
    setFileError(null);
  };

  const handleFileSelect = (file: File | null) => {
    if (!file) {
      setForm((current) => ({ ...current, file: null }));
      setFileError(null);
      return;
    }
    const error = validateCommitteeResourceFile(file, form.type);
    if (error) {
      setFileError(error);
      setForm((current) => ({ ...current, file: null }));
      return;
    }
    setFileError(null);
    setForm((current) => ({ ...current, file }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!editable || !canSubmit) return;
    void onSave?.(form);
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

  const handleOpenResource = async () => {
    if (!resource) return;
    if (!resource.url && !resource.storagePath) return;
    setOpeningFile(true);
    try {
      await openCommitteeResource(supabase, resource);
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to open file."));
      void reportPortalOperationalError(committeeOperationalSurface(isAdmin), {
        organizationId,
        operation: "committees.resources.open",
        error: "",
      }, err);
    } finally {
      setOpeningFile(false);
    }
  };

  const maxFileLabel = formatCommitteeResourceMaxFileSizeLabel();

  return (
    <>
      <CommitteeFormSidePanel
        open={open}
        theme={theme}
        kicker={mode === "create" ? "New resource" : "Resource"}
        title={headerTitle}
        icon={
          <CommitteeResourceTypeIcon
            type={resource?.type ?? form.type}
            style={{ color: theme.primary }}
          />
        }
        onRequestClose={requestClose}
        saving={saving}
        formId={editable ? "committee-resource-form" : undefined}
        onSubmit={editable ? handleSubmit : undefined}
        footer={
          mode === "create" && editable ? (
            <div className="flex items-center justify-between gap-2">
              <span aria-hidden="true" />
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
                  {saving ? "Adding…" : "Add resource"}
                </AdminButton>
              </div>
            </div>
          ) : mode === "view" ? (
            <div className="flex items-center justify-between gap-2">
              {canDelete && onDelete ? (
                <button
                  type="button"
                  onClick={() => setDeleteDialogOpen(true)}
                  disabled={saving}
                  className="rounded-md p-2 transition-colors disabled:opacity-50"
                  style={{ color: theme.alert }}
                  aria-label="Delete resource"
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
                  Close
                </AdminButton>
                {(resource?.url || resource?.storagePath) && (
                  <AdminButton
                    theme={theme}
                    variant="primary"
                    type="button"
                    onClick={() => void handleOpenResource()}
                    disabled={openingFile}
                  >
                    {openingFile ? "Opening…" : "Open"}
                    <ExternalLink className="ml-1 h-3.5 w-3.5" />
                  </AdminButton>
                )}
              </div>
            </div>
          ) : undefined
        }
      >
        {mode === "create" && editable ? (
          <div className="space-y-5">
            <div className="space-y-3">
              <FormGroupLabel theme={theme}>Resource details</FormGroupLabel>
              <div className="space-y-2">
                <FieldLabel theme={theme} htmlFor="committee-resource-title">
                  Title
                </FieldLabel>
                <input
                  id="committee-resource-title"
                  value={form.title}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, title: event.target.value }))
                  }
                  placeholder="Resource title"
                  className={committeeStoryInputClassName}
                  style={inputStyle}
                />
              </div>
              <div className="space-y-2">
                <FieldLabel theme={theme}>Type</FieldLabel>
                <ResourceSelect
                  C={C}
                  value={form.type}
                  onChange={(value) => handleTypeChange(value as CommitteeResourceType)}
                  options={typeOptions}
                  ariaLabel="Resource type"
                />
              </div>
              {form.type === "link" && (
                <div className="space-y-2">
                  <FieldLabel theme={theme} htmlFor="committee-resource-url">
                    URL
                  </FieldLabel>
                  <input
                    id="committee-resource-url"
                    value={form.url}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, url: event.target.value }))
                    }
                    placeholder="https://"
                    className={committeeStoryInputClassName}
                    style={inputStyle}
                  />
                </div>
              )}
            </div>

            {needsFile ? (
              <div
                className="space-y-3 border-t pt-5"
                style={{ borderColor: theme.line }}
              >
                <FormGroupLabel theme={theme}>File upload</FormGroupLabel>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={acceptForResourceType(form.type)}
                  className="hidden"
                  onChange={(event) => handleFileSelect(event.target.files?.[0] ?? null)}
                />
                <div
                  className="flex flex-col items-center justify-center rounded-md px-4 py-6 text-center"
                  style={{
                    border: `2px dashed ${theme.line}`,
                    backgroundColor: theme.paper,
                  }}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    if (saving) return;
                    const file = event.dataTransfer.files[0];
                    if (file) handleFileSelect(file);
                  }}
                >
                  {form.file ? (
                    <div className="flex w-full items-center justify-between gap-2">
                      <p className="truncate text-sm" style={{ color: theme.ink }}>
                        {form.file.name}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleFileSelect(null)}
                        className="rounded-md p-1"
                        style={{ color: theme.muted }}
                        aria-label="Remove file"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="mb-2 h-5 w-5" style={{ color: theme.primary }} />
                      <p className="text-sm font-medium" style={{ color: theme.ink }}>
                        Drop a file here
                      </p>
                      <p className="mt-1 text-[11px]" style={{ color: theme.muted }}>
                        {form.type === "pdf"
                          ? `PDF up to ${maxFileLabel}`
                          : `Word document up to ${maxFileLabel}`}
                      </p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-3 text-xs font-medium underline-offset-2 hover:underline"
                        style={{ color: theme.primary }}
                      >
                        Choose file
                      </button>
                    </>
                  )}
                </div>
                {fileError ? (
                  <p className="text-xs" style={{ color: theme.alert }} role="alert">
                    {fileError}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div
              className="space-y-2 border-t pt-5"
              style={{ borderColor: theme.line }}
            >
              <FormGroupLabel theme={theme}>Description</FormGroupLabel>
              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({ ...current, description: event.target.value }))
                }
                placeholder="Optional description for committee members"
                rows={4}
                className={`${committeeStoryInputClassName} resize-y`}
                style={inputStyle}
              />
            </div>
          </div>
        ) : resource ? (
          <div className="space-y-4">
            <div className="space-y-3">
              <AdminChip theme={theme} tone="info" className="!text-[10px]">
                {COMMITTEE_RESOURCE_TYPE_LABELS[resource.type]}
              </AdminChip>
              {resource.fileName ? (
                <ResourceOpenLink
                  theme={theme}
                  label={resource.fileName}
                  disabled={openingFile || !resource.storagePath}
                  onClick={() => void handleOpenResource()}
                />
              ) : null}
              {resource.url ? (
                <ResourceOpenLink
                  theme={theme}
                  label={resource.url}
                  disabled={openingFile}
                  onClick={() => void handleOpenResource()}
                />
              ) : null}
              {resource.description ? (
                <p className="text-sm leading-relaxed" style={{ color: theme.ink }}>
                  {resource.description}
                </p>
              ) : (
                <p className="text-sm" style={{ color: theme.muted }}>
                  No description provided.
                </p>
              )}
            </div>
            <CommitteeAttributionLabel
              theme={theme}
              createdByMemberId={resource.createdByMemberId}
              createdByName={resource.createdByName}
              createdByRole={resource.createdByRole}
              members={members}
              className="text-xs"
            />
          </div>
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
        title="Delete resource?"
        description="This resource will be permanently removed. This cannot be undone."
        confirmLabel="Delete resource"
        cancelLabel="Cancel"
        variant="destructive"
        loading={saving}
        onConfirm={() => {
          setDeleteDialogOpen(false);
          void onDelete?.();
        }}
        onClose={() => setDeleteDialogOpen(false)}
      />
    </>
  );
}

function ResourceSelect({
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
