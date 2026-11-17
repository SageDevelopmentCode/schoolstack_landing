import {
  MessageCircle,
  School,
  Sprout,
  Sun,
  type LucideIcon,
} from "lucide-react";
import {
  DEMO_REQUEST_ROLE_OPTIONS,
  type DemoRequestRoleId,
} from "@/lib/demo-request-roles";
import { Tick } from "@/components/garden/ui";
import { DEMO_INTRO_FORM_COPY } from "@/lib/marketing/demo-intro-form-copy";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

const ROLE_ICONS: Record<DemoRequestRoleId, LucideIcon> = {
  starting: Sprout,
  running: School,
  program: Sun,
  other: MessageCircle,
};

const SOFT_TRACK = "#EAF2EB";
const TILE_BG = "#F1F5EE";
const TILE_ICON = "#78917D";
const CHOICE_BORDER = "#DCE4DA";
const CHOICE_BORDER_SELECTED = "#91B198";

/** Icon tile tint per stage card (literal classes; needs `.sf-garden`). */
const GARDEN_ICON_TINT: Record<DemoRequestRoleId, string> = {
  starting: "bg-[var(--sf-mint)] text-[var(--sf-forest)]",
  running: "bg-[var(--sf-sky)] text-[#24507a]",
  program: "bg-[var(--sf-butter)] text-[#6b4f00]",
  other: "bg-[var(--sf-lav)] text-[#5e3a78]",
};

const GARDEN_CARD = {
  on: "border-[var(--sf-ink)] bg-[var(--sf-butter)]/35 shadow-[0_4px_0_0_var(--sf-ink)]",
  off: "border-[var(--sf-ink)]/15 bg-white hover:-translate-y-0.5 hover:border-[var(--sf-ink)]/50",
} as const;

type GetStartedRoleChoicesProps = {
  theme: ParentThemeTokens;
  value: DemoRequestRoleId | "";
  onChange: (role: DemoRequestRoleId) => void;
  hasError?: boolean;
  variant?: "default" | "intro";
  /** "garden" needs a `.sf-garden` ancestor; only applies to `variant="intro"`. */
  appearance?: "story" | "garden";
};

