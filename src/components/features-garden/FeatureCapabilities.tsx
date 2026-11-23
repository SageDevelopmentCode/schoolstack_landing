"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Globe, Smartphone } from "lucide-react";
import type { Feature, FeatureRole, FeatureShot } from "@/lib/marketing/features/types";
import { FEATURE_PAGE_LABELS as L } from "@/lib/marketing/features/features-copy";
import { Tick } from "@/components/garden/ui";
import { WordsReveal } from "@/components/garden/motion";
import { MobileShotCard, ROLE_META, ROLE_ORDER, WebShotFrame } from "./feature-ui";
import { useHashRole } from "./useHashRole";

function shotsFor(feature: Feature, role: FeatureRole, platform: FeatureShot["platform"]) {
  return feature.shots.map((s, i) => ({ s, i })).filter(({ s }) => s.role === role && s.platform === platform);
}

/**
 * "What you can do": the page's one forest panel. Role tabs (only the roles
 * that use this feature) → ticked capabilities on the left; picking one swaps
 * the real screenshot on the right, with a Web / App toggle when both exist.
 * `#for-<role>` deep links open that role's tab.
 */
export default function FeatureCapabilities({ feature }: { feature: Feature }) {
  const roles = ROLE_ORDER.filter((r) => feature.capabilities[r]?.length);
  // `#for-<role>` deep links pick the starting tab; a click overrides it.
  const hashRole = useHashRole();
  const [picked, setRole] = useState<FeatureRole | null>(null);
  const role: FeatureRole = picked ?? (hashRole && roles.includes(hashRole) ? hashRole : (roles[0] ?? "admin"));
  const [pick, setPick] = useState(0);
  const [platform, setPlatform] = useState<FeatureShot["platform"]>("web");
  const reduce = useReducedMotion();
  const uid = useId();


  const caps = feature.capabilities[role] ?? [];
  // A role with no screens of its own (admins on the website page) shows the feature's other screens.
  const ownWeb = shotsFor(feature, role, "web");
  const ownMobile = shotsFor(feature, role, "mobile");
  const hasOwn = ownWeb.length + ownMobile.length > 0;
  const web = hasOwn ? ownWeb : feature.shots.map((s, i) => ({ s, i })).filter(({ s }) => s.platform === "web");
  const mobile = hasOwn ? ownMobile : feature.shots.map((s, i) => ({ s, i })).filter(({ s }) => s.platform === "mobile");
  const hasBoth = web.length > 0 && mobile.length > 0;
  const activePlatform: FeatureShot["platform"] = hasBoth ? platform : web.length ? "web" : "mobile";

  // The picked capability's own screen wins if it matches the platform shown;
  // otherwise cycle through this role's screens for that platform.
  const pool = activePlatform === "web" ? web : mobile;
  const capShot = caps[pick]?.shot;
  const fromCap = capShot !== undefined ? pool.find(({ i }) => i === capShot) : undefined;
  const shown = fromCap ?? (pool.length ? pool[pick % pool.length] : undefined);

  const selectRole = (r: FeatureRole) => {
    setRole(r);
    setPick(0);
  };

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const i = roles.indexOf(role);
    let next = -1;
    if (e.key === "ArrowRight") next = (i + 1) % roles.length;
    if (e.key === "ArrowLeft") next = (i - 1 + roles.length) % roles.length;
    if (next < 0) return;
    e.preventDefault();
    selectRole(roles[next]);
    document.getElementById(`${uid}-tab-${roles[next]}`)?.focus();
  };

  if (!roles.length) return null;

  return (
    <section id="what-you-can-do" aria-labelledby={`${uid}-h2`} className="scroll-mt-24 px-3 py-10 lg:px-6">
      <div className="rounded-[44px] bg-[var(--sf-forest)] px-6 py-20 text-[var(--sf-cream)] sm:px-10 lg:px-16 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <h2 id={`${uid}-h2`} className="sf-display text-5xl leading-[0.95] text-[var(--sf-cream)] md:text-6xl">
                <WordsReveal as="span" text={`${L.capabilitiesLead} ${feature.roles.length > 1 ? L.capabilitiesAccent : `${ROLE_META[roles[0]].label.toLowerCase()}.`}`} />
              </h2>
            </div>
            {roles.length > 1 ? (
              <div role="tablist" aria-label={L.roleTabsLabel} className="sf-no-scrollbar flex max-w-full gap-1 overflow-x-auto rounded-full bg-white/10 p-1.5">
                {roles.map((r) => {
                  const selected = r === role;
                  return (
                    <button
                      key={r}
                      id={`${uid}-tab-${r}`}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      aria-controls={`${uid}-panel`}
                      tabIndex={selected ? 0 : -1}
                      onClick={() => selectRole(r)}
                      onKeyDown={onTabKey}
                      className={`relative shrink-0 cursor-pointer whitespace-nowrap rounded-full px-4 py-2 text-[15px] font-extrabold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-butter)]/50 sm:px-5 ${
                        selected ? "text-[var(--sf-ink)]" : "text-[var(--sf-cream)]/80 hover:text-white"
                      }`}
                    >
                      {selected ? (
                        <motion.span
                          layoutId={`${uid}-pill`}
                          className="absolute inset-0 rounded-full bg-[var(--sf-butter)]"
                          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 30 }}
                          aria-hidden="true"
                        />
                      ) : null}
                      <span className="relative">
                        <span aria-hidden="true">{ROLE_META[r].emoji} </span>
                        {ROLE_META[r].label}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>

          <div
            id={`${uid}-panel`}
            role={roles.length > 1 ? "tabpanel" : undefined}
            aria-labelledby={roles.length > 1 ? `${uid}-tab-${role}` : undefined}
            className="mt-12 grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-14"
          >
            <ul className="space-y-2">
              {caps.map((c, i) => {
                const active = i === pick;
                return (
                  <li key={`${role}-${c.title}`}>
                    <button
                      type="button"
                      aria-pressed={active}
                      onClick={() => setPick(i)}
                      className={`flex w-full cursor-pointer items-start gap-4 rounded-[22px] px-4 py-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-butter)]/50 sm:px-5 ${
                        active ? "bg-white/12 ring-2 ring-[var(--sf-butter)]" : "hover:bg-white/6"
                      }`}
                    >
                      <Tick className="mt-0.5 h-7 w-7" color="var(--sf-forest)" fill={active ? "var(--sf-butter)" : "#fff"} />
                      <span>
                        <span className="block text-lg font-extrabold leading-snug text-white">{c.title}</span>
                        <span className="mt-1 block text-[15.5px] leading-relaxed text-[var(--sf-cream)]/85">{c.body}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="lg:sticky lg:top-28 lg:self-start">
              {hasBoth ? (
                <div className="mb-6 flex justify-end">
                  <div className="flex gap-1 rounded-full bg-white/10 p-1" role="group" aria-label="Screen">
                    {(["web", "mobile"] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        aria-pressed={activePlatform === p}
                        onClick={() => setPlatform(p)}
                        className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-extrabold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-butter)]/50 ${
                          activePlatform === p ? "bg-[var(--sf-butter)] text-[var(--sf-ink)]" : "text-[var(--sf-cream)]/80 hover:text-white"
                        }`}
                      >
                        {p === "web" ? <Globe size={14} aria-hidden="true" /> : <Smartphone size={14} aria-hidden="true" />}
                        {p === "web" ? L.webLabel : L.mobileLabel}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              <AnimatePresence mode="wait" initial={false}>
                {shown ? (
                  <motion.div
                    key={shown.s.src}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, rotate: 1 }}
                    animate={{ opacity: 1, y: 0, rotate: 0 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10 }}
                    transition={{ duration: reduce ? 0.15 : 0.45, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {shown.s.platform === "web" ? (
                      <WebShotFrame shot={shown.s} label={`${ROLE_META[role].short} · ${feature.name}`} tilt={-0.6} tape="var(--sf-butter)" />
                    ) : (
                      <MobileShotCard shot={shown.s} tilt={1.5} tape="var(--sf-butter)" sizes="300px" className="mx-auto w-[min(300px,70vw)]" />
                    )}
                    <p className="mt-6 text-center text-sm font-bold text-[var(--sf-cream)]/80" aria-live="polite">
                      {shown.s.caption}
                    </p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
