"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronRight, ClipboardList, Lock } from "lucide-react";
import { Tick } from "@/components/garden/ui";
import { PORTAL_EASE } from "@/components/school-parent/garden/motion";
import { GCard, GChip, GIcon, GKicker, GTabBar, G_FOCUS, gLinkSm } from "@/components/school-parent/garden/ui";
import { SIGNUP_TYPE_LABELS } from "@/lib/classroom-signups/types";
import type { ParentClassroomSignupListItem } from "@/lib/classroom-signups/types";
import type { ParentClassroomSignupsModel } from "../useParentClassroomSignupsModel";
import {
  SIGNUP_FILTERS,
  listStatusChip as listStatusLabelChip,
  signupActionLabel,
  signupDeadlineLabel,
  signupFromLine,
  type SignupFilter,
} from "./signups-garden-ui";

const listStatusLabel = (status: ParentClassroomSignupListItem["listStatus"]) => listStatusLabelChip(status).label;

export const SIGNUPS_LIST_ID = "parent-signups-list";

/** Every signup for the family as a notebook list, filterable by status. */
export default function SignupsListCard({
  model,
  readOnly,
  index = 3,
}: {
  model: ParentClassroomSignupsModel;
  readOnly: boolean;
  index?: number;
}) {
  const reduce = useReducedMotion() === true;
  const { filter, setFilter, statusCounts, groups } = model;

  return (
    <GCard index={index} id={SIGNUPS_LIST_ID} kicker="Classroom signups" title="All signups" data-testid="parent-signups-list-card">
      <GTabBar
        ariaLabel="Filter signups by status"
        activeKey={filter}
        onChange={(key) => setFilter(key as SignupFilter)}
        className="mb-4"
        data-testid="parent-signups-filter"
        items={SIGNUP_FILTERS.map(({ key, label }) => ({
          key,
          label,
          testId: `parent-signups-filter-${key}`,
          suffix: <span className="tabular-nums opacity-75">· {statusCounts[key]}</span>,
        }))}
      />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={filter}
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: PORTAL_EASE }}
          className="flex flex-col gap-4"
        >
          {groups.length === 0 ? (
            <div className="flex flex-col items-start gap-2 rounded-[18px] bg-[var(--sf-paper)] p-4 sm:flex-row sm:items-center">
              <GIcon size="sm">
                <ClipboardList />
              </GIcon>
              <p className="m-0 flex-1 text-[15px] font-semibold text-[var(--sf-soft)]">No signups match this filter.</p>
              <button type="button" onClick={() => setFilter("all")} className={gLinkSm}>
                Show all signups
              </button>
            </div>
          ) : (
            groups.map((group) => (
                <div key={group.key}>
                  {filter === "all" ? (
                    <GKicker className="mb-2 px-1">
                      {group.label} · {group.items.length}
                    </GKicker>
                  ) : null}
                  <ul className="sf-paper m-0 flex list-none flex-col rounded-[18px] p-1" aria-label={group.label}>
                    {group.items.map((item) => (
                      <SignupRow
                        key={item.signup.id}
                        item={item}
                        readOnly={readOnly}
                        flash={model.recentlyChangedId === item.signup.id}
                        reduce={reduce}
                        onOpen={() => model.openSignup(item.signup.id)}
                      />
                    ))}
                  </ul>
                </div>
            ))
          )}
        </motion.div>
      </AnimatePresence>
    </GCard>
  );
}

function SignupRow({
  item,
  readOnly,
  flash,
  reduce,
  onOpen,
}: {
  item: ParentClassroomSignupListItem;
  readOnly: boolean;
  flash: boolean;
  reduce: boolean;
  onOpen: () => void;
}) {
  const { signup, listStatus } = item;
  const deadline = listStatus === "needs_response" ? signupDeadlineLabel(signup) : null;
  const action = signupActionLabel(listStatus, readOnly);

  return (
    <motion.li
      initial={false}
      animate={{ backgroundColor: flash ? "var(--sf-accent-wash)" : "rgba(255,255,255,0)" }}
      transition={{ duration: reduce ? 0 : 0.35, ease: PORTAL_EASE }}
      className="rounded-[14px]"
    >
      <button
        type="button"
        onClick={onOpen}
        data-testid={`parent-signup-card-${signup.id}`}
        className={`group flex min-h-[64px] w-full cursor-pointer items-center gap-3 rounded-[14px] px-3 py-2.5 text-left transition-colors hover:bg-white/80 ${G_FOCUS} focus-visible:ring-inset`}
      >
        {listStatus === "signed_up" ? (
          <Tick className="h-7 w-7 shrink-0" color="var(--sf-forest)" fill="var(--sf-mint)" />
        ) : listStatus === "closed" ? (
          <span
            aria-hidden="true"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-[var(--sf-ink)]/20 bg-white text-[var(--sf-ink)]/45"
          >
            <Lock className="h-3.5 w-3.5" />
          </span>
        ) : (
          <span aria-hidden="true" className="h-7 w-7 shrink-0 rounded-full border-2 border-[var(--sf-clay)] bg-white" />
        )}
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="min-w-0 text-[15px] font-extrabold leading-snug text-[var(--sf-ink)]">{signup.title}</span>
            {flash ? (
              <GChip tone="neutral">
                <Tick className="h-3.5 w-3.5" /> Updated
              </GChip>
            ) : null}
          </span>
          <span className="sr-only">{listStatusLabel(listStatus)}. </span>
          <span className="mt-0.5 block text-[13px] font-semibold leading-snug text-[var(--sf-soft)] sm:truncate">
            {signupFromLine(signup)} · {SIGNUP_TYPE_LABELS[signup.signupType]}
          </span>
          {deadline ? (
            <span className="mt-0.5 block text-[12.5px] font-extrabold text-[var(--sf-clay-deep)]">{deadline}</span>
          ) : null}
        </span>
        <span className="hidden shrink-0 text-[13px] font-extrabold text-[var(--sf-clay-deep)] sm:inline">{action}</span>
        <ChevronRight
          className="h-4 w-4 shrink-0 text-[var(--sf-ink)]/40 transition-transform duration-300 group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </button>
    </motion.li>
  );
}
