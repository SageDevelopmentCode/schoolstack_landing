"use client";

import type { ReactNode } from "react";

export type DemoPreviewVariant =
  | "website"
  | "application"
  | "observation"
  | "admin"
  | "parent"
  | "teacher"
  | "contact"
  | "mobile";

/**
 * Whose view each preview is, with its Garden tints (home page role colours:
 * parents sky, teachers mint, admins peach). `short` names it in the phone step bar;
 * `wash` is the dotted backdrop behind the preview; `bar` tints the phone step bar to
 * match. Literal classes only.
 */
export const DEMO_PREVIEW_ROLES: Record<
  DemoPreviewVariant,
  { label: string; short: string; wash: string; bar: string }
> = {
  website: {
    label: "Website",
    short: "Website",
    wash: "bg-[var(--sf-butter)]/35",
    bar: "bg-[var(--sf-butter)]/70",
  },
  application: {
    label: "Application",
    short: "Application",
    wash: "bg-[var(--sf-lav)]/50",
    bar: "bg-[var(--sf-lav)]/80",
  },
  observation: {
    label: "Observation booking",
    short: "Booking",
    wash: "bg-[var(--sf-lav)]/50",
    bar: "bg-[var(--sf-lav)]/80",
  },
  admin: {
    label: "Admin view",
    short: "Admin",
    wash: "bg-[var(--sf-peach)]/45",
    bar: "bg-[var(--sf-peach)]/75",
  },
  parent: {
    label: "Parent portal",
    short: "Parent",
    wash: "bg-[var(--sf-sky)]/60",
    bar: "bg-[var(--sf-sky)]/85",
  },
  teacher: {
    label: "Teacher view",
    short: "Teacher",
    wash: "bg-[var(--sf-mint)]/55",
    bar: "bg-[var(--sf-mint)]/80",
  },
  contact: {
    label: "Get in touch",
    short: "Contact",
    wash: "bg-[var(--sf-mint)]/55",
    bar: "bg-[var(--sf-mint)]/80",
  },
  mobile: {
    label: "Mobile app",
    short: "App",
    wash: "bg-[var(--sf-lav)]/50",
    bar: "bg-[var(--sf-lav)]/80",
  },
};

/** Beats `.sf-garden .sf-demo` so previews keep the font/ink set by the shell. */
const PREVIEW_TYPE = { fontFamily: "inherit", color: "inherit" } as const;

interface Props {
  variant: DemoPreviewVariant;
  children: ReactNode;
}

/**
 * The live preview, framed as a toy card on a dotted wash tinted by whose view it
 * is. The card is `.sf-demo`, so the school's own site and portals keep their own type.
 */
export default function DemoPreviewFrame({ variant, children }: Props) {
  return (
    <div
      className={`sf-grid flex h-full flex-1 flex-col overflow-hidden px-2 pb-4 pt-3 sm:px-4 sm:pb-6 sm:pt-5 lg:px-8 lg:pb-10 lg:pt-8 ${DEMO_PREVIEW_ROLES[variant].wash}`}
    >
      <div
        className="sf-demo min-h-0 flex-1 overflow-hidden rounded-[26px] border-2 border-[var(--sf-ink)] bg-white shadow-[0_8px_0_0_var(--sf-ink)]"
        style={PREVIEW_TYPE}
      >
        {children}
      </div>
    </div>
  );
}
