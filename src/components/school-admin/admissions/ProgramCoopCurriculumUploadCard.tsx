"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ExternalLink, Loader2, Upload } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import {
  createProgramCoopCurriculumSignedUrl,
  getProgramCoopCurriculum,
  PROGRAM_COOP_CURRICULUM_PDF_ACCEPT,
  removeProgramCoopCurriculum,
  type ProgramCoopCurriculumRecord,
  uploadProgramCoopCurriculumFile,
  upsertProgramCoopCurriculumRecord,
  validateProgramCoopCurriculumFile,
  formatProgramCoopCurriculumUploadError,
} from "@/lib/admissions/program-coop-curriculum-storage";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
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

export default function ProgramCoopCurriculumUploadCard({
  C,
  theme,
  supabase,
  organizationId,
  programId,
  coopModeEnabled,
}: ProgramCoopCurriculumUploadCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [curriculum, setCurriculum] = useState<ProgramCoopCurriculumRecord | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [opening, setOpening] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const loadCurriculum = useCallback(async () => {
    setLoading(true);
    try {
      const record = await getProgramCoopCurriculum(supabase, programId);
      setCurriculum(record);
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to load curriculum."));
    } finally {
      setLoading(false);
    }
  }, [programId, supabase]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadCurriculum();
    });
  }, [loadCurriculum]);

  const handleFileSelect = async (file: File | null) => {
    if (!file || !coopModeEnabled) return;

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

      const record = await upsertProgramCoopCurriculumRecord(supabase, {
        organizationId,
        programId,
        storagePath: uploaded.storagePath,
        fileName: uploaded.fileName,
        fileSizeBytes: uploaded.fileSizeBytes,
        uploadedBy: user?.id ?? null,
      });

      setCurriculum(record);
      adminToast.success("Curriculum uploaded");
    } catch (err) {
      const message = formatProgramCoopCurriculumUploadError(err);
      setUploadError(message);
      adminToast.error(message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleOpen = async () => {
    if (!curriculum?.storagePath) return;
    setOpening(true);
    try {
      const url = await createProgramCoopCurriculumSignedUrl(
        supabase,
        curriculum.storagePath,
      );
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to open curriculum."));
    } finally {
      setOpening(false);
    }
  };

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await removeProgramCoopCurriculum(supabase, programId);
      setCurriculum(null);
      setRemoveOpen(false);
      adminToast.success("Curriculum removed");
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to remove curriculum."));
    } finally {
      setRemoving(false);
    }
  };

  if (!coopModeEnabled) {
    return (
      <BuilderQuestionCard
        C={C}
        tone="accent"
        question="Co-op curriculum"
        helper="Enable co-op mode in portal settings (configured by MudKitchen) to upload a curriculum PDF for families."
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
        helper="Upload a PDF curriculum guide for families in this co-op program."
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={PROGRAM_COOP_CURRICULUM_PDF_ACCEPT}
          className="hidden"
          disabled={uploading}
          onChange={(e) => void handleFileSelect(e.target.files?.[0] ?? null)}
        />

        {loading ? (
          <div className="flex items-center gap-2 text-sm" style={{ color: C.textSecondary }}>
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading curriculum…
          </div>
        ) : curriculum ? (
          <div
            className="rounded-md border px-3 py-3"
            style={{ borderColor: C.border, backgroundColor: C.surface }}
          >
            <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
              {curriculum.fileName}
            </p>
            <p className="mt-0.5 text-xs" style={{ color: C.textTertiary }}>
              Updated {new Date(curriculum.updatedAt).toLocaleDateString()}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <AdminButton
                theme={theme}
                variant="outline"
                size="compact"
                onClick={() => void handleOpen()}
                disabled={opening}
              >
                {opening ? "Opening…" : "Open"}
                <ExternalLink className="ml-1 h-3.5 w-3.5" />
              </AdminButton>
              <AdminButton
                theme={theme}
                variant="outline"
                size="compact"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? "Uploading…" : "Replace"}
              </AdminButton>
              <AdminButton
                theme={theme}
                variant="danger"
                size="compact"
                onClick={() => setRemoveOpen(true)}
                disabled={uploading || removing}
              >
                Remove
              </AdminButton>
            </div>
          </div>
        ) : (
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
              Max 100 MB. Families see this on the Curriculum tab when enabled.
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="mt-3 text-xs font-medium underline-offset-2 hover:underline"
              style={{ color: C.accent }}
            >
              Choose file
            </button>
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
        open={removeOpen}
        title="Remove curriculum?"
        description="Families will no longer see this PDF on the Curriculum tab."
        confirmLabel="Remove curriculum"
        variant="destructive"
        loading={removing}
        onConfirm={() => void handleRemove()}
        onClose={() => setRemoveOpen(false)}
      />
    </>
  );
}
