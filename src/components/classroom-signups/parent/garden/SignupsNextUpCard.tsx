"use client";

import { ArrowRight, ChevronRight, ClipboardList } from "lucide-react";
import { Tick } from "@/components/garden/ui";
import { GCard, GIcon, GNoteTile, NOTE_TINTS, G_FOCUS, gBtnOnAccent, gLinkSm } from "@/components/school-parent/garden/ui";
import { SIGNUP_TYPE_LABELS } from "@/lib/classroom-signups/types";
import type { ParentClassroomSignupsModel } from "../useParentClassroomSignupsModel";
import { pluralSignups, signupDeadlineLabel, signupFromLine } from "./signups-garden-ui";

/*
 * "Next up": the main card. First open request = solid accent strip (the
 * page's one toy pill); the next few = note tiles; footer = answered progress.
 * Recipe: parent-portal-garden-design › "Start here".
 */

const MAX_TILES = 4;
const MAX_DOTS = 10;

export default function SignupsNextUpCard({
  model,
  readOnly,
  onShowNeeds,
  index = 1,
}: {
  model: ParentClassroomSignupsModel;
  readOnly: boolean;
  onShowNeeds: () => void;
  index?: number;
}) {
  const waiting = model.needsResponse;
  const answered = model.statusCounts.signed_up;
  const open = model.openCount;

  if (waiting.length === 0) {
    const allAnswered = answered > 0;
    return (
      <GCard index={index} kicker="Next up" title="You're all caught up" data-testid="parent-signups-next-up">
        <div className="flex items-center gap-4 rounded-[16px] bg-[var(--sf-mint)] p-5">
          <Tick className="h-12 w-12" color="var(--sf-forest)" />
          <div>
            <p className="m-0 text-[15px] font-semibold text-[var(--sf-ink)]/80">
              {allAnswered
                ? `You've answered every open signup (${pluralSignups(answered)}). New requests from teachers will show up here.`
                : "No open signups need a response right now. New requests from teachers will show up here."}
            </p>
            {allAnswered ? (
              <span aria-hidden="true" className="sf-hand mt-1 block text-xl text-[var(--sf-forest)]">
                thanks for helping ✿
              </span>
            ) : null}
          </div>
        </div>
      </GCard>
    );
  }

  const [lead, ...rest] = waiting;
  const tiles = rest.slice(0, MAX_TILES);
  const hidden = rest.length - tiles.length;
  const leadDeadline = signupDeadlineLabel(lead.signup);

  return (
    <GCard
      index={index}
      kicker="Next up"
      title={`${pluralSignups(waiting.length)} ${waiting.length === 1 ? "needs" : "need"} your response`}
      data-testid="parent-signups-next-up"
      action={
        waiting.length > 1 ? (
          <button type="button" className={gLinkSm} onClick={onShowNeeds}>
            See all waiting <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        ) : null
      }
    >
      <button
        type="button"
        onClick={() => model.openSignup(lead.signup.id)}
        data-testid={`parent-signup-next-${lead.signup.id}`}
        className={`group flex w-full cursor-pointer flex-col gap-4 rounded-[16px] bg-[var(--sf-clay)] p-5 text-left text-white sm:flex-row sm:items-center ${G_FOCUS}`}
      >
        <GIcon size="sm" className="!ring-white/70">
          <ClipboardList />
        </GIcon>
        <span className="min-w-0 flex-1">
          <span className="block text-[17px] font-extrabold leading-snug">{lead.signup.title}</span>
          <span className="mt-0.5 block text-sm text-white/85">{signupFromLine(lead.signup)}</span>
          <span className="mt-1.5 block text-[13px] font-bold text-white/85">
            {SIGNUP_TYPE_LABELS[lead.signup.signupType]}
            {leadDeadline ? ` · ${leadDeadline}` : ""}
          </span>
        </span>
        <span className={gBtnOnAccent} aria-hidden="true">
          {readOnly ? "Preview" : "Sign up"} <ArrowRight className="h-4 w-4" />
        </span>
      </button>

      {tiles.length > 0 ? (
        <ul className="m-0 mt-5 grid list-none gap-4 p-0 sm:grid-cols-2">
          {tiles.map((item, i) => {
            const deadline = signupDeadlineLabel(item.signup);
            return (
              <li key={item.signup.id}>
                <GNoteTile
                  tint={NOTE_TINTS[i % NOTE_TINTS.length]}
                  onClick={() => model.openSignup(item.signup.id)}
                  data-testid={`parent-signup-next-${item.signup.id}`}
                >
                  <span className="flex items-start justify-between gap-2">
                    <GIcon size="sm">
                      <ClipboardList />
                    </GIcon>
                    <ChevronRight
                      className="h-4 w-4 text-[var(--sf-ink)]/50 transition-transform duration-300 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </span>
                  <span className="mt-3 block text-[15px] font-extrabold leading-snug text-[var(--sf-ink)]">
                    {item.signup.title}
                  </span>
                  <span className="mt-1 block text-[13px] font-semibold leading-snug text-[var(--sf-ink)]/65">
                    {signupFromLine(item.signup)}
                  </span>
                  {deadline ? (
                    <span className="mt-1 block text-[12.5px] font-extrabold text-[var(--sf-ink)]/75">{deadline}</span>
                  ) : null}
                </GNoteTile>
              </li>
            );
          })}
        </ul>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t-[1.5px] border-dashed border-[var(--sf-ink)]/15 pt-4">
        <div className="flex items-center gap-3">
          {open <= MAX_DOTS ? (
            <span className="flex gap-1" aria-hidden="true">
              {Array.from({ length: open }, (_, i) => (
                <span
                  key={i}
                  className={`h-2.5 w-5 rounded-full border-[1.5px] border-[var(--sf-ink)] ${i < answered ? "bg-[var(--sf-clay)]" : "bg-white"}`}
                />
              ))}
            </span>
          ) : null}
          <span className="text-[13px] font-extrabold text-[var(--sf-ink)]/75">
            {answered} of {open} open {open === 1 ? "signup" : "signups"} answered
          </span>
        </div>
        {hidden > 0 ? (
          <button type="button" className={gLinkSm} onClick={onShowNeeds}>
            +{hidden} more
          </button>
        ) : null}
      </div>
    </GCard>
  );
}
