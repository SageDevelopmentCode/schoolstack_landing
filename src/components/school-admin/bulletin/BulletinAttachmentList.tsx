"use client";

import { FileText, Trash2 } from "lucide-react";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import type { BulletinAttachment } from "@/lib/school-bulletin/types";

type BulletinAttachmentListProps = {
  attachments: BulletinAttachment[];
  onRemove?: (attachmentId: string) => void;
  removingId?: string | null;
};

export default function BulletinAttachmentList({
  attachments,
  onRemove,
  removingId = null,
}: BulletinAttachmentListProps) {
  const { theme } = useSchoolAdminStoryTheme();

  if (attachments.length === 0) {
    return (
      <p className="text-sm text-[#65747A]">
        No files attached yet. Upload PDFs or images to include flyers.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {attachments.map((attachment) => (
        <li
          key={attachment.id}
          className="flex items-center justify-between gap-3 rounded-xl border border-[#DCE4DC] bg-white px-3 py-2.5"
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EEF3EE]">
              <FileText className="h-4 w-4 text-[#4A6741]" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[#1E2A24]">
                {attachment.fileName}
              </p>
              {attachment.sizeBytes ? (
                <p className="text-xs text-[#78858A]">
                  {Math.max(1, Math.round(attachment.sizeBytes / 1024))} KB
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {attachment.downloadUrl ? (
              <a
                href={attachment.downloadUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-extrabold"
                style={{ color: theme.primary }}
              >
                Open
              </a>
            ) : null}
            {onRemove ? (
              <AdminButton
                type="button"
                theme={theme}
                variant="outline"
                size="compact"
                onClick={() => onRemove(attachment.id)}
                disabled={removingId === attachment.id}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </AdminButton>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
