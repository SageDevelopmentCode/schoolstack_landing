"use client";

import type { ReactNode } from "react";
import { Pill, type Tint } from "@/components/garden/ui";

type DemoPreviewVariant =
  | "website"
  | "application"
  | "observation"
  | "admin"
  | "parent"
  | "teacher"
  | "contact"
  | "mobile";

/** Garden wash + pill per preview, following the home page role tints
 * (parents sky, teachers mint, admins peach). Literal classes only. */
const VARIANT_CONFIG: Record<
  DemoPreviewVariant,
  { label: string; emoji: string; wash: string; pill: Tint }
> = {
  website: {
    label: "Website",
    emoji: "🌐",
    wash: "bg-[var(--sf-butter)]/35",
    pill: "butter",
  },
  application: {
    label: "Application",
    emoji: "📝",
    wash: "bg-[var(--sf-lav)]/50",
    pill: "lav",
  },
  observation: {
    label: "Observation booking",
    emoji: "📅",
    wash: "bg-[var(--sf-lav)]/50",
    pill: "lav",
  },
  admin: {
    label: "Admin view",
    emoji: "📊",
    wash: "bg-[var(--sf-peach)]/45",
    pill: "clay",
  },
  parent: {
    label: "Parent portal",
    emoji: "👨‍👩‍👧",
    wash: "bg-[var(--sf-sky)]/60",
    pill: "sky",
  },
  teacher: {
    label: "Teacher view",
    emoji: "📋",
    wash: "bg-[var(--sf-mint)]/55",
    pill: "forest",
  },
  contact: {
    label: "Get in touch",
    emoji: "✉️",
    wash: "bg-[var(--sf-mint)]/55",
    pill: "forest",
  },
  mobile: {
    label: "Mobile app",
    emoji: "📱",
    wash: "bg-[var(--sf-lav)]/50",
    pill: "lav",
  },
};

/** Beats `.sf-garden .sf-demo` so previews keep the font/ink set by the shell. */
const PREVIEW_TYPE = { fontFamily: "inherit", color: "inherit" } as const;

interface Props {
  variant: DemoPreviewVariant;
  children: ReactNode;
}

/**
 * The live preview, framed as a toy card on a dotted wash. The card is
 * `.sf-demo`, so the school's own site and portals keep their own type.
 */
export default function DemoPreviewFrame({ variant, children }: Props) {
  const config = VARIANT_CONFIG[variant];

  return (
    <div
      className={`sf-grid flex h-full flex-1 flex-col overflow-hidden px-4 pb-6 pt-4 lg:px-8 lg:pb-10 lg:pt-6 ${config.wash}`}
    >
      <div className="mb-3.5 flex shrink-0 justify-center">
        <Pill
          tint={config.pill}
          className="border-2 border-[var(--sf-ink)] !px-3 !py-1 !text-xs shadow-[0_2px_0_0_var(--sf-ink)]"
        >
          <span aria-hidden="true">{config.emoji}</span>
          {config.label}
        </Pill>
      </div>
      <div
        className="sf-demo min-h-0 flex-1 overflow-hidden rounded-[26px] border-2 border-[var(--sf-ink)] bg-white shadow-[0_8px_0_0_var(--sf-ink)]"
        style={PREVIEW_TYPE}
      >
        {children}
      </div>
    </div>
  );
}
