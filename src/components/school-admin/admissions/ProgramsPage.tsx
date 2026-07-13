"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/school-admin/ConfirmDialog";
import {
  createProgram,
  deleteProgram,
  listProgramsDetailed,
  PROGRAM_STATUS_OPTIONS,
  PROGRAM_TYPE_OPTIONS,
  programStatusLabel,
  programTypeLabel,
  updateProgram,
  type Program,
  type ProgramStatus,
  type ProgramType,
} from "@/lib/admissions/programs";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { createClient } from "@/utils/supabase/client";

type ProgramsPageProps = {
  organizationId: string;
  branding: OrganizationBranding;
  slug: string;
};

type EditableProgramState = {
  name: string;
  type: ProgramType;
  status: ProgramStatus;
  startDate: string;
  endDate: string;
  capacity: string;
};

const STATUS_STYLES: Record<
  ProgramStatus,
  { bg: string; color: string }
> = {
  draft: { bg: "rgba(113, 113, 122, 0.1)", color: "#71717A" },
  open: { bg: "rgba(22, 163, 74, 0.1)", color: "#16A34A" },
  waitlist: { bg: "rgba(217, 119, 6, 0.1)", color: "#D97706" },
  full: { bg: "rgba(220, 38, 38, 0.1)", color: "#DC2626" },
  closed: { bg: "rgba(113, 113, 122, 0.1)", color: "#71717A" },
};

const NEW_PROGRAM_ID = "__new__";

function toEditableState(program: Program): EditableProgramState {
  return {
    name: program.name,
    type: program.type,
    status: program.status,
    startDate: program.start_date ?? "",
    endDate: program.end_date ?? "",
    capacity: program.capacity != null ? String(program.capacity) : "",
  };
}

function emptyEditableState(): EditableProgramState {
  return {
    name: "",
    type: "school_year",
    status: "open",
    startDate: "",
    endDate: "",
    capacity: "",
  };
}

function inputStyle(C: ReturnType<typeof buildAdminThemeTokens>): React.CSSProperties {
  return {
    backgroundColor: C.input,
    border: `1px solid ${C.inputBorder}`,
    color: C.textPrimary,
    borderRadius: C.r.md,
    fontSize: "14px",
    padding: "10px 12px",
    width: "100%",
    boxSizing: "border-box",
    outline: "none",
  };
}

