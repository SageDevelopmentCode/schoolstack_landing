import Image from "next/image";
import type { ReactNode } from "react";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

/** MudKitchen marketing greens (site globals) — not school portal accent. */
const MK_CALLOUT = {
  background: "linear-gradient(135deg, #E8F0EC, #C5D5B8)",
  border: "#A6B89A",
  kicker: "#233B2F",
  body: "#2E4A3C",
} as const;

export function mudkitchenBody(text: string): string {
  return text.replace(/^MudKitchen\s+/i, "").trim();
}

type MondayCheckMudKitchenCalloutProps = {
  theme: ParentThemeTokens;
  children: ReactNode;
  className?: string;
};

export default function MondayCheckMudKitchenCallout({
  theme,
  children,
  className = "",
}: MondayCheckMudKitchenCalloutProps) {
  return (
    <div
      className={`flex gap-3 sm:gap-4 ${className}`}
      style={{
        borderRadius: theme.radiusButton,
        border: `1px solid ${MK_CALLOUT.border}`,
        background: MK_CALLOUT.background,
        padding: "14px 16px",
        boxShadow: theme.shadowPill,
      }}
    >
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: theme.white, boxShadow: theme.shadowPill }}
      >
        <Image
          src="/images/Logo.png"
          alt=""
          width={40}
          height={40}
          className="h-9 w-9 object-contain"
          aria-hidden
        />
      </span>
      <div className="min-w-0 flex-1">
        <p
          className="mb-1 text-[11px] font-bold uppercase tracking-[0.12em]"
          style={{ color: MK_CALLOUT.kicker, fontFamily: theme.fontBody }}
        >
          MudKitchen
        </p>
        <p
          className="text-[14px] leading-relaxed sm:text-[15px]"
          style={{ color: MK_CALLOUT.body, fontFamily: theme.fontBody }}
        >
          {children}
        </p>
      </div>
    </div>
  );
}
