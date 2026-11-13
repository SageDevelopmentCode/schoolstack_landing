"use client";

import { useMemo, useRef, useState } from "react";
import { ArrowRight, MessageSquarePlus, Search } from "lucide-react";
import { GDialog } from "@/components/school-parent/garden/GDialog";
import { GChip, GSkeleton, G_FOCUS } from "@/components/school-parent/garden/ui";
import type { MessageContact, MessageContactKind } from "@/lib/messages/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { GardenAvatar } from "./garden-messages-shared";

const GROUP_ORDER: MessageContactKind[] = [
  "school_office",
  "staff_member",
  "guardian",
  "platform_support",
];

const GROUP_LABEL: Record<MessageContactKind, string> = {
  school_office: "School office",
  staff_member: "Teachers",
  guardian: "Families",
  platform_support: "MudKitchen",
};

const SEARCH_THRESHOLD = 6;

function StepPills() {
  return (
    <ol aria-label="Steps" className="m-0 mt-3 flex list-none flex-wrap items-center gap-2 p-0">
      <li
        aria-current="step"
        className="inline-flex items-center gap-1.5 rounded-full bg-[var(--sf-clay)] py-1 pl-1 pr-3 text-[12.5px] font-extrabold text-white"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] text-[var(--sf-clay-deep)]">
          1
        </span>
        Choose who
      </li>
      <li aria-hidden="true" className="text-[var(--sf-ink)]/30">
        <ArrowRight className="h-3.5 w-3.5" />
      </li>
      <li className="inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-[var(--sf-ink)]/15 bg-white py-[3px] pl-1 pr-3 text-[12.5px] font-extrabold text-[var(--sf-ink)]/60">
        <span className="flex h-5 w-5 items-center justify-center rounded-full border-[1.5px] border-[var(--sf-ink)]/25 text-[11px]">
          2
        </span>
        Write your message
      </li>
    </ol>
  );
}

/*
 * "Start a conversation" in Garden: step pills, optional search, contacts
 * grouped by who they are, and a clear "Open conversation" vs "Start" cue.
 * Selecting a contact runs the layout's existing open-contact flow.
 */
export default function GardenNewConversationDialog({
  theme,
  open,
  contacts,
  loadingContacts,
  contactKeysWithThreads,
  onClose,
  onSelect,
}: {
  theme: ParentThemeTokens;
  open: boolean;
  contacts: MessageContact[];
  loadingContacts: boolean;
  contactKeysWithThreads: ReadonlySet<string | null>;
  onClose: () => void;
  onSelect: (contact: MessageContact) => void;
}) {
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const showSearch = contacts.length > SEARCH_THRESHOLD;

  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = needle
      ? contacts.filter(
          (contact) =>
            contact.name.toLowerCase().includes(needle) ||
            (contact.subtitle?.toLowerCase().includes(needle) ?? false),
        )
      : contacts;
    return GROUP_ORDER.map((kind) => ({
      kind,
      label: GROUP_LABEL[kind],
      contacts: filtered.filter((contact) => contact.kind === kind),
    })).filter((group) => group.contacts.length > 0);
  }, [contacts, query]);

  const close = () => {
    setQuery("");
    onClose();
  };

  return (
    <GDialog
      theme={theme}
      open={open}
      onClose={close}
      title="Start a conversation"
      titleId="new-conversation-title"
      icon={<MessageSquarePlus />}
      size="lg"
      initialFocusRef={showSearch ? searchRef : undefined}
      data-testid="parent-messages-new-conversation-dialog"
      description={
        <>
          <span className="block">Choose who you&apos;d like to message.</span>
          <StepPills />
        </>
      }
    >
      {showSearch ? (
        <div className="relative mb-4">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--sf-ink)]/45"
            aria-hidden
          />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name"
            aria-label="Search contacts"
            className="w-full rounded-full border-2 border-[var(--sf-ink)]/15 bg-[var(--sf-paper)] py-2 pl-10 pr-4 text-[16px] font-semibold text-[var(--sf-ink)] outline-none placeholder:text-[var(--sf-ink)]/40 focus:border-[var(--sf-ink)] sm:text-sm"
          />
        </div>
      ) : null}

      {loadingContacts ? (
        <div role="status" aria-label="Loading contacts" className="space-y-2">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="flex items-center gap-3 rounded-2xl p-2">
              <GSkeleton className="h-10 w-10 !rounded-full" />
              <div className="flex-1 space-y-2">
                <GSkeleton className="h-3.5 w-1/2 !rounded-full" />
                <GSkeleton className="h-3 w-2/3 !rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : contacts.length === 0 ? (
        <p className="sf-paper m-0 rounded-2xl px-4 py-6 text-center text-sm font-semibold text-[var(--sf-soft)]">
          No contacts available to message right now.
        </p>
      ) : groups.length === 0 ? (
        <p className="m-0 py-6 text-center text-sm font-semibold text-[var(--sf-soft)]">
          No one matches “{query.trim()}”.
        </p>
      ) : (
        <div className="space-y-5">
          {groups.map((group) => (
            <section key={group.kind} aria-labelledby={`contact-group-${group.kind}`}>
              <h3
                id={`contact-group-${group.kind}`}
                className="m-0 mb-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--sf-soft)]"
              >
                {group.label}
              </h3>
              <ul className="m-0 list-none space-y-1.5 p-0">
                {group.contacts.map((contact) => {
                  const existing = contactKeysWithThreads.has(contact.key);
                  return (
                    <li key={contact.key}>
                      <button
                        type="button"
                        onClick={() => {
                          setQuery("");
                          onSelect(contact);
                        }}
                        className={`group flex w-full items-center gap-3 rounded-2xl border-[1.5px] border-[var(--sf-ink)]/10 bg-white p-2.5 text-left transition-all hover:-translate-y-0.5 hover:border-[var(--sf-ink)]/30 hover:bg-[var(--sf-accent-wash)] ${G_FOCUS} focus-visible:ring-offset-0`}
                      >
                        <GardenAvatar
                          name={contact.name}
                          color={contact.color}
                          photoUrl={contact.profilePhotoUrl}
                          supportLogo={contact.kind === "platform_support"}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[15px] font-extrabold text-[var(--sf-ink)]">
                            {contact.name}
                          </span>
                          {contact.subtitle ? (
                            <span className="block truncate text-[13px] font-semibold text-[var(--sf-soft)]">
                              {contact.subtitle}
                            </span>
                          ) : null}
                        </span>
                        {existing ? (
                          <GChip tone="info">Open conversation</GChip>
                        ) : (
                          <span className="inline-flex shrink-0 items-center gap-1 text-[13px] font-extrabold text-[var(--sf-clay-deep)]">
                            Start
                            <ArrowRight
                              className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                              aria-hidden
                            />
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </GDialog>
  );
}
