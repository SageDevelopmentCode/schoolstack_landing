"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertCircle, Paperclip, RotateCw, Trash2, X } from "lucide-react";
import { GConfirmDialog } from "@/components/school-parent/garden/GDialog";
import { PORTAL_EASE } from "@/components/school-parent/garden/motion";
import { G_FOCUS, gLinkSm } from "@/components/school-parent/garden/ui";
import type { MessagesInboxViewModel } from "@/components/messages/messages-inbox-view-model";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { MessageContact } from "@/lib/messages/types";
import GardenConversationList, { type GardenInboxFilter } from "./GardenConversationList";
import GardenNewConversationDialog from "./GardenNewConversationDialog";
import GardenThreadDetails from "./GardenThreadDetails";
import GardenThreadPane from "./GardenThreadPane";

/*
 * Parent Messages in the Garden dashboard look (variant="parent-garden").
 * Presentation only: `MessagesInboxLayout` owns every bit of state, fetching
 * and handlers and hands them over as `model`.
 *
 * Layout: the inbox IS the page — full-bleed panes that fill the content
 * area: list (search, All/Unread + New) | conversation | details (xl). No
 * visible page header (sr-only h1). Dialogs portal out with their own frame.
 * Skill: .agents/skills/parent-portal-garden-design
 */
