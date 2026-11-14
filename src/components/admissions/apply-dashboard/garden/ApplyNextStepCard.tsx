"use client";

import { createElement } from "react";
import { ArrowRight, ChevronRight, ClipboardCheck, FileSignature, PencilLine, type LucideIcon } from "lucide-react";
import { Tick } from "@/components/garden/ui";
import NavigationLink from "@/components/school/shared/NavigationLink";
import {
  GCard,
  GIcon,
  GNoteTile,
  NOTE_TINTS,
  G_FOCUS,
  gBtnOnAccent,
  gBtnOutlineSm,
  gBtnPopSm,
  gLinkSm,
} from "@/components/school-parent/garden/ui";
import { POST_SUBMIT_ACTION_TEMPLATES } from "@/lib/admissions/post-submit-templates";
import type { ApplyTodo, BookingTarget } from "../useApplyDashboardModel";

/*
 * "Start here" for the apply dashboard (recipe: parent-portal-garden-design ›
 * Start here). The most important to-do is a solid accent strip with the
 * page's one toy pill; the rest are pastel note tiles. To-dos never print a
 * child's full name as text: they carry an initials badge instead.
 */

const MAX_TILES = 6;

function todoIconType(todo: ApplyTodo): LucideIcon {
  switch (todo.tone) {
    case "sign":
      return FileSignature;
    case "enroll":
      return ClipboardCheck;
    case "draft":
      return PencilLine;
    case "book":
      return todo.booking
        ? (POST_SUBMIT_ACTION_TEMPLATES[todo.booking.task.type]?.Icon ?? ClipboardCheck)
        : ClipboardCheck;
  }
}

