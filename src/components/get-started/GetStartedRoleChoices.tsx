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

type GetStartedRoleChoicesProps = {
  theme: ParentThemeTokens;
  value: DemoRequestRoleId | "";
  onChange: (role: DemoRequestRoleId) => void;
  hasError?: boolean;
  variant?: "default" | "intro";
};

export default function GetStartedRoleChoices({
  theme,
  value,
  onChange,
  hasError = false,
  variant = "default",
}: GetStartedRoleChoicesProps) {
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