export default function GetStartedRoleChoices({
  theme,
  value,
  onChange,
  hasError = false,
  variant = "default",
  appearance = "story",
}: GetStartedRoleChoicesProps) {
  if (variant === "intro" && appearance === "garden") {
    const copy = DEMO_INTRO_FORM_COPY;
    return (
      <fieldset className="m-0 mt-9 min-w-0 border-0 p-0">
        <legend className="p-0 text-sm font-extrabold leading-snug text-[var(--sf-ink)]">
          {copy.stageLegend}
        </legend>
        <p className="mt-1.5 text-xs leading-relaxed text-[var(--sf-soft)]">{copy.stageHint}</p>
        <div
          className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2"
          role="radiogroup"
          aria-invalid={hasError}
          aria-describedby={hasError ? "intro-role-error" : undefined}
        >
          {DEMO_REQUEST_ROLE_OPTIONS.map((option) => {
            const selected = value === option.id;
            const Icon = ROLE_ICONS[option.id];
            return (
              <label
                key={option.id}
                className={`relative flex min-w-0 cursor-pointer items-start gap-3 rounded-[22px] border-2 p-4 transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-[var(--sf-clay)]/30 ${selected ? GARDEN_CARD.on : GARDEN_CARD.off}`}
              >
                <input
                  type="radio"
                  name="schoolStage"
                  value={option.id}
                  checked={selected}
                  onChange={() => onChange(option.id)}
                  className="absolute h-px w-px opacity-0"
                  aria-label={`${option.title}: ${option.subtitle}`}
                />
                <span
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ring-2 ring-[var(--sf-ink)] ${GARDEN_ICON_TINT[option.id]}`}
                >
                  <Icon size={18} strokeWidth={2.4} aria-hidden />
                </span>
                <span className="min-w-0 pr-7">
                  <strong className="block text-[15px] font-extrabold leading-snug text-[var(--sf-ink)]">
                    {option.title}
                  </strong>
                  <small className="mt-0.5 block text-[13px] leading-snug text-[var(--sf-soft)]">
                    {option.subtitle}
                  </small>
                </span>
                {selected ? (
                  <Tick className="absolute right-3 top-3 h-6 w-6" />
                ) : (
                  <span
                    className="absolute right-3.5 top-3.5 h-5 w-5 rounded-full ring-2 ring-inset ring-[var(--sf-ink)]/20"
                    aria-hidden
                  />
                )}
              </label>
            );
          })}
        </div>
        {hasError ? (
          <p
            id="intro-role-error"
            className="mt-2 text-xs font-bold leading-snug text-[var(--sf-clay-deep)]"
            role="alert"
          >
            {copy.errors.role}
          </p>
        ) : null}
      </fieldset>
    );
  }

  if (variant === "intro") {
    const copy = DEMO_INTRO_FORM_COPY;
    return (
      <fieldset className="border-0 p-0 m-0 min-w-0 mt-8">
        <legend
          className="text-[13px] font-bold p-0 leading-snug"
          style={{ color: theme.ink, fontFamily: theme.fontBody }}
        >
          {copy.stageLegend}
        </legend>
        <p
          className="mt-2 text-[11px] leading-[1.8]"
          style={{ color: theme.muted, fontFamily: theme.fontBody }}
        >
          {copy.stageHint}
        </p>
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4"
          role="radiogroup"
          aria-invalid={hasError}
        >
          {DEMO_REQUEST_ROLE_OPTIONS.map((option) => {
            const selected = value === option.id;
            const Icon = ROLE_ICONS[option.id];
            return (
              <label
                key={option.id}
                className="relative flex gap-3 items-start min-w-0 p-4 sm:p-[19px_16px] rounded-[14px] border cursor-pointer transition-[background,border-color] hover:bg-[#FCFDFB] hover:border-[#BDD0BA]"
                style={{
                  borderColor: selected ? CHOICE_BORDER_SELECTED : CHOICE_BORDER,
                  backgroundColor: selected ? SOFT_TRACK : theme.white,
                  boxShadow: selected ? `inset 0 0 0 0.5px ${CHOICE_BORDER_SELECTED}` : undefined,
                }}
              >
                <input
                  type="radio"
                  name="schoolStage"
                  value={option.id}
                  checked={selected}
                  onChange={() => onChange(option.id)}
                  className="absolute opacity-0 w-px h-px"
                  aria-label={`${option.title}: ${option.subtitle}`}
                />
                <span
                  className="w-[33px] h-[33px] rounded-[10px] grid place-items-center shrink-0"
                  style={{
                    backgroundColor: selected ? "#D6E6D7" : TILE_BG,
                    color: selected ? theme.primary : TILE_ICON,
                  }}
                >
                  <Icon size={16} aria-hidden />
                </span>
                <span className="min-w-0 pr-8">
                  <strong
                    className="text-[12px] leading-[1.7] block font-semibold"
                    style={{ color: theme.ink, fontFamily: theme.fontBody }}
                  >
                    {option.title}
                  </strong>
                  <small
                    className="block text-[10px] leading-[1.8] mt-1.5"
                    style={{ color: theme.muted, fontFamily: theme.fontBody }}
                  >
                    {option.subtitle}
                  </small>
                </span>
                <span
                  className="absolute right-3 top-3.5 w-3 h-3 rounded-full border grid place-items-center"
                  style={{
                    borderColor: selected ? theme.primary : "#D1DBCB",
                    backgroundColor: theme.white,
                  }}
                  aria-hidden
                >
                  {selected ? (
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: theme.primary }}
                    />
                  ) : null}
                </span>
              </label>
            );
          })}
        </div>
        {hasError ? (
          <p
            className="mt-2 text-[11px] leading-snug"
            style={{ color: "#B5594A", fontFamily: theme.fontBody }}
          >
            {copy.errors.role}
          </p>
        ) : null}
      </fieldset>
    );
  }

  return (
    <div>
      <p
        className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em]"
        style={{ color: theme.muted, fontFamily: theme.fontBody }}
      >
        Where are you today?
      </p>
      <div
        className="rounded-[14px]"
        style={{
          outline: hasError ? `2px solid ${theme.alert}40` : undefined,
        }}
      >
        <div className="flex flex-col gap-2.5">
          {DEMO_REQUEST_ROLE_OPTIONS.map((option) => {
            const selected = value === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onChange(option.id)}
                className="w-full text-left px-4 py-3.5 text-[14px] font-semibold transition-all duration-150 cursor-pointer"
                style={{
                  fontFamily: theme.fontBody,
                  borderRadius: theme.radiusButton,
                  border: `1.5px solid ${selected ? theme.primary : theme.line}`,
                  backgroundColor: selected ? theme.primaryLight : theme.white,
                  color: selected ? theme.primary : theme.ink,
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