export default function ParentGardenMessagesView({
  model,
  theme,
  C,
}: {
  model: MessagesInboxViewModel;
  theme: ParentThemeTokens;
  C: AdminThemeTokens;
}) {
  const reduce = useReducedMotion() === true;
  const { actions } = model;
  const [filter, setFilter] = useState<GardenInboxFilter>("all");
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const focusComposerFor = useRef<string | null>(null);
  const chatOpen = model.mobileView === "chat";

  const unreadThreads = useMemo(
    () =>
      model.allThreads
        .filter((thread) => thread.unreadCount > 0)
        .sort(
          (a, b) =>
            new Date(b.lastMessageAt ?? 0).getTime() - new Date(a.lastMessageAt ?? 0).getTime(),
        ),
    [model.allThreads],
  );

  const visibleThreads = useMemo(
    () =>
      filter === "unread"
        ? model.threads.filter(
            (thread) => thread.unreadCount > 0 || thread.id === model.activeThreadId,
          )
        : model.threads,
    [filter, model.activeThreadId, model.threads],
  );

  // After picking someone in "Start a conversation", land the cursor in the
  // composer so step 2 ("Write your message") is one keystroke away.
  useEffect(() => {
    const target = focusComposerFor.current;
    if (!target || model.readOnly || model.loadingMessages || !model.activeThread) return;
    if (model.activeThread.id.startsWith("pending-") && !target.startsWith("pending-")) return;
    focusComposerFor.current = null;
    window.setTimeout(() => composerRef.current?.focus(), 80);
  }, [model.activeThread, model.loadingMessages, model.readOnly]);

  const handleContactSelect = (contact: MessageContact) => {
    focusComposerFor.current = contact.key;
    actions.selectNewConversationContact(contact);
  };

  const unreadTotal = unreadThreads.length;

  const deleting = model.deleteTargetId !== null;
  // A just-created thread swaps its "pending-…" id for the real one; keep the
  // same pane so it doesn't flash.
  const paneKey = model.activeThread ? model.activeThread.title : "start-here";

  return (
    <motion.div
      data-testid="parent-messages-inbox-layout"
      className="flex h-full min-h-0 w-full flex-1 flex-col bg-white"
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: PORTAL_EASE }}
    >
      {/* The inbox is the page: no visible page header, so the h1 is for screen readers. */}
      <h1 className="sr-only">Messages</h1>

      <AnimatePresence initial={false}>
        {model.error ? (
          <motion.div
            key="error"
            role="alert"
            initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: PORTAL_EASE }}
            className="shrink-0 overflow-hidden border-b-[1.5px] border-[#9a3412]/15 bg-[color-mix(in_srgb,#c2410c_9%,#fffaf4)]"
          >
            <div className="flex items-center gap-3 px-4 py-2.5 sm:px-5">
              <AlertCircle className="h-[18px] w-[18px] shrink-0 text-[#9a3412]" aria-hidden />
              <p className="m-0 min-w-0 flex-1 text-[13.5px] font-semibold text-[var(--sf-ink)]/80">
                <span className="font-extrabold text-[var(--sf-ink)]">Something didn’t go through.</span>{" "}
                {model.error}
              </p>
              <button
                type="button"
                className={`${gLinkSm} shrink-0 !text-[#7c2d12]`}
                onClick={actions.retry}
              >
                <RotateCw className="h-3.5 w-3.5" aria-hidden />
                Refresh
              </button>
              <button
                type="button"
                onClick={actions.dismissError}
                aria-label="Dismiss message"
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[var(--sf-ink)]/60 hover:bg-white/60 hover:text-[var(--sf-ink)] ${G_FOCUS} focus-visible:ring-offset-0`}
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <section aria-label="Inbox" className="flex min-h-0 flex-1 overflow-hidden">
        <div
          className={`${chatOpen ? "hidden md:flex" : "flex"} w-full min-w-0 shrink-0 flex-col border-[var(--sf-ink)]/10 bg-white md:w-[340px] md:border-r-[1.5px] lg:w-[360px]`}
        >
          <GardenConversationList
            threads={visibleThreads}
            filter={filter}
            onFilterChange={setFilter}
            unreadCount={unreadTotal}
            activeThreadId={model.activeThreadId}
            onSelect={actions.selectThread}
            search={model.inboxSearch}
            onSearchChange={actions.setSearch}
            loading={model.loadingInbox}
            refreshing={model.isRefetchingInbox}
            emptyDescription={model.emptyInboxDescription}
            onStartConversation={actions.openNewConversation}
            startDisabled={model.readOnly || model.newMessageDisabled}
            onNewMessage={actions.openNewConversation}
            newMessageDisabled={model.readOnly || model.newMessageDisabled}
            newMessageBusy={model.loadingContacts}
            readOnly={model.readOnly}
          />
        </div>

        <div className={`${chatOpen ? "flex" : "hidden md:flex"} min-h-0 min-w-0 flex-1 flex-col`}>
          {/* Keyed fade-in only (no exit wait): the new conversation shows instantly. */}
          <motion.div
            key={paneKey}
            className="flex min-h-0 flex-1 flex-col"
            initial={reduce ? false : { opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.22, ease: PORTAL_EASE }}
          >
            <GardenThreadPane
              model={model}
              C={C}
              composerRef={composerRef}
              unreadThreads={unreadThreads}
            />
          </motion.div>
        </div>

        {model.activeThread ? (
          <aside
            aria-label="Conversation details"
            className="hidden w-[300px] shrink-0 flex-col border-l-[1.5px] border-[var(--sf-ink)]/10 bg-white xl:flex"
          >
            <GardenThreadDetails thread={model.activeThread} C={C} />
          </aside>
        ) : null}
      </section>

      <GardenNewConversationDialog
        theme={theme}
        open={model.newConversationOpen}
        contacts={model.contacts}
        loadingContacts={model.loadingContacts}
        contactKeysWithThreads={model.contactKeysWithThreads}
        onClose={actions.closeNewConversation}
        onSelect={handleContactSelect}
      />

      <GConfirmDialog
        theme={theme}
        open={deleting}
        title="Delete message?"
        description="This message will be removed for everyone in the conversation. This cannot be undone."
        confirmLabel="Delete"
        loadingLabel="Deleting…"
        cancelLabel="Cancel"
        destructive
        icon={<Trash2 />}
        loading={model.deletingMessage}
        onConfirm={actions.confirmDelete}
        onClose={actions.cancelDelete}
      />

      <GConfirmDialog
        theme={theme}
        open={model.attachmentDiscardDialogOpen}
        title="Discard unsent attachments?"
        description="Your message text is saved for this conversation. Unsent file attachments will be lost if you continue."
        confirmLabel="Continue"
        cancelLabel="Stay"
        destructive
        icon={<Paperclip />}
        onConfirm={actions.confirmDiscardAttachments}
        onClose={actions.cancelDiscardAttachments}
      />

      <GConfirmDialog
        theme={theme}
        open={model.attachmentRouteLeaveDialogOpen}
        title="Discard unsent attachments?"
        description="Unsent file attachments will be lost if you leave this page."
        confirmLabel="Leave"
        cancelLabel="Stay"
        destructive
        icon={<Paperclip />}
        onConfirm={actions.confirmRouteLeave}
        onClose={actions.cancelRouteLeave}
      />
    </motion.div>
  );
}
