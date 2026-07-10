"use client";

import { useMemo, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { FileText } from "lucide-react";
import {
  formatApplicationFileSize,
  getApplicationFileSignedUrl,
  type ApplicationFileUploadMeta,
} from "@/lib/admissions/application-file-storage";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { createClient } from "@/utils/supabase/client";

type ApplicationUploadedFileListProps = {
  files: ApplicationFileUploadMeta[];
  C: AdminThemeTokens;
  supabase?: SupabaseClient;
  removable?: boolean;
  onRemove?: (file: ApplicationFileUploadMeta) => void | Promise<void>;
};

export default function ApplicationUploadedFileList({
  files,
  C,
  supabase,
  removable = false,
  onRemove,
}: ApplicationUploadedFileListProps) {
  const client = useMemo(() => supabase ?? createClient(), [supabase]);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const showRemove = removable && Boolean(onRemove);

  const openFile = async (file: ApplicationFileUploadMeta) => {
    if (!file.storagePath) {
      setError("This file is not available to download yet.");
      return;
    }

    setOpeningId(file.id);
    setError(null);

    try {
      const signedUrl = await getApplicationFileSignedUrl(client, file.storagePath);
      window.open(signedUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to open file.");
    } finally {
      setOpeningId(null);
    }
  };

  const removeFile = async (file: ApplicationFileUploadMeta) => {
    if (!onRemove) return;

    setRemovingId(file.id);
    setError(null);

    try {
      await onRemove(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove file.");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="space-y-1.5">
      <ul className="space-y-2">
        {files.map((file) => {
          const sizeLabel = formatApplicationFileSize(file.sizeBytes);
          const isOpening = openingId === file.id;
          const isRemoving = removingId === file.id;
          const actionBusy = isOpening || isRemoving || Boolean(openingId) || Boolean(removingId);

          return (
            <li
              key={file.id}
              className="flex items-center justify-between gap-2 rounded-md border px-3 py-2.5 text-sm"
              style={{ borderColor: C.border, color: C.textPrimary, backgroundColor: "#FFFFFF" }}
            >
              <button
                type="button"
                onClick={() => void openFile(file)}
                disabled={actionBusy}
                className="flex min-w-0 flex-1 items-center gap-2 text-left underline-offset-2 hover:underline disabled:cursor-wait disabled:opacity-70"
                style={{ color: C.accent }}
              >
                <FileText className="h-4 w-4 shrink-0" aria-hidden />
                <span className="truncate">{file.fileName}</span>
              </button>
              <div className="flex shrink-0 items-center gap-2">
                {sizeLabel ? (
                  <span style={{ color: C.textTertiary }}>
                    {isOpening ? "Opening…" : sizeLabel}
                  </span>
                ) : isOpening ? (
                  <span style={{ color: C.textTertiary }}>Opening…</span>
                ) : null}
                {showRemove ? (
                  <button
                    type="button"
                    onClick={() => void removeFile(file)}
                    disabled={actionBusy}
                    className="text-xs font-medium disabled:cursor-wait disabled:opacity-70"
                    style={{ color: C.error }}
                  >
                    {isRemoving ? "Removing…" : "Remove"}
                  </button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
      {error ? (
        <p className="text-xs" style={{ color: C.error }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
