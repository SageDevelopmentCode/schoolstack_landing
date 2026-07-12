import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

export const BUILDER_CARD_TONES = {
  accent: (C: AdminThemeTokens) => ({
    bg: C.accentLight,
    border: C.secondaryBtnBorder,
  }),
  clay: (C: AdminThemeTokens) => ({ bg: C.clayBg, border: C.clayBorder }),
  info: (C: AdminThemeTokens) => ({ bg: C.infoBg, border: C.infoBorder }),
  success: (C: AdminThemeTokens) => ({
    bg: C.successBg,
    border: C.successBorder,
  }),
  warning: (C: AdminThemeTokens) => ({
    bg: C.warningBg,
    border: C.warningBorder,
  }),
} as const;

export type BuilderCardTone = keyof typeof BUILDER_CARD_TONES;

export function BuilderSectionIntro({
  C,
  title,
  subtitle,
  eyebrow,
}: {
  C: AdminThemeTokens;
  title: string;
  subtitle: string;
  eyebrow?: string;
}) {
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
      <p className="mt-1 text-sm" style={{ color: C.textTertiary }}>
        {subtitle}
      </p>
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
  action?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const cardTone = BUILDER_CARD_TONES[tone](C);

  return (
    <div
      className={`rounded-lg border ${children || helper ? "p-5" : "px-5 py-3"}${children ? " space-y-4" : ""}`}
      style={{
        borderColor: highlightError ? C.errorBorder : cardTone.border,
        backgroundColor: highlightError ? C.errorBg : cardTone.bg,
      }}
    >
      <div className={helper ? "space-y-1" : undefined}>
        <div className="flex items-start justify-between gap-3">
          <p
            className="min-w-0 flex-1 text-base font-semibold"
            style={{ color: C.textPrimary }}
          >
            {question}
          </p>
          {action}
        </div>
        {helper ? (
          <p className="text-xs" style={{ color: C.textTertiary }}>
            {helper}
          </p>
        ) : null}
      </div>
      {children ? <div>{children}</div> : null}
    </div>
  );
}
