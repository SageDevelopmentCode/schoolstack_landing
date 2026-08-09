"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { MessageContact } from "@/lib/messages/types";
import {
  committeeTransition,
  modalPanel,
} from "@/components/school-admin/committees/committee-motion";
import MessagesAvatar from "./MessagesAvatar";

export default function MessagesNewConversationModal({
  open,
  contacts,
  onClose,
  onSelect,
  C,
}: {
  open: boolean;
  contacts: MessageContact[];
  onClose: () => void;
  onSelect: (contact: MessageContact) => void;
  C: AdminThemeTokens;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion() ?? false;

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    panelRef.current?.focus();
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

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
            style={{ backgroundColor: C.surface }}
            variants={modalPanel(reducedMotion)}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={committeeTransition}
          >
            <div
              className="flex items-center justify-between border-b px-5 py-4"
              style={{ borderColor: C.border }}
            >
              <h2
                id="new-conversation-title"
                className="text-base font-semibold"
                style={{ color: C.textPrimary }}
              >
                Start a conversation
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 cursor-pointer transition hover:bg-black/[0.04]"
                aria-label="Close"
              >
                <X className="h-5 w-5" style={{ color: C.textTertiary }} />
              </button>
            </div>

            <div className="max-h-[min(24rem,60vh)] overflow-y-auto">
              {contacts.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm" style={{ color: C.textSecondary }}>
                  No contacts available to message right now.
                </p>
              ) : (
                contacts.map((contact, index) => (
                  <motion.button
                    key={contact.key}
                    type="button"
                    onClick={() => onSelect(contact)}
                    className="flex w-full items-center gap-3 px-5 py-3.5 text-left cursor-pointer transition hover:bg-black/[0.03] active:scale-[0.99]"
                    initial={reducedMotion ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={
                      reducedMotion
                        ? { duration: 0 }
                        : { ...committeeTransition, delay: index * 0.04 }
                    }
                  >
                    <MessagesAvatar name={contact.name} color={contact.color} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold" style={{ color: C.textPrimary }}>
                        {contact.name}
                      </p>
                      {contact.subtitle ? (
                        <p className="truncate text-xs" style={{ color: C.textTertiary }}>
                          {contact.subtitle}
                        </p>
                      ) : null}
                    </div>
                  </motion.button>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
