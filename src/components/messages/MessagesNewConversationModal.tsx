"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { MessageContact } from "@/lib/messages/types";
import {
  committeeTransition,
  modalPanel,
} from "@/components/school-admin/committees/committee-motion";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import ParentStoryPillNav from "@/components/school-parent/ui/ParentStoryPillNav";
import {
  countContactsByAudience,
  filterContactsByAudience,
  getContactPickerEmptyMessage,
  type MessageContactAudienceFilter,
} from "@/lib/messages/contact-filters";
import {
  isAdminStoryMessagesVariant,
  isStoryMessagesVariant,
} from "@/lib/messages/messages-layout-variant";
import MessagesAvatar, { type MessagesLayoutVariant } from "./MessagesAvatar";
import MessageStudentSubtitle from "./MessageStudentSubtitle";

export default function MessagesNewConversationModal({
  open,
  contacts,
  loadingContacts = false,
  onClose,
  onSelect,
  C,
  theme,
  variant = "embedded",
}: {
  open: boolean;
  contacts: MessageContact[];
  loadingContacts?: boolean;
  onClose: () => void;
  onSelect: (contact: MessageContact) => void;
  C: AdminThemeTokens;
  theme?: ParentThemeTokens;
  variant?: MessagesLayoutVariant;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion() ?? false;
  const parentStory = isStoryMessagesVariant(variant) && theme;
  const adminStory = isAdminStoryMessagesVariant(variant);
  const [audienceFilter, setAudienceFilter] = useState<MessageContactAudienceFilter>("all");

  useEffect(() => {
    if (!open) {
      setAudienceFilter("all");
    }
  }, [open]);

  const audienceCounts = useMemo(() => countContactsByAudience(contacts), [contacts]);
  const filteredContacts = useMemo(
    () => (adminStory ? filterContactsByAudience(contacts, audienceFilter) : contacts),
    [adminStory, audienceFilter, contacts],
  );

  function handleContactRowKeyDown(
    event: KeyboardEvent<HTMLDivElement>,
    contact: MessageContact,
  ) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(contact);
    }
  }

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    panelRef.current?.focus();
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  const surfaceColor = parentStory ? theme.white : C.surface;
  const borderColor = parentStory ? theme.line : C.border;
  const textPrimary = parentStory ? theme.ink : C.textPrimary;
  const textSecondary = parentStory ? theme.muted : C.textSecondary;
  const textTertiary = parentStory ? theme.muted : C.textTertiary;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={committeeTransition}
        >
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 cursor-default"
            style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-conversation-title"
            tabIndex={-1}
            className="relative w-full max-w-md overflow-hidden rounded-2xl shadow-xl outline-none"
            style={{ backgroundColor: surfaceColor }}
            variants={modalPanel(reducedMotion)}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={committeeTransition}
          >
            <div
              className="flex items-center justify-between border-b px-5 py-4"
              style={{ borderColor }}
            >
              {parentStory ? (
                <ParentDisplayHeading
                  theme={theme}
                  as="h2"
                  id="new-conversation-title"
                  size="section"
                  className="!text-lg"
                >
                  Start a conversation
                </ParentDisplayHeading>
              ) : (
                <h2
                  id="new-conversation-title"
                  className="text-base font-semibold"
                  style={{ color: textPrimary }}
                >
                  Start a conversation
                </h2>
              )}
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 cursor-pointer transition hover:bg-black/[0.04]"
                aria-label="Close"
              >
                <X className="h-5 w-5" style={{ color: textTertiary }} />
              </button>
            </div>

            {adminStory && theme ? (
              <div className="px-5 pb-3 pt-1">
                <ParentStoryPillNav
                  theme={theme}
                  items={[
                    { key: "all", label: `All · ${audienceCounts.all}` },
                    { key: "parents", label: `Parents · ${audienceCounts.parents}` },
                    { key: "staff", label: `Staff · ${audienceCounts.staff}` },
                  ]}
                  activeKey={audienceFilter}
                  onChange={(key) => setAudienceFilter(key as MessageContactAudienceFilter)}
                  ariaLabel="Contact audience"
                />
              </div>
            ) : null}

            <div className="max-h-[min(32rem,85dvh)] overflow-y-auto sm:max-h-[min(24rem,60vh)]">
              {loadingContacts ? (
                <div className="py-1">
                  {Array.from({ length: 8 }, (_, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 px-5 py-3.5"
                      style={{ borderBottom: `1px solid ${borderColor}` }}
                    >
                      <div
                        className="h-8 w-8 shrink-0 animate-pulse rounded-full"
                        style={{ backgroundColor: borderColor }}
                      />
                      <div className="min-w-0 flex-1 space-y-2">
                        <div
                          className="h-3.5 w-[48%] animate-pulse rounded"
                          style={{ backgroundColor: borderColor }}
                        />
                        <div
                          className="h-3 w-[32%] animate-pulse rounded"
                          style={{ backgroundColor: borderColor }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredContacts.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm" style={{ color: textSecondary }}>
                  {adminStory
                    ? getContactPickerEmptyMessage(audienceFilter, false)
                    : "No contacts available to message right now."}
                </p>
              ) : (
                filteredContacts.map((contact, index) => (
                  <motion.div
                    key={contact.key}
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelect(contact)}
                    onKeyDown={(event) => handleContactRowKeyDown(event, contact)}
                    className={`flex w-full items-center gap-3 px-5 py-3.5 text-left cursor-pointer transition active:scale-[0.99] ${
                      parentStory ? "" : "hover:bg-black/[0.03]"
                    }`}
                    onMouseEnter={
                      parentStory
                        ? (event) => {
                            event.currentTarget.style.backgroundColor = theme.primarySoft;
                          }
                        : undefined
                    }
                    onMouseLeave={
                      parentStory
                        ? (event) => {
                            event.currentTarget.style.backgroundColor = "transparent";
                          }
                        : undefined
                    }
                    initial={reducedMotion ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={
                      reducedMotion
                        ? { duration: 0 }
                        : { ...committeeTransition, delay: index * 0.04 }
                    }
                  >
                    <MessagesAvatar
                      name={contact.name}
                      color={contact.color}
                      photoUrl={contact.profilePhotoUrl}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate text-sm font-semibold"
                        style={{ color: textPrimary }}
                      >
                        {contact.name}
                      </p>
                      {contact.subtitle || contact.subtitleStudents?.length ? (
                        <MessageStudentSubtitle
                          students={contact.subtitleStudents}
                          subtitle={contact.subtitle}
                          C={C}
                          truncate
                        />
                      ) : null}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
