"use client";

import { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Phone, UserPlus } from "lucide-react";
import DemoSchoolParentStoryProvider from "@/components/demo/shared/DemoSchoolParentStoryProvider";
import ParentGardenFrame from "@/components/school-parent/garden/ParentGardenFrame";
import ParentGardenPageHeader from "@/components/school-parent/garden/ParentGardenPageHeader";
import { PORTAL_EASE, useCelebrate } from "@/components/school-parent/garden/motion";
import {
  GCard,
  GChip,
  PANEL_TINTS,
  gBtnOutlineSm,
  gBtnPopSm,
} from "@/components/school-parent/garden/ui";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import { Tick } from "@/components/garden/ui";
import { PORTAL_HOME_CONTAINER_CLASS } from "@/lib/portal-home/layout";
import {
  buildDemoParentEmergencyContacts,
  type DemoParentChildName,
  type DemoParentEmergencyContact,
} from "@/data/school-demos/demo-parent-emergency-fixtures";

/*
 * Parent demo › Emergency contacts. Demo-only (no backend): fixtures from
 * `buildDemoParentEmergencyContacts()` plus local state for the one action,
 * "Confirm contacts are up to date". Built from the `school-parent/garden`
 * kit so it can move into the parent portal later.
 */

const CELEBRATE_KEY = "demo-parent-emergency-confirmed";

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function childrenLabel(children: DemoParentChildName[]): string {
  return children.join(" · ");
}

function Avatar({ name, index, size = "md" }: { name: string; index: number; size?: "sm" | "md" }) {
  const box = size === "sm" ? "h-9 w-9 text-sm" : "h-12 w-12 text-lg";
  return (
    <span
      aria-hidden="true"
      className={`sf-display flex shrink-0 items-center justify-center rounded-full border-[1.5px] border-[var(--sf-ink)]/15 text-[var(--sf-ink)]/75 ${PANEL_TINTS[index % PANEL_TINTS.length]} ${box}`}
    >
      {initials(name)}
    </span>
  );
}

function ContactCard({ contact, order }: { contact: DemoParentEmergencyContact; order: number }) {
  return (
    <li
      className="flex items-start gap-3.5 rounded-[16px] border-[1.5px] border-[var(--sf-ink)]/10 bg-white p-4"
      data-testid={`demo-parent-emergency-contact-${contact.id}`}
    >
      <span
        aria-hidden="true"
        className="sf-display mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-[var(--sf-ink)] bg-[var(--sf-butter)] text-sm leading-none text-[var(--sf-ink)]"
      >
        {order}
      </span>
      <Avatar name={contact.name} index={order - 1} />
      <div className="min-w-0 flex-1">
        <h3 className="m-0 text-[16px] font-extrabold leading-tight text-[var(--sf-ink)]">
          <span className="sr-only">Call {order}: </span>
          {contact.name}
        </h3>
        <p className="m-0 mt-0.5 text-[13px] font-semibold text-[var(--sf-soft)]">{contact.relationship}</p>
        <p className="m-0 mt-1.5 inline-flex items-center gap-1.5 text-[14px] font-extrabold text-[var(--sf-ink)]">
          <Phone className="h-3.5 w-3.5 text-[var(--sf-clay-deep)]" aria-hidden="true" />
          {contact.phone}
        </p>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {contact.canPickUp ? <GChip tone="success">Can pick up</GChip> : null}
          <GChip tone="neutral">
            <span className="sr-only">Covers </span>
            {childrenLabel(contact.children)}
          </GChip>
        </div>
      </div>
    </li>
  );
}

