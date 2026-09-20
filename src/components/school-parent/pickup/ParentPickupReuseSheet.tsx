"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Users, X } from "lucide-react";
import { areAuthorizedPickupContactsEquivalent } from "@/lib/authorized-pickup/contact-equivalence";
import type { FamilyPickupReuseOption } from "@/lib/authorized-pickup/load-family-pickup-reuse-options";
import { formatAuthorizedPickupContactName } from "@/lib/authorized-pickup/map-row";
import type { AuthorizedPickupContact } from "@/lib/authorized-pickup/types";
import { parentToast } from "@/lib/school-parent/parent-toast";
import { ParentPickupContactSummary } from "@/components/school-parent/pickup/ParentPickupContactCard";
import ParentButton from "@/components/school-parent/ui/ParentButton";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type ParentPickupReuseSheetProps = {
  theme: ParentThemeTokens;
  open: boolean;
  organizationId: string;
  studentId: string;
  studentFirstName: string;
  options: FamilyPickupReuseOption[];
  currentContacts: AuthorizedPickupContact[];
  saving?: boolean;
  onClose: () => void;
  onContactAdded: () => Promise<void>;
};

export default function ParentPickupReuseSheet({
  theme,
  open,
  organizationId,
  studentId,
  studentFirstName,
  options,
  currentContacts,
  saving = false,
  onClose,
  onContactAdded,
}: ParentPickupReuseSheetProps) {
  const [addingContactId, setAddingContactId] = useState<string | null>(null);
  const titleId = "parent-pickup-reuse-sheet-title";

  const existingComparable = useMemo(
    () =>
      currentContacts.map((contact) => ({
        firstName: contact.firstName,
        lastName: contact.lastName,
        phone: contact.phone,
      })),
    [currentContacts],
  );

  const isAlreadyAdded = (contact: AuthorizedPickupContact) =>
    existingComparable.some((existing) =>
      areAuthorizedPickupContactsEquivalent(existing, contact),
    );

  const handleAdd = async (contact: AuthorizedPickupContact) => {
    if (isAlreadyAdded(contact) || saving || addingContactId) return;

    setAddingContactId(contact.id);
    try {
      const response = await fetch(
        `/api/parent-portal/students/${encodeURIComponent(studentId)}/authorized-pickup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            organizationId,
            firstName: contact.firstName,
            lastName: contact.lastName,
            relationship: contact.relationship,
            phone: contact.phone,
            notes: contact.notes,
          }),
        },
      );

      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        throw new Error(body?.error ?? "Failed to add pickup contact.");
      }

      parentToast.success(
        `${formatAuthorizedPickupContactName(contact)} added to ${studentFirstName}'s list.`,
      );
      await onContactAdded();
    } catch (error) {
      parentToast.error(
        error instanceof Error ? error.message : "Failed to add pickup contact.",
      );
    } finally {
      setAddingContactId(null);
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[110]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          data-testid="parent-pickup-reuse-sheet"
        >
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="absolute inset-y-0 right-0 z-[15] flex w-[min(100%,28rem)] max-w-full flex-col overflow-hidden border-l"
            style={{
              backgroundColor: theme.white,
              borderColor: theme.line,
              boxShadow: theme.shadowCard,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="flex items-start justify-between gap-3 border-b px-5 py-4"
              style={{ borderColor: theme.line }}
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: theme.primarySoft }}
                >
                  <Users className="h-4 w-4" style={{ color: theme.primary }} aria-hidden />
                </div>
                <div className="min-w-0">
                  <h2 id={titleId} className="text-sm font-semibold" style={{ color: theme.ink }}>
                    Reuse from another child
                  </h2>
                  <p className="m-0 mt-0.5 text-xs leading-relaxed" style={{ color: theme.muted }}>
                    Add contacts already on file for another child to {studentFirstName}&apos;s list.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={Boolean(addingContactId)}
                aria-label="Close"
                className="border-0 bg-transparent p-0 disabled:opacity-50"
              >
                <X className="h-5 w-5" style={{ color: theme.muted }} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="space-y-5">
                {options.map((group) => (
                  <section key={group.studentId}>
                    <h3 className="text-xs font-bold uppercase tracking-wide" style={{ color: theme.muted }}>
                      {group.studentName}
                    </h3>
                    <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {group.contacts.map((contact) => {
                        const alreadyAdded = isAlreadyAdded(contact);
                        const isAdding = addingContactId === contact.id;

                        return (
                          <div
                            key={contact.id}
                            className="rounded-lg border px-3.5 py-3"
                            style={{ borderColor: theme.line, backgroundColor: theme.white }}
                          >
                            <ParentPickupContactSummary theme={theme} contact={contact} />
                            <ParentButton
                              theme={theme}
                              variant={alreadyAdded ? "soft" : "outline"}
                              type="button"
                              disabled={alreadyAdded || saving || Boolean(addingContactId)}
                              onClick={() => void handleAdd(contact)}
                              className="mt-2 w-full !text-xs"
                            >
                              {isAdding ? (
                                <>
                                  <Loader2 className="mr-1.5 inline h-3.5 w-3.5 animate-spin" aria-hidden />
                                  Adding…
                                </>
                              ) : alreadyAdded ? (
                                "Already added"
                              ) : (
                                `Add to ${studentFirstName}'s list`
                              )}
                            </ParentButton>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