export default function ProgramsPage({
  organizationId,
  branding,
  slug,
}: ProgramsPageProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const supabase = useMemo(() => createClient(), []);

  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editable, setEditable] = useState<EditableProgramState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isNew = selectedId === NEW_PROGRAM_ID;
  const selectedProgram = programs.find((program) => program.id === selectedId) ?? null;
  const flowsPath = schoolAdminPath(slug, "admissions", "flows");

  const loadPrograms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await listProgramsDetailed(supabase, organizationId);
      setPrograms(rows);
      setSelectedId((prev) => {
        if (prev === NEW_PROGRAM_ID) return prev;
        if (prev && rows.some((row) => row.id === prev)) return prev;
        return rows[0]?.id ?? null;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load programs.");
    } finally {
      setLoading(false);
    }
  }, [organizationId, supabase]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadPrograms();
    });
  }, [loadPrograms]);

  useEffect(() => {
    if (isNew) {
      queueMicrotask(() => setEditable(emptyEditableState()));
      return;
    }
    if (!selectedProgram) {
      queueMicrotask(() => setEditable(null));
      return;
    }
    queueMicrotask(() => setEditable(toEditableState(selectedProgram)));
  }, [isNew, selectedProgram?.id, selectedProgram?.updated_at]);

  const handleCreate = () => {
    setSelectedId(NEW_PROGRAM_ID);
    setEditable(emptyEditableState());
    setError(null);
  };

  const handleSave = async () => {
    if (!editable) return;

    setSaving(true);
    setError(null);

    const capacityValue = editable.capacity.trim();
    const parsedCapacity =
      capacityValue === "" ? null : Number.parseInt(capacityValue, 10);

    if (capacityValue && Number.isNaN(parsedCapacity)) {
      setError("Capacity must be a whole number.");
      setSaving(false);
      return;
    }

    const payload = {
      name: editable.name,
      type: editable.type,
      status: editable.status,
      start_date: editable.startDate.trim() || null,
      end_date: editable.endDate.trim() || null,
      capacity: parsedCapacity,
    };

    try {
      if (isNew) {
        const created = await createProgram(supabase, organizationId, payload);
        setPrograms((prev) =>
          [...prev, created].sort((a, b) => a.name.localeCompare(b.name)),
        );
        setSelectedId(created.id);
      } else if (selectedProgram) {
        const updated = await updateProgram(
          supabase,
          selectedProgram.id,
          organizationId,
          payload,
        );
        setPrograms((prev) =>
          prev
            .map((row) => (row.id === updated.id ? updated : row))
            .sort((a, b) => a.name.localeCompare(b.name)),
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save program.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProgram) return;

    setDeleting(true);
    setError(null);

    try {
      await deleteProgram(supabase, selectedProgram.id, organizationId);
      setPrograms((prev) => prev.filter((row) => row.id !== selectedProgram.id));
      setSelectedId((prev) => {
        if (prev !== selectedProgram.id) return prev;
        const remaining = programs.filter((row) => row.id !== selectedProgram.id);
        return remaining[0]?.id ?? null;
      });
      setDeleteOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete program.");
      setDeleteOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex h-full min-h-0" style={{ backgroundColor: C.surface }}>
      <div
        className="flex h-full min-h-0 w-[240px] flex-shrink-0 flex-col overflow-hidden"
        style={{
          borderRight: `1px solid ${C.border}`,
          backgroundColor: C.surface,
        }}
      >
        <div
          className="flex h-14 flex-shrink-0 items-center justify-between px-3"
          style={{ borderBottom: `1px solid ${C.border}` }}
        >
          <span className="text-sm font-semibold" style={{ color: C.textPrimary }}>
            Programs
          </span>
          <button
            type="button"
            onClick={handleCreate}
            disabled={isNew}
            className="flex items-center gap-1 rounded-sm px-3 py-1.5 text-xs font-semibold disabled:opacity-60"
            style={getAdminButtonStyle(C, "secondary")}
          >
            <Plus className="h-3.5 w-3.5" />
            New
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center px-3 py-8">
              <Loader2
                className="h-5 w-5 animate-spin"
                style={{ color: C.textTertiary }}
              />
            </div>
          ) : programs.length === 0 && !isNew ? (
            <p className="px-3 py-4 text-xs leading-relaxed" style={{ color: C.textTertiary }}>
              No programs yet. Create one before linking an application form.
            </p>
          ) : (
            <>
              {isNew ? (
                <div
                  className="w-full px-3 py-3 text-left"
                  style={{
                    backgroundColor: C.accentLight,
                    borderLeft: `3px solid ${C.accent}`,
                  }}
                >
                  <p className="text-sm font-medium" style={{ color: C.accent }}>
                    New program
                  </p>
                  <p className="mt-0.5 text-xs" style={{ color: C.textSecondary }}>
                    Draft
                  </p>
                </div>
              ) : null}
              {programs.map((program) => {
                const isActive = program.id === selectedId;
                const statusStyle = STATUS_STYLES[program.status];
                return (
                  <button
                    key={program.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(program.id);
                      setError(null);
                    }}
                    className="w-full px-3 py-3 text-left transition-all"
                    style={{
                      backgroundColor: isActive ? C.accentLight : "transparent",
                      borderLeft: isActive
                        ? `3px solid ${C.accent}`
                        : "3px solid transparent",
                    }}
                  >
                    <p
                      className="truncate text-sm font-medium"
                      style={{ color: isActive ? C.accent : C.textPrimary }}
                    >
                      {program.name}
                    </p>
                    <span
                      className="mt-1 inline-flex rounded-pill px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                      style={{
                        backgroundColor: statusStyle.bg,
                        color: statusStyle.color,
                      }}
                    >
                      {programStatusLabel(program.status)}
                    </span>
                  </button>
                );
              })}
            </>
          )}
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div
          className="flex h-14 flex-shrink-0 items-center justify-between gap-3 px-5"
          style={{ borderBottom: `1px solid ${C.border}` }}
        >
          <div>
            <h1 className="text-sm font-semibold" style={{ color: C.textPrimary }}>
              {isNew ? "New program" : selectedProgram?.name ?? "Programs"}
            </h1>
          </div>
          {editable ? (
            <div className="flex items-center gap-2">
              {!isNew && selectedProgram ? (
                <button
                  type="button"
                  onClick={() => setDeleteOpen(true)}
                  disabled={saving || deleting}
                  className="inline-flex items-center gap-1.5 rounded-sm px-3 py-2 text-xs font-semibold disabled:opacity-60"
                  style={{
                    border: `1px solid ${C.errorBorder}`,
                    color: C.error,
                    backgroundColor: C.surface,
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              ) : null}
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-sm px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                style={{ backgroundColor: C.accent }}
              >
                {saving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                {isNew ? "Create program" : "Save"}
              </button>
            </div>
          ) : null}
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {error ? (
            <p
              className="mb-4 rounded-md border px-3 py-2.5 text-sm"
              style={{
                borderColor: C.errorBorder,
                backgroundColor: C.surface,
                color: C.error,
              }}
              role="alert"
            >
              {error}
            </p>
          ) : null}

          {!editable && !loading ? (
            <div className="mx-auto max-w-lg text-center">
              <h2 className="text-lg font-semibold" style={{ color: C.textPrimary }}>
                Create your first program
              </h2>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: C.textSecondary }}>
                Programs represent enrollment periods like a school year or summer
                session. You will link each application form to one program.
              </p>
              <button
                type="button"
                onClick={handleCreate}
                className="mt-5 inline-flex items-center gap-2 rounded-sm px-4 py-2.5 text-sm font-semibold text-white"
                style={{ backgroundColor: C.accent }}
              >
                <Plus className="h-4 w-4" />
                New program
              </button>
            </div>
          ) : editable ? (
            <div className="mx-auto max-w-xl space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium" style={{ color: C.textPrimary }}>
                  Program name
                </label>
                <input
                  type="text"
                  value={editable.name}
                  onChange={(e) =>
                    setEditable((prev) =>
                      prev ? { ...prev, name: e.target.value } : prev,
                    )
                  }
                  placeholder="e.g. School Year 2026–27"
                  style={inputStyle(C)}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-medium" style={{ color: C.textPrimary }}>
                    Type
                  </label>
                  <select
                    value={editable.type}
                    onChange={(e) =>
                      setEditable((prev) =>
                        prev ? { ...prev, type: e.target.value } : prev,
                      )
                    }
                    style={inputStyle(C)}
                  >
                    {PROGRAM_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium" style={{ color: C.textPrimary }}>
                    Status
                  </label>
                  <select
                    value={editable.status}
                    onChange={(e) =>
                      setEditable((prev) =>
                        prev
                          ? { ...prev, status: e.target.value as ProgramStatus }
                          : prev,
                      )
                    }
                    style={inputStyle(C)}
                  >
                    {PROGRAM_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-medium" style={{ color: C.textPrimary }}>
                    Start date
                  </label>
                  <input
                    type="date"
                    value={editable.startDate}
                    onChange={(e) =>
                      setEditable((prev) =>
                        prev ? { ...prev, startDate: e.target.value } : prev,
                      )
                    }
                    style={inputStyle(C)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium" style={{ color: C.textPrimary }}>
                    End date
                  </label>
                  <input
                    type="date"
                    value={editable.endDate}
                    onChange={(e) =>
                      setEditable((prev) =>
                        prev ? { ...prev, endDate: e.target.value } : prev,
                      )
                    }
                    style={inputStyle(C)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium" style={{ color: C.textPrimary }}>
                  Capacity
                </label>
                <input
                  type="number"
                  min={1}
                  value={editable.capacity}
                  onChange={(e) =>
                    setEditable((prev) =>
                      prev ? { ...prev, capacity: e.target.value } : prev,
                    )
                  }
                  placeholder="Optional"
                  style={inputStyle(C)}
                />
              </div>

              {!isNew && selectedProgram ? (
                <p className="text-xs" style={{ color: C.textTertiary }}>
                  {programTypeLabel(selectedProgram.type)} · Updated{" "}
                  {new Date(selectedProgram.updated_at).toLocaleDateString()}
                </p>
              ) : null}

              <p className="text-sm" style={{ color: C.textSecondary }}>
                Next, link this program on{" "}
                <Link
                  href={flowsPath}
                  className="font-medium underline-offset-2 hover:underline"
                  style={{ color: C.accent }}
                >
                  Enrollment Flows
                </Link>
                .
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <ConfirmDialog
        C={C}
        open={deleteOpen}
        title="Delete program?"
        description="This cannot be undone. Programs linked to applications cannot be deleted."
        confirmLabel="Delete program"
        variant="destructive"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => {
          if (!deleting) setDeleteOpen(false);
        }}
      />
    </div>
  );
}
