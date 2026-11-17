"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  Check,
  Copy,
  ExternalLink,
  Globe,
  ListChecks,
  Mail,
  MonitorSmartphone,
  Newspaper,
  PauseCircle,
  Send,
  Type,
  type LucideIcon,
} from "lucide-react";
import type { PublicTourFieldDefinition } from "@/lib/admissions/public-tour-settings";
import {
  DEFAULT_PUBLIC_TOUR_FIELDS,
  DEFAULT_PUBLIC_TOUR_HEADLINE,
  DEFAULT_PUBLIC_TOUR_INTRO,
} from "@/lib/admissions/public-tour-settings";
import AdmissionsAvailabilityEditor from "@/components/school-admin/admissions/AdmissionsAvailabilityEditor";
import PublicTourFieldsEditor from "@/components/school-admin/admissions/PublicTourFieldsEditor";
import {
  PUBLIC_TOUR_SHARE_IDEAS,
  PUBLIC_TOUR_TURNED_OFF_COPY,
  PUBLIC_TOUR_WIZARD_STEPS,
  questionCountLabel,
  type PublicTourWizardStepId,
} from "@/components/school-admin/admissions/public-tour-wizard-copy";
import { BusyLabel, GardenField, GardenLoadError, GardenNotice } from "@/components/school-admin/garden/kit";
import {
  GChip,
  GSkeleton,
  G_FOCUS,
  G_INPUT,
  gBtnOutlineSm,
  gBtnPopSm,
} from "@/components/school-parent/garden/ui";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";

/*
 * Schedule → Tours & interviews → Public tour page: a 4-step Garden wizard
 * (Words · Times · Questions · Share). Renders inside the admin Garden frame.
 */

type PublicTourSchoolSettingsPanelProps = {
  C: AdminThemeTokens;
  organizationId: string;
  schoolSlug: string;
  onPlatformEnabledChange?: (enabled: boolean) => void;
};

type SavedSnapshot = { headline: string; intro: string; fields: string };

const SAVE_ERROR_TOAST_ID = "public-tour-save-error";

const STEP_ICONS: Record<PublicTourWizardStepId, { icon: LucideIcon; tint: string }> = {
  words: { icon: Type, tint: "bg-[var(--sf-butter)]" },
  times: { icon: CalendarClock, tint: "bg-[var(--sf-sky)]" },
  questions: { icon: ListChecks, tint: "bg-[var(--sf-lav)]" },
  share: { icon: Send, tint: "bg-[var(--sf-mint)]" },
};

const SHARE_IDEA_ICONS: Record<(typeof PUBLIC_TOUR_SHARE_IDEAS)[number]["id"], { icon: LucideIcon; tint: string }> = {
  email: { icon: Mail, tint: "bg-[var(--sf-sky)]" },
  newsletter: { icon: Newspaper, tint: "bg-[var(--sf-butter)]" },
  website: { icon: MonitorSmartphone, tint: "bg-[var(--sf-lav)]" },
};

const gBtnTextSm = `inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-extrabold text-[var(--sf-ink)]/70 transition-colors hover:bg-[var(--sf-ink)]/[0.05] hover:text-[var(--sf-ink)] disabled:cursor-not-allowed disabled:opacity-50 ${G_FOCUS}`;

const gBtnLinkPill = `inline-flex min-h-[36px] items-center justify-center gap-1.5 rounded-full border-[1.5px] border-[var(--sf-ink)]/20 bg-white px-3 py-1.5 text-[13px] font-extrabold text-[var(--sf-ink)] transition-colors hover:border-[var(--sf-ink)]/50 ${G_FOCUS}`;

