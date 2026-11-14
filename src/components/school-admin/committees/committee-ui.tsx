"use client";

import { useMemo, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import ConfirmDialog, { type ConfirmDialogProps } from "@/components/school-admin/ConfirmDialog";
import SchoolAdminDatePicker from "@/components/school-admin/ui/SchoolAdminDatePicker";
import SchoolAdminSelect from "@/components/school-admin/ui/SchoolAdminSelect";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import AdminChip, { type AdminChipTone } from "@/components/school-admin/ui/story/AdminChip";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import AdminMetricCard, { type AdminMetricAccent } from "@/components/school-admin/ui/story/AdminMetricCard";
import AdminSectionKicker from "@/components/school-admin/ui/story/AdminSectionKicker";
import AdminTextLink from "@/components/school-admin/ui/story/AdminTextLink";
import {
  committeeStoryInputClassName,
  committeeStoryInputStyle,
} from "@/components/school-admin/committees/committee-story-input-style";
import { useIsGardenCommittee } from "@/components/school-admin/committees/committee-surface";
import { GConfirmDialog } from "@/components/school-parent/garden/GDialog";
import {
  GChip,
  GKicker,
  G_FOCUS,
  SPRINGY,
  gBtnOutlineSm,
  gBtnPopSm,
  gLinkSm,
  type GChipTone,
} from "@/components/school-parent/garden/ui";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

/*
 * Drop-in committee primitives. Each takes the same props as the admin story
 * component it replaces. On the story surface (admin) it renders that exact
 * component; on the Garden surface (parent/teacher workspace) it renders the
 * parent Garden kit equivalent. Garden branches assume a ParentGardenFrame
 * ancestor (the workspace layout provides one).
 */

/** Copy of `obj` without `keys` (drops story-only props like `theme`). */
function omit<T extends object, K extends keyof T>(obj: T, keys: readonly K[]): Omit<T, K> {
  const copy = { ...obj };
  for (const key of keys) delete copy[key];
  return copy;
}

/* ------------------------------------------------------------------ */
/* Card                                                               */
/* ------------------------------------------------------------------ */

type CardProps = {
  theme: ParentThemeTokens;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  padding?: "none" | "default" | "canvas" | "compact";
  "data-testid"?: string;
  id?: string;
};

export const G_CARD_SHELL =
  "rounded-[24px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white shadow-[0_3px_0_0_rgba(43,36,29,0.08)]";

export function CommitteeCard(props: CardProps) {
  const garden = useIsGardenCommittee();
  if (!garden) return <AdminCard {...props} />;
  const { children, className = "", style, padding = "default", "data-testid": testId, id } = props;
  const pad =
    padding === "none" ? "" : padding === "canvas" ? "p-5 sm:p-6" : padding === "compact" ? "p-3" : "p-4 sm:p-5";
  return (
    <div id={id} data-testid={testId} className={`overflow-hidden ${G_CARD_SHELL} ${pad} ${className}`} style={style}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Button                                                             */
/* ------------------------------------------------------------------ */

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  theme: ParentThemeTokens;
  variant?: "primary" | "soft" | "outline" | "danger";
  children: ReactNode;
  size?: "default" | "compact";
};

const G_SOFT = `inline-flex items-center justify-center gap-1.5 rounded-full border-[1.5px] border-[var(--sf-clay)]/25 bg-[var(--sf-accent-wash)] px-4 py-2.5 text-sm font-extrabold text-[var(--sf-clay-deep)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--sf-clay)]/50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${G_FOCUS}`;
const G_DANGER = `${gBtnOutlineSm} !border-[#b42318]/30 !text-[#b42318] hover:!border-[#b42318]/60`;
const G_COMPACT = "!px-3 !py-1.5 !text-[13px]";

export function gardenButtonClass(variant: ButtonProps["variant"] = "primary", size: ButtonProps["size"] = "default") {
  const base =
    variant === "soft" ? G_SOFT : variant === "outline" ? gBtnOutlineSm : variant === "danger" ? G_DANGER : gBtnPopSm;
  return size === "compact" ? `${base} ${G_COMPACT}` : base;
}

export function CommitteeButton(props: ButtonProps) {
  const garden = useIsGardenCommittee();
  if (!garden) return <AdminButton {...props} />;
  const { variant = "primary", size = "default", className = "", children } = props;
  const rest = omit(props, ["theme", "variant", "size", "className", "style", "children"]);
  return (
    <button type="button" className={`${gardenButtonClass(variant, size)} ${className}`} {...rest}>
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Chip                                                               */
/* ------------------------------------------------------------------ */

const CHIP_TONE: Record<AdminChipTone, GChipTone> = {
  success: "success",
  warning: "warning",
  alert: "alert",
  info: "info",
  purple: "neutral",
};

export function CommitteeChip(props: {
  theme: ParentThemeTokens;
  tone: AdminChipTone;
  children: ReactNode;
  className?: string;
}) {
  const garden = useIsGardenCommittee();
  if (!garden) return <AdminChip {...props} />;
  return (
    <GChip tone={CHIP_TONE[props.tone]} className={`whitespace-nowrap ${props.className ?? ""}`}>
      {props.children}
    </GChip>
  );
}

/* ------------------------------------------------------------------ */
/* Type                                                               */
/* ------------------------------------------------------------------ */

export function CommitteeHeading(props: {
  theme: ParentThemeTokens;
  children: ReactNode;
  as?: "h1" | "h2" | "h3";
  className?: string;
  size?: "display" | "section" | "canvas";
  id?: string;
}) {
  const garden = useIsGardenCommittee();
  if (!garden) return <AdminDisplayHeading {...props} />;
  const { as: Tag = "h2", size = "display", className = "", id, children } = props;
  const sizeClass =
    size === "display"
      ? "text-[1.9rem] leading-[1]"
      : size === "canvas"
        ? "text-[1.5rem] leading-[1.05]"
        : "text-[1.3rem] leading-[1.05]";
  return (
    <Tag id={id} className={`sf-display m-0 text-[var(--sf-ink)] ${sizeClass} ${className}`}>
      {children}
    </Tag>
  );
}

export function CommitteeKicker(props: { theme: ParentThemeTokens; children: ReactNode; className?: string }) {
  const garden = useIsGardenCommittee();
  if (!garden) return <AdminSectionKicker {...props} />;
  return <GKicker className={props.className}>{props.children}</GKicker>;
}

export function CommitteeTextLink(
  props: ButtonHTMLAttributes<HTMLButtonElement> & { theme: ParentThemeTokens; children: ReactNode },
) {
  const garden = useIsGardenCommittee();
  if (!garden) return <AdminTextLink {...props} />;
  const { className = "", children } = props;
  const rest = omit(props, ["theme", "className", "children"]);
  return (
    <button type="button" className={`${gLinkSm} cursor-pointer border-0 bg-transparent p-0 ${className}`} {...rest}>
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Metric                                                             */
/* ------------------------------------------------------------------ */

const METRIC_TINT: Record<AdminMetricAccent, string> = {
  forest: "bg-[var(--sf-mint)]",
  sky: "bg-[var(--sf-sky)]",
  gold: "bg-[var(--sf-butter)]",
  berry: "bg-[var(--sf-lav)]",
};

export function CommitteeMetricCard(props: {
  theme: ParentThemeTokens;
  value: string;
  label: string;
  accent?: AdminMetricAccent;
  onClick?: () => void;
  className?: string;
  /** Garden only: small icon shown in a pastel chip. */
  icon?: ReactNode;
}) {
  const garden = useIsGardenCommittee();
  if (!garden) {
    return <AdminMetricCard {...omit(props, ["icon"])} />;
  }
  const { value, label, accent = "forest", onClick, className = "", icon } = props;
  const inner = (
    <>
      <span className="flex items-center justify-between gap-2">
        <span className="sf-display text-[2.2rem] leading-none text-[var(--sf-ink)]">{value}</span>
        {icon ? (
          <span
            aria-hidden="true"
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-2 ring-[var(--sf-ink)] ${METRIC_TINT[accent]} [&_svg]:h-4 [&_svg]:w-4 [&_svg]:text-[var(--sf-ink)]`}
          >
            {icon}
          </span>
        ) : null}
      </span>
      <span className="mt-1.5 block text-[13px] font-extrabold text-[var(--sf-ink)]/70 group-hover:text-[var(--sf-ink)]">
        {label}
      </span>
    </>
  );
  const cls = `group flex h-full w-full flex-col rounded-[20px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white p-4 text-left shadow-[0_3px_0_0_rgba(43,36,29,0.06)] ${className}`;
  if (!onClick) return <div className={cls}>{inner}</div>;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${cls} cursor-pointer hover:-translate-y-0.5 hover:border-[var(--sf-ink)]/30 ${SPRINGY} ${G_FOCUS}`}
    >
      {inner}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Confirm dialog                                                     */
/* ------------------------------------------------------------------ */

export function CommitteeConfirmDialog(props: ConfirmDialogProps & { theme: ParentThemeTokens }) {
  const garden = useIsGardenCommittee();
  if (!garden) {
    return <ConfirmDialog {...omit(props, ["theme"])} />;
  }
  return (
    <GConfirmDialog
      theme={props.theme}
      open={props.open}
      title={props.title}
      description={props.description}
      confirmLabel={props.confirmLabel ?? "Confirm"}
      cancelLabel={props.cancelLabel}
      destructive={props.variant === "destructive"}
      loading={props.loading}
      onConfirm={props.onConfirm}
      onClose={props.onClose}
      confirmTestId={props.confirmTestId}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Inputs                                                             */
/* ------------------------------------------------------------------ */

export const G_COMMITTEE_INPUT =
  "w-full rounded-[14px] border-2 border-[var(--sf-ink)]/15 bg-white px-3.5 py-2.5 text-[16px] font-semibold text-[var(--sf-ink)] outline-none transition-colors placeholder:font-medium placeholder:text-[var(--sf-ink)]/40 hover:border-[var(--sf-ink)]/30 focus:border-[var(--sf-clay)] focus:ring-4 focus:ring-[var(--sf-clay)]/15 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm";

/** Input class + style for committee forms: story keeps the admin look, Garden uses the Garden field. */
export function useCommitteeInput(theme: ParentThemeTokens): { className: string; style: CSSProperties | undefined } {
  const garden = useIsGardenCommittee();
  return useMemo(
    () =>
      garden
        ? { className: G_COMMITTEE_INPUT, style: undefined }
        : { className: committeeStoryInputClassName, style: committeeStoryInputStyle(theme) },
    [garden, theme],
  );
}

/** Select: admin's custom select on story; a native Garden select (good on phones) on Garden. */
export function CommitteeSelectField(props: {
  id?: string;
  C: AdminThemeTokens;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  ariaLabel: string;
  disabled?: boolean;
  placeholder?: string;
  triggerClassName?: string;
}) {
  const garden = useIsGardenCommittee();
  if (!garden) return <SchoolAdminSelect {...props} />;
  const { id, value, onChange, options, ariaLabel, disabled, placeholder } = props;
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={ariaLabel}
        disabled={disabled}
        className={`${G_COMMITTEE_INPUT} cursor-pointer appearance-none pr-10`}
      >
        {placeholder && !options.some((option) => option.value === "") ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--sf-ink)]/55"
        aria-hidden="true"
      />
    </div>
  );
}

/** Date: admin's date picker on story; a native date field on Garden (same YYYY-MM-DD value). */
export function CommitteeDateField(props: {
  id: string;
  C: AdminThemeTokens;
  value: string;
  onChange: (iso: string) => void;
  disabled?: boolean;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
  error?: string | null;
}) {
  const garden = useIsGardenCommittee();
  if (!garden) return <SchoolAdminDatePicker {...props} />;
  const { id, value, onChange, disabled, minDate, maxDate, error } = props;
  return (
    <div>
      <input
        id={id}
        type="date"
        value={value}
        min={minDate}
        max={maxDate}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        className={G_COMMITTEE_INPUT}
      />
      {error ? <p className="m-0 mt-1 text-[12.5px] font-bold text-[#b42318]">{error}</p> : null}
    </div>
  );
}
