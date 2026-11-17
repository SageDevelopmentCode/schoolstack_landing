"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Lock } from "lucide-react";
import {
  AdminGardenPage,
  AdminGardenPageHeader,
  GardenSection,
} from "@/components/school-admin/garden/kit";
import { gFade } from "@/components/school-parent/garden/motion";
import {
  G_FOCUS,
  G_INPUT,
  GCard,
  GKicker,
  gBtnOnAccent,
  gBtnPopSm,
} from "@/components/school-parent/garden/ui";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import { buildParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { FREE_PLAN_FULL_PLAN_LABEL } from "@/lib/school-admin/free-plan-upgrade";
import { useFreePlanUpgrade } from "@/lib/school-admin/free-plan-upgrade-context";
import {
  getFreePlanPitch,
  type FreePlanPitchTint,
} from "@/lib/school-admin/free-plan-upgrade-pitches";
import { createClient } from "@/utils/supabase/client";
import {
  FREE_HOME_COPY as COPY,
  FREE_HOME_LOCKED_ITEMS,
  FREE_HOME_START_ITEMS,
} from "./free-school-home-copy";

type FreeSchoolHomeProps = {
  slug: string;
  schoolName: string;
  branding: OrganizationBranding;
  initialName: string | null;
};

const TILE_TINT: Record<FreePlanPitchTint, string> = {
  butter: "bg-[var(--sf-butter)]",
  sky: "bg-[var(--sf-sky)]",
  lav: "bg-[var(--sf-lav)]",
  mint: "bg-[var(--sf-mint)]",
  peach: "bg-[var(--sf-peach)]",
};

const ICON_TILE =
  "inline-flex shrink-0 items-center justify-center rounded-[13px] text-[var(--sf-ink)] ring-[1.5px] ring-[var(--sf-ink)]/10 [&_svg]:[stroke-width:2.3]";

/** Free-plan admin Home: name capture, a "start here" list and the locked features. */
export default function FreeSchoolHome({
  slug,
  schoolName,
  branding,
  initialName,
}: FreeSchoolHomeProps) {
  const theme = useMemo(() => buildParentThemeTokens(branding), [branding]);
  const openUpgrade = useFreePlanUpgrade();
  const school = schoolName.trim() || "your school";
  const [savedName, setSavedName] = useState(initialName);

  return (
    <AdminGardenPage theme={theme} data-testid="free-school-home">
      {savedName ? (
        <AdminGardenPageHeader
          kicker={school}
          title={
            <>
              Welcome, <span className="text-[var(--sf-clay)]">{savedName}</span>
            </>
          }
          subtitle={COPY.welcomeSubtitle}
        />
      ) : (
        <NameCard school={school} initialName={initialName} onSaved={setSavedName} />
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <GCard kicker={COPY.startKicker} title={COPY.startTitle} index={1} data-testid="free-home-start">
          <ol className="m-0 -mx-2 flex list-none flex-col divide-y divide-[var(--sf-ink)]/[0.06] p-0">
            {FREE_HOME_START_ITEMS.map((item, index) => {
              const Icon = item.icon;
              return (
                <li key={item.id} className="py-0.5">
                  <Link
                    href={`${schoolAdminPath(slug, item.feature, item.subtab)}${item.query ? `?${item.query}` : ""}`}
                    className={`group flex items-center gap-3 rounded-[16px] px-2 py-2.5 transition-colors hover:bg-[var(--sf-accent-wash)] ${G_FOCUS}`}
                  >
                    <span className="w-4 shrink-0 text-center text-[12px] font-extrabold tabular-nums text-[var(--sf-soft)]">
                      {index + 1}
                    </span>
                    <span aria-hidden className={`${ICON_TILE} h-10 w-10 ${item.tint}`}>
                      <Icon className="h-[18px] w-[18px]" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14.5px] font-extrabold text-[var(--sf-ink)]">{item.title}</span>
                      <span className="block text-[13px] font-semibold leading-snug text-[var(--sf-soft)]">
                        {item.description}
                      </span>
                    </span>
                    <ArrowRight
                      className="h-4 w-4 shrink-0 text-[var(--sf-ink)]/35 transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--sf-clay-deep)]"
                      aria-hidden
                    />
                  </Link>
                </li>
              );
            })}
          </ol>
        </GCard>

        <GCard tone="dark" kicker={COPY.callKicker} title={COPY.callTitle(school)} index={2}>
          <p className="m-0 text-[15px] leading-relaxed text-white/80">{COPY.callBody}</p>
          <ul className="m-0 mt-4 flex list-none flex-col gap-2 p-0">
            {getFreePlanPitch(null).highlights.map(({ text }) => (
              <li key={text} className="flex items-start gap-2.5 text-[14px] font-semibold leading-snug text-white/90">
                <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--sf-butter)]" />
                {text}
              </li>
            ))}
          </ul>
          {openUpgrade ? (
            <div className="mt-auto pt-6">
              <button
                type="button"
                aria-haspopup="dialog"
                onClick={() => openUpgrade(FREE_PLAN_FULL_PLAN_LABEL)}
                className={`group rounded-full ${G_FOCUS}`}
              >
                <span className={gBtnOnAccent}>
                  {COPY.callCta}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </span>
              </button>
            </div>
          ) : null}
        </GCard>
      </div>

      <GardenSection
        id="free-home-locked"
        title={COPY.lockedTitle}
        description={COPY.lockedBody(school)}
        className="mt-2"
      >
        <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 xl:grid-cols-3">
          {FREE_HOME_LOCKED_ITEMS.map((item, index) => (
            <LockedFeatureCard
              key={item.label}
              index={index}
              label={item.label}
              pitchKey={item.pitchKey}
              onOpen={openUpgrade ? () => openUpgrade(item.label) : undefined}
            />
          ))}
        </ul>
      </GardenSection>
    </AdminGardenPage>
  );
}