function renderTodoIcon(todo: ApplyTodo) {
  return createElement(todoIconType(todo));
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function ChildBadge({ name, onAccent = false }: { name: string | null; onAccent?: boolean }) {
  if (!name) return null;
  return (
    <span
      role="img"
      aria-label={`For ${name}`}
      title={name}
      className={`inline-flex h-7 min-w-7 shrink-0 items-center justify-center rounded-full px-1.5 text-[11px] font-extrabold tracking-wide ${
        onAccent
          ? "bg-white/20 text-white ring-[1.5px] ring-white/50"
          : "bg-white text-[var(--sf-ink)]/75 ring-[1.5px] ring-[var(--sf-ink)]/15"
      }`}
    >
      {initials(name)}
    </span>
  );
}

function LeadStrip({ todo, onBook }: { todo: ApplyTodo; onBook: (target: BookingTarget) => void }) {
  const body = (
    <>
      <GIcon size="sm" className="!ring-white/70">
        {renderTodoIcon(todo)}
      </GIcon>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/75">Next step</span>
          <ChildBadge name={todo.studentName} onAccent />
        </span>
        <span className="mt-1 block text-[17px] font-extrabold leading-snug">{todo.title}</span>
        {todo.subtitle ? (
          <span className="mt-0.5 line-clamp-2 block text-sm text-white/85">{todo.subtitle}</span>
        ) : null}
      </span>
      <span className={gBtnOnAccent} aria-hidden="true">
        {todo.cta} <ArrowRight className="h-4 w-4" />
      </span>
    </>
  );
  const cls = `group flex w-full flex-col gap-4 rounded-[16px] bg-[var(--sf-clay)] p-5 text-left text-white sm:flex-row sm:items-center ${G_FOCUS}`;

  if (todo.booking) {
    const booking = todo.booking;
    return (
      <button
        type="button"
        onClick={() => onBook(booking)}
        aria-label={`${todo.cta}: ${todo.title}`}
        className={cls}
        data-testid="apply-next-step"
      >
        {body}
      </button>
    );
  }
  return (
    <NavigationLink href={todo.href} className={cls} data-testid="apply-next-step">
      {body}
    </NavigationLink>
  );
}

function TodoTile({
  todo,
  index,
  onBook,
}: {
  todo: ApplyTodo;
  index: number;
  onBook: (target: BookingTarget) => void;
}) {
  const booking = todo.booking;
  const inner = (
    <>
      <span className="flex items-start justify-between gap-2">
        <GIcon size="sm">{renderTodoIcon(todo)}</GIcon>
        <ChildBadge name={todo.studentName} />
      </span>
      <span className="mt-3 block text-[15px] font-extrabold leading-snug text-[var(--sf-ink)]">{todo.title}</span>
      {todo.subtitle ? (
        <span className="mt-1 line-clamp-2 block text-[13px] font-semibold leading-snug text-[var(--sf-ink)]/65">
          {todo.subtitle}
        </span>
      ) : null}
      <span className="mt-auto inline-flex items-center gap-1 pt-3 text-[13px] font-extrabold text-[var(--sf-clay-deep)]">
        {todo.cta}
        <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
      </span>
    </>
  );
  const tint = NOTE_TINTS[index % NOTE_TINTS.length];
  return booking ? (
    <GNoteTile tint={tint} onClick={() => onBook(booking)}>
      {inner}
    </GNoteTile>
  ) : (
    <GNoteTile tint={tint} href={todo.href}>
      {inner}
    </GNoteTile>
  );
}

export function ApplyEnrolledCard({
  index,
  schoolName,
  parentPortalHref,
  primary,
}: {
  index: number;
  schoolName: string;
  parentPortalHref: string;
  /** False when another card already holds the page's toy button. */
  primary: boolean;
}) {
  return (
    <GCard index={index} kicker="Enrollment complete" data-testid="apply-enrolled-card">
      <div className="flex flex-col gap-4 rounded-[16px] bg-[var(--sf-mint)] p-5 sm:flex-row sm:items-center">
        <Tick className="h-12 w-12" color="var(--sf-forest)" />
        <div className="min-w-0 flex-1">
          <h2 className="sf-display m-0 text-[1.5rem] leading-tight text-[var(--sf-ink)]">Your family is enrolled!</h2>
          <p className="m-0 mt-1 text-[14px] font-semibold leading-relaxed text-[var(--sf-ink)]/75">
            Welcome to {schoolName}. Tuition, messages, your children&apos;s school-day
            updates, and family events now live in your parent portal.
          </p>
          <span aria-hidden="true" className="sf-hand mt-1 block text-xl text-[var(--sf-forest)]">
            welcome to the family ✿
          </span>
        </div>
        <NavigationLink
          href={parentPortalHref}
          className={`${primary ? gBtnPopSm : gBtnOutlineSm} w-full shrink-0 sm:w-auto`}
        >
          Go to parent portal <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </NavigationLink>
      </div>
    </GCard>
  );
}

export default function ApplyNextStepCard({
  index,
  todos,
  requiredDone,
  requiredTotal,
  onBook,
  onSeeAllSteps,
}: {
  index: number;
  todos: ApplyTodo[];
  requiredDone: number;
  requiredTotal: number;
  onBook: (target: BookingTarget) => void;
  onSeeAllSteps?: () => void;
}) {
  if (todos.length === 0) {
    return (
      <GCard index={index} kicker="Start here" title="You're all caught up" data-testid="apply-next-step-card">
        <div className="flex items-center gap-4 rounded-[16px] bg-[var(--sf-mint)] p-5">
          <Tick className="h-12 w-12" color="var(--sf-forest)" />
          <div>
            <p className="m-0 text-[15px] font-semibold text-[var(--sf-ink)]/80">
              Nothing needs your attention right now. New steps will show up here as your
              application moves along.
            </p>
            <span aria-hidden="true" className="sf-hand mt-1 block text-xl text-[var(--sf-forest)]">
              enjoy the quiet ✿
            </span>
          </div>
        </div>
      </GCard>
    );
  }

  const [lead, ...rest] = todos;
  const tiles = rest.slice(0, MAX_TILES);
  const hidden = rest.length - tiles.length;

  return (
    <GCard
      index={index}
      kicker="Start here"
      title={`${todos.length} thing${todos.length === 1 ? "" : "s"} need${todos.length === 1 ? "s" : ""} your attention`}
      data-testid="apply-next-step-card"
    >
      <LeadStrip todo={lead} onBook={onBook} />

      {tiles.length > 0 ? (
        <ul className="m-0 mt-5 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {tiles.map((todo, i) => (
            <li key={todo.key}>
              <TodoTile todo={todo} index={i} onBook={onBook} />
            </li>
          ))}
        </ul>
      ) : null}

      {requiredTotal > 0 || hidden > 0 ? (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t-[1.5px] border-dashed border-[var(--sf-ink)]/15 pt-4">
          {requiredTotal > 0 ? (
            <div className="flex items-center gap-3">
              <span className="flex gap-1" aria-hidden="true">
                {Array.from({ length: Math.min(requiredTotal, 8) }, (_, i) => (
                  <span
                    key={i}
                    className={`h-2.5 w-5 rounded-full border-[1.5px] border-[var(--sf-ink)] ${
                      i < requiredDone ? "bg-[var(--sf-clay)]" : "bg-white"
                    }`}
                  />
                ))}
              </span>
              <span className="text-[13px] font-extrabold text-[var(--sf-ink)]/75">
                Required steps · {requiredDone} of {requiredTotal} complete
              </span>
            </div>
          ) : (
            <span />
          )}
          {onSeeAllSteps ? (
            <button type="button" className={gLinkSm} onClick={onSeeAllSteps}>
              {hidden > 0 ? `+${hidden} more · ` : ""}See all steps <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          ) : hidden > 0 ? (
            <span className="text-[13px] font-extrabold text-[var(--sf-ink)]/60">+{hidden} more</span>
          ) : null}
        </div>
      ) : null}
    </GCard>
  );
}
