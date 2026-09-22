"use client";

import { useEffect, useState } from "react";
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

function MessageAttachmentItem({
  attachment,
  attachments,
  C,
  splitPane,
  isOwn,
  resolveAttachmentUrl,
  onOpenImage,
}: {
  attachment: MessageAttachmentDisplay;
  attachments: MessageAttachmentDisplay[];
  C: AdminThemeTokens;
  splitPane: boolean;
  isOwn: boolean;
  resolveAttachmentUrl?: (
    attachment: MessageAttachmentDisplay,
  ) => Promise<string | null>;
  onOpenImage: (attachment: MessageAttachmentDisplay) => void;
}) {
  const [url, setUrl] = useState(attachment.url ?? null);
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    if (url || !resolveAttachmentUrl) return;
    if (!isMessageImageAttachment(attachment.mimeType)) return;
    if (!attachment.storagePath && !attachment.url) return;

    let cancelled = false;
    void (async () => {
      try {
        const signedUrl = await resolveAttachmentUrl(attachment);
        if (!cancelled && signedUrl) {
          setUrl(signedUrl);
        }
      } catch {
        // Leave preview empty; user can retry via file link pattern if needed.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [attachment, resolveAttachmentUrl, url]);

  if (isMessageImageAttachment(attachment.mimeType)) {
    if (!url) {
      return (
        <div
          className={`max-h-48 min-h-24 w-40 animate-pulse ${
            splitPane ? "rounded-xl" : "rounded-lg border"
          }`}
          style={{
            backgroundColor: splitPane && isOwn ? "rgba(255,255,255,0.15)" : C.elevated,
            border: splitPane ? undefined : `1px solid ${C.border}`,
          }}
          aria-label={`Loading ${attachment.fileName}`}
        />
      );
    }

    return (
      <button
        type="button"
        onClick={() => onOpenImage({ ...attachment, url })}
        className="block cursor-zoom-in border-0 bg-transparent p-0 text-left"
        aria-label={`View ${attachment.fileName}`}
      >
        <Image
          src={url}
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

  const handleFileOpen = async () => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }
    if (!resolveAttachmentUrl || opening) return;

    setOpening(true);
    try {
      const signedUrl = await resolveAttachmentUrl(attachment);
      if (signedUrl) {
        setUrl(signedUrl);
        window.open(signedUrl, "_blank", "noopener,noreferrer");
      }
    } finally {
      setOpening(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleFileOpen()}
      disabled={opening}
      className={`inline-flex items-center gap-1 text-xs underline ${
        splitPane && isOwn ? "text-white/90" : ""
      } disabled:opacity-60`}
      style={splitPane && isOwn ? undefined : { color: C.accent }}
    >
      <FileText className="w-3.5 h-3.5" />
      {attachment.fileName}
    </button>
  );
}

export default function MessageAttachments({
  attachments,
  C,
  splitPane = true,
  isOwn = false,
  resolveAttachmentUrl,
}: {
  attachments: MessageAttachmentDisplay[];
  C: AdminThemeTokens;
  splitPane?: boolean;
  isOwn?: boolean;
  resolveAttachmentUrl?: (
    attachment: MessageAttachmentDisplay,
  ) => Promise<string | null>;
}) {
  const [viewerState, setViewerState] = useState<MessageImageViewerState | null>(null);

  if (attachments.length === 0) return null;

  return (
    <>
      <div className="mt-2 space-y-2">
        {attachments.map((attachment) => (
          <MessageAttachmentItem
            key={attachment.id}
            attachment={attachment}
            attachments={attachments}
            C={C}
            splitPane={splitPane}
            isOwn={isOwn}
            resolveAttachmentUrl={resolveAttachmentUrl}
            onOpenImage={(openedAttachment) =>
              setViewerState(buildMessageImageViewerState(attachments, openedAttachment))
            }
          />
        ))}
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