function ConfirmCard({ lastReviewedLabel, index }: { lastReviewedLabel: string; index: number }) {
  const { theme } = useParentTheme();
  const reduce = useReducedMotion() === true;
  const [confirmed, setConfirmed] = useState(false);
  useCelebrate(confirmed, theme, CELEBRATE_KEY);

  // The button leaves the DOM on confirm, so hand focus to the result once
  // AnimatePresence mounts it (after the exit, so an effect would be too early).
  const focusOnMount = useCallback((el: HTMLDivElement | null) => {
    el?.focus({ preventScroll: true });
  }, []);

  const swap = reduce
    ? { initial: false as const, animate: { opacity: 1 }, exit: { opacity: 0, transition: { duration: 0 } } }
    : {
        initial: { opacity: 0, y: 6 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -6 },
        transition: { duration: 0.25, ease: PORTAL_EASE },
      };

  return (
    <GCard index={index} kicker="Once a term" title="Still right?" data-testid="demo-parent-emergency-confirm">
      <div aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          {confirmed ? (
            <motion.div
              key="confirmed"
              {...swap}
              ref={focusOnMount}
              tabIndex={-1}
              className="flex items-center gap-3 rounded-[16px] bg-[var(--sf-mint)] px-4 py-3.5 outline-none"
            >
              <Tick className="h-7 w-7" color="var(--sf-forest)" fill="#fff" />
              <div className="min-w-0">
                <p className="m-0 text-[15px] font-extrabold text-[var(--sf-forest)]">Confirmed today</p>
                <p className="m-0 mt-0.5 text-[13px] font-semibold text-[var(--sf-forest)]/80">
                  Thanks for checking.
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div key="pending" {...swap} className="flex flex-col items-start gap-3.5">
              <p className="m-0 text-[13px] font-semibold text-[var(--sf-soft)]">
                Last reviewed <span className="font-extrabold text-[var(--sf-ink)]">{lastReviewedLabel}</span>
              </p>
              <button type="button" className={gBtnPopSm} onClick={() => setConfirmed(true)}>
                Confirm contacts are up to date
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GCard>
  );
}

function DemoParentEmergencyContactsContent() {
  const { theme } = useParentTheme();
  const data = useMemo(() => buildDemoParentEmergencyContacts(), []);

  return (
    <ParentGardenFrame theme={theme}>
      <div className={PORTAL_HOME_CONTAINER_CLASS} data-testid="demo-parent-emergency-contacts">
        <ParentGardenPageHeader
          kicker="Your family"
          title={
            <>
              Emergency <span className="text-[var(--sf-clay)]">contacts</span>
            </>
          }
          subtitle="Who the school calls if they can't reach you, and who can pick up."
        />

        <div className="grid items-start gap-5 lg:grid-cols-[1.55fr_1fr]">
          <GCard
            index={1}
            kicker={`The ${data.familyName} family`}
            title="Call order"
            action={<GChip tone="info">{data.contacts.length} contacts</GChip>}
          >
            <div className="rounded-[20px] border-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-paper)] p-3 sm:p-4">
              <ol className="m-0 flex list-none flex-col gap-3 p-0">
                {data.contacts.map((contact, i) => (
                  <ContactCard key={contact.id} contact={contact} order={i + 1} />
                ))}
              </ol>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button type="button" className={gBtnOutlineSm} disabled aria-describedby="demo-emergency-add-note">
                <UserPlus className="h-4 w-4" aria-hidden="true" />
                Add a contact
              </button>
              <span id="demo-emergency-add-note" className="text-[13px] font-semibold text-[var(--sf-soft)]">
                Preview · editing is off in the demo
              </span>
            </div>
          </GCard>

          <div className="flex flex-col gap-5">
            <GCard index={2} kicker="At the door" title="Authorized pickup">
              <ul className="m-0 flex list-none flex-col gap-1 p-0">
                {data.authorizedPickup.map((person, i) => (
                  <li key={person.id} className="flex items-center gap-3 rounded-lg px-1 py-1.5">
                    <Avatar name={person.name} index={i} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-extrabold text-[var(--sf-ink)]">{person.name}</span>
                      <span className="block truncate text-[13px] font-semibold text-[var(--sf-soft)]">
                        {person.relationship} · {childrenLabel(person.children)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </GCard>

            <GCard
              index={3}
              kicker="Health"
              title="Medical info on file"
              action={<GChip tone="success">On file · {data.medical.length}</GChip>}
            >
              <ul className="sf-paper -mx-1 m-0 flex list-none flex-col rounded-xl p-0 px-1">
                {data.medical.map((entry) => (
                  <li key={entry.id} className="flex min-h-[52px] items-center gap-3 px-2 py-2">
                    <Tick className="h-6 w-6" color="var(--sf-forest)" fill="var(--sf-mint)" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-extrabold text-[var(--sf-ink)]">{entry.title}</span>
                      <span className="block text-xs font-semibold text-[var(--sf-soft)]">{entry.meta}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </GCard>

            <ConfirmCard lastReviewedLabel={data.lastReviewedLabel} index={4} />
          </div>
        </div>
      </div>
    </ParentGardenFrame>
  );
}

export default function DemoParentEmergencyContactsPage() {
  return (
    <DemoSchoolParentStoryProvider>
      <DemoParentEmergencyContactsContent />
    </DemoSchoolParentStoryProvider>
  );
}
