import type { PortalMessage } from "./types";

export function portalMessageSupportsTextMutation(message: PortalMessage): boolean {
  return (
    message.isOwn &&
    !message.pending &&
    !message.deletedAt &&
    Boolean(message.body.trim()) &&
    message.attachments.length === 0
  );
}
