"use client";

import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Tick } from "@/components/garden/ui";
import { parentPortalAttentionIcon } from "@/components/school-parent/parent-portal-attention-icons";
import { useCelebrate } from "@/components/school-parent/garden/motion";
import { GCard, GIcon, GNoteTile, GSkeleton, NOTE_TINTS, gBtnOnAccent, gLinkSm, G_FOCUS } from "@/components/school-parent/garden/ui";
import type { ParentPortalAttentionItem } from "@/lib/parent-portal/parent-home-attention";
import type { ParentHomePageProps } from "../parent-home-types";
import type { ParentHomeModel } from "../useParentHomeModel";

/*
 * "Start here" — the Home's main card.
 * Urgent first to-do = solid accent strip (one link, toy "Open" pill);
 * the rest = pastel note tiles; footer = account-setup progress.
 * Recipe: parent-portal-garden-design › "Start here".
 */

function attentionTitle(count: number) {
  return `${count} thing${count === 1 ? "" : "s"} need your attention`;
}

function ItemIcon({ item, onAccent = false }: { item: ParentPortalAttentionItem; onAccent?: boolean }) {
  const icon = parentPortalAttentionIcon(item);
  if (icon.iconIncludesWrapper) return <span className="shrink-0">{icon.icon}</span>;
  return (
    <GIcon size="sm" className={onAccent ? "!ring-white/70" : ""}>
      {icon.icon}
    </GIcon>
  );
}

function SetupFooter({
  model,
  props,
  hidden,
}: {
  model: ParentHomeModel;
  props: ParentHomePageProps;
  hidden: number;
}) {
  const onboarding = props.onboardingItems ?? [];
  if (model.onboardingTotal === 0 && hidden <= 0) return null;
  return (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t-[1.5px] border-dashed border-[var(--sf-ink)]/15 pt-4">
      {model.onboardingTotal > 0 ? (
        <div className="flex items-center gap-3">
          <span className="flex gap-1" aria-hidden="true">
            {onboarding.map((o) => (
              <span
                key={o.id}
                className={`h-2.5 w-5 rounded-full border-[1.5px] border-[var(--sf-ink)] ${o.completed ? "bg-[var(--sf-clay)]" : "bg-white"}`}
              />
            ))}
          </span>
          <span className="text-[13px] font-extrabold text-[var(--sf-ink)]/75">
            Account setup · {model.onboardingDone} of {model.onboardingTotal} complete
          </span>
        </div>
      ) : (
        <span />
      )}
      {hidden > 0 ? (
        <button type="button" className={gLinkSm} onClick={model.openTodos}>
          +{hidden} more
        </button>
      ) : null}
    </div>
  );
}

export default function HomeStartHereCard({
  model,
  props,
}: {
  model: ParentHomeModel;
  props: ParentHomePageProps;
}) {
  const deferred = props.contentDeferred ?? false;
  const onboarding = props.onboardingItems ?? [];
  const items = model.attentionItems;
  const allDone = onboarding.every((i) => i.completed);
  const caughtUp = !deferred && items.length === 0 && allDone;
  // No confetti in admin previews or marketing demos.
  useCelebrate(caughtUp && !props.previewMode, model.theme, "parent-home-caught-up");

  const lead = items[0]?.urgent ? items[0] : null;
  const tiles = (lead ? items.slice(1) : items).slice(0, 4);
  const hidden = items.length - (lead ? 1 : 0) - tiles.length;

  return (
    <GCard
      index={1}
      kicker="Start here"
      title={
        deferred
          ? "Loading your to-dos"
          : items.length > 0
            ? attentionTitle(items.length)
            : allDone
              ? "You're all caught up"
              : "Finish setting up your account"
      }
      action={
        model.showTodosLink ? (
          <button type="button" className={gLinkSm} onClick={model.openTodos}>
            Review today&apos;s to-dos <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        ) : null
      }
    >
      {deferred ? (
        <GSkeleton className="h-52" />
      ) : items.length > 0 ? (
        <>
          {lead ? (
            lead.href ? (
              <Link
                href={lead.href}
                className={`group flex flex-col gap-4 rounded-[16px] bg-[var(--sf-clay)] p-5 text-white sm:flex-row sm:items-center ${G_FOCUS}`}
              >
                <ItemIcon item={lead} onAccent />
                <span className="min-w-0 flex-1">
                  <span className="block text-[17px] font-extrabold leading-snug">{lead.title}</span>
                  {lead.subtitle ? <span className="mt-0.5 block text-sm text-white/85">{lead.subtitle}</span> : null}
                </span>
                <span className={gBtnOnAccent} aria-hidden="true">
                  Open <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            ) : (
              <div className="flex flex-col gap-4 rounded-[16px] bg-[var(--sf-clay)] p-5 text-white sm:flex-row sm:items-center">
                <ItemIcon item={lead} onAccent />
                <div className="min-w-0 flex-1">
                  <p className="m-0 text-[17px] font-extrabold leading-snug">{lead.title}</p>
                  {lead.subtitle ? <p className="m-0 mt-0.5 text-sm text-white/85">{lead.subtitle}</p> : null}
                </div>
              </div>
            )
          ) : null}

          {tiles.length > 0 ? (
            <ul className={`grid gap-4 sm:grid-cols-2 ${lead ? "mt-5" : ""}`}>
              {tiles.map((item, i) => (
                <li key={item.key}>
                  <GNoteTile tint={NOTE_TINTS[i % NOTE_TINTS.length]} href={item.href}>
                    <span className="flex items-start justify-between gap-2">
                      <ItemIcon item={item} />
                      {item.href ? (
                        <ChevronRight
                          className="h-4 w-4 text-[var(--sf-ink)]/50 transition-transform duration-300 group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      ) : null}
                    </span>
                    <span className="mt-3 block text-[15px] font-extrabold leading-snug text-[var(--sf-ink)]">{item.title}</span>
                    {item.subtitle ? (
                      <span className="mt-1 block text-[13px] font-semibold leading-snug text-[var(--sf-ink)]/65">{item.subtitle}</span>
                    ) : null}
                  </GNoteTile>
                </li>
              ))}
            </ul>
          ) : null}

          <SetupFooter model={model} props={props} hidden={hidden} />
        </>
      ) : allDone ? (
        <div className="flex items-center gap-4 rounded-[16px] bg-[var(--sf-mint)] p-5">
          <Tick className="h-12 w-12" color="var(--sf-forest)" />
          <div>
            <p className="m-0 text-[15px] font-semibold text-[var(--sf-ink)]/80">
              No urgent tasks right now. Check back for updates from school.
            </p>
            <span aria-hidden="true" className="sf-hand mt-1 block text-xl text-[var(--sf-forest)]">
              enjoy the quiet ✿
            </span>
          </div>
        </div>
      ) : (
        <>
          <p className="m-0 text-[15px] text-[var(--sf-soft)]">A few quick steps to get the most from your portal</p>
          <SetupFooter model={model} props={props} hidden={0} />
        </>
      )}
    </GCard>
  );
}
