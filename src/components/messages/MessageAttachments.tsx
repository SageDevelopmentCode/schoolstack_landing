"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import Image from "next/image";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import {
  buildMessageImageViewerState,
  isMessageImageAttachment,
  type MessageAttachmentDisplay,
  type MessageImageViewerState,
} from "@/lib/messages/attachment-preview";
import MessageAttachmentImageViewer from "./MessageAttachmentImageViewer";

export type { MessageAttachmentDisplay } from "@/lib/messages/attachment-preview";

export default function MessageAttachments({
  attachments,
  C,
  splitPane = true,
  isOwn = false,
}: {
  attachments: MessageAttachmentDisplay[];
  C: AdminThemeTokens;
  splitPane?: boolean;
  isOwn?: boolean;
}) {
  const [viewerState, setViewerState] = useState<MessageImageViewerState | null>(null);

  if (attachments.length === 0) return null;

  return (
    <>
      <div className="mt-2 space-y-2">
        {attachments.map((attachment) => {
          if (isMessageImageAttachment(attachment.mimeType) && attachment.url) {
            return (
              <button
                key={attachment.id}
                type="button"
                onClick={() =>
                  setViewerState(buildMessageImageViewerState(attachments, attachment))
                }
                className="block cursor-zoom-in border-0 bg-transparent p-0 text-left"
                aria-label={`View ${attachment.fileName}`}
              >
                <Image
                  src={attachment.url}
                  alt={attachment.fileName}
                  width={240}
                  height={180}
                  unoptimized
                  className={`max-h-48 w-auto object-cover ${
                    splitPane ? "rounded-xl" : "rounded-lg border"
                  }`}
                  style={splitPane ? undefined : { borderColor: C.border }}
                />
              </button>
            );
          }

          return (
            <a
              key={attachment.id}
              href={attachment.url ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1 text-xs underline ${
                splitPane && isOwn ? "text-white/90" : ""
              }`}
              style={splitPane && isOwn ? undefined : { color: C.accent }}
            >
              <FileText className="w-3.5 h-3.5" />
              {attachment.fileName}
            </a>
          );
        })}
      </div>

      <MessageAttachmentImageViewer
        open={viewerState !== null}
        viewerState={viewerState}
        onClose={() => setViewerState(null)}
        onChangeIndex={(index) =>
          setViewerState((current) =>
            current ? { ...current, index } : current,
          )
        }
      />
    </>
  );
}