function IconTile({ icon: Icon, tint, size = "md" }: { icon: LucideIcon; tint: string; size?: "sm" | "md" }) {
  const box = size === "sm" ? "h-9 w-9 rounded-[12px]" : "h-11 w-11 rounded-[14px]";
  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center border-[1.5px] border-[var(--sf-ink)]/15 ${box} ${tint}`}
    >
      <Icon className={size === "sm" ? "h-4 w-4 text-[var(--sf-ink)]/75" : "h-5 w-5 text-[var(--sf-ink)]/75"} />
    </span>
  );
}

function snapshotOf(headline: string, intro: string, fields: PublicTourFieldDefinition[]): SavedSnapshot {
  return { headline, intro, fields: JSON.stringify(fields) };
}

/** Small "browser window" preview of the top of the public tour page. */
function TourPagePreview({
  headline,
  intro,
  tone,
  size,
  hand,
}: {
  headline: string;
  intro: string;
  tone: "paper" | "butter";
  size: "sm" | "md";
  hand?: string;
}) {
  const shownHeadline = headline.trim() || DEFAULT_PUBLIC_TOUR_HEADLINE;
  const shownIntro = intro.trim() || DEFAULT_PUBLIC_TOUR_INTRO;
  return (
    <figure
      className={`m-0 min-w-0 rounded-[18px] border-[1.5px] border-[var(--sf-ink)]/12 shadow-[0_3px_0_0_rgba(43,36,29,0.08)] ${
        tone === "butter" ? "bg-[var(--sf-butter)]/55" : "bg-[var(--sf-paper)]"
      }`}
    >
      <div className="flex items-center gap-1.5 border-b border-[var(--sf-ink)]/10 px-3.5 py-2" aria-hidden>
        <span className="h-2 w-2 rounded-full bg-[var(--sf-clay)]/60" />
        <span className="h-2 w-2 rounded-full bg-[#d9a400]/60" />
        <span className="h-2 w-2 rounded-full bg-[var(--sf-forest)]/50" />
        <span className="ml-auto text-[11.5px] font-extrabold text-[var(--sf-ink)]/55">Preview</span>
      </div>
      <figcaption className="sr-only">Preview of the top of your tour page</figcaption>
      <div className={size === "sm" ? "px-4 py-3.5" : "px-5 py-5"}>
        <p
          className={`sf-display m-0 leading-[1.1] text-[var(--sf-ink)] ${
            size === "sm" ? "line-clamp-2 text-[1.15rem]" : "text-[1.45rem]"
          } ${headline.trim() ? "" : "opacity-60"}`}
          data-testid={`public-tour-preview-headline-${size}`}
        >
          {shownHeadline}
        </p>
        <p
          className={`m-0 mt-1.5 whitespace-pre-line text-[13px] font-semibold leading-relaxed text-[var(--sf-ink)]/70 ${
            size === "sm" ? "line-clamp-2" : ""
          } ${intro.trim() ? "" : "opacity-60"}`}
        >
          {shownIntro}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5" aria-hidden>
          {["9:00", "10:30", "1:15"].map((time) => (
            <span
              key={time}
              className="rounded-full border-[1.5px] border-[var(--sf-ink)]/15 bg-white px-2.5 py-0.5 text-[11.5px] font-extrabold tabular-nums text-[var(--sf-ink)]/70"
            >
              {time}
            </span>
          ))}
        </div>
        {hand ? (
          <p aria-hidden className="sf-hand m-0 mt-4 text-[17px] leading-none text-[var(--sf-clay-deep)]">
            {hand}
          </p>
        ) : null}
      </div>
    </figure>
  );
}

function PanelSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading your tour page">
      <GSkeleton className="h-[188px]" />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <GSkeleton key={i} className="h-[58px] !rounded-[16px]" />
        ))}
      </div>
      <GSkeleton className="h-[280px]" />
    </div>
  );
}

export default function PublicTourSchoolSettingsPanel({
  C,
  organizationId,
  schoolSlug,
  onPlatformEnabledChange,
}: PublicTourSchoolSettingsPanelProps) {
  const reduce = useReducedMotion() === true;
  const headingId = useId();
  const headlineId = useId();
  const introId = useId();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [platformEnabled, setPlatformEnabled] = useState(false);
  const [headline, setHeadline] = useState("");
  const [intro, setIntro] = useState("");
  const [fields, setFields] = useState<PublicTourFieldDefinition[]>(DEFAULT_PUBLIC_TOUR_FIELDS);
  const [saved, setSaved] = useState<SavedSnapshot | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [finished, setFinished] = useState<ReadonlySet<PublicTourWizardStepId>>(() => new Set());
  const [urlCopied, setUrlCopied] = useState(false);

  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const wizardRef = useRef<HTMLDivElement>(null);
  const focusStepRef = useRef(false);
  const onPlatformEnabledChangeRef = useRef(onPlatformEnabledChange);
  useEffect(() => {
    onPlatformEnabledChangeRef.current = onPlatformEnabledChange;
  }, [onPlatformEnabledChange]);

  const tourPath = `/school/${schoolSlug}/tour`;
  const step = PUBLIC_TOUR_WIZARD_STEPS[stepIndex]!;
  const isLastStep = stepIndex === PUBLIC_TOUR_WIZARD_STEPS.length - 1;

  const handleCopyTourUrl = useCallback(async () => {
    const absoluteUrl = `${window.location.origin}${tourPath}`;
    try {
      await navigator.clipboard.writeText(absoluteUrl);
      setUrlCopied(true);
      adminToast.success("Tour link copied.", {
        id: "public-tour-link",
        description: "Paste it into an email, newsletter or your website.",
      });
      window.setTimeout(() => setUrlCopied(false), 2000);
    } catch {
      adminToast.error("Couldn't copy the link.", {
        id: "public-tour-link-error",
        description: `Copy it by hand: ${absoluteUrl}`,
      });
    }
  }, [tourPath]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await fetch(
        `/api/school-admin/admissions/public-tour-settings?organizationId=${encodeURIComponent(organizationId)}`,
      );
      const payload = (await response.json()) as {
        platformEnabled?: boolean;
        headline?: string;
        intro?: string;
        fields?: PublicTourFieldDefinition[];
        error?: string;
      };
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to load settings.");
      }
      const nextFields = payload.fields?.length ? payload.fields : DEFAULT_PUBLIC_TOUR_FIELDS;
      setPlatformEnabled(Boolean(payload.platformEnabled));
      onPlatformEnabledChangeRef.current?.(Boolean(payload.platformEnabled));
      setHeadline(payload.headline ?? "");
      setIntro(payload.intro ?? "");
      setFields(nextFields);
      setSaved(snapshotOf(payload.headline ?? "", payload.intro ?? "", nextFields));
    } catch (err) {
      setLoadError(formatActionError(err, "Failed to load public tour settings."));
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  // Move focus to the new step's heading after a step change (keyboard + SR users).
  useEffect(() => {
    if (!focusStepRef.current) return;
    focusStepRef.current = false;
    stepHeadingRef.current?.focus({ preventScroll: true });
    const top = wizardRef.current?.getBoundingClientRect().top ?? 0;
    if (top < 0) {
      wizardRef.current?.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
    }
  }, [stepIndex, reduce]);

  const goToStep = useCallback((index: number) => {
    focusStepRef.current = true;
    setStepIndex(Math.max(0, Math.min(PUBLIC_TOUR_WIZARD_STEPS.length - 1, index)));
  }, []);

  const markFinished = useCallback((id: PublicTourWizardStepId) => {
    setFinished((current) => {
      if (current.has(id)) return current;
      const next = new Set(current);
      next.add(id);
      return next;
    });
  }, []);

  const handleSave = useCallback(
    async (context: PublicTourWizardStepId, retry?: () => void): Promise<boolean> => {
      setSaving(true);
      try {
        const response = await fetch("/api/school-admin/admissions/public-tour-settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ organizationId, headline, intro, fields }),
        });
        if (!response.ok) {
          const payload = (await response.json()) as { error?: string };
          throw new Error(payload.error ?? "Failed to save.");
        }
        setSaved(snapshotOf(headline, intro, fields));
        adminToast.dismiss(SAVE_ERROR_TOAST_ID);
        const required = fields.filter((field) => field.required).length;
        adminToast.success(
          context === "questions" ? "Booking questions saved." : context === "words" ? "Tour page words saved." : "Public tour page updated.",
          {
            id: "public-tour-save",
            description:
              context === "questions"
                ? `Families now see ${questionCountLabel(fields.length, required)} after picking a time.`
                : "Families see the new version on your tour page now.",
          },
        );
        return true;
      } catch (err) {
        void reportPortalOperationalError(
          "school_admin",
          { organizationId, operation: "public_tour.settings.save", error: "" },
          err,
        );
        adminToast.error(formatActionError(err, "Failed to save settings."), {
          id: SAVE_ERROR_TOAST_ID,
          description: "Your tour page hasn't changed. Your edits are still here.",
          action: retry ? { label: "Retry", onClick: retry } : undefined,
        });
        return false;
      } finally {
        setSaving(false);
      }
    },
    [fields, headline, intro, organizationId],
  );

  if (loading) {
    return <PanelSkeleton />;
  }

  if (loadError) {
    return (
      <GardenLoadError
        title="Couldn't load your tour page settings."
        description={loadError}
        onRetry={() => void load()}
      />
    );
  }

  const formDisabled = !platformEnabled || saving;
  const tourDisplayUrl = `${window.location.host}${tourPath}`;
  const dirty =
    saved !== null &&
    (saved.headline !== headline || saved.intro !== intro || saved.fields !== JSON.stringify(fields));
  const requiredCount = fields.filter((field) => field.required).length;

  async function handleContinue() {
    if (step.id === "times") {
      markFinished("times");
      goToStep(stepIndex + 1);
      return;
    }
    const ok = await handleSave(step.id, () => void handleContinue());
    if (!ok) return;
    markFinished(step.id);
    if (!isLastStep) goToStep(stepIndex + 1);
  }

  const copyButton = (className: string) => (
    <button
      type="button"
      onClick={() => void handleCopyTourUrl()}
      className={className}
      aria-label={urlCopied ? "Link copied" : "Copy tour page link"}
      data-testid="public-tour-copy-link"
    >
      {urlCopied ? <Check className="h-4 w-4" aria-hidden strokeWidth={3} /> : <Copy className="h-4 w-4" aria-hidden />}
      {urlCopied ? "Link copied" : "Copy link"}
    </button>
  );

  const openLink = (className: string) => (
    <a href={tourPath} target="_blank" rel="noreferrer" className={className}>
      Open
      <ExternalLink className="h-3.5 w-3.5" aria-hidden />
      <span className="sr-only">tour page in a new tab</span>
    </a>
  );

  let body: ReactNode;
  if (step.id === "words") {
    body = (
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
        <div className="space-y-4">
          <GardenField id={headlineId} label="Headline" hint="A short welcome, like “Come and visit us”.">
            <input
              id={headlineId}
              type="text"
              value={headline}
              disabled={formDisabled}
              onChange={(event) => setHeadline(event.target.value)}
              className={G_INPUT}
              placeholder={DEFAULT_PUBLIC_TOUR_HEADLINE}
              aria-describedby={`${headlineId}-hint`}
            />
          </GardenField>
          <GardenField id={introId} label="Intro" hint="One or two sentences about what a visit is like.">
            <textarea
              id={introId}
              value={intro}
              disabled={formDisabled}
              onChange={(event) => setIntro(event.target.value)}
              rows={4}
              className={`${G_INPUT} resize-y`}
              placeholder={DEFAULT_PUBLIC_TOUR_INTRO}
              aria-describedby={`${introId}-hint`}
            />
          </GardenField>
        </div>
        <div className="hidden lg:block">
          <TourPagePreview headline={headline} intro={intro} tone="butter" size="md" hand="how families see it ✿" />
        </div>
      </div>
    );
  } else if (step.id === "times") {
    body = (
      <div className="min-w-0" data-testid="public-tour-times">
        <AdmissionsAvailabilityEditor C={C} organizationId={organizationId} compactLayout storySurface />
      </div>
    );
  } else if (step.id === "questions") {
    body = <PublicTourFieldsEditor fields={fields} disabled={formDisabled} onChange={setFields} />;
  } else {
    body = (
      <div className="space-y-5">
        <div className="rounded-[20px] border-[1.5px] border-[var(--sf-clay)]/25 bg-[var(--sf-accent-wash)] p-4 sm:p-5">
          <div className="flex min-w-0 items-center gap-3">
            <IconTile icon={Globe} tint="bg-[var(--sf-peach)]" />
            <div className="min-w-0">
              <p className="m-0 text-[13px] font-extrabold text-[var(--sf-ink)]/70">Your tour page link</p>
              <p
                className="m-0 mt-0.5 break-all text-[16px] font-extrabold text-[var(--sf-ink)] sm:text-[18px]"
                data-testid="public-tour-share-url"
              >
                {tourDisplayUrl}
              </p>
            </div>
          </div>
          {platformEnabled ? (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {copyButton(gBtnPopSm)}
              {openLink(gBtnOutlineSm)}
            </div>
          ) : (
            <p className="m-0 mt-3 text-[13px] font-semibold text-[var(--sf-ink)]/70">
              {PUBLIC_TOUR_TURNED_OFF_COPY}
            </p>
          )}
        </div>
        <ul className="m-0 grid list-none gap-2 p-0 md:grid-cols-3">
          {PUBLIC_TOUR_SHARE_IDEAS.map((idea) => {
            const visual = SHARE_IDEA_ICONS[idea.id];
            return (
              <li
                key={idea.id}
                className="flex items-start gap-3 rounded-[16px] border-[1.5px] border-[var(--sf-ink)]/10 bg-white p-3.5"
              >
                <IconTile icon={visual.icon} tint={visual.tint} size="sm" />
                <div className="min-w-0">
                  <p className="m-0 text-[14px] font-extrabold leading-snug text-[var(--sf-ink)]">{idea.title}</p>
                  <p className="m-0 mt-0.5 text-[12.5px] font-semibold leading-snug text-[var(--sf-soft)]">
                    {idea.body}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
        {dirty ? (
          <GardenNotice
            tone="warning"
            title="You have unsaved changes."
            action={
              <button
                type="button"
                className={gBtnOutlineSm}
                disabled={formDisabled}
                aria-busy={saving || undefined}
                onClick={() => {
                  const saveShare = () => void handleSave("share", saveShare);
                  saveShare();
                }}
              >
                <BusyLabel busy={saving} busyLabel="Saving…">
                  Save changes
                </BusyLabel>
              </button>
            }
          >
            Families still see the last saved version.
          </GardenNotice>
        ) : null}
      </div>
    );
  }

  const stepVisual = STEP_ICONS[step.id];

  return (
    <div ref={wizardRef} className="min-w-0 scroll-mt-4 space-y-4" data-testid="public-tour-wizard">
      {/* Status hero */}
      <section
        aria-labelledby={headingId}
        className={`grid min-w-0 items-center gap-5 rounded-[24px] border-[1.5px] p-5 sm:p-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] ${
          platformEnabled
            ? "border-[var(--sf-forest)]/20 bg-[var(--sf-mint)]"
            : "border-[#d9a400]/35 bg-[var(--sf-butter)]/60"
        }`}
        data-testid="public-tour-status"
      >
        <div className="min-w-0">
          {platformEnabled ? (
            <GChip tone="success" className="!bg-[var(--sf-forest)] !text-white">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[var(--sf-mint)]" />
              Live for families
            </GChip>
          ) : (
            <GChip tone="warning" className="!bg-white">
              <PauseCircle className="h-3.5 w-3.5" aria-hidden />
              Turned off
            </GChip>
          )}
          <h2 id={headingId} className="sf-display m-0 mt-2.5 text-[1.55rem] leading-[1.05] text-[var(--sf-ink)] sm:text-[1.75rem]">
            Your tour page
          </h2>
          {platformEnabled ? (
            <>
              <p className="m-0 mt-1.5 text-[14px] font-semibold leading-snug text-[var(--sf-ink)]/75">
                Families pick a time and book a visit here.
              </p>
              <div className="mt-4 flex min-w-0 flex-wrap items-center gap-2 rounded-[22px] border-[1.5px] border-[var(--sf-forest)]/20 bg-white/85 p-1.5 pl-3.5 sm:flex-nowrap sm:rounded-full">
                <Globe className="h-4 w-4 shrink-0 text-[var(--sf-forest)]" aria-hidden />
                <span
                  className="min-w-0 flex-1 basis-[10rem] truncate text-[13px] font-bold text-[var(--sf-forest)]"
                  title={tourDisplayUrl}
                >
                  {tourDisplayUrl}
                </span>
                <span className="flex shrink-0 items-center gap-1.5">
                  {copyButton(gBtnLinkPill)}
                  {openLink(gBtnLinkPill)}
                </span>
              </div>
              {urlCopied ? (
                <span className="sr-only" aria-live="polite">
                  Link copied
                </span>
              ) : null}
            </>
          ) : (
            <p className="m-0 mt-1.5 max-w-[46ch] text-[14px] font-semibold leading-snug text-[var(--sf-ink)]/80">
              {PUBLIC_TOUR_TURNED_OFF_COPY}
            </p>
          )}
        </div>
        <TourPagePreview headline={headline} intro={intro} tone="paper" size="sm" />
      </section>

      {/* Stepper */}
      <nav aria-label="Tour page setup steps">
        <ol className="m-0 grid list-none grid-cols-2 gap-2 p-0 sm:grid-cols-4">
          {PUBLIC_TOUR_WIZARD_STEPS.map((item, index) => {
            const current = index === stepIndex;
            const done = finished.has(item.id) && !current;
            return (
              <li key={item.id} className="min-w-0">
                <button
                  type="button"
                  onClick={() => goToStep(index)}
                  aria-current={current ? "step" : undefined}
                  aria-label={`Step ${index + 1}: ${item.label}${done ? ", done" : ""}`}
                  data-testid={`public-tour-step-${item.id}`}
                  className={`flex h-full w-full min-w-0 items-center gap-2.5 rounded-[16px] border-[1.5px] px-3 py-2.5 text-left transition-colors ${
                    current
                      ? "border-[var(--sf-clay)]/45 bg-[var(--sf-accent-wash)]"
                      : "border-[var(--sf-ink)]/10 bg-white hover:border-[var(--sf-ink)]/30"
                  } ${G_FOCUS}`}
                >
                  <span
                    aria-hidden
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-[1.5px] text-[12.5px] font-extrabold tabular-nums ${
                      done
                        ? "border-[var(--sf-forest)] bg-[var(--sf-forest)] text-white"
                        : current
                          ? "border-[var(--sf-ink)] bg-[var(--sf-clay)] text-white"
                          : "border-[var(--sf-ink)]/25 bg-white text-[var(--sf-ink)]/60"
                    }`}
                  >
                    {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[14px] font-extrabold text-[var(--sf-ink)]">
                      {item.label}
                    </span>
                    <span className="hidden truncate text-[12px] font-semibold text-[var(--sf-soft)] sm:block">
                      {item.hint}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Current step */}
      <section
        aria-labelledby={`${headingId}-step`}
        className="min-w-0 rounded-[24px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white p-5 shadow-[0_3px_0_0_rgba(43,36,29,0.08)] sm:p-6"
        data-testid={`public-tour-step-panel-${step.id}`}
      >
        <div className="mb-5 flex min-w-0 items-start gap-3">
          <IconTile icon={stepVisual.icon} tint={stepVisual.tint} />
          <div className="min-w-0 flex-1">
            <h3
              id={`${headingId}-step`}
              ref={stepHeadingRef}
              tabIndex={-1}
              className="sf-display m-0 text-[1.35rem] leading-[1.1] text-[var(--sf-ink)] outline-none"
            >
              {step.title}
            </h3>
            <p className="m-0 mt-1 text-[13.5px] font-semibold leading-snug text-[var(--sf-soft)]">{step.lead}</p>
          </div>
          {step.id === "questions" ? (
            <span className="mt-1 hidden shrink-0 sm:block">
              <GChip tone="neutral" className="tabular-nums">
                {questionCountLabel(fields.length, requiredCount)}
              </GChip>
            </span>
          ) : (
            <span className="mt-1 hidden shrink-0 text-[12.5px] font-extrabold tabular-nums text-[var(--sf-soft)] sm:block">
              Step {stepIndex + 1} of {PUBLIC_TOUR_WIZARD_STEPS.length}
            </span>
          )}
        </div>

        {body}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t-[1.5px] border-[var(--sf-ink)]/8 pt-4">
          {stepIndex > 0 ? (
            <button type="button" className={gBtnTextSm} onClick={() => goToStep(stepIndex - 1)} disabled={saving}>
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back
            </button>
          ) : (
            <span />
          )}
          <div className="ml-auto flex flex-wrap items-center justify-end gap-3">
            {dirty && !isLastStep ? (
              <span className="text-[12.5px] font-bold text-[var(--sf-soft)]" role="status">
                Unsaved changes
              </span>
            ) : null}
            {isLastStep ? null : (
              <button
                type="button"
                className={gBtnPopSm}
                disabled={step.id === "times" ? saving : formDisabled}
                aria-busy={saving || undefined}
                onClick={() => void handleContinue()}
                data-testid="public-tour-continue"
              >
                <BusyLabel busy={saving} busyLabel="Saving…">
                  {step.id === "times" ? "Continue" : "Save & continue"}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </BusyLabel>
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