function LockedFeatureCard({
  index,
  label,
  pitchKey,
  onOpen,
}: {
  index: number;
  label: string;
  pitchKey: string;
  onOpen?: () => void;
}) {
  const reduce = useReducedMotion() === true;
  const pitch = getFreePlanPitch(pitchKey);
  const Icon = pitch.icon;
  const body = (
    <>
      <span aria-hidden className={`${ICON_TILE} h-11 w-11 ${TILE_TINT[pitch.tint]}`}>
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-[14.5px] font-extrabold text-[var(--sf-ink)]">{label}</span>
          <span
            aria-hidden
            className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--sf-ink)]/[0.06] text-[var(--sf-ink)]/55"
          >
            <Lock className="h-2.5 w-2.5" strokeWidth={2.8} />
          </span>
        </span>
        <span className="mt-0.5 line-clamp-2 block text-[13px] font-semibold leading-snug text-[var(--sf-soft)]">
          {pitch.promise}
        </span>
      </span>
    </>
  );
  const cardClass =
    "flex h-full w-full items-start gap-3 rounded-[20px] border-[1.5px] border-[var(--sf-ink)]/10 bg-white p-4 text-left shadow-[0_2px_0_0_rgba(43,36,29,0.06)]";
  return (
    <motion.li {...gFade(Math.min(index, 6) + 3, reduce)} className="min-w-0">
      {onOpen ? (
        <button
          type="button"
          aria-haspopup="dialog"
          aria-label={`${label}, locked. See what it does`}
          onClick={onOpen}
          className={`${cardClass} transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-[var(--sf-ink)]/25 ${G_FOCUS}`}
        >
          {body}
        </button>
      ) : (
        <div className={cardClass}>{body}</div>
      )}
    </motion.li>
  );
}

function NameCard({
  school,
  initialName,
  onSaved,
}: {
  school: string;
  initialName: string | null;
  onSaved: (name: string) => void;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const reduce = useReducedMotion() === true;
  const [name, setName] = useState(initialName ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveName() {
    const trimmed = name.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    setError(null);
    const { error: updateError } = await supabase.auth.updateUser({
      data: { first_name: trimmed, full_name: trimmed },
    });
    setSaving(false);
    if (updateError) {
      setError("Could not save your name. Please try again.");
      return;
    }
    onSaved(trimmed);
    router.refresh();
  }

  return (
    <motion.section
      {...gFade(0, reduce)}
      aria-labelledby="free-home-name-title"
      className="relative overflow-hidden rounded-[28px] border-[1.5px] border-[var(--sf-ink)]/12 bg-[var(--sf-paper)] p-6 shadow-[0_3px_0_0_rgba(43,36,29,0.08)] sm:p-8"
      data-testid="free-home-name"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[var(--sf-butter)]/45"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-24 right-24 hidden h-44 w-44 rounded-full bg-[var(--sf-mint)]/55 sm:block"
      />
      <div className="relative max-w-xl">
        <GKicker>{COPY.nameKicker}</GKicker>
        <h1
          id="free-home-name-title"
          className="sf-display m-0 mt-2 text-[2.2rem] leading-[0.98] text-[var(--sf-ink)] sm:text-[2.8rem]"
        >
          {COPY.nameTitleLead} <span className="text-[var(--sf-clay)]">{COPY.nameTitleAccent}</span>
        </h1>
        <p className="m-0 mt-3 text-[15.5px] font-semibold text-[var(--sf-soft)]">{COPY.nameBody(school)}</p>
        <form
          className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center"
          onSubmit={(event) => {
            event.preventDefault();
            void saveName();
          }}
        >
          <label className="sr-only" htmlFor="free-school-name">
            Your name
          </label>
          <input
            id="free-school-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="given-name"
            placeholder="Your name"
            className={`${G_INPUT} !rounded-full !px-5 !py-3 sm:max-w-[320px]`}
          />
          <button type="submit" disabled={saving || !name.trim()} className={`${gBtnPopSm} !px-6 !py-3`}>
            {saving ? "Saving…" : "Save"}
          </button>
        </form>
        {error ? (
          <p role="alert" className="m-0 mt-3 text-sm font-semibold text-[var(--sf-clay-deep)]">
            {error}
          </p>
        ) : null}
      </div>
      <p
        aria-hidden
        className="sf-hand pointer-events-none absolute bottom-5 right-7 m-0 hidden -rotate-3 text-2xl text-[var(--sf-forest)] md:block"
      >
        {COPY.nameHand}
      </p>
    </motion.section>
  );
}
