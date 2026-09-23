"use client";

import { useRef, useState } from "react";
import { FileText, Loader2, Upload, X } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import {
  createFridayBranchClassFlyerSignedUrl,
  formatFridayBranchClassFlyerUploadError,
  FRIDAY_BRANCH_CLASS_FLYER_PDF_ACCEPT,
  removeFridayBranchClassFlyer,
  uploadFridayBranchClassFlyer,
  validateFridayBranchClassFlyerFile,
} from "@/lib/school-admin/friday-branch/friday-branch-class-flyer-storage";
import type { FridayBranchClass } from "@/lib/school-admin/friday-branch/friday-branch-types";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import { FridayBranchFieldLabel } from "./FridayBranchFormFields";

type FridayBranchClassFlyerUploadProps = {
  C: AdminThemeTokens;
  theme: ParentThemeTokens;
  supabase: SupabaseClient;
  organizationId: string;
  classEntry: FridayBranchClass;
  onChange: (next: FridayBranchClass) => void;
};

export default function FridayBranchClassFlyerUpload({
  C,
  theme,
  supabase,
  organizationId,
  classEntry,
  onChange,
}: FridayBranchClassFlyerUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [opening, setOpening] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const hasFlyer = Boolean(classEntry.flyerStoragePath);

  const handleFileSelect = async (file: File | null) => {
    if (!file) return;

    const validationError = validateFridayBranchClassFlyerFile(file);
    if (validationError) {
      setUploadError(validationError);
      return;
    }

    setUploadError(null);
    setUploading(true);

    const previousPath = classEntry.flyerStoragePath;

    try {
      const uploaded = await uploadFridayBranchClassFlyer(
        supabase,
        { organizationId, classId: classEntry.id },
        file,
      );

      onChange({
        ...classEntry,
        flyerStoragePath: uploaded.storagePath,
        flyerFileName: uploaded.fileName,
        flyerFileSizeBytes: uploaded.fileSizeBytes,
      });

      if (previousPath && previousPath !== uploaded.storagePath) {
        try {
          await removeFridayBranchClassFlyer(supabase, previousPath);
        } catch {
          // Best-effort cleanup of replaced file.
        }
      }

      adminToast.success("Flyer uploaded");
    } catch (err) {
      const message = formatFridayBranchClassFlyerUploadError(err);
      setUploadError(message);
      adminToast.error(message);
      void reportPortalOperationalError(
        "school_admin",
        {
          organizationId,
          operation: "friday_branch.class_flyer.upload",
          error: "",
        },
        err,
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleOpen = async () => {
    if (!classEntry.flyerStoragePath) return;

    setOpening(true);
    try {
      const url = await createFridayBranchClassFlyerSignedUrl(
        supabase,
        classEntry.flyerStoragePath,
      );
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to open flyer."));
      void reportPortalOperationalError(
        "school_admin",
        {
          organizationId,
          operation: "friday_branch.class_flyer.open",
          error: "",
        },
        err,
      );
    } finally {
      setOpening(false);
    }
  };

  const handleRemove = () => {
    onChange({
      ...classEntry,
      flyerStoragePath: null,
      flyerFileName: null,
      flyerFileSizeBytes: null,
    });
    setUploadError(null);
  };

  return (
    <div>
      <FridayBranchFieldLabel C={C}>Class flyer (PDF)</FridayBranchFieldLabel>
      <p className="mb-2 text-[11px]" style={{ color: C.textSecondary }}>
        Optional flyer families can view when browsing classes.
      </p>

      {hasFlyer ? (
        <div
          className="flex items-center justify-between gap-2 rounded-md border px-3 py-2"
          style={{ borderColor: C.border, backgroundColor: C.surface }}
        >
          <div className="flex min-w-0 items-center gap-2">
            <FileText className="h-4 w-4 shrink-0" style={{ color: theme.primary }} />
            <span className="truncate text-sm" style={{ color: C.textPrimary }}>
              {classEntry.flyerFileName || "Flyer.pdf"}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={() => void handleOpen()}
              disabled={opening || uploading}
              className="rounded-md px-2 py-1 text-[11px] font-semibold"
              style={{ color: theme.primary }}
            >
              {opening ? "Opening…" : "View"}
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="rounded-md px-2 py-1 text-[11px] font-semibold"
              style={{ color: C.textSecondary }}
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => void handleRemove()}
              disabled={uploading}
              className="rounded-md p-1"
              style={{ color: C.textSecondary }}
              aria-label="Remove flyer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed px-3 py-4 text-sm font-medium"
          style={{ borderColor: C.border, color: C.textSecondary }}
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading…
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Upload PDF flyer
            </>
          )}
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={FRIDAY_BRANCH_CLASS_FLYER_PDF_ACCEPT}
        className="hidden"
        onChange={(event) => void handleFileSelect(event.target.files?.[0] ?? null)}
      />

      {uploadError ? (
        <p className="mt-2 text-xs" style={{ color: theme.alert }}>
          {uploadError}
        </p>
      ) : null}
    </div>
  );
}
