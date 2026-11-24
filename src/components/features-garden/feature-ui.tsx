import Image from "next/image";
import { Globe, Smartphone } from "lucide-react";
import type { Feature, FeatureRole, FeatureShot, FeatureTint } from "@/lib/marketing/features/types";
import { Tape } from "@/components/garden/ui";
import { GardenFrameBar } from "@/components/home-garden/GardenBrowserFrame";

/** Literal class maps (never build Tailwind classes dynamically). */
export const TINT_BG: Record<FeatureTint, string> = {
  butter: "bg-[var(--sf-butter)]",
  mint: "bg-[var(--sf-mint)]",
  sky: "bg-[var(--sf-sky)]",
  peach: "bg-[var(--sf-peach)]",
  lav: "bg-[var(--sf-lav)]",
};

export const TINT_WASH: Record<FeatureTint, string> = {
  butter: "bg-[var(--sf-butter)]/40",
  mint: "bg-[var(--sf-mint)]/45",
  sky: "bg-[var(--sf-sky)]/35",
  peach: "bg-[var(--sf-peach)]/40",
  lav: "bg-[var(--sf-lav)]/40",
};

export const TINT_VAR: Record<FeatureTint, string> = {
  butter: "var(--sf-butter)",
  mint: "var(--sf-mint)",
  sky: "var(--sf-sky)",
  peach: "var(--sf-peach)",
  lav: "var(--sf-lav)",
};

/** Role colours match the home page groups: admin peach, families sky, staff mint. */
export const ROLE_META: Record<FeatureRole, { label: string; short: string; emoji: string; bg: string; pill: "clay" | "sky" | "forest" }> = {
  admin: { label: "School admins", short: "Admins", emoji: "🧺", bg: "bg-[var(--sf-peach)]", pill: "clay" },
  family: { label: "Families", short: "Families", emoji: "🏡", bg: "bg-[var(--sf-sky)]", pill: "sky" },
  staff: { label: "Staff & teachers", short: "Staff", emoji: "🍎", bg: "bg-[var(--sf-mint)]", pill: "forest" },
};

export const ROLE_ORDER: FeatureRole[] = ["admin", "family", "staff"];

/** The dashed postage-stamp corner holding a feature's icon. */
export function IconStamp({ feature, size = "md", className = "" }: { feature: Feature; size?: "sm" | "md"; className?: string }) {
  const Icon = feature.icon;
  const box = size === "sm" ? "h-12 w-11" : "h-16 w-14";
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-md border-2 border-dashed border-[var(--sf-ink)]/40 ${TINT_BG[feature.tint]} ${box} ${className}`}
    >
      <Icon size={size === "sm" ? 20 : 24} strokeWidth={2.3} className="text-[var(--sf-ink)]" />
    </span>
  );
}

/** "Web" and "iPhone & Android app" chips. */
export function PlatformChips({ platforms, className = "", dark = false }: { platforms: Feature["platforms"]; className?: string; dark?: boolean }) {
  const chip = dark
    ? "inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold text-[var(--sf-cream)]"
    : "inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-[var(--sf-ink)]/20 bg-white px-3 py-1 text-xs font-extrabold text-[var(--sf-ink)]/80";
  return (
    <ul className={`flex flex-wrap gap-2 ${className}`} aria-label="Available on">
      {platforms.web ? (
        <li className={chip}>
          <Globe size={13} strokeWidth={2.5} aria-hidden="true" /> Web
        </li>
      ) : null}
      {platforms.mobile ? (
        <li className={chip}>
          <Smartphone size={13} strokeWidth={2.5} aria-hidden="true" /> iPhone &amp; Android app
        </li>
      ) : null}
    </ul>
  );
}

/** A web screenshot in the taped Garden browser frame. */
export function WebShotFrame({
  shot,
  label,
  tilt = 0,
  tape = "var(--sf-butter)",
  sizes = "(min-width: 1024px) 640px, 92vw",
  preload = false,
  className = "",
}: {
  shot: FeatureShot;
  label: string;
  tilt?: number;
  tape?: string | null;
  sizes?: string;
  preload?: boolean;
  className?: string;
}) {
  return (
    <figure
      className={`group/frame relative transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:!rotate-0 ${className}`}
      style={{ rotate: `${tilt}deg` }}
    >
      {tape ? <Tape color={tape} className="-top-3 left-1/2 w-28 -translate-x-1/2 -rotate-2" /> : null}
      <div className="overflow-hidden rounded-[22px] border-2 border-[var(--sf-ink)] bg-white shadow-[0_10px_0_0_var(--sf-ink),0_40px_80px_-40px_rgba(43,36,29,0.6)] sm:rounded-[28px]">
        <GardenFrameBar label={label} />
        <div className="relative bg-white" style={{ aspectRatio: `${shot.width} / ${shot.height}` }}>
          <Image src={shot.src} alt={shot.alt} fill sizes={sizes} className="object-cover object-top" preload={preload} />
        </div>
      </div>
    </figure>
  );
}

/** A mobile screenshot as a white phone card (same material as PhoneCard). */
export function MobileShotCard({
  shot,
  tilt = 0,
  tape = "var(--sf-mint)",
  sizes = "220px",
  preload = false,
  className = "",
}: {
  shot: FeatureShot;
  tilt?: number;
  tape?: string | null;
  sizes?: string;
  preload?: boolean;
  className?: string;
}) {
  return (
    <figure
      className={`${/\babsolute\b/.test(className) ? "" : "relative"} rounded-[26px] bg-white p-2 shadow-[0_1px_2px_rgba(43,36,29,0.06),0_24px_50px_-24px_rgba(43,36,29,0.5)] ring-2 ring-[var(--sf-ink)] transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:!rotate-0 ${className}`}
      style={{ rotate: `${tilt}deg` }}
    >
      {tape ? <Tape color={tape} className="-top-3 left-1/2 -translate-x-1/2 rotate-2" /> : null}
      <div className="relative overflow-hidden rounded-[20px]" style={{ aspectRatio: `${shot.width} / ${shot.height}` }}>
        <Image src={shot.src} alt={shot.alt} fill sizes={sizes} className="object-cover object-top" preload={preload} />
      </div>
    </figure>
  );
}

/**
 * The web and mobile shot for a feature's cards and hero. With a `role`, prefer
 * that role's screens (a family card shows the parent app, not the admin page).
 */
export function featureCoverShots(feature: Feature, role?: FeatureRole) {
  const pick = (platform: FeatureShot["platform"], heroIndex?: number) => {
    if (role) {
      const forRole = feature.shots.find((s) => s.platform === platform && s.role === role);
      if (forRole) return forRole;
    }
    if (heroIndex !== undefined && feature.shots[heroIndex]) return feature.shots[heroIndex];
    return feature.shots.find((s) => s.platform === platform);
  };
  return { web: pick("web", feature.heroShots.web), mobile: pick("mobile", feature.heroShots.mobile) };
}
