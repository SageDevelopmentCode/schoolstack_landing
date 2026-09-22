export type MessageAttachmentDisplay = {
  id: string;
  fileName: string;
  mimeType: string | null;
  url?: string | null;
};

const MESSAGE_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export function isMessageImageAttachment(mimeType: string | null): boolean {
  return mimeType !== null && MESSAGE_IMAGE_MIME_TYPES.has(mimeType);
}

export type MessageImageViewerState = {
  attachments: MessageAttachmentDisplay[];
  index: number;
};

export function buildMessageImageViewerState(
  attachments: MessageAttachmentDisplay[],
  clickedAttachment: MessageAttachmentDisplay,
): MessageImageViewerState {
  const imageAttachments = attachments.filter(
    (item) => item.url && isMessageImageAttachment(item.mimeType),
  );
  const index = imageAttachments.findIndex((item) => item.id === clickedAttachment.id);
  return {
    attachments: imageAttachments,
    index: index >= 0 ? index : 0,
  };
}
