import type { ReactNode } from "react";
import { useAdminGardenSkin } from "@/components/school-admin/garden/skin";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import AdminSectionKicker from "@/components/school-admin/ui/story/AdminSectionKicker";

export const BUILDER_CARD_TONES = {
  accent: (C: AdminThemeTokens) => ({
    bg: C.surface,
    border: "#E0E7E0",
  }),
  clay: (C: AdminThemeTokens) => ({ bg: C.surface, border: "#E0E7E0" }),
  info: (C: AdminThemeTokens) => ({ bg: C.surface, border: "#E0E7E0" }),
  success: (C: AdminThemeTokens) => ({ bg: C.surface, border: "#E0E7E0" }),
  warning: (C: AdminThemeTokens) => ({ bg: C.surface, border: "#E0E7E0" }),
} as const;

export type BuilderCardTone = keyof typeof BUILDER_CARD_TONES;

export function BuilderSectionIntro({
  C,
  theme,
  title,
  subtitle,
  eyebrow,
}: {
  C: AdminThemeTokens;
  theme?: ParentThemeTokens;
  title: string;
  subtitle?: string;
  eyebrow?: string;
}) {
  const skin = useAdminGardenSkin();
  if (skin) {
    return (
      <div>
        {eyebrow ? (
          <p className="m-0 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--sf-soft)]">{eyebrow}</p>
        ) : null}
        <h2 className={`sf-display m-0 text-[1.4rem] leading-[1.08] text-[var(--sf-ink)] ${eyebrow ? "mt-1.5" : ""}`}>
          {title}
        </h2>
        {subtitle ? (
          <p className="m-0 mt-1.5 max-w-[62ch] text-[13.5px] font-semibold leading-relaxed text-[var(--sf-soft)]">
            {subtitle}
          </p>
        ) : null}
      </div>
    );
  }
  if (theme) {
    return (
      <div>
        {eyebrow ? <AdminSectionKicker theme={theme}>{eyebrow}</AdminSectionKicker> : null}
        <AdminDisplayHeading
          theme={theme}
          as="h2"
          size="canvas"
          className={eyebrow ? "mt-1.5" : ""}
        >
          {title}
        </AdminDisplayHeading>
        {subtitle ? (
          <p className="mt-2 text-xs leading-relaxed" style={{ color: theme.muted }}>
            {subtitle}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div>
      {eyebrow ? (
        <p className="text-xs font-medium" style={{ color: C.textTertiary }}>
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={`font-semibold ${eyebrow ? "mt-0.5" : ""} text-lg`}
        style={{ color: C.textPrimary }}
      >
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-1 text-sm" style={{ color: C.textTertiary }}>
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

export function BuilderQuestionCard({
  C,
  tone,
  question,
  helper,
  highlightError = false,
  action,
  children,
}: {
  C: AdminThemeTokens;
  tone: BuilderCardTone;
  question: string;
  helper?: string;
  highlightError?: boolean;
  action?: ReactNode;
  children?: ReactNode;
}) {
  const skin = useAdminGardenSkin();
  const cardTone = BUILDER_CARD_TONES[tone](C);

  if (skin) {
    return (
      <div
        className={`rounded-[18px] border-[1.5px] ${children || helper ? "p-4" : "px-4 py-3"} ${
          highlightError ? "border-[#b4412f]/45 bg-[#fdf0ec]" : "border-[var(--sf-ink)]/12 bg-white"
        } ${children ? "space-y-3" : ""}`}
      >
        <div className={helper ? "space-y-1" : undefined}>
          <div className="flex items-center justify-between gap-3">
            <p className="m-0 min-w-0 flex-1 text-[14px] font-extrabold text-[var(--sf-ink)]">{question}</p>
            {action}
          </div>
          {helper ? (
            <p className="m-0 text-[12.5px] font-semibold leading-snug text-[var(--sf-soft)]">{helper}</p>
          ) : null}
        </div>
        {children ? <div>{children}</div> : null}
      </div>
    );
  }

  return (
    <div
      className={`rounded-md border ${children || helper ? "p-3.5" : "px-3.5 py-3"}${children ? " space-y-3" : ""}`}
      style={{
        borderColor: highlightError ? C.errorBorder : cardTone.border,
        backgroundColor: highlightError ? C.errorBg : cardTone.bg,
      }}
    >
      <div className={helper ? "space-y-1" : undefined}>
        <div className="flex items-center justify-between gap-3">
          <p
            className="min-w-0 flex-1 text-[13px] font-semibold"
            style={{ color: C.textPrimary }}
          >
            {question}
          </p>
          {action}
        </div>
        {helper ? (
          <p className="text-[11px] leading-relaxed" style={{ color: C.textTertiary }}>
            {helper}
          </p>
        ) : null}
      </div>
      {children ? <div>{children}</div> : null}
    </div>
  );
}
