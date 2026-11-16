"use client";

import { ArrowRight, ChevronRight, HeartHandshake } from "lucide-react";
import { DateStamp, GCard, G_FOCUS, gBtnButterSm } from "@/components/school-parent/garden/ui";
import type { ParentClassroomSignupsModel } from "../useParentClassroomSignupsModel";
import { slotDateLabel } from "./signups-garden-ui";

const MAX_TICKETS = 4;

/** Rail (the page's one dark card): what the family has signed up to help with, as tickets. */
export function UpcomingHelpCard({
  model,
  onShowSignedUp,
  onShowNeeds,
  index = 2,
}: {
  model: ParentClassroomSignupsModel;
  onShowSignedUp: () => void;
  onShowNeeds: () => void;
  index?: number;
}) {
  const help = model.upcomingHelp;
  const shown = help.slice(0, MAX_TICKETS);
  const more = help.length - shown.length;

  return (
    <GCard index={index} tone="dark" kicker="Your upcoming help" title="You're helping with" data-testid="parent-signups-upcoming">
      {shown.length > 0 ? (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {shown.map((entry) => (
            <li key={entry.key}>
              <button
                type="button"
                onClick={() => model.openSignup(entry.signupId)}
                className={`sf-ticket group flex w-full items-stretch rounded-2xl bg-[var(--sf-paper)] text-left text-[var(--sf-ink)] ${G_FOCUS} focus-visible:ring-offset-[var(--sf-clay-deep)]`}
              >
                <span className="flex items-center py-2.5 pl-5 pr-3">
                  {entry.date ? (
                    <DateStamp date={entry.date} size="sm" />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="flex h-[66px] w-14 items-center justify-center rounded-2xl border-2 border-dashed border-[var(--sf-ink)]/25 text-[var(--sf-clay-deep)]"
                    >
                      <HeartHandshake className="h-6 w-6" strokeWidth={2.2} />
                    </span>
                  )}
                </span>
                <span className="my-3 border-l-[1.5px] border-dashed border-[var(--sf-ink)]/20" aria-hidden="true" />
                <span className="min-w-0 flex-1 px-4 py-3 pr-6">
                  <span className="block truncate text-[15px] font-extrabold">{entry.title}</span>
                  {entry.date ? (
                    <span className="sr-only">{slotDateLabel({ date: entry.date })}, </span>
                  ) : null}
                  <span className="block text-[13px] font-semibold leading-snug text-[var(--sf-soft)]">{entry.detail}</span>
                </span>
                <span className="flex items-center pr-5" aria-hidden="true">
                  <ChevronRight className="h-4 w-4 text-[var(--sf-ink)]/40 transition-transform duration-300 group-hover:translate-x-0.5" />
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="m-0 text-[15px] text-white/80">
          Nothing booked yet. Pick a signup and your times and roles will show up here.
        </p>
      )}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        {help.length > 0 ? (
          <button type="button" className={gBtnButterSm} onClick={onShowSignedUp}>
            {more > 0 ? `See all ${help.length}` : "See your signups"} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : model.needsResponse.length > 0 ? (
          <button type="button" className={gBtnButterSm} onClick={onShowNeeds}>
            See open requests <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </GCard>
  );
}

const STEPS = [
  { title: "Pick a request", body: "Open any signup from your child's teacher." },
  { title: "Choose how to help", body: "A time slot, a role, or a short note — whatever the teacher asked for." },
  { title: "Confirm", body: "You can update or withdraw any time while the signup is open." },
] as const;

/** Rail: the three-step "how it works", with step 1 lit while requests are waiting. */
export function HowSignupsWorkCard({ model, index = 4 }: { model: ParentClassroomSignupsModel; index?: number }) {
  const current = model.needsResponse.length > 0 ? 0 : -1;
  return (
    <GCard index={index} kicker="How signups work" title="Three quick steps" data-testid="parent-signups-how">
      <ol className="m-0 list-none space-y-2.5 p-0" aria-label="Steps">
        {STEPS.map((step, i) => (
          <li
            key={step.title}
            aria-current={i === current ? "step" : undefined}
            className={`flex items-start gap-3 rounded-[16px] border-[1.5px] p-3.5 ${
              i === current ? "border-[var(--sf-clay)]/35 bg-[var(--sf-accent-wash)]" : "border-[var(--sf-ink)]/10 bg-white"
            }`}
          >
            <span
              aria-hidden="true"
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-[13px] font-extrabold ${
                i === current
                  ? "border-[var(--sf-ink)] bg-[var(--sf-clay)] text-white"
                  : "border-[var(--sf-ink)]/25 bg-white text-[var(--sf-ink)]/60"
              }`}
            >
              {i + 1}
            </span>
            <span className="min-w-0">
              <span className="block text-[14.5px] font-extrabold text-[var(--sf-ink)]">{step.title}</span>
              <span className="block text-[13px] font-semibold leading-snug text-[var(--sf-soft)]">{step.body}</span>
            </span>
          </li>
        ))}
      </ol>
    </GCard>
  );
}
