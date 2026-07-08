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
};

export default function ApplicationUploadedFileList({
  files,
  C,
  supabase,
}: ApplicationUploadedFileListProps) {
  const client = useMemo(() => supabase ?? createClient(), [supabase]);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="space-y-1.5">
      <ul className="space-y-1">
        {files.map((file) => {
          const sizeLabel = formatApplicationFileSize(file.sizeBytes);
          const isOpening = openingId === file.id;

          return (
            <li
              key={file.id}
              className="flex items-center justify-between gap-2 rounded border px-2 py-1.5 text-xs"
              style={{ borderColor: C.border, color: C.textPrimary }}
            >
              <button
                type="button"
                onClick={() => void openFile(file)}
                disabled={isOpening || Boolean(openingId)}
                className="flex min-w-0 flex-1 items-center gap-2 text-left underline-offset-2 hover:underline disabled:cursor-wait disabled:opacity-70"
                style={{ color: C.accent }}
              >
                <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span className="truncate">{file.fileName}</span>
              </button>
              {sizeLabel ? (
                <span className="shrink-0" style={{ color: C.textTertiary }}>
                  {isOpening ? "Opening…" : sizeLabel}
                </span>
              ) : isOpening ? (
                <span className="shrink-0" style={{ color: C.textTertiary }}>
                  Opening…
                </span>
              ) : null}
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
