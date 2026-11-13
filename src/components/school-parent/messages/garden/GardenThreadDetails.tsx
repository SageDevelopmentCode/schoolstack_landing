"use client";

import { useMemo } from "react";
import { Paperclip, Users } from "lucide-react";
import { GChip, GKicker } from "@/components/school-parent/garden/ui";
import MessageAttachments from "@/components/messages/MessageAttachments";
import MessagesAvatar from "@/components/messages/MessagesAvatar";
import { colorForKey } from "@/lib/messages/format";
import { MUDKITCHEN_SUPPORT_LOGO_URL } from "@/lib/messages/platform-support";
import type { MessageThreadDetail } from "@/lib/messages/types";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

const SHARED_FILES_LIMIT = 6;

/*
 * xl-only rail beside a conversation: who has written in it and the files
 * shared in it (opened with the same viewer/links as in the bubbles).
 */
export default function GardenThreadDetails({
  thread,
  C,
}: {
  thread: MessageThreadDetail;
  C: AdminThemeTokens;
}) {
  const people = useMemo(() => {
    const seen = new Map<
      string,
      { key: string; name: string; photoUrl?: string | null; isOwn: boolean; color: string }
    >();
    for (const message of thread.messages) {
      if (message.pending) continue;
      const key = message.isOwn ? "self" : message.senderUserId;
      if (seen.has(key)) continue;
      seen.set(key, {
        key,
        name: message.isOwn ? "You" : message.senderName,
        photoUrl: message.profilePhotoUrl,
        isOwn: message.isOwn,
        color: colorForKey(message.senderUserId),
      });
    }
    return [...seen.values()].sort((a, b) => Number(a.isOwn) - Number(b.isOwn));
  }, [thread.messages]);

  const sharedFiles = useMemo(
    () =>
      thread.messages
        .filter((message) => !message.deletedAt && !message.pending)
        .flatMap((message) => message.attachments)
        .reverse(),
    [thread.messages],
  );
  const visibleFiles = sharedFiles.slice(0, SHARED_FILES_LIMIT);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-5">
      <section aria-labelledby="garden-thread-people">
        <div className="mb-3 flex items-center gap-2">
          <Users className="h-4 w-4 text-[var(--sf-clay-deep)]" aria-hidden />
          <GKicker>
            <span id="garden-thread-people">In this conversation</span>
          </GKicker>
        </div>
        <p className="m-0 text-[15px] font-extrabold text-[var(--sf-ink)]">{thread.title}</p>
        {thread.subtitle ? (
          <p className="m-0 mt-0.5 text-[13px] font-semibold text-[var(--sf-soft)]">{thread.subtitle}</p>
        ) : null}
        {people.length > 0 ? (
          <ul className="m-0 mt-3 list-none space-y-2 p-0">
            {people.map((person) => (
              <li key={person.key} className="flex items-center gap-2.5">
                <MessagesAvatar
                  name={person.name}
                  color={person.color}
                  photoUrl={person.photoUrl}
                  photoBackground={person.photoUrl === MUDKITCHEN_SUPPORT_LOGO_URL ? "#FFFFFF" : undefined}
                  photoObjectFit={person.photoUrl === MUDKITCHEN_SUPPORT_LOGO_URL ? "contain" : "cover"}
                  size="sm"
                />
                <span className="truncate text-[13.5px] font-bold text-[var(--sf-ink)]">
                  {person.name}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="m-0 mt-3 text-[13px] font-semibold text-[var(--sf-soft)]">
            No messages yet.
          </p>
        )}
      </section>

      <section aria-labelledby="garden-thread-files">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Paperclip className="h-4 w-4 text-[var(--sf-clay-deep)]" aria-hidden />
            <GKicker>
              <span id="garden-thread-files">Shared files</span>
            </GKicker>
          </div>
          {sharedFiles.length > 0 ? <GChip tone="neutral">{sharedFiles.length}</GChip> : null}
        </div>
        {visibleFiles.length > 0 ? (
          <div className="rounded-[16px] border-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-paper)] p-3 text-[13px] [&_img]:max-h-28 [&_img]:rounded-xl">
            <MessageAttachments attachments={visibleFiles} C={C} splitPane isOwn={false} />
            {sharedFiles.length > SHARED_FILES_LIMIT ? (
              <p className="m-0 mt-2 text-[12px] font-semibold text-[var(--sf-soft)]">
                +{sharedFiles.length - SHARED_FILES_LIMIT} more in the conversation
              </p>
            ) : null}
          </div>
        ) : (
          <p className="m-0 text-[13px] font-semibold text-[var(--sf-soft)]">No files shared yet.</p>
        )}
      </section>
    </div>
  );
}
