"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ExternalLink, Loader2, Upload } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import {
  createProgramCoopCurriculumSignedUrl,
  insertProgramCoopCurriculumRecord,
  listProgramCoopCurriculum,
  PROGRAM_COOP_CURRICULUM_MAX_FILES,
  PROGRAM_COOP_CURRICULUM_PDF_ACCEPT,
  removeProgramCoopCurriculumById,
  type ProgramCoopCurriculumRecord,
  updateProgramCoopCurriculumDisplayName,
  uploadProgramCoopCurriculumFile,
  validateProgramCoopCurriculumFile,
  formatProgramCoopCurriculumUploadError,
} from "@/lib/admissions/program-coop-curriculum-storage";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import ConfirmDialog from "@/components/school-admin/ConfirmDialog";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { BuilderQuestionCard } from "./builder-question-card";

type ProgramCoopCurriculumUploadCardProps = {
  C: AdminThemeTokens;
  theme: ParentThemeTokens;
  supabase: SupabaseClient;
  organizationId: string;
  programId: string;
  coopModeEnabled: boolean;
};

type GuideDraftNames = Record<string, string>;

export default function ProgramCoopCurriculumUploadCard({
  C,
  theme,
  supabase,
  organizationId,
  programId,
  coopModeEnabled,
}: ProgramCoopCurriculumUploadCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [guides, setGuides] = useState<ProgramCoopCurriculumRecord[]>([]);
  const [draftNames, setDraftNames] = useState<GuideDraftNames>({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [savingNameId, setSavingNameId] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<ProgramCoopCurriculumRecord | null>(
    null,
  );
  const [removing, setRemoving] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const loadGuides = useCallback(async () => {
    setLoading(true);
    try {
      const records = await listProgramCoopCurriculum(supabase, programId);
      setGuides(records);
      setDraftNames(
        Object.fromEntries(
          records.map((record) => [record.id, record.displayName ?? ""]),
        ),
      );
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to load curriculum guides."));
      void reportPortalOperationalError("school_admin", {
        organizationId,
        operation: "programs.coop_curriculum.load",
        error: "",
      }, err);
    } finally {
      setLoading(false);
    }
  }, [programId, supabase]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadGuides();
    });
  }, [loadGuides]);

  const handleFileSelect = async (file: File | null) => {
    if (!file || !coopModeEnabled) return;

    if (guides.length >= PROGRAM_COOP_CURRICULUM_MAX_FILES) {
      setUploadError(`You can upload up to ${PROGRAM_COOP_CURRICULUM_MAX_FILES} curriculum guides.`);
      return;
    }

    const validationError = validateProgramCoopCurriculumFile(file);
    if (validationError) {
      setUploadError(validationError);
      return;
    }

    setUploadError(null);
    setUploading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const uploaded = await uploadProgramCoopCurriculumFile(
        supabase,
        { organizationId, programId },
        file,
      );

      const record = await insertProgramCoopCurriculumRecord(supabase, {
        organizationId,
        programId,
        storagePath: uploaded.storagePath,
        fileName: uploaded.fileName,
        fileSizeBytes: uploaded.fileSizeBytes,
        uploadedBy: user?.id ?? null,
      });

      setGuides((current) => [...current, record]);
      setDraftNames((current) => ({ ...current, [record.id]: record.displayName ?? "" }));
      adminToast.success("Curriculum guide uploaded");
    } catch (err) {
      const message = formatProgramCoopCurriculumUploadError(err);
      void reportPortalOperationalError("school_admin", {
        organizationId,
        operation: "programs.coop_curriculum.upload",
        error: "",
      }, err);
      setUploadError(message);
      adminToast.error(message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleOpen = async (guide: ProgramCoopCurriculumRecord) => {
    setOpeningId(guide.id);
    try {
      const url = await createProgramCoopCurriculumSignedUrl(
        supabase,
        guide.storagePath,
      );
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to open curriculum."));
      void reportPortalOperationalError("school_admin", {
        organizationId,
        operation: "programs.coop_curriculum.open",
        error: "",
      }, err);
    } finally {
      setOpeningId(null);
    }
  };

  const handleSaveDisplayName = async (guide: ProgramCoopCurriculumRecord) => {
    const nextName = draftNames[guide.id]?.trim() ?? "";
    const currentName = guide.displayName?.trim() ?? "";
    if (nextName === currentName) return;

    setSavingNameId(guide.id);
    try {
      const updated = await updateProgramCoopCurriculumDisplayName(
        supabase,
        guide.id,
        nextName || null,
      );
      setGuides((current) =>
        current.map((record) => (record.id === updated.id ? updated : record)),
      );
      setDraftNames((current) => ({
        ...current,
        [updated.id]: updated.displayName ?? "",
      }));
      adminToast.success("Display name saved");
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to save display name."));
      void reportPortalOperationalError("school_admin", {
        organizationId,
        operation: "programs.coop_curriculum.save_name",
        error: "",
      }, err);
    } finally {
      setSavingNameId(null);
    }
  };

  const handleRemove = async () => {
    if (!removeTarget) return;
    setRemoving(true);
    try {
      await removeProgramCoopCurriculumById(supabase, removeTarget.id);
      setGuides((current) => current.filter((record) => record.id !== removeTarget.id));
      setDraftNames((current) => {
        const next = { ...current };
        delete next[removeTarget.id];
        return next;
      });
      setRemoveTarget(null);
      adminToast.success("Curriculum guide removed");
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to remove curriculum guide."));
      void reportPortalOperationalError("school_admin", {
        organizationId,
        operation: "programs.coop_curriculum.remove",
        error: "",
      }, err);
    } finally {
      setRemoving(false);
    }
  };

  const canAddMore = guides.length < PROGRAM_COOP_CURRICULUM_MAX_FILES;

  if (!coopModeEnabled) {
    return (
      <BuilderQuestionCard
        C={C}
        tone="accent"
        question="Co-op curriculum"
        helper="Enable co-op mode in portal settings (configured by MudKitchen) to upload curriculum PDFs for families."
      >
        <p className="text-sm" style={{ color: C.textSecondary }}>
          Co-op mode is not enabled for this program.
        </p>
      </BuilderQuestionCard>
    );
  }

  return (
    <>
      <BuilderQuestionCard
        C={C}
        tone="accent"
        question="Co-op curriculum"
        helper={`Upload up to ${PROGRAM_COOP_CURRICULUM_MAX_FILES} PDF guides. Families switch between them on the Curriculum tab.`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={PROGRAM_COOP_CURRICULUM_PDF_ACCEPT}
          className="hidden"
          disabled={uploading || !canAddMore}
          onChange={(e) => void handleFileSelect(e.target.files?.[0] ?? null)}
        />

        {loading ? (
          <div className="flex items-center gap-2 text-sm" style={{ color: C.textSecondary }}>
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading curriculum guides…
          </div>
        ) : (
          <div className="space-y-3">
            {guides.map((guide) => (
              <div
                key={guide.id}
                className="rounded-md border px-3 py-3"
                style={{ borderColor: C.border, backgroundColor: C.surface }}
              >
                <label className="block text-[11px] font-medium uppercase tracking-wide" style={{ color: C.textTertiary }}>
                  Display name
                </label>
                <input
                  type="text"
                  value={draftNames[guide.id] ?? ""}
                  placeholder={guide.fileName}
                  disabled={savingNameId === guide.id}
                  onChange={(event) =>
                    setDraftNames((current) => ({
                      ...current,
                      [guide.id]: event.target.value,
                    }))
                  }
                  onBlur={() => void handleSaveDisplayName(guide)}
                  className="mt-1 w-full rounded-md border px-2.5 py-1.5 text-sm"
                  style={{
                    borderColor: C.border,
                    backgroundColor: C.bg,
                    color: C.textPrimary,
                  }}
                />
                <p className="mt-2 text-xs" style={{ color: C.textSecondary }}>
                  {guide.fileName}
                </p>
                <p className="mt-0.5 text-[11px]" style={{ color: C.textTertiary }}>
                  Updated {new Date(guide.updatedAt).toLocaleDateString()}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <AdminButton
                    theme={theme}
                    variant="outline"
                    size="compact"
                    onClick={() => void handleOpen(guide)}
                    disabled={openingId === guide.id}
                  >
                    {openingId === guide.id ? "Opening…" : "Open"}
                    <ExternalLink className="ml-1 h-3.5 w-3.5" />
                  </AdminButton>
                  <AdminButton
                    theme={theme}
                    variant="danger"
                    size="compact"
                    onClick={() => setRemoveTarget(guide)}
                    disabled={uploading || removing}
                  >
                    Remove
                  </AdminButton>
                </div>
              </div>
            ))}

            {canAddMore ? (
              <div
                className="flex flex-col items-center justify-center rounded-md px-4 py-8 text-center"
                style={{
                  border: `2px dashed ${C.borderStrong}`,
                  backgroundColor: C.bg,
                  opacity: uploading ? 0.7 : 1,
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (uploading) return;
                  const file = e.dataTransfer.files[0];
                  if (file) void handleFileSelect(file);
                }}
              >
                {uploading ? (
                  <Loader2 className="mb-2 h-6 w-6 animate-spin" style={{ color: C.accent }} />
                ) : (
                  <Upload className="mb-2 h-6 w-6" style={{ color: C.textQuaternary }} />
                )}
                <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
                  {uploading ? "Uploading PDF…" : "Drop a curriculum PDF here"}
                </p>
                <p className="mt-1 text-[11px]" style={{ color: C.textTertiary }}>
                  Max 100 MB per file. {guides.length}/{PROGRAM_COOP_CURRICULUM_MAX_FILES} guides uploaded.
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="mt-3 text-xs font-medium underline-offset-2 hover:underline"
                  style={{ color: C.accent }}
                >
                  {guides.length === 0 ? "Choose file" : "Add guide"}
                </button>
              </div>
            ) : (
              <p className="text-xs" style={{ color: C.textTertiary }}>
                Maximum of {PROGRAM_COOP_CURRICULUM_MAX_FILES} guides reached. Remove one to upload another.
              </p>
            )}
          </div>
        )}

        {uploadError ? (
          <p className="mt-2 text-xs" style={{ color: C.error }} role="alert">
            {uploadError}
          </p>
        ) : null}
      </BuilderQuestionCard>

      <ConfirmDialog
        C={C}
        open={Boolean(removeTarget)}
        title="Remove curriculum guide?"
        description="Families will no longer see this PDF on the Curriculum tab. Its guide-specific discussion will also be removed."
        confirmLabel="Remove guide"
        variant="destructive"
        loading={removing}
        onConfirm={() => void handleRemove()}
        onClose={() => setRemoveTarget(null)}
      />
    </>
  );
}
